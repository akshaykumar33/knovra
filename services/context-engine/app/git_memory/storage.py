"""Storage and cross-domain lineage engine for Git history and decisions."""

from collections import defaultdict
from threading import Lock
from typing import Any

from app.git_memory.models import (
    GitBranch,
    GitCommit,
    GitTag,
    LineageTraceResult,
)


class GitMemoryStore:
    """In-memory thread-safe store for Git history with bi-directional lineage indices."""

    def __init__(self) -> None:
        self._lock = Lock()
        self._commits: dict[str, GitCommit] = {}
        self._short_hash_map: dict[str, str] = {}
        self._branches: dict[str, GitBranch] = {}
        self._tags: dict[str, GitTag] = {}
        self._commits_by_file: dict[str, set[str]] = defaultdict(set)
        self._commits_by_decision: dict[str, set[str]] = defaultdict(set)

    def add_commit(self, commit: GitCommit) -> None:
        with self._lock:
            self._commits[commit.hash] = commit
            self._short_hash_map[commit.short_hash] = commit.hash

            # Index by file
            for fc in commit.changed_files:
                norm_path = fc.path.replace("\\", "/").lower()
                self._commits_by_file[norm_path].add(commit.hash)

            # Index by decision
            for dec_id in commit.linked_decisions:
                self._commits_by_decision[dec_id.lower()].add(commit.hash)

    def add_commits(self, commits: list[GitCommit]) -> int:
        for c in commits:
            self.add_commit(c)
        return len(commits)

    def add_branches(self, branches: list[GitBranch]) -> None:
        with self._lock:
            for b in branches:
                self._branches[b.name] = b

    def add_tags(self, tags: list[GitTag]) -> None:
        with self._lock:
            for t in tags:
                self._tags[t.name] = t

    def get_commit(self, hash_or_short: str) -> GitCommit | None:
        with self._lock:
            if hash_or_short in self._commits:
                return self._commits[hash_or_short]
            full_hash = self._short_hash_map.get(hash_or_short)
            if full_hash and full_hash in self._commits:
                return self._commits[full_hash]
            return None

    def list_commits(
        self,
        limit: int = 50,
        offset: int = 0,
        decision_id: str | None = None,
    ) -> list[GitCommit]:
        with self._lock:
            if decision_id:
                hashes = self._commits_by_decision.get(decision_id.lower(), set())
                commits = [self._commits[h] for h in hashes if h in self._commits]
            else:
                commits = list(self._commits.values())

            # Sort newest first
            commits.sort(key=lambda c: c.date, reverse=True)
            return commits[offset : offset + limit]

    def get_commits_for_file(self, file_path: str) -> list[GitCommit]:
        with self._lock:
            norm = file_path.replace("\\", "/").lower()
            matching_hashes: set[str] = set()
            for stored_path, hashes in self._commits_by_file.items():
                if norm in stored_path or stored_path in norm:
                    matching_hashes.update(hashes)

            result = [self._commits[h] for h in matching_hashes if h in self._commits]
            result.sort(key=lambda c: c.date, reverse=True)
            return result

    def get_commits_for_decision(self, decision_id: str) -> list[GitCommit]:
        with self._lock:
            hashes = self._commits_by_decision.get(decision_id.lower(), set())
            result = [self._commits[h] for h in hashes if h in self._commits]
            result.sort(key=lambda c: c.date, reverse=True)
            return result

    def trace_decision(
        self,
        decision_id: str,
        decision_store: Any | None = None,
        conversation_store: Any | None = None,
    ) -> LineageTraceResult:
        """Trace from an Architecture Decision -> Commits -> Modified Files -> Conversations."""
        norm_dec_id = decision_id.lower()

        title: str | None = None
        status: str | None = None
        if decision_store:
            dec = decision_store.get_decision(norm_dec_id)
            if dec:
                title = dec.title
                status = dec.status.value

        commits = self.get_commits_for_decision(norm_dec_id)

        # Collect unique modified files
        files_set: set[str] = set()
        for c in commits:
            for f in c.changed_files:
                files_set.add(f.path)

        # Collect conversations discussing this decision
        conversations: list[dict[str, Any]] = []
        if conversation_store:
            sessions = conversation_store.get_sessions_for_decision(norm_dec_id)
            for s in sessions:
                conversations.append(
                    {
                        "session_id": s.id,
                        "title": s.title,
                        "created_at": s.created_at.isoformat(),
                        "summary": s.summary,
                        "message_count": len(s.messages),
                    }
                )

        return LineageTraceResult(
            query_type="decision",
            query_target=decision_id,
            decision_id=norm_dec_id,
            decision_title=title,
            decision_status=status,
            commits=commits,
            modified_files=sorted(files_set),
            conversations=conversations,
        )

    def trace_file(
        self,
        file_path: str,
        decision_store: Any | None = None,
        conversation_store: Any | None = None,
    ) -> LineageTraceResult:
        """Trace from a Source File -> Modifying Commits -> Linked Decisions -> Mentioning Conversations."""
        commits = self.get_commits_for_file(file_path)

        # Discover linked decisions across these commits
        dec_ids_set: set[str] = set()
        for c in commits:
            for dec_id in c.linked_decisions:
                dec_ids_set.add(dec_id.lower())

        # Collect conversations mentioning this file
        conversations: list[dict[str, Any]] = []
        if conversation_store:
            sessions = conversation_store.get_sessions_for_file(file_path)
            for s in sessions:
                conversations.append(
                    {
                        "session_id": s.id,
                        "title": s.title,
                        "created_at": s.created_at.isoformat(),
                        "summary": s.summary,
                        "message_count": len(s.messages),
                    }
                )

        return LineageTraceResult(
            query_type="file",
            query_target=file_path,
            decision_id=", ".join(sorted(dec_ids_set)) if dec_ids_set else None,
            decision_title=None,
            decision_status=None,
            commits=commits,
            modified_files=[file_path],
            conversations=conversations,
        )
