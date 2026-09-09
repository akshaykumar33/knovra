"""Knovra Context Engine - Universal AI Project Intelligence and Context Planner.

Phase 05 Deliverable: Semantic Memory with pgvector and resilient offline fallback.
Provides semantic retrieval, chunking, and provenance-tracked search for AI agents.
"""

import json
import logging
import time
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from typing import Any

from fastapi import FastAPI, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.chunking.chunker import Chunker
from app.config import settings
from app.conversation import (
    ConversationSession,
    ConversationStore,
    ExtractedFact,
    FactType,
    IngestConversationRequest,
    IngestConversationResponse,
    parse_transcript,
)
from app.decision import (
    Decision,
    DecisionLineageResponse,
    DecisionRuleStore,
    DecisionStatus,
    Rule,
    RuleCategory,
    RuleCheckRequest,
    RuleCheckResponse,
    RuleSeverity,
)
from app.embeddings.adapter import BaseEmbeddingProvider, get_embedding_provider
from app.events import (
    AgentEvent,
    EventProcessor,
    EventType,
    PublishEventResponse,
    ResilientEventBus,
)
from app.git_memory import (
    GitCommit,
    GitHistoryPayload,
    GitMemoryStore,
    IngestGitResponse,
    LineageTraceResult,
)
from app.mcp import (
    JsonRpcRequest,
    JsonRpcResponse,
    McpGatewayHandler,
    get_all_tools_dict,
)
from app.models import (
    Chunk,
    DocType,
    DocumentInput,
    IndexBatchRequest,
    IndexBatchResponse,
    Provenance,
    SearchQuery,
    SearchResult,
    SemanticStats,
)
from app.planner import (
    ContextBundle,
    ContextPlanner,
    ContextPlanRequest,
    ContextPlanResponse,
)
from app.storage.vector_store import BaseVectorStore, ResilientVectorStore

logging.basicConfig(
    level=logging.INFO if settings.knovra_log_level.lower() == "info" else logging.DEBUG,
    format='{"timestamp":"%(asctime)s","level":"%(levelname)s","service":"knovra-context-engine","message":"%(message)s"}',
)
logger = logging.getLogger("knovra.context-engine")

start_time = time.time()

# Global singleton dependencies
vector_store: BaseVectorStore = ResilientVectorStore(
    postgres_host=settings.postgres_host,
    postgres_port=settings.postgres_port,
    postgres_user=settings.postgres_user,
    postgres_password=settings.postgres_password,
    postgres_db=settings.postgres_db,
    model_name=settings.embedding_model,
    dimension=settings.embedding_dimension,
)
embedding_provider: BaseEmbeddingProvider = get_embedding_provider(
    provider_type=settings.embedding_provider,
    api_key=settings.openai_api_key,
    model_name=settings.embedding_model,
    dimension=settings.embedding_dimension,
)
chunker: Chunker = Chunker(
    max_chunk_chars=settings.chunk_max_chars,
    overlap_chars=settings.chunk_overlap_chars,
)
decision_store: DecisionRuleStore = DecisionRuleStore()
conversation_store: ConversationStore = ConversationStore()
git_store: GitMemoryStore = GitMemoryStore()
context_planner: ContextPlanner = ContextPlanner(
    vector_store=vector_store,
    embedding_provider=embedding_provider,
    decision_store=decision_store,
    conversation_store=conversation_store,
    git_store=git_store,
)
event_processor: EventProcessor = EventProcessor(
    decision_store=decision_store,
    conversation_store=conversation_store,
    vector_store=vector_store,
)
nats_server_url = getattr(settings, "nats_url", "nats://localhost:4222")
event_bus: ResilientEventBus = ResilientEventBus(nats_url=nats_server_url)
event_bus.subscribe(event_processor.process_event)

mcp_gateway: McpGatewayHandler = McpGatewayHandler(
    vector_store=vector_store,
    embedding_provider=embedding_provider,
    decision_store=decision_store,
    conversation_store=conversation_store,
    git_store=git_store,
    context_planner=context_planner,
    event_bus=event_bus,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes database connections and vector indices on startup."""
    logger.info("Initializing Knovra Semantic Memory...")
    try:
        await vector_store.initialize()
    except Exception as ex:  # noqa: BLE001
        logger.error("Error during vector store initialization: %s", ex)

    try:
        await event_bus.start()
    except Exception as ex:  # noqa: BLE001
        logger.error("Error starting event bus: %s", ex)

    yield
    logger.info("Shutting down Knovra Semantic Memory and Event Bus...")
    await event_bus.stop()
    await vector_store.close()


app = FastAPI(
    title="Knovra Context Engine",
    version="0.1.0",
    description="Universal AI Project Intelligence, Semantic Memory, and Context Planner",
    lifespan=lifespan,
)


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: str
    uptime_seconds: float
    details: dict[str, Any]


@app.get("/")
async def root():
    return {
        "service": "knovra-context-engine",
        "version": "0.1.0",
        "description": "AI Context Engine and Semantic Memory",
    }


@app.get("/health", response_model=HealthResponse)
async def health():
    stats = await vector_store.get_stats()
    return HealthResponse(
        status="ok",
        service="knovra-context-engine",
        version="0.1.0",
        timestamp=datetime.now(UTC).isoformat(),
        uptime_seconds=round(time.time() - start_time, 2),
        details={
            "environment": settings.knovra_env,
            "semantic_retrieval": "ready",
            "context_planner": "ready",
            "storage_backend": stats.storage_backend,
            "embedding_model": stats.embedding_model,
            "total_documents": stats.total_documents,
            "total_chunks": stats.total_chunks,
        },
    )


@app.post("/semantic/index", response_model=IndexBatchResponse)
async def index_documents(request: IndexBatchRequest):
    """Chunks documents, computes dense vector embeddings, and stores them with provenance."""
    t0 = time.time()
    all_chunks: list[Chunk] = []
    doc_types: dict[str, int] = {}

    for doc in request.documents:
        # If reembed is False, check and delete prior version if updating
        await vector_store.delete_document(doc.document_id)

        chunks = chunker.chunk_document(doc)
        all_chunks.extend(chunks)
        doc_types[doc.doc_type.value] = doc_types.get(doc.doc_type.value, 0) + 1

    if not all_chunks:
        return IndexBatchResponse(
            indexed_documents=len(request.documents),
            indexed_chunks=0,
            doc_types=doc_types,
            model_name=embedding_provider.model_name,
            elapsed_ms=round((time.time() - t0) * 1000, 2),
        )

    # Batch embed chunk contents
    texts = [c.content for c in all_chunks]
    embeddings = await embedding_provider.embed_texts(texts)

    for chunk, emb in zip(all_chunks, embeddings):
        chunk.embedding = emb
        chunk.model_name = embedding_provider.model_name

    # Persist chunks
    await vector_store.store_chunks(all_chunks)

    elapsed_ms = round((time.time() - t0) * 1000, 2)
    logger.info(
        "Indexed %d documents (%d chunks) in %.2fms",
        len(request.documents),
        len(all_chunks),
        elapsed_ms,
    )

    return IndexBatchResponse(
        indexed_documents=len(request.documents),
        indexed_chunks=len(all_chunks),
        doc_types=doc_types,
        model_name=embedding_provider.model_name,
        elapsed_ms=elapsed_ms,
    )


@app.post("/semantic/search", response_model=list[SearchResult])
async def search(query: SearchQuery):
    """Semantic vector search across project artifacts with provenance and filters."""
    query_vector = await embedding_provider.embed_query(query.query)
    results = await vector_store.search(query_vector=query_vector, query=query)
    return results


@app.delete("/semantic/documents/{document_id}")
async def delete_document(document_id: str):
    """Propagates document deletion across the vector store."""
    deleted_chunks = await vector_store.delete_document(document_id)
    if deleted_chunks == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Document {document_id} not found")
    return {"status": "deleted", "document_id": document_id, "chunks_removed": deleted_chunks}


@app.get("/semantic/stats", response_model=SemanticStats)
async def get_stats():
    """Returns vector store inventory, counts by doc type, and model configuration."""
    return await vector_store.get_stats()


# ==============================================================================
# Phase 06 — Decision & Rule Memory Endpoints
# ==============================================================================


@app.post("/decisions", response_model=Decision, status_code=status.HTTP_201_CREATED)
async def create_decision(decision: Decision):
    """Records an architectural decision with rationale, alternatives, and provenance.

    Also indexes into semantic memory for natural-language retrieval.
    """
    recorded = decision_store.record_decision(decision)

    # Automatically chunk and index into Semantic Memory with Provenance (Invariant #2)
    alt_text = "\n".join(f"- Alternative '{a.name}': {a.description} (Rejection: {a.rejection_reason})" for a in decision.alternatives)
    content = f"# {decision.title}\n\n## Status: {decision.status.value.upper()}\n\n## Rationale\n{decision.reason}\n\n## Description\n{decision.description}\n\n## Alternatives Considered\n{alt_text}"

    doc = DocumentInput(
        document_id=f"decision:{decision.id}",
        project_id="knovra",
        repository_id="knovra",
        doc_type=DocType.DECISION,
        title=decision.title,
        content=content,
        provenance=Provenance(
            file_path=decision.source or f"docs/decisions/{decision.id}.md",
            content_hash=decision.id,
            repo_name="knovra",
        ),
        metadata={
            "decision_id": decision.id,
            "status": decision.status.value,
            "created_by": decision.created_by,
            "supersedes": decision.supersedes,
            "superseded_by": decision.superseded_by,
            "affected_entities": decision.affected_entities,
        },
    )

    chunks = chunker.chunk_document(doc)
    if chunks:
        embeddings = await embedding_provider.embed_texts([c.content for c in chunks])
        for c, emb in zip(chunks, embeddings):
            c.embedding = emb
            c.model_name = embedding_provider.model_name
        await vector_store.store_chunks(chunks)

    return recorded


@app.get("/decisions", response_model=list[Decision])
async def list_decisions(
    status_filter: DecisionStatus | None = None,
    active_only: bool = False,
    affected_entity: str | None = None,
):
    """Lists architectural decisions matching filters."""
    return decision_store.list_decisions(
        status=status_filter,
        active_only=active_only,
        affected_entity=affected_entity,
    )


@app.get("/decisions/{decision_id}", response_model=DecisionLineageResponse)
async def get_decision_lineage(decision_id: str):
    """Retrieves an architectural decision with full supersession lineage (Invariant #3)."""
    lineage = decision_store.get_lineage(decision_id)
    if not lineage:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Decision {decision_id} not found")
    return lineage


@app.post("/decisions/{decision_id}/supersede", response_model=Decision)
async def supersede_decision(decision_id: str, new_decision: Decision):
    """Explicitly supersedes an existing decision with a newer decision."""
    try:
        return await create_decision(
            Decision(
                id=new_decision.id,
                title=new_decision.title,
                description=new_decision.description,
                reason=new_decision.reason,
                alternatives=new_decision.alternatives,
                affected_entities=new_decision.affected_entities,
                created_by=new_decision.created_by,
                confidence=new_decision.confidence,
                status=DecisionStatus.ACCEPTED,
                source=new_decision.source,
                supersedes=decision_id,
                metadata=new_decision.metadata,
            )
        )
    except KeyError as ex:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ex))


@app.post("/rules", response_model=Rule, status_code=status.HTTP_201_CREATED)
async def create_rule(rule: Rule):
    """Registers a project rule, architecture constraint, or security policy."""
    return decision_store.record_rule(rule)


@app.get("/rules", response_model=list[Rule])
async def list_rules(
    category: RuleCategory | None = None,
    severity: RuleSeverity | None = None,
    scope: str | None = None,
):
    """Lists project rules and architecture constraints."""
    return decision_store.list_rules(category=category, severity=severity, scope=scope)


@app.post("/rules/check", response_model=RuleCheckResponse)
async def check_rules(request: RuleCheckRequest):
    """Evaluates files and contents against active project rules."""
    return decision_store.evaluate_rules(
        file_paths=request.file_paths,
        contents=request.contents,
    )


# -----------------------------------------------------------------------------
# Conversation Memory Endpoints (Phase 07)
# -----------------------------------------------------------------------------


@app.post("/conversations/ingest", response_model=IngestConversationResponse, status_code=status.HTTP_201_CREATED)
async def ingest_conversation(request: IngestConversationRequest):
    """Ingests and parses conversation transcripts (Claude Code, ChatGPT, Codex, Generic)."""
    raw_str = json.dumps(request.content) if not isinstance(request.content, str) else request.content
    session = parse_transcript(
        data=request.content,
        fmt=request.format,
        title=request.title,
        session_id=request.session_id,
    )
    saved_session = conversation_store.add_session(session, raw_content=raw_str)

    fact_counts: dict[str, int] = {}
    detected_adrs: set[str] = set()
    for f in saved_session.extracted_facts:
        fact_counts[f.fact_type.value] = fact_counts.get(f.fact_type.value, 0) + 1
        for dec in f.related_decisions:
            detected_adrs.add(dec)

    # Index summary into semantic memory
    indexed_semantic = False
    if saved_session.summary:
        try:
            doc = DocumentInput(
                document_id=f"conv:{saved_session.id}",
                project_id=request.project_id,
                repository_id="knovra",
                doc_type=DocType.CONVERSATION,
                title=saved_session.title,
                content=f"Conversation: {saved_session.title}\nSummary: {saved_session.summary}",
                provenance=Provenance(
                    file_path=saved_session.raw_source_path or f"conversations/{saved_session.id}.json",
                    content_hash=saved_session.id,
                    repo_name="knovra",
                ),
                metadata={"session_id": saved_session.id, "source_format": saved_session.source_format},
            )
            chunks = chunker.chunk_document(doc)
            if chunks:
                embeddings = await embedding_provider.embed_texts([c.content for c in chunks])
                for c, emb in zip(chunks, embeddings):
                    c.embedding = emb
                    c.model_name = embedding_provider.model_name
                await vector_store.store_chunks(chunks)
            indexed_semantic = True
        except (RuntimeError, ValueError, KeyError, ConnectionError, OSError) as ex:
            logger.warning(f"Failed to index conversation summary into semantic memory: {ex}")

    return IngestConversationResponse(
        session_id=saved_session.id,
        title=saved_session.title,
        message_count=len(saved_session.messages),
        fact_counts=fact_counts,
        decisions_detected=sorted(detected_adrs),
        indexed_into_semantic_memory=indexed_semantic,
    )


@app.get("/conversations/sessions", response_model=list[ConversationSession])
async def list_conversation_sessions(limit: int = 50, offset: int = 0):
    """Lists imported conversation sessions."""
    return conversation_store.list_sessions(limit=limit, offset=offset)


@app.get("/conversations/sessions/{session_id}", response_model=ConversationSession)
async def get_conversation_session(session_id: str):
    """Retrieves a conversation session by ID."""
    session = conversation_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Session '{session_id}' not found")
    return session


@app.get("/conversations/sessions/{session_id}/facts", response_model=list[ExtractedFact])
async def get_conversation_facts(session_id: str, fact_type: FactType | None = None):
    """Retrieves extracted facts for a conversation session."""
    session = conversation_store.get_session(session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Session '{session_id}' not found")
    return conversation_store.get_facts(session_id, fact_type=fact_type)


# -----------------------------------------------------------------------------
# Git Memory & Lineage Endpoints (Phase 07)
# -----------------------------------------------------------------------------


@app.post("/git/ingest", response_model=IngestGitResponse, status_code=status.HTTP_201_CREATED)
async def ingest_git_history(payload: GitHistoryPayload):
    """Ingests Git commit logs, branches, tags, and file diff summaries."""
    commits_count = git_store.add_commits(payload.commits)
    git_store.add_branches(payload.branches)
    git_store.add_tags(payload.tags)

    decisions_linked: dict[str, list[str]] = {}
    for c in payload.commits:
        for dec_id in c.linked_decisions:
            norm_id = dec_id.lower()
            if norm_id not in decisions_linked:
                decisions_linked[norm_id] = []
            decisions_linked[norm_id].append(c.short_hash)

    return IngestGitResponse(
        commits_ingested=commits_count,
        branches_ingested=len(payload.branches),
        tags_ingested=len(payload.tags),
        decisions_linked=decisions_linked,
    )


@app.get("/git/commits", response_model=list[GitCommit])
async def list_git_commits(
    limit: int = 50,
    offset: int = 0,
    decision_id: str | None = None,
):
    """Queries ingested Git commits with optional decision ID filtering."""
    return git_store.list_commits(limit=limit, offset=offset, decision_id=decision_id)


@app.get("/git/commits/{commit_hash}", response_model=GitCommit)
async def get_git_commit(commit_hash: str):
    """Retrieves specific Git commit details by hash or short hash prefix."""
    commit = git_store.get_commit(commit_hash)
    if not commit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Commit '{commit_hash}' not found")
    return commit


@app.get("/trace/decision/{decision_id}", response_model=LineageTraceResult)
async def trace_decision(decision_id: str):
    """Cross-domain lineage trace from Decision -> Commits -> Files -> Conversations."""
    return git_store.trace_decision(
        decision_id=decision_id,
        decision_store=decision_store,
        conversation_store=conversation_store,
    )


@app.get("/trace/file/{file_path:path}", response_model=LineageTraceResult)
async def trace_file(file_path: str):
    """Cross-domain lineage trace from File -> Commits -> Decisions -> Conversations."""
    return git_store.trace_file(
        file_path=file_path,
        decision_store=decision_store,
        conversation_store=conversation_store,
    )


# -----------------------------------------------------------------------------
# Context Planner Endpoints (Phase 08)
# -----------------------------------------------------------------------------


@app.post("/planner/bundle", response_model=ContextBundle)
async def generate_context_bundle(request: ContextPlanRequest):
    """Synthesizes a bounded ContextBundle for a task using the 12-stage pipeline."""
    response = await context_planner.plan(request)
    return response.bundle


@app.post("/planner/prompt", response_model=ContextPlanResponse)
async def generate_context_prompt(request: ContextPlanRequest):
    """Generates both the structured ContextBundle and prompt-ready Markdown."""
    return await context_planner.plan(request)


# -----------------------------------------------------------------------------
# MCP and Universal Agent Gateway Endpoints (Phase 09)
# -----------------------------------------------------------------------------


@app.post("/mcp/rpc", response_model=JsonRpcResponse)
async def mcp_json_rpc(request: JsonRpcRequest):
    """Executes a JSON-RPC 2.0 MCP request against Knovra project intelligence."""
    return await mcp_gateway.handle_request(request)


@app.get("/mcp/tools")
async def mcp_list_tools():
    """Lists all 12 available Knovra MCP tools and their schemas."""
    return {"tools": get_all_tools_dict()}


@app.get("/mcp/sse")
async def mcp_sse_endpoint():
    """Server-Sent Events (SSE) transport endpoint for MCP clients."""
    async def event_generator():
        yield "event: endpoint\ndata: /mcp/rpc\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


# -----------------------------------------------------------------------------
# Agent Event System Endpoints (Phase 10)
# -----------------------------------------------------------------------------


@app.post("/events/publish", response_model=PublishEventResponse)
async def publish_agent_event(event: AgentEvent):
    """Publishes a single AgentEvent into Knovra's real-time event pipeline."""
    success, is_duplicate, _ = await event_processor.process_event(event)
    await event_bus.publish(event)
    return PublishEventResponse(
        event_id=event.event_id,
        status="acknowledged" if success else "failed",
        idempotent_duplicate=is_duplicate,
        processed_at=datetime.now(UTC).isoformat(),
    )


@app.post("/events/batch", response_model=list[PublishEventResponse])
async def publish_agent_events_batch(events: list[AgentEvent]):
    """Batch ingestion of multiple agent events."""
    responses: list[PublishEventResponse] = []
    for event in events:
        success, is_duplicate, _ = await event_processor.process_event(event)
        await event_bus.publish(event)
        responses.append(
            PublishEventResponse(
                event_id=event.event_id,
                status="acknowledged" if success else "failed",
                idempotent_duplicate=is_duplicate,
                processed_at=datetime.now(UTC).isoformat(),
            )
        )
    return responses


@app.get("/events/recent", response_model=list[AgentEvent])
async def get_recent_agent_events(limit: int = 50, event_type: EventType | None = None):
    """Retrieves recently processed agent events."""
    return event_processor.get_recent_events(limit=limit, event_type=event_type)


@app.get("/events/dead-letter")
async def get_dead_letter_records(limit: int = 50):
    """Inspects dead-letter queue records and failure diagnostics."""
    return event_processor.dlq.list_records(limit=limit)


@app.get("/events/file-activities")
async def get_file_activities(limit: int = 50):
    """Returns file activity touches tracked from agent activity."""
    return event_processor.get_file_activities(limit=limit)


@app.get("/events/test-results")
async def get_test_results(limit: int = 50):
    """Returns test execution records tracked from agent activity."""
    return event_processor.get_test_results(limit=limit)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.port_context_engine)

