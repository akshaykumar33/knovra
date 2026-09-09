"""Context Planner engine synthesizing graph, vectors, decisions, rules, and history."""

import logging
from typing import Any

from app.conversation import ConversationStore, FactType
from app.decision import DecisionRuleStore
from app.embeddings.adapter import BaseEmbeddingProvider
from app.git_memory import GitMemoryStore
from app.models import DocType, SearchQuery
from app.planner.models import (
    ContextBundle,
    ContextItem,
    ContextPlanRequest,
    ContextPlanResponse,
    TaskType,
)
from app.planner.pipeline import (
    classify_task,
    compress_content,
    estimate_tokens,
    extract_task_entities,
    pack_context_items,
    render_markdown_prompt,
)
from app.storage.vector_store import BaseVectorStore

logger = logging.getLogger("knovra.planner")


class ContextPlanner:
    """Universal AI Project Intelligence Context Planner."""

    def __init__(
        self,
        vector_store: BaseVectorStore,
        embedding_provider: BaseEmbeddingProvider,
        decision_store: DecisionRuleStore,
        conversation_store: ConversationStore,
        git_store: GitMemoryStore,
    ) -> None:
        self.vector_store = vector_store
        self.embedding_provider = embedding_provider
        self.decision_store = decision_store
        self.conversation_store = conversation_store
        self.git_store = git_store

    async def plan(self, request: ContextPlanRequest) -> ContextPlanResponse:
        """Executes the 12-stage context synthesis pipeline within token constraints."""
        # 1. Task Classification
        task_type = request.task_type or classify_task(request.prompt)

        # 2. Entity Extraction
        entities = extract_task_entities(request.prompt, request.file_hints)

        candidates: list[ContextItem] = []

        # 3. Rules Retrieval (Phase 06) - High Priority
        all_rules = self.decision_store.list_rules()
        for r in all_rules:
            # Check if rule scope applies to extracted files
            matches_file = any(
                r.scope == "*" or fpath.startswith(r.scope.rstrip("*"))
                for fpath in entities["files"]
            )
            score = 1.0 if matches_file else (0.85 if r.severity.value == "critical" else 0.6)
            rule_text = f"[{r.severity.value.upper()}] {r.title}: {r.instruction} (Scope: {r.scope})"
            candidates.append(
                ContextItem(
                    category="rule",
                    title=f"Rule: {r.title}",
                    content=rule_text,
                    relevance_score=score,
                    token_count=estimate_tokens(rule_text),
                    provenance={"rule_id": r.id, "scope": r.scope},
                )
            )

        # 4. Decisions Retrieval (Phase 06)
        all_decisions = self.decision_store.list_decisions()
        for d in all_decisions:
            norm_id = d.id.lower()
            is_directly_mentioned = norm_id in entities["adrs"]
            matches_kw = any(term in d.title.lower() or term in d.reason.lower() for term in request.prompt.lower().split())
            if is_directly_mentioned or matches_kw:
                score = 1.0 if is_directly_mentioned else 0.75
                dec_text = f"ADR {d.id.upper()}: {d.title} (Status: {d.status.value.upper()})\nReason: {d.reason}\nDescription: {d.description}"
                candidates.append(
                    ContextItem(
                        category="decision",
                        title=f"ADR: {d.id}",
                        content=compress_content(dec_text, max_chars=500),
                        relevance_score=score,
                        token_count=estimate_tokens(dec_text),
                        provenance={"decision_id": d.id, "status": d.status.value},
                    )
                )

        # 5. Git Commits & Modified Files Retrieval (Phase 07)
        for fpath in entities["files"]:
            commits = self.git_store.get_commits_for_file(fpath)
            for c in commits[:3]:
                c_text = f"Commit {c.short_hash} by {c.author_name} ({c.date.strftime('%Y-%m-%d')}): {c.subject}"
                candidates.append(
                    ContextItem(
                        category="commit",
                        title=f"Commit: {c.short_hash}",
                        content=c_text,
                        relevance_score=0.78,
                        token_count=estimate_tokens(c_text),
                        provenance={"commit_hash": c.hash, "file": fpath},
                    )
                )

            # Also add file target candidate
            file_entry = f"Target File: {fpath} (Referenced in task prompt or file hints)"
            candidates.append(
                ContextItem(
                    category="file",
                    title=f"File: {fpath}",
                    content=file_entry,
                    relevance_score=0.92,
                    token_count=estimate_tokens(file_entry),
                    provenance={"file_path": fpath},
                )
            )

        # 6. Conversation & Prior Errors/Solutions Retrieval (Phase 07)
        for adr_id in entities["adrs"]:
            sessions = self.conversation_store.get_sessions_for_decision(adr_id)
            for s in sessions[:2]:
                for fact in s.extracted_facts:
                    if fact.fact_type in {FactType.ERROR, FactType.SOLUTION}:
                        score = 0.95 if task_type == TaskType.BUGFIX else 0.8
                        fact_text = f"[{fact.fact_type.value.upper()}] {fact.text}"
                        candidates.append(
                            ContextItem(
                                category="error_solution",
                                title=f"Past {fact.fact_type.value}: {s.title}",
                                content=compress_content(fact_text, 400),
                                relevance_score=score,
                                token_count=estimate_tokens(fact_text),
                                provenance={"session_id": s.id, "fact_id": fact.id},
                            )
                        )
                # Session summary candidate
                if s.summary:
                    candidates.append(
                        ContextItem(
                            category="conversation",
                            title=f"Discussion: {s.title}",
                            content=compress_content(s.summary, 400),
                            relevance_score=0.72,
                            token_count=estimate_tokens(s.summary),
                            provenance={"session_id": s.id},
                        )
                    )

        # 7. Semantic Vector Retrieval (Phase 05)
        try:
            query_vec = await self.embedding_provider.embed_query(request.prompt)
            search_query = SearchQuery(
                query_text=request.prompt,
                top_k=6,
                min_score=0.25,
            )
            semantic_results = await self.vector_store.search(query_vec, search_query)
            for sr in semantic_results:
                cat = "symbol" if sr.doc_type == DocType.CODE_SUMMARY else "file"
                content_text = f"[{sr.doc_type.value}] {sr.title}\n{sr.content}"
                candidates.append(
                    ContextItem(
                        category=cat,
                        title=sr.title,
                        content=compress_content(content_text, 500),
                        relevance_score=sr.score,
                        token_count=estimate_tokens(content_text),
                        provenance={
                            "document_id": sr.document_id,
                            "file_path": sr.provenance.file_path,
                            "line_start": sr.provenance.line_start,
                        },
                    )
                )
        except (RuntimeError, ValueError, KeyError, ConnectionError, OSError) as ex:
            logger.debug(f"Semantic search skipped in planner: {ex}")

        # 8. Deduplication
        deduped: list[ContextItem] = []
        seen_keys: set[str] = set()
        for item in candidates:
            key = f"{item.category}::{item.title.strip().lower()}"
            if key not in seen_keys:
                seen_keys.add(key)
                deduped.append(item)

        # 9, 10, 11. Greedy Token Packing
        packed_items, token_usage, total_tokens = pack_context_items(
            items=deduped,
            max_tokens=request.max_tokens,
        )

        # 12. ContextBundle Output Assembly
        rules_out: list[dict[str, Any]] = []
        files_out: list[dict[str, Any]] = []
        symbols_out: list[dict[str, Any]] = []
        decisions_out: list[dict[str, Any]] = []
        errors_out: list[dict[str, Any]] = []
        commits_out: list[dict[str, Any]] = []
        convs_out: list[dict[str, Any]] = []
        provenance_out: list[dict[str, Any]] = []

        for pi in packed_items:
            provenance_out.append({"category": pi.category, "title": pi.title, **pi.provenance})
            if pi.category == "rule":
                rules_out.append({"title": pi.title, "instruction": pi.content, **pi.provenance})
            elif pi.category == "decision":
                decisions_out.append({"id": pi.provenance.get("decision_id", ""), "title": pi.title, "details": pi.content, **pi.provenance})
            elif pi.category == "file":
                files_out.append({"path": pi.provenance.get("file_path", pi.title), "snippet": pi.content})
            elif pi.category == "symbol":
                symbols_out.append({"name": pi.title, "details": pi.content, **pi.provenance})
            elif pi.category == "error_solution":
                errors_out.append({"item": pi.content, **pi.provenance})
            elif pi.category == "commit":
                commits_out.append({"summary": pi.content, **pi.provenance})
            elif pi.category == "conversation":
                convs_out.append({"title": pi.title, "summary": pi.content, **pi.provenance})

        bundle = ContextBundle(
            task=request.prompt,
            task_type=task_type,
            project_summary="Knovra: Universal AI Project Intelligence Monorepo (Go runtime, Python context-engine, Rust code-indexer)",
            architecture=["polyglot monorepo", "property graph (Neo4j)", "resilient vector store (pgvector)", "local-first offline"],
            rules=rules_out,
            files=files_out,
            symbols=symbols_out,
            dependencies=[],
            decisions=decisions_out,
            prior_errors_solutions=errors_out,
            recent_changes=commits_out,
            relevant_conversations=convs_out,
            provenance=provenance_out,
            freshness="fresh",
            token_usage=token_usage,
            total_tokens=total_tokens,
        )

        markdown_prompt = render_markdown_prompt(bundle)

        return ContextPlanResponse(
            bundle=bundle,
            markdown_prompt=markdown_prompt,
        )
