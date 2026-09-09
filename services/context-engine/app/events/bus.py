"""Event bus abstraction providing NATS JetStream and resilient local in-memory fallback."""

import asyncio
import json
import logging
from collections.abc import Callable, Coroutine
from typing import Any

from app.events.models import AgentEvent

logger = logging.getLogger("knovra.event-bus")

EventHandler = Callable[[AgentEvent], Coroutine[Any, Any, Any]]


class EventBus:
    """Protocol for event streaming backbones."""

    async def publish(self, event: AgentEvent) -> bool:
        raise NotImplementedError

    def subscribe(self, handler: EventHandler) -> None:
        raise NotImplementedError

    async def start(self) -> None:
        pass

    async def stop(self) -> None:
        pass


class InMemoryEventBus(EventBus):
    """Local, in-memory event bus ensuring deterministic offline execution (Invariant #7)."""

    def __init__(self) -> None:
        self._handlers: list[EventHandler] = []
        self._is_running = False

    def subscribe(self, handler: EventHandler) -> None:
        self._handlers.append(handler)

    async def publish(self, event: AgentEvent) -> bool:
        logger.debug("InMemoryEventBus publishing event %s (%s)", event.event_id, event.event_type.value)
        for handler in self._handlers:
            try:
                await handler(event)
            except Exception as ex:  # noqa: BLE001
                logger.error("Handler error on event %s: %s", event.event_id, ex)
        return True


class ResilientEventBus(EventBus):
    """Dual-mode event bus using NATS JetStream when available with resilient local fallback."""

    def __init__(self, nats_url: str = "nats://localhost:4222") -> None:
        self.nats_url = nats_url
        self.in_memory = InMemoryEventBus()
        self.is_nats_connected = False
        self._handlers: list[EventHandler] = []
        self._nc: Any = None
        self._js: Any = None

    def subscribe(self, handler: EventHandler) -> None:
        self._handlers.append(handler)
        self.in_memory.subscribe(handler)

    async def start(self) -> None:
        """Attempts connection to NATS JetStream; falls back to in-memory mode if offline."""
        try:
            # Check if nats-py is installed
            import nats
            logger.info("Attempting connection to NATS JetStream at %s...", self.nats_url)
            self._nc = await asyncio.wait_for(nats.connect(self.nats_url), timeout=2.0)
            self._js = self._nc.jetstream()

            # Create stream if not exists
            await self._js.add_stream(name="KNOVRA_EVENTS", subjects=["knovra.events.>"])
            self.is_nats_connected = True
            logger.info("✓ Connected to NATS JetStream successfully.")

        except Exception as ex:  # noqa: BLE001
            self.is_nats_connected = False
            logger.info("ℹ️  NATS JetStream offline (%s). Using local in-memory event bus (Invariant #7).", ex)

    async def publish(self, event: AgentEvent) -> bool:
        if self.is_nats_connected and self._js:
            try:
                subject = f"knovra.events.{event.event_type.value.lower()}"
                payload_bytes = json.dumps(event.model_dump(), default=str).encode("utf-8")
                await self._js.publish(subject, payload_bytes)
                logger.debug("Published event %s to NATS subject %s", event.event_id, subject)
                # Also notify local handlers
                await self.in_memory.publish(event)
                return True
            except Exception as ex:  # noqa: BLE001
                logger.warning("NATS publish failed (%s). Falling back to in-memory bus.", ex)

        return await self.in_memory.publish(event)

    async def stop(self) -> None:
        if self._nc and self.is_nats_connected:
            try:
                await self._nc.drain()
            except Exception:  # noqa: BLE001, S110
                pass
            self.is_nats_connected = False

    def stats(self) -> dict[str, Any]:
        return {
            "mode": "nats" if self.is_nats_connected else "in-memory-fallback",
            "nats_connected": self.is_nats_connected,
            "nats_url": self.nats_url,
            "subscribers_count": len(self._handlers),
        }
