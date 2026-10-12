"""Graph-backed, explainable Impact Analysis Engine for Knovra (Phase 12).

Performs reverse dependency traversal, caller/callee analysis, test suite
discovery, database relation mapping, and ADR/rule linking.
"""

import logging
import os
import re
import time
from pathlib import Path
from typing import Any

from app.decision import DecisionRuleStore
from app.git_memory import GitMemoryStore
from app.impact.models import (
    CriticalPath,
    ImpactAnalysisRequest,
    ImpactAnalysisResponse,
    ImpactNode,
    ImpactTargetType,
    ImpactType,
    RelatedDecisionImpact,
    TestRecommendation,
)

logger = logging.getLogger("knovra.impact")

# Known architectural database tables and mapped primary components
KNOWN_DB_TABLES: dict[str, dict[str, Any]] = {
    "chunks": {
        "description": "Vector store chunks & embeddings table (pgvector)",
        "models": ["Chunk", "ChunkMetadata", "FreshnessMetadata"],
        "consumers": [
            "services/context-engine/app/storage/vector_store.py",
            "services/context-engine/app/main.py",
            "services/runtime/internal/semantic/client.go",
        ],
    },
    "decisions": {
        "description": "Architectural Decision Records (ADRs) table",
        "models": ["Decision", "DecisionStatus", "DecisionCategory"],
        "consumers": [
            "services/context-engine/app/decision/store.py",
            "services/context-engine/app/planner/engine.py",
            "services/runtime/internal/decision/client.go",
        ],
    },
    "rules": {
        "description": "Architectural Rules and invariant constraints table",
        "models": ["Rule", "RuleSeverity", "RuleCategory"],
        "consumers": [
            "services/context-engine/app/decision/store.py",
            "services/context-engine/app/planner/engine.py",
        ],
    },
    "sessions": {
        "description": "Conversation sessions and agent interaction history",
        "models": ["ConversationSession", "Message", "ExtractedFact"],
        "consumers": [
            "services/context-engine/app/conversation/store.py",
            "services/runtime/internal/conversation/client.go",
        ],
    },
    "commits": {
        "description": "Git commit provenance and file diff lineage",
        "models": ["GitCommit", "FileDiffRecord"],
        "consumers": [
            "services/context-engine/app/git_memory/store.py",
            "services/runtime/internal/git/client.go",
        ],
    },
    "events": {
        "description": "Agent event stream and continuous learning ledger",
        "models": ["AgentEvent", "EventBatch", "DeadLetterRecord"],
        "consumers": [
            "services/context-engine/app/events/bus.py",
            "services/runtime/internal/events/client.go",
        ],
    },
}

# Known API endpoints and consumer mappings
KNOWN_API_ENDPOINTS: dict[str, dict[str, Any]] = {
    "/semantic/search": {
        "handler": "services/context-engine/app/main.py:search_semantic",
        "consumers": [
            "services/runtime/internal/semantic/client.go",
            "services/context-engine/app/planner/engine.py",
            "services/context-engine/app/mcp/handler.py:semantic_search",
        ],
    },
    "/semantic/delta": {
        "handler": "services/context-engine/app/main.py:delta_index",
        "consumers": [
            "services/runtime/internal/watcher/invalidator.go",
            "services/runtime/cmd/knovra/main.go:runWatch",
        ],
    },
    "/plan/context": {
        "handler": "services/context-engine/app/main.py:plan_context",
        "consumers": [
            "services/runtime/internal/planner/client.go",
            "services/context-engine/app/mcp/handler.py:plan_context",
        ],
    },
    "/events/publish": {
        "handler": "services/context-engine/app/main.py:publish_event",
        "consumers": [
            "services/runtime/internal/events/client.go",
            "services/context-engine/app/mcp/handler.py:emit_event",
        ],
    },
    "/impact/analyze": {
        "handler": "services/context-engine/app/main.py:analyze_impact",
        "consumers": [
            "services/runtime/internal/impact/analyzer.go",
            "services/context-engine/app/mcp/handler.py:impact_analysis",
        ],
    },
}


class ImpactAnalyzer:
    """Universal Graph-Backed Impact Analysis Engine."""

    def __init__(
        self,
        decision_store: DecisionRuleStore | None = None,
        git_store: GitMemoryStore | None = None,
        code_index_data: dict[str, Any] | None = None,
    ) -> None:
        self.decision_store = decision_store
        self.git_store = git_store
        self.code_index = code_index_data or {}
        self._reverse_deps: dict[str, list[tuple[str, str]]] = {}
        self._callers: dict[str, list[dict[str, Any]]] = {}
        self._file_symbols: dict[str, list[dict[str, Any]]] = {}
        self._all_files: list[str] = []

        self._build_in_memory_graph()

    def _build_in_memory_graph(self) -> None:
        """Indexes reverse dependencies, callers, and file-symbol relationships."""
        files = self.code_index.get("files", [])
        for f in files:
            fpath = f.get("file_path", "").replace("\\", "/")
            if not fpath:
                continue
            self._all_files.append(fpath)
            self._file_symbols[fpath] = f.get("symbols", [])

            # Index calls: callee -> callers
            for c in f.get("calls", []):
                callee = c.get("callee", "")
                caller = c.get("caller", "")
                line = c.get("line", 0)
                if callee:
                    self._callers.setdefault(callee.lower(), []).append({
                        "file_path": fpath,
                        "caller": caller,
                        "line": line,
                    })

            # Index imports: module -> importers
            for imp in f.get("imports", []):
                mod = imp.get("module", "").replace("\\", "/")
                sym = imp.get("symbol", "")
                if mod:
                    self._reverse_deps.setdefault(mod, []).append((fpath, "imports"))
                if sym:
                    self._reverse_deps.setdefault(sym.lower(), []).append((fpath, "imports_symbol"))

        # Index dependency edges
        for edge in self.code_index.get("dependency_edges", []):
            src = edge.get("from", "").replace("\\", "/")
            tgt = edge.get("to", "").replace("\\", "/")
            edge_type = edge.get("type", "DEPENDS_ON")
            if src and tgt and src != tgt:
                self._reverse_deps.setdefault(tgt, []).append((src, edge_type))

    def detect_target_type(self, target: str) -> ImpactTargetType:
        """Heuristically infers the target type from string characteristics."""
        target_norm = target.strip().replace("\\", "/")

        # 1. API Endpoint
        if target_norm.startswith(("/", "GET ", "POST ", "PUT ", "DELETE ", "PATCH ")) or "/api/" in target_norm:
            return ImpactTargetType.API_ENDPOINT

        # 2. Database Table
        clean_target = target_norm.lower()
        if clean_target in KNOWN_DB_TABLES or clean_target.endswith(("_table", "_tbl")):
            return ImpactTargetType.DB_TABLE

        # 3. Known Service
        if clean_target in {"runtime", "context-engine", "code-indexer", "knovra-runtime", "gateway"}:
            return ImpactTargetType.SERVICE

        # 4. File by extension
        known_exts = {".py", ".go", ".rs", ".ts", ".js", ".json", ".yaml", ".yml", ".sql", ".sh", ".cypher"}
        if any(target_norm.endswith(ext) for ext in known_exts):
            return ImpactTargetType.FILE

        # 5. Class or Function by casing and symbols
        for syms in self._file_symbols.values():
            for s in syms:
                if s.get("name", "").lower() == clean_target:
                    kind = s.get("kind", "").lower()
                    if kind in {"class", "struct", "interface", "trait"}:
                        return ImpactTargetType.CLASS
                    if kind in {"function", "method"}:
                        return ImpactTargetType.FUNCTION

        # Check CamelCase naming convention for Class/Interface
        if re.match(r"^[A-Z][a-zA-Z0-9]+$", target.strip()):
            return ImpactTargetType.CLASS

        # Check snake_case or standard identifier
        if "_" in target_norm or re.match(r"^[a-z][a-zA-Z0-9_]*$", target.strip()):
            return ImpactTargetType.FUNCTION

        # Default fallback: Module
        return ImpactTargetType.MODULE

    def find_associated_tests(self, file_path: str) -> list[TestRecommendation]:
        """Discovers unit and regression test files directly mapped to a file."""
        norm_path = file_path.replace("\\", "/")
        path_obj = Path(norm_path)
        stem = path_obj.stem
        ext = path_obj.suffix

        recommendations: list[TestRecommendation] = []
        seen_tests: set[str] = set()

        # If the file itself is a test
        if "_test." in norm_path or "test_" in norm_path or "/tests/" in norm_path:
            return [
                TestRecommendation(
                    test_file=norm_path,
                    target_file=norm_path,
                    priority="critical",
                    reason="Target entity is directly inside a test suite",
                )
            ]

        # Check Go test pattern: foo.go -> foo_test.go
        if ext == ".go":
            candidate = norm_path.replace(".go", "_test.go")
            if candidate in self._all_files or os.path.exists(candidate):
                recommendations.append(
                    TestRecommendation(
                        test_file=candidate,
                        target_file=norm_path,
                        priority="critical",
                        reason=f"Direct Go unit test suite for '{path_obj.name}'",
                    )
                )
                seen_tests.add(candidate)

        # Check Python test patterns: foo.py -> test_foo.py or tests/test_foo.py
        if ext == ".py":
            candidates = [
                str(path_obj.parent / f"test_{stem}.py").replace("\\", "/"),
                f"tests/test_{stem}.py",
                f"services/context-engine/tests/test_{stem}.py",
            ]
            for cand in candidates:
                if (cand in self._all_files or os.path.exists(cand)) and (cand not in seen_tests):
                    recommendations.append(
                        TestRecommendation(
                            test_file=cand,
                            target_file=norm_path,
                            priority="critical",
                            reason=f"Direct Python pytest suite for '{path_obj.name}'",
                        )
                    )
                    seen_tests.add(cand)

        # Check Rust test patterns: foo.rs -> tests/test_foo.rs or lib test
        if ext == ".rs":
            candidates = [
                str(path_obj.parent / f"{stem}_test.rs").replace("\\", "/"),
                f"tests/test_{stem}.rs",
            ]
            for cand in candidates:
                if (cand in self._all_files or os.path.exists(cand)) and cand not in seen_tests:
                    recommendations.append(
                        TestRecommendation(
                            test_file=cand,
                            target_file=norm_path,
                            priority="critical",
                            reason=f"Direct Rust test suite for '{path_obj.name}'",
                        )
                    )
                    seen_tests.add(cand)

        # Reverse check: scan indexed files for tests importing or referencing this file
        for indexed_f in self._all_files:
            if (
                indexed_f not in seen_tests
                and ("_test." in indexed_f or "test_" in indexed_f or "/tests/" in indexed_f)
                and stem.lower() in indexed_f.lower()
            ):
                recommendations.append(
                    TestRecommendation(
                        test_file=indexed_f,
                        target_file=norm_path,
                        priority="high",
                        reason=f"Test file matching component name '{stem}'",
                    )
                )
                seen_tests.add(indexed_f)

        return recommendations

    async def analyze(self, request: ImpactAnalysisRequest) -> ImpactAnalysisResponse:
        """Executes full graph-backed impact analysis."""
        t0 = time.perf_counter()
        target = request.target.strip()
        target_norm = target.replace("\\", "/")
        target_type = request.target_type or self.detect_target_type(target)

        direct_impacts: list[ImpactNode] = []
        transitive_impacts: list[ImpactNode] = []
        all_impacted_names: set[str] = set()
        tests_to_run: list[TestRecommendation] = []
        critical_paths: list[CriticalPath] = []
        related_decisions: list[RelatedDecisionImpact] = []
        recent_commits: list[dict[str, Any]] = []

        # ----------------------------------------------------------------------
        # 1. Target Type Specific Direct Resolution
        # ----------------------------------------------------------------------
        if target_type == ImpactTargetType.DB_TABLE:
            clean_tbl = target_norm.lower().replace("_table", "").replace("_tbl", "")
            tbl_info = KNOWN_DB_TABLES.get(clean_tbl, {})
            if tbl_info:
                for c in tbl_info.get("consumers", []):
                    direct_impacts.append(
                        ImpactNode(
                            name=c,
                            target_type=ImpactTargetType.FILE,
                            impact_type=ImpactType.DIRECT,
                            distance=1,
                            confidence=1.0,
                            reason=f"Directly queries and maps database table '{clean_tbl}'",
                            critical=True,
                            provenance={"table": clean_tbl, "models": tbl_info.get("models", [])},
                        )
                    )
                    all_impacted_names.add(c)
                critical_paths.append(
                    CriticalPath(
                        path=[clean_tbl, *tbl_info.get("consumers", [])[:2]],
                        risk_level="critical",
                        description=f"Database schema change on '{clean_tbl}' directly impacts core storage and API layers.",
                    )
                )

        elif target_type == ImpactTargetType.API_ENDPOINT:
            endpoint_norm = target_norm
            for prefix in ("GET ", "POST ", "PUT ", "DELETE ", "PATCH "):
                if endpoint_norm.startswith(prefix):
                    endpoint_norm = endpoint_norm[len(prefix):]
                    break
            api_info = KNOWN_API_ENDPOINTS.get(endpoint_norm, {})
            if api_info:
                handler = api_info.get("handler", "")
                if handler:
                    direct_impacts.append(
                        ImpactNode(
                            name=handler,
                            target_type=ImpactTargetType.FILE,
                            impact_type=ImpactType.DIRECT,
                            distance=1,
                            confidence=1.0,
                            reason=f"Implements HTTP API endpoint '{endpoint_norm}'",
                            critical=True,
                            provenance={"endpoint": endpoint_norm},
                        )
                    )
                    all_impacted_names.add(handler)
                for consumer in api_info.get("consumers", []):
                    direct_impacts.append(
                        ImpactNode(
                            name=consumer,
                            target_type=ImpactTargetType.FILE,
                            impact_type=ImpactType.DIRECT,
                            distance=1,
                            confidence=0.95,
                            reason=f"Consumes API endpoint '{endpoint_norm}'",
                            critical=False,
                            provenance={"endpoint": endpoint_norm},
                        )
                    )
                    all_impacted_names.add(consumer)

        elif target_type in {ImpactTargetType.FUNCTION, ImpactTargetType.CLASS}:
            # Callers of the function or class
            caller_list = self._callers.get(target.lower(), [])
            for c in caller_list:
                c_file = c["file_path"]
                caller_sym = c["caller"]
                line = c["line"]
                direct_impacts.append(
                    ImpactNode(
                        name=f"{c_file}:{caller_sym}",
                        target_type=ImpactTargetType.FUNCTION,
                        impact_type=ImpactType.DIRECT,
                        distance=1,
                        confidence=1.0,
                        reason=f"Calls symbol '{target}' at line {line}",
                        critical="test" not in c_file,
                        provenance={"callee": target, "caller": caller_sym, "file": c_file, "line": line},
                    )
                )
                all_impacted_names.add(c_file)

            # Check if defined in any indexed file
            for fpath, syms in self._file_symbols.items():
                for s in syms:
                    if s.get("name", "").lower() == target.lower():
                        direct_impacts.append(
                            ImpactNode(
                                name=fpath,
                                target_type=ImpactTargetType.FILE,
                                impact_type=ImpactType.DIRECT,
                                distance=1,
                                confidence=1.0,
                                reason=f"Declares symbol '{target}' ({s.get('kind', 'symbol')})",
                                critical=True,
                                provenance={"symbol_id": s.get("id", "")},
                            )
                        )
                        all_impacted_names.add(fpath)

        # ----------------------------------------------------------------------
        # 2. File / Module Dependency Traversal (BFS)
        # ----------------------------------------------------------------------
        queue: list[tuple[str, int, list[str]]] = []  # (node, depth, path)

        # Initialize BFS queue with target or resolved direct files
        if target_type == ImpactTargetType.FILE or target_norm in self._all_files:
            queue.append((target_norm, 1, [target_norm]))
            all_impacted_names.add(target_norm)
        else:
            for d in direct_impacts:
                clean_name = d.name.split(":")[0]
                queue.append((clean_name, 2, [target_norm, clean_name]))

        visited: set[str] = {target_norm}

        while queue:
            current_node, depth, path = queue.pop(0)
            if depth > request.max_depth:
                continue

            # Look up who depends on or imports current_node
            dependents: list[tuple[str, str]] = []

            # Exact match
            if current_node in self._reverse_deps:
                dependents.extend(self._reverse_deps[current_node])

            # Suffix / partial module match
            node_stem = Path(current_node).stem
            for key, deps in self._reverse_deps.items():
                if key != current_node and (current_node.endswith(key) or key.endswith(node_stem)):
                    dependents.extend(deps)

            for dep_file, edge_kind in dependents:
                dep_clean = dep_file.replace("\\", "/")
                if dep_clean in visited:
                    continue
                visited.add(dep_clean)
                all_impacted_names.add(dep_clean)

                is_direct = depth == 1
                decay_factor = 0.75 ** (depth - 1)
                confidence = round(1.0 * decay_factor, 2)
                imp_type = ImpactType.DIRECT if is_direct else ImpactType.TRANSITIVE

                reason = f"Imports '{current_node}' via edge [{edge_kind}]"
                if depth > 1:
                    reason = f"Transitively depends on '{target_norm}' via {len(path)} hops: {' -> '.join(path)}"

                node = ImpactNode(
                    name=dep_clean,
                    target_type=ImpactTargetType.FILE,
                    impact_type=imp_type,
                    distance=depth,
                    confidence=confidence,
                    reason=reason,
                    critical=depth <= 2 and "cmd" in dep_clean or "main" in dep_clean,
                    provenance={"edge_type": edge_kind, "hops": depth, "path": path},
                )

                if is_direct:
                    direct_impacts.append(node)
                else:
                    transitive_impacts.append(node)

                new_path = [*path, dep_clean]
                if depth >= 2 and ("cmd" in dep_clean or "main" in dep_clean):
                    critical_paths.append(
                        CriticalPath(
                            path=new_path,
                            risk_level="high",
                            description=f"Change propagates across service boundary to entrypoint '{dep_clean}'",
                        )
                    )

                if request.include_transitive and depth < request.max_depth:
                    queue.append((dep_clean, depth + 1, new_path))

        # ----------------------------------------------------------------------
        # 3. Test Recommendations Discovery
        # ----------------------------------------------------------------------
        if request.include_tests:
            files_to_check = set(all_impacted_names)
            if target_type == ImpactTargetType.FILE:
                files_to_check.add(target_norm)

            seen_test_files: set[str] = set()
            for f in files_to_check:
                # Direct test recommendations
                recs = self.find_associated_tests(f)
                for r in recs:
                    if r.test_file not in seen_test_files:
                        seen_test_files.add(r.test_file)
                        # Downgrade priority if found via transitive file
                        if f != target_norm and r.priority == "critical":
                            r.priority = "high"
                            r.reason = f"Downstream regression test for impacted file '{Path(f).name}'"
                        tests_to_run.append(r)

        # ----------------------------------------------------------------------
        # 4. Related Decisions & Rules Discovery (Phase 06)
        # ----------------------------------------------------------------------
        if request.include_decisions and self.decision_store is not None:
            all_rules = self.decision_store.list_rules()
            all_decisions = self.decision_store.list_decisions()

            # Find matching rules for target or impacted files
            target_files = {target_norm, *all_impacted_names}
            matching_rules: list[dict[str, Any]] = []

            for r in all_rules:
                matches = r.scope == "*" or any(
                    tf.startswith(r.scope.rstrip("*")) for tf in target_files
                )
                if matches:
                    matching_rules.append({
                        "id": r.id,
                        "title": r.title,
                        "severity": r.severity.value,
                        "instruction": r.instruction,
                        "scope": r.scope,
                    })

            # Find decisions affecting target or matching keywords
            keywords = {target_norm.lower(), *[Path(tf).stem.lower() for tf in target_files]}
            for d in all_decisions:
                is_match = any(kw in d.title.lower() or kw in d.reason.lower() for kw in keywords if len(kw) > 3)
                if is_match or d.id.lower() in target_norm.lower():
                    related_decisions.append(
                        RelatedDecisionImpact(
                            decision_id=d.id,
                            title=d.title,
                            status=d.status.value,
                            reason=d.reason,
                            rules=[r for r in matching_rules if r.get("scope") in {d.id, "*"}],
                        )
                    )

            # If no specific decision matched, attach global architectural decisions
            if not related_decisions and all_decisions:
                primary = all_decisions[0]
                related_decisions.append(
                    RelatedDecisionImpact(
                        decision_id=primary.id,
                        title=primary.title,
                        status=primary.status.value,
                        reason=primary.reason,
                        rules=matching_rules[:3],
                    )
                )

        # ----------------------------------------------------------------------
        # 5. Recent Commits & Churn (Phase 07)
        # ----------------------------------------------------------------------
        if request.include_commits and self.git_store is not None:
            for f in [target_norm, *list(all_impacted_names)[:3]]:
                commits = self.git_store.get_commits_for_file(f)
                for c in commits[:2]:
                    recent_commits.append({
                        "file": f,
                        "commit_hash": c.short_hash,
                        "author": c.author_name,
                        "date": c.date.isoformat(),
                        "subject": c.subject,
                    })

        # ----------------------------------------------------------------------
        # 6. Overall Confidence & Explanation Calculation
        # ----------------------------------------------------------------------
        total_impacted = len(direct_impacts) + len(transitive_impacts)
        if direct_impacts:
            confidence_score = round(sum(d.confidence for d in direct_impacts) / len(direct_impacts), 2)
        else:
            confidence_score = 0.85 if total_impacted > 0 else 1.0

        explanation = (
            f"Impact analysis for '{target}' ({target_type.value}): "
            f"identified {len(direct_impacts)} direct dependency links and {len(transitive_impacts)} "
            f"transitive dependents up to depth {request.max_depth}. "
            f"Recommended {len(tests_to_run)} test suites for regression verification. "
            f"Cross-referenced {len(related_decisions)} governing architectural decisions."
        )

        duration_ms = round((time.perf_counter() - t0) * 1000, 2)

        return ImpactAnalysisResponse(
            target=target,
            target_type=target_type,
            direct_impacts=direct_impacts,
            transitive_impacts=transitive_impacts,
            total_impacted=total_impacted,
            confidence_score=confidence_score,
            critical_paths=critical_paths,
            tests_to_run=tests_to_run,
            related_decisions=related_decisions,
            recent_commits=recent_commits,
            graph_backed=True,
            explanation=explanation,
            execution_time_ms=duration_ms,
        )
