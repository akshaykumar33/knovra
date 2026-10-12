"""Idempotent Event Processor and Continuous Intelligence Learning Engine."""

import logging
import time
from collections import deque
from threading import Lock
from typing import Any

from app.conversation import (
    ConversationSession,
    ConversationStore,
    ExtractedFact,
    FactType,
)
from app.decision import Decision, DecisionRuleStore, DecisionStatus
from app.events.dead_letter import DeadLetterRegistry
from app.events.models import AgentEvent, EventType
from app.security.redactor import SecretRedactor
from app.storage.vector_store import BaseVectorStore

logger = logging.getLogger("knovra.event-processor")


class EventProcessor:
    """Processes incoming AgentEvents with strict idempotency and auto-learns into Knovra stores."""

    def __init__(
        self,
        decision_store: DecisionRuleStore,
        conversation_store: ConversationStore,
        vector_store: BaseVectorStore,
        dead_letter_registry: DeadLetterRegistry | None = None,
        max_history: int = 500,
    ) -> None:
        self.decision_store = decision_store
        self.conversation_store = conversation_store
        self.vector_store = vector_store
        self.dlq = dead_letter_registry or DeadLetterRegistry()
        self.redactor = SecretRedactor()

        self._lock = Lock()
        self._processed_ids: set[str] = set()
        self._processed_id_order: deque[str] = deque(maxlen=5000)
        self._event_history: deque[AgentEvent] = deque(maxlen=max_history)
        self._file_activities: deque[dict[str, Any]] = deque(maxlen=max_history)
        self._test_results: deque[dict[str, Any]] = deque(maxlen=max_history)

    async def process_event(self, event: AgentEvent) -> tuple[bool, bool, str]:
        """Processes an event idempotently.

        Returns:
            (success: bool, is_duplicate: bool, message: str)
        """
        # 1. Idempotency Check
        with self._lock:
            if event.event_id in self._processed_ids:
                logger.info("Ignoring duplicate event: %s (%s)", event.event_id, event.event_type.value)
                return True, True, "Event already processed (idempotent duplicate)"

        # 2. Invariant #6: Secret Redaction on Event Payload
        sanitized_payload = self._sanitize_dict(event.payload)
        event.payload = sanitized_payload

        # 3. Continuous Learning Dispatch
        try:
            await self._dispatch_learning(event)

            with self._lock:
                self._processed_ids.add(event.event_id)
                self._processed_id_order.append(event.event_id)
                self._event_history.append(event)

            logger.info("Successfully processed event %s: %s", event.event_id, event.event_type.value)
            return True, False, "Event processed and integrated into project intelligence"

        except Exception as ex:
            logger.exception("Failed processing event %s", event.event_id)
            self.dlq.record_failure(event, str(ex))
            return False, False, f"Event processing failed: {ex}"

    async def _dispatch_learning(self, event: AgentEvent) -> None:
        """Dispatches event to appropriate subsystem learner without manual import."""
        p = event.payload

        if event.event_type == EventType.DECISION_MADE:
            await self._learn_decision(event, p)
        elif event.event_type == EventType.ERROR_OBSERVED:
            self._learn_error(event, p)
        elif event.event_type == EventType.SOLUTION_APPLIED:
            await self._learn_solution(event, p)
        elif event.event_type in (EventType.FILE_MODIFIED, EventType.FILE_CREATED, EventType.FILE_READ):
            self._learn_file_activity(event, p)
        elif event.event_type in (EventType.TEST_PASSED, EventType.TEST_FAILED, EventType.TEST_EXECUTED):
            self._learn_test_activity(event, p)
        elif event.event_type in (EventType.TASK_STARTED, EventType.TASK_COMPLETED, EventType.PROMPT_RECEIVED):
            self._learn_task_session(event, p)

    async def _learn_decision(self, event: AgentEvent, p: dict[str, Any]) -> None:
        """Automatically creates and registers Architectural Decision Record."""
        did = p.get("id") or f"ADR-{int(time.time())}"
        title = p.get("title") or "Dynamic Architectural Decision"
        status_str = str(p.get("status", "accepted")).upper()
        status = DecisionStatus.ACCEPTED
        if status_str in DecisionStatus.__members__:
            status = DecisionStatus[status_str]

        reason = p.get("reason") or "Discovered during autonomous agent execution"
        decision_text = p.get("decision") or title

        dec = Decision(
            id=did,
            title=title,
            status=status,
            description=decision_text,
            reason=reason,
            supersedes=p.get("supersedes"),
            created_by=event.agent_id,
            metadata={"session_id": event.session_id, "event_id": event.event_id},
        )
        self.decision_store.record_decision(dec)
        logger.info("Learned Decision from agent event: %s - %s", did, title)

    def _learn_error(self, event: AgentEvent, p: dict[str, Any]) -> None:
        """Stores observed runtime/compile error in conversation memory."""
        msg = p.get("error_message") or str(p)
        file_path = p.get("file_path", "")

        sess = self._ensure_agent_session(event)
        fact_id = f"fact-err-{int(time.time() * 1000)}"
        fact = ExtractedFact(
            id=fact_id,
            session_id=sess.id,
            fact_type=FactType.ERROR,
            text=f"Error in '{file_path}': {msg}" if file_path else msg,
            related_entities=[file_path] if file_path else [],
            metadata={"agent_id": event.agent_id, "event_id": event.event_id},
        )
        sess.extracted_facts.append(fact)
        logger.info("Learned Error from agent event: %s", msg[:60])

    async def _learn_solution(self, event: AgentEvent, p: dict[str, Any]) -> None:
        """Stores applied bugfix or architectural solution in memory."""
        prob = p.get("problem", "")
        sol = p.get("solution", "")
        text = f"Problem: {prob} | Solution: {sol}" if prob else sol

        sess = self._ensure_agent_session(event)
        fact_id = f"fact-sol-{int(time.time() * 1000)}"
        fact = ExtractedFact(
            id=fact_id,
            session_id=sess.id,
            fact_type=FactType.SOLUTION,
            text=text,
            related_entities=p.get("modified_files", []),
            metadata={"agent_id": event.agent_id, "event_id": event.event_id},
        )
        sess.extracted_facts.append(fact)
        logger.info("Learned Solution from agent event: %s", text[:60])

    def _learn_file_activity(self, event: AgentEvent, p: dict[str, Any]) -> None:
        """Tracks modified or created files."""
        fpath = p.get("file_path", "")
        if fpath:
            with self._lock:
                self._file_activities.append({
                    "event_type": event.event_type.value,
                    "file_path": fpath,
                    "agent_id": event.agent_id,
                    "session_id": event.session_id,
                    "timestamp": event.timestamp.isoformat(),
                    "additions": p.get("additions", 0),
                    "deletions": p.get("deletions", 0),
                    "summary": p.get("change_summary", ""),
                })

    def _learn_test_activity(self, event: AgentEvent, p: dict[str, Any]) -> None:
        """Tracks test execution results."""
        with self._lock:
            self._test_results.append({
                "test_name": p.get("test_name", "test"),
                "status": event.event_type.value,
                "duration_ms": p.get("duration_ms", 0.0),
                "error": p.get("error_message", ""),
                "timestamp": event.timestamp.isoformat(),
            })

    def _learn_task_session(self, event: AgentEvent, p: dict[str, Any]) -> None:
        """Tracks agent task transitions."""
        sess = self._ensure_agent_session(event)
        if event.event_type == EventType.PROMPT_RECEIVED:
            sess.summary = f"Active task: {p.get('prompt', '')[:120]}"

    def _ensure_agent_session(self, event: AgentEvent) -> ConversationSession:
        sid = event.session_id or f"agent-session-{event.agent_id}"
        sess = self.conversation_store.get_session(sid)
        if not sess:
            sess = ConversationSession(
                id=sid,
                title=f"Autonomous Agent Session ({event.agent_id})",
                source_format="agent_event_stream",
                messages=[],
                extracted_facts=[],
            )
            self.conversation_store._sessions[sid] = sess
        return sess

    def _sanitize_dict(self, data: dict[str, Any]) -> dict[str, Any]:
        """Recursively scrubs secrets from dictionary strings (Invariant #6)."""
        clean = {}
        for k, v in data.items():
            if isinstance(v, str):
                clean[k] = self.redactor.redact_text(v)
            elif isinstance(v, dict):
                clean[k] = self._sanitize_dict(v)
            elif isinstance(v, list):
                clean[k] = [self.redactor.redact_text(item) if isinstance(item, str) else item for item in v]
            else:
                clean[k] = v
        return clean

    def get_recent_events(self, limit: int = 50, event_type: EventType | None = None) -> list[AgentEvent]:
        with self._lock:
            events = list(self._event_history)
            if event_type:
                events = [e for e in events if e.event_type == event_type]
            events.reverse()
            return events[:limit]

    def get_file_activities(self, limit: int = 50) -> list[dict[str, Any]]:
        with self._lock:
            acts = list(self._file_activities)
            acts.reverse()
            return acts[:limit]

    def get_test_results(self, limit: int = 50) -> list[dict[str, Any]]:
        with self._lock:
            results = list(self._test_results)
            results.reverse()
            return results[:limit]
