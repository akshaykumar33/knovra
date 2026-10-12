"""Dead-Letter Queue (DLQ) registry for failed event diagnostic retention."""

from datetime import UTC, datetime
from threading import Lock
from typing import Any

from pydantic import BaseModel, Field

from app.events.models import AgentEvent


class DeadLetterRecord(BaseModel):
    """Encapsulates a failed event and its diagnostic failure cause."""

    event: AgentEvent
    error: str
    failure_count: int = 1
    failed_at: str = Field(default_factory=lambda: datetime.now(UTC).isoformat())
    metadata: dict[str, Any] = Field(default_factory=dict)


class DeadLetterRegistry:
    """Thread-safe in-memory dead-letter store."""

    def __init__(self, max_size: int = 1000) -> None:
        self._lock = Lock()
        self._max_size = max_size
        self._records: dict[str, DeadLetterRecord] = {}

    def record_failure(self, event: AgentEvent, error: str) -> DeadLetterRecord:
        """Stores or increments a failed event record."""
        with self._lock:
            if event.event_id in self._records:
                rec = self._records[event.event_id]
                rec.failure_count += 1
                rec.error = error
                rec.failed_at = datetime.now(UTC).isoformat()
                return rec

            # Evict oldest if capacity reached
            if len(self._records) >= self._max_size:
                oldest_id = next(iter(self._records))
                del self._records[oldest_id]

            rec = DeadLetterRecord(
                event=event,
                error=error,
                failure_count=1,
            )
            self._records[event.event_id] = rec
            return rec

    def list_records(self, limit: int = 50) -> list[DeadLetterRecord]:
        """Lists dead-letter records."""
        with self._lock:
            records = list(self._records.values())
            records.reverse()
            return records[:limit]

    def get_record(self, event_id: str) -> DeadLetterRecord | None:
        """Retrieves a single dead-letter record by event ID."""
        with self._lock:
            return self._records.get(event_id)

    def remove_record(self, event_id: str) -> bool:
        """Removes a record from the DLQ upon successful replay."""
        with self._lock:
            return self._records.pop(event_id, None) is not None

    def clear(self) -> None:
        """Clears all dead-letter records."""
        with self._lock:
            self._records.clear()
