"""Storage manager for conversation sessions, facts, and raw transcript preservation."""

import os
from collections import defaultdict
from pathlib import Path
from threading import Lock

from app.conversation.extractor import ConversationExtractor
from app.conversation.models import (
    ConversationSession,
    ExtractedFact,
    FactType,
)


class ConversationStore:
    """Thread-safe conversation session and fact store with bidirectional search indices."""

    def __init__(self, raw_storage_dir: str | None = None) -> None:
        self._lock = Lock()
        self._sessions: dict[str, ConversationSession] = {}
        self._sessions_by_decision: dict[str, set[str]] = defaultdict(set)
        self._sessions_by_file: dict[str, set[str]] = defaultdict(set)
        self._extractor = ConversationExtractor()
        self._raw_dir = Path(raw_storage_dir or os.getenv("KNOVRA_CONVERSATION_RAW_DIR", ".knovra/raw_conversations"))
        self._raw_dir.mkdir(parents=True, exist_ok=True)

    def save_raw_transcript(self, session_id: str, raw_content: str) -> str:
        target = self._raw_dir / f"{session_id}.raw.json"
        target.write_text(raw_content, encoding="utf-8")
        return str(target)

    def add_session(
        self,
        session: ConversationSession,
        raw_content: str | None = None,
    ) -> ConversationSession:
        with self._lock:
            # Preserve raw source separately if provided
            if raw_content:
                session.raw_source_path = self.save_raw_transcript(session.id, raw_content)

            # Extract intelligence and facts
            facts = self._extractor.extract_facts(session)
            session.extracted_facts = facts

            # Set summary on session
            for f in facts:
                if f.fact_type == FactType.SUMMARY:
                    session.summary = f.text
                    break

            # Index session
            self._sessions[session.id] = session

            # Index by referenced decisions and files
            for f in facts:
                for dec_id in f.related_decisions:
                    self._sessions_by_decision[dec_id.lower()].add(session.id)
                for fpath in f.related_entities:
                    self._sessions_by_file[fpath.lower()].add(session.id)

            return session

    def get_session(self, session_id: str) -> ConversationSession | None:
        with self._lock:
            return self._sessions.get(session_id)

    def list_sessions(self, limit: int = 50, offset: int = 0) -> list[ConversationSession]:
        with self._lock:
            items = list(self._sessions.values())
            # Sort newest first
            items.sort(key=lambda s: s.created_at, reverse=True)
            return items[offset : offset + limit]

    def get_sessions_for_decision(self, decision_id: str) -> list[ConversationSession]:
        with self._lock:
            sids = self._sessions_by_decision.get(decision_id.lower(), set())
            return [self._sessions[sid] for sid in sids if sid in self._sessions]

    def get_sessions_for_file(self, file_path: str) -> list[ConversationSession]:
        with self._lock:
            norm = file_path.replace("\\", "/").lower()
            matching_sids = set()
            for stored_path, sids in self._sessions_by_file.items():
                if norm in stored_path or stored_path in norm:
                    matching_sids.update(sids)
            return [self._sessions[sid] for sid in matching_sids if sid in self._sessions]

    def get_facts(self, session_id: str, fact_type: FactType | None = None) -> list[ExtractedFact]:
        with self._lock:
            session = self._sessions.get(session_id)
            if not session:
                return []
            if not fact_type:
                return list(session.extracted_facts)
            return [f for f in session.extracted_facts if f.fact_type == fact_type]
