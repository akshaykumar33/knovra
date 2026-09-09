"""MCP Gateway Handler executing JSON-RPC 2.0 requests and tools."""

import json
import logging
import time
from typing import Any

from app.conversation import (
    ConversationSession,
    ConversationStore,
    ExtractedFact,
    FactType,
)
from app.decision import Decision, DecisionRuleStore, DecisionStatus
from app.embeddings.adapter import BaseEmbeddingProvider
from app.events import AgentEvent, EventBus, EventType
from app.git_memory import GitMemoryStore
from app.mcp.models import (
    ContentItem,
    JsonRpcError,
    JsonRpcRequest,
    JsonRpcResponse,
    ToolCallResult,
)
from app.mcp.tools import get_all_tools_dict, get_tool_definition
from app.models import DocType, SearchQuery
from app.planner import ContextPlanner, ContextPlanRequest
from app.security.redactor import SecretRedactor
from app.storage.vector_store import BaseVectorStore

logger = logging.getLogger("knovra.mcp-gateway")


class McpGatewayHandler:
    """Handles JSON-RPC 2.0 protocol and executes the 12 Knovra MCP tools."""

    def __init__(
        self,
        vector_store: BaseVectorStore,
        embedding_provider: BaseEmbeddingProvider,
        decision_store: DecisionRuleStore,
        conversation_store: ConversationStore,
        git_store: GitMemoryStore,
        context_planner: ContextPlanner,
        event_bus: EventBus | None = None,
    ) -> None:
        self.vector_store = vector_store
        self.embedding_provider = embedding_provider
        self.decision_store = decision_store
        self.conversation_store = conversation_store
        self.git_store = git_store
        self.context_planner = context_planner
        self.event_bus = event_bus
        self.redactor = SecretRedactor()

    async def handle_request(self, req: JsonRpcRequest) -> JsonRpcResponse:
        """Processes a single JSON-RPC 2.0 request."""
        start = time.perf_counter()
        logger.info("Handling MCP method '%s' (id=%s)", req.method, req.id)

        try:
            if req.method == "initialize":
                result = self._handle_initialize(req.params)
            elif req.method in ("notifications/initialized", "initialized"):
                return JsonRpcResponse(id=req.id, result={})
            elif req.method == "ping":
                result = {}
            elif req.method == "tools/list":
                result = {"tools": get_all_tools_dict()}
            elif req.method == "tools/call":
                result = await self._handle_tool_call(req.params)
            else:
                return JsonRpcResponse(
                    id=req.id,
                    error=JsonRpcError(
                        code=-32601,
                        message=f"Method not found: {req.method}",
                    ),
                )

            elapsed_ms = (time.perf_counter() - start) * 1000.0
            logger.info("Completed MCP method '%s' in %.2fms", req.method, elapsed_ms)
            return JsonRpcResponse(id=req.id, result=result)

        except Exception as ex:
            logger.exception("Error processing MCP request method '%s'", req.method)
            return JsonRpcResponse(
                id=req.id,
                error=JsonRpcError(
                    code=-32603,
                    message=f"Internal error executing {req.method}: {ex}",
                ),
            )

    def _handle_initialize(self, _params: dict[str, Any]) -> dict[str, Any]:
        return {
            "protocolVersion": "2024-11-05",
            "capabilities": {
                "tools": {
                    "listChanged": False,
                },
            },
            "serverInfo": {
                "name": "knovra",
                "version": "0.1.0",
                "description": "Knovra Universal AI Project Intelligence MCP Server",
            },
        }

    async def _handle_tool_call(self, params: dict[str, Any]) -> dict[str, Any]:
        tool_name = params.get("name", "")
        args = params.get("arguments", {})
        if not isinstance(args, dict):
            args = {}

        tool_def = get_tool_definition(tool_name)
        if not tool_def:
            return ToolCallResult(
                content=[ContentItem(text=f"Unknown tool: {tool_name}")],
                isError=True,
            ).model_dump()

        try:
            if tool_name == "knovra.search":
                text = await self._tool_search(args)
            elif tool_name == "knovra.context":
                text = await self._tool_context(args)
            elif tool_name == "knovra.project":
                text = self._tool_project(args)
            elif tool_name == "knovra.architecture":
                text = self._tool_architecture(args)
            elif tool_name == "knovra.related_code":
                text = await self._tool_related_code(args)
            elif tool_name == "knovra.dependencies":
                text = self._tool_dependencies(args)
            elif tool_name == "knovra.decisions":
                text = self._tool_decisions(args)
            elif tool_name == "knovra.rules":
                text = self._tool_rules(args)
            elif tool_name == "knovra.history":
                text = self._tool_history(args)
            elif tool_name == "knovra.errors":
                text = self._tool_errors(args)
            elif tool_name == "knovra.remember":
                text = await self._tool_remember(args)
            elif tool_name == "knovra.record_decision":
                text = self._tool_record_decision(args)
            else:
                text = f"Tool handler not implemented for {tool_name}"

            # Scrub secrets before returning (Invariant #6)
            cleaned_text = self.redactor.redact_text(text)

            # Auto-emit AgentEvent for continuous intelligence learning (Phase 10)
            if self.event_bus:
                try:
                    if tool_name == "knovra.record_decision":
                        await self.event_bus.publish(
                            AgentEvent(
                                event_type=EventType.DECISION_MADE,
                                payload={
                                    "id": args.get("id"),
                                    "title": args.get("title"),
                                    "decision": args.get("decision"),
                                    "reason": args.get("context"),
                                    "status": args.get("status", "accepted"),
                                    "supersedes": args.get("supersedes"),
                                },
                            )
                        )
                    elif tool_name == "knovra.remember":
                        cat = str(args.get("category", "insight")).lower()
                        evt = EventType.SOLUTION_APPLIED if cat == "solution" else EventType.ERROR_OBSERVED if cat == "error" else EventType.PROMPT_RECEIVED
                        await self.event_bus.publish(
                            AgentEvent(
                                event_type=evt,
                                payload={"text": args.get("text"), "category": cat},
                            )
                        )
                    elif tool_name == "knovra.context":
                        await self.event_bus.publish(
                            AgentEvent(
                                event_type=EventType.TASK_STARTED,
                                payload={"prompt": args.get("prompt"), "budget": args.get("budget", 4000)},
                            )
                        )
                except Exception as bus_ex:  # noqa: BLE001
                    logger.warning("Failed to emit agent event from tool %s: %s", tool_name, bus_ex)

            return ToolCallResult(
                content=[ContentItem(text=cleaned_text)],
                isError=False,
            ).model_dump()

        except Exception as ex:  # noqa: BLE001
            logger.error("Error executing tool %s: %s", tool_name, ex)
            return ToolCallResult(
                content=[ContentItem(text=f"Error executing {tool_name}: {ex}")],
                isError=True,
            ).model_dump()

    # --- Tool Implementations ---

    async def _tool_search(self, args: dict[str, Any]) -> str:
        query = args.get("query", "")
        top_k = int(args.get("top_k", 5))
        doc_types = args.get("doc_types")
        types_filter = [DocType(dt) for dt in doc_types] if doc_types else None

        emb = await self.embedding_provider.embed_query(query)
        search_query = SearchQuery(
            query_embedding=emb,
            top_k=top_k,
            doc_types=types_filter,
            project_id=args.get("project_id", "knovra"),
        )
        results = await self.vector_store.search(search_query)
        if not results:
            return f"No semantic search results found for: '{query}'"

        lines = [f"### Semantic Search Results for: '{query}' ({len(results)} matches)"]
        for idx, r in enumerate(results, 1):
            prov = r.chunk.provenance
            lines.append(
                f"\n**{idx}. [{r.chunk.doc_type.value}] {prov.file_path} (Score: {r.score:.3f})**\n"
                f"Lines {prov.start_line}-{prov.end_line} | ID: `{r.chunk.chunk_id}`\n"
                f"```\n{r.chunk.content.strip()}\n```"
            )
        return "\n".join(lines)

    async def _tool_context(self, args: dict[str, Any]) -> str:
        prompt = args.get("prompt", "")
        budget = int(args.get("budget", 4000))
        task_type = args.get("task_type") or None
        file_hints = args.get("file_hints") or []
        fmt = args.get("format", "markdown")
        project_id = args.get("project_id", "knovra")

        plan_req = ContextPlanRequest(
            prompt=prompt,
            task_type=task_type,
            max_tokens=budget,
            file_hints=file_hints,
            project_id=project_id,
        )
        res = await self.context_planner.plan(plan_req)
        if fmt == "json":
            return json.dumps(res.bundle.model_dump(), indent=2)
        return res.markdown_prompt

    def _tool_project(self, _args: dict[str, Any]) -> str:
        return (
            "### Knovra Project Overview\n"
            "- **Name**: Knovra Universal AI Project Intelligence Monorepo\n"
            "- **Architecture**: Polyglot Monorepo (Go runtime, Python context-engine, Rust code-indexer)\n"
            "- **Primary Invariants**:\n"
            "  - Invariant #2: Mandatory provenance on all derived items\n"
            "  - Invariant #6: Zero secret leakage across all outputs\n"
            "  - Invariant #7: Local-first offline execution capability\n"
            "  - Invariant #8: Sub-second query latency for context synthesis\n"
            "- **Subsystems**:\n"
            "  - `services/runtime`: Go runtime daemon, project ingestion, Git extractor, CLI, MCP server\n"
            "  - `services/context-engine`: FastAPI, pgvector/in-memory semantic memory, Context Planner, decision engine\n"
            "  - `services/code-indexer`: Rust Tree-sitter AST parser, symbol extractor, SHA-256 scanner\n"
            f"- **Active Memory State**: {len(self.decision_store.list_decisions())} ADRs, "
            f"{len(self.decision_store.list_rules())} rules, "
            f"{len(self.git_store.list_commits())} git commits, "
            f"{len(self.conversation_store.list_sessions())} conversation sessions."
        )

    def _tool_architecture(self, _args: dict[str, Any]) -> str:
        decisions = self.decision_store.list_decisions(status=DecisionStatus.ACCEPTED)
        lines = [
            "### Knovra Architecture & Invariants",
            "- **Design**: Multi-engine polyglot architecture separating high-speed indexing (Rust), orchestration (Go), and AI/semantic reasoning (Python).",
            "- **Active Architecture Decisions (ADRs)**:",
        ]
        if not decisions:
            lines.append("  (no accepted decisions recorded)")
        else:
            for d in decisions:
                lines.append(f"  - **{d.id}**: {d.title} (Status: {d.status.value})")
                lines.append(f"    *Decision*: {d.description or d.reason}")
        return "\n".join(lines)

    async def _tool_related_code(self, args: dict[str, Any]) -> str:
        target = args.get("symbol_or_path", "")
        # Search vector store for code symbols matching target
        emb = await self.embedding_provider.embed_query(target)
        res = await self.vector_store.search(
            SearchQuery(
                query_embedding=emb,
                top_k=6,
                doc_types=[DocType.CODE_SYMBOL, DocType.DOC],
                project_id=args.get("project_id", "knovra"),
            )
        )
        lines = [f"### Related Code & AST Symbols for '{target}':"]
        if not res:
            lines.append("  No direct symbol matches found in code memory.")
        else:
            for r in res:
                lines.append(
                    f"- **{r.chunk.provenance.file_path}** ({r.chunk.doc_type.value}, score: {r.score:.3f})\n"
                    f"  Lines {r.chunk.provenance.start_line}-{r.chunk.provenance.end_line}:\n"
                    f"  `{r.chunk.content.strip()[:200]}`"
                )
        return "\n".join(lines)

    def _tool_dependencies(self, _args: dict[str, Any]) -> str:
        return (
            "### Knovra Polyglot Dependencies\n"
            "- **Go Runtime (`services/runtime/go.mod`)**:\n"
            "  - `gopkg.in/yaml.v3`: Configuration and ADR metadata parsing\n"
            "- **Python Context Engine (`services/context-engine/pyproject.toml`)**:\n"
            "  - `fastapi`, `uvicorn`: REST API and HTTP/SSE transport\n"
            "  - `pydantic`, `pydantic-settings`: Type-safe schema validation and configuration\n"
            "  - `httpx`: Async HTTP client\n"
            "  - `pytest`, `pytest-asyncio`, `ruff`: Testing and linting quality gates\n"
            "- **Rust Code Indexer (`services/code-indexer/Cargo.toml`)**:\n"
            "  - `tree-sitter`, `tree-sitter-go`, `tree-sitter-python`, `tree-sitter-rust`, `tree-sitter-typescript`\n"
            "  - `sha2`: SHA-256 cryptographic content hashing\n"
            "  - `serde`, `serde_json`: High-speed AST serialization"
        )

    def _tool_decisions(self, args: dict[str, Any]) -> str:
        q = args.get("query", "").lower()
        st_str = args.get("status", "").upper()
        status_filter = DecisionStatus(st_str) if st_str and hasattr(DecisionStatus, st_str) else None

        decisions = self.decision_store.list_decisions(status=status_filter)
        if q:
            decisions = [
                d
                for d in decisions
                if q in d.title.lower() or q in d.id.lower() or q in d.reason.lower() or q in d.description.lower()
            ]

        if not decisions:
            return "No decisions found matching the specified criteria."

        lines = [f"### Architectural Decisions ({len(decisions)} matches):"]
        for d in decisions:
            sup = f" (Supersedes: {d.supersedes})" if d.supersedes else ""
            lines.append(
                f"\n- **{d.id}**: {d.title} [{d.status.value}]{sup}\n"
                f"  **Decision**: {d.description or d.reason}\n"
                f"  **Reason**: {d.reason}"
            )
        return "\n".join(lines)

    def _tool_rules(self, args: dict[str, Any]) -> str:
        cat = args.get("category", "").lower()
        sev = args.get("severity", "").lower()

        rules = self.decision_store.list_rules()
        if cat:
            rules = [r for r in rules if r.category.value.lower() == cat]
        if sev:
            rules = [r for r in rules if r.severity.value.lower() == sev]

        if not rules:
            return "No governance rules found matching the criteria."

        lines = [f"### Active Project Governance Rules ({len(rules)} active):"]
        for r in rules:
            lines.append(f"- **[{r.severity.value.upper()}] {r.id}** ({r.category.value}): {r.title} — {r.instruction}")
        return "\n".join(lines)

    def _tool_history(self, args: dict[str, Any]) -> str:
        path = args.get("path", "")
        decision_id = args.get("decision_id", "")
        limit = int(args.get("limit", 10))

        if decision_id:
            trace = self.git_store.trace_decision(decision_id)
            lines = [
                f"### Lineage Trace for Decision [{decision_id}]:",
                f"- Linked Commits: {len(trace.commits)}",
                f"- Modified Files: {len(trace.files)}",
            ]
            for c in trace.commits:
                lines.append(f"  * [{c.short_hash}] {c.date.strftime('%Y-%m-%d')} - {c.subject} ({c.author_name})")
            return "\n".join(lines)

        if path:
            trace = self.git_store.trace_file(path)
            lines = [
                f"### Lineage Trace for File [{path}]:",
                f"- Modifying Commits: {len(trace.commits)}",
                f"- Governing Decisions: {', '.join(trace.commits[0].linked_decisions) if trace.commits and trace.commits[0].linked_decisions else 'None'}",
            ]
            for c in trace.commits:
                lines.append(f"  * [{c.short_hash}] {c.date.strftime('%Y-%m-%d')} - {c.subject} ({c.author_name})")
            return "\n".join(lines)

        commits = self.git_store.list_commits(limit=limit)
        if not commits:
            return "No recorded git commits in memory."

        lines = [f"### Recent Git History ({len(commits)} commits):"]
        for c in commits:
            adrs = f" [ADR: {', '.join(c.linked_decisions)}]" if c.linked_decisions else ""
            lines.append(f"- `[{c.short_hash}]` {c.date.strftime('%Y-%m-%d')} — {c.subject}{adrs} ({c.author_name})")
        return "\n".join(lines)

    def _tool_errors(self, args: dict[str, Any]) -> str:
        query = args.get("query", "").lower()
        limit = int(args.get("limit", 5))

        facts = []
        for session in self.conversation_store.list_sessions():
            for f in session.extracted_facts:
                if f.fact_type in (FactType.ERROR, FactType.SOLUTION):
                    facts.append(f)

        if query:
            facts = [f for f in facts if query in f.text.lower()]

        if not facts:
            return "No historical errors or solutions found in conversation memory."

        lines = [f"### Historical Errors & Solutions ({min(len(facts), limit)} items):"]
        for f in facts[:limit]:
            lines.append(f"- **[{f.fact_type.value.upper()}]** {f.text}")
        return "\n".join(lines)

    async def _tool_remember(self, args: dict[str, Any]) -> str:
        text = args.get("text", "").strip()
        cat = args.get("category", "insight").lower()
        if not text:
            return "Error: Cannot remember empty text."

        fact_type = FactType.SUMMARY
        if cat == "decision":
            fact_type = FactType.DECISION
        elif cat == "solution":
            fact_type = FactType.SOLUTION
        elif cat == "error":
            fact_type = FactType.ERROR
        elif cat == "rule":
            fact_type = FactType.REQUIREMENT

        sid = "mcp-learned-facts"
        sess = self.conversation_store.get_session(sid)
        if not sess:
            sess = ConversationSession(
                id=sid,
                title="MCP Learned Knowledge & Memories",
                source_format="mcp_remember",
                messages=[],
                extracted_facts=[],
            )
            self.conversation_store._sessions[sid] = sess

        fact_id = f"fact-mcp-{int(time.time() * 1000)}"
        fact = ExtractedFact(
            id=fact_id,
            session_id=sid,
            fact_type=fact_type,
            text=text,
            metadata={"source": "mcp.knovra.remember", "timestamp": time.time()},
        )
        sess.extracted_facts.append(fact)

        return f"✓ Successfully remembered {cat} in Knovra memory: '{text[:80]}...'"

    def _tool_record_decision(self, args: dict[str, Any]) -> str:
        did = args.get("id", "").strip()
        title = args.get("title", "").strip()
        st_str = args.get("status", "PROPOSED").upper()
        context = args.get("context", "").strip()
        dec = args.get("decision", "").strip()
        consequences = args.get("consequences", "").strip()
        supersedes = args.get("supersedes", "").strip()

        if not did or not title or not context or not dec:
            return "Error: Missing required fields (id, title, context, decision)."

        status = DecisionStatus.PROPOSED
        if st_str in DecisionStatus.__members__:
            status = DecisionStatus[st_str]

        reason_text = f"{context} | Consequences: {consequences}" if consequences else context
        decision = Decision(
            id=did,
            title=title,
            status=status,
            description=dec,
            reason=reason_text,
            supersedes=supersedes or None,
            metadata={"source": "mcp.knovra.record_decision", "project_id": args.get("project_id", "knovra")},
        )
        self.decision_store.record_decision(decision)

        msg = f"✓ Recorded decision {did}: '{title}' [{status.value}]"
        if supersedes:
            msg += f" (Supersedes {supersedes})"
        return msg
