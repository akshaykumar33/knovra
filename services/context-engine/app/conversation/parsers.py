"""Transcript parsers supporting Claude Code, ChatGPT, Codex, and Generic formats."""

import json
import uuid
from datetime import UTC, datetime
from typing import Any

from app.conversation.models import ConversationSession, Message, MessageRole
from app.security.redactor import SecretRedactor


def _normalize_role(raw: str) -> MessageRole:
    lower = raw.strip().lower()
    if lower in {"user", "human"}:
        return MessageRole.USER
    if lower in {"assistant", "bot", "ai", "model"}:
        return MessageRole.ASSISTANT
    if lower in {"tool", "function", "observation"}:
        return MessageRole.TOOL
    return MessageRole.SYSTEM


class GenericTranscriptParser:
    """Parses standard JSON/JSONL transcripts."""

    def __init__(self, redactor: SecretRedactor | None = None) -> None:
        self.redactor = redactor or SecretRedactor()

    def parse(self, data: Any, default_title: str | None = None, session_id: str | None = None) -> ConversationSession:
        sid = session_id or f"sess-{uuid.uuid4().hex[:12]}"
        title = default_title or "Conversation Session"
        messages: list[Message] = []

        if isinstance(data, str):
            # Try parsing JSON or JSONL
            trimmed = data.strip()
            if trimmed.startswith(("{", "[")):
                try:
                    data = json.loads(trimmed)
                except json.JSONDecodeError:
                    # Treat as JSONL
                    lines = [json.loads(line) for line in trimmed.splitlines() if line.strip()]
                    data = lines
            else:
                lines = [json.loads(line) for line in trimmed.splitlines() if line.strip()]
                data = lines

        if isinstance(data, dict):
            if "title" in data and not default_title:
                title = str(data["title"])
            if "id" in data and not session_id:
                sid = str(data["id"])
            raw_msgs = data.get("messages", [])
        elif isinstance(data, list):
            raw_msgs = data
        else:
            raw_msgs = []

        for idx, m in enumerate(raw_msgs):
            if not isinstance(m, dict):
                continue
            role = _normalize_role(str(m.get("role", "user")))
            raw_content = m.get("content", "")
            if isinstance(raw_content, list):
                # Concatenate text blocks
                parts = []
                for p in raw_content:
                    if isinstance(p, dict) and "text" in p:
                        parts.append(str(p["text"]))
                    elif isinstance(p, str):
                        parts.append(p)
                raw_content = "\n".join(parts)
            else:
                raw_content = str(raw_content)

            redacted_content = self.redactor.redact_text(raw_content)
            msg_id = str(m.get("id", f"msg-{idx + 1:04d}"))

            ts = datetime.now(UTC)
            if "timestamp" in m:
                try:
                    ts = datetime.fromisoformat(str(m["timestamp"]))
                except ValueError:
                    pass

            messages.append(
                Message(
                    id=msg_id,
                    role=role,
                    content=redacted_content,
                    timestamp=ts,
                    metadata=m.get("metadata", {}),
                    tool_calls=m.get("tool_calls", []),
                )
            )

        return ConversationSession(
            id=sid,
            title=title,
            source_format="generic",
            messages=messages,
        )


class ClaudeCodeTranscriptParser:
    """Parses Claude Code transcript sessions and logs."""

    def __init__(self, redactor: SecretRedactor | None = None) -> None:
        self.redactor = redactor or SecretRedactor()

    def parse(self, data: Any, default_title: str | None = None, session_id: str | None = None) -> ConversationSession:
        sid = session_id or f"claude-{uuid.uuid4().hex[:12]}"
        title = default_title or "Claude Code Session"
        messages: list[Message] = []

        if isinstance(data, str):
            trimmed = data.strip()
            try:
                data = json.loads(trimmed)
            except json.JSONDecodeError:
                data = [json.loads(line) for line in trimmed.splitlines() if line.strip()]

        raw_list = data if isinstance(data, list) else data.get("messages", [data])

        for idx, item in enumerate(raw_list):
            if not isinstance(item, dict):
                continue
            role = _normalize_role(str(item.get("role", item.get("type", "user"))))
            content_val = item.get("content", item.get("text", item.get("message", "")))

            tool_calls = []
            if isinstance(content_val, list):
                text_parts = []
                for block in content_val:
                    if isinstance(block, dict):
                        btype = block.get("type")
                        if btype == "text":
                            text_parts.append(block.get("text", ""))
                        elif btype == "tool_use":
                            tool_calls.append(block)
                            text_parts.append(f"[Tool Use: {block.get('name')}]")
                        elif btype == "tool_result":
                            text_parts.append(f"[Tool Result: {block.get('content', '')}]")
                    elif isinstance(block, str):
                        text_parts.append(block)
                raw_text = "\n".join(text_parts)
            else:
                raw_text = str(content_val)

            redacted_content = self.redactor.redact_text(raw_text)
            msg_id = str(item.get("id", f"claude-msg-{idx + 1:04d}"))

            messages.append(
                Message(
                    id=msg_id,
                    role=role,
                    content=redacted_content,
                    tool_calls=tool_calls,
                    metadata=item.get("metadata", {}),
                )
            )

        return ConversationSession(
            id=sid,
            title=title,
            source_format="claude_code",
            messages=messages,
        )


class ChatGPTTranscriptParser:
    """Parses OpenAI ChatGPT export JSON structure."""

    def __init__(self, redactor: SecretRedactor | None = None) -> None:
        self.redactor = redactor or SecretRedactor()

    def parse(self, data: Any, default_title: str | None = None, session_id: str | None = None) -> ConversationSession:
        if isinstance(data, str):
            data = json.loads(data)

        if isinstance(data, list) and len(data) > 0:
            # Multi-conversation export, take first or wrapper
            data = data[0]

        title = default_title or data.get("title", "ChatGPT Session")
        sid = session_id or data.get("id", f"chatgpt-{uuid.uuid4().hex[:12]}")

        messages: list[Message] = []
        mapping = data.get("mapping", {})

        if isinstance(mapping, dict):
            # Walk nodes in order of create_time if possible
            nodes = list(mapping.values())

            def sort_key(n: dict[str, Any]) -> float:
                msg = n.get("message")
                if isinstance(msg, dict) and msg.get("create_time"):
                    return float(msg["create_time"])
                return 0.0

            nodes.sort(key=sort_key)

            for idx, node in enumerate(nodes):
                if not isinstance(node, dict):
                    continue
                msg = node.get("message")
                if not isinstance(msg, dict):
                    continue

                author = msg.get("author", {})
                role_str = author.get("role", "user") if isinstance(author, dict) else "user"
                role = _normalize_role(role_str)

                content_obj = msg.get("content", {})
                parts = content_obj.get("parts", []) if isinstance(content_obj, dict) else []
                text = "\n".join(str(p) for p in parts if isinstance(p, str))

                if not text.strip():
                    continue

                redacted = self.redactor.redact_text(text)
                msg_id = msg.get("id", f"msg-{idx + 1}")

                create_time = msg.get("create_time")
                ts = (
                    datetime.fromtimestamp(create_time, tz=UTC)
                    if create_time
                    else datetime.now(UTC)
                )

                messages.append(
                    Message(
                        id=msg_id,
                        role=role,
                        content=redacted,
                        timestamp=ts,
                    )
                )

        return ConversationSession(
            id=sid,
            title=title,
            source_format="chatgpt",
            messages=messages,
        )


class CodexTranscriptParser:
    """Parses Codex / code assistant session transcripts."""

    def __init__(self, redactor: SecretRedactor | None = None) -> None:
        self.redactor = redactor or SecretRedactor()

    def parse(self, data: Any, default_title: str | None = None, session_id: str | None = None) -> ConversationSession:
        sid = session_id or f"codex-{uuid.uuid4().hex[:12]}"
        title = default_title or "Codex Assistant Session"

        if isinstance(data, str):
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                data = {"prompt": data}

        messages: list[Message] = []
        if isinstance(data, dict):
            if "prompt" in data:
                messages.append(
                    Message(
                        id=f"{sid}-p1",
                        role=MessageRole.USER,
                        content=self.redactor.redact_text(str(data["prompt"])),
                    )
                )
            if "completion" in data:
                messages.append(
                    Message(
                        id=f"{sid}-c1",
                        role=MessageRole.ASSISTANT,
                        content=self.redactor.redact_text(str(data["completion"])),
                    )
                )
            if "turns" in data and isinstance(data["turns"], list):
                for idx, turn in enumerate(data["turns"]):
                    if isinstance(turn, dict):
                        p = turn.get("prompt", turn.get("user", ""))
                        c = turn.get("completion", turn.get("assistant", ""))
                        if p:
                            messages.append(
                                Message(
                                    id=f"{sid}-p{idx + 1}",
                                    role=MessageRole.USER,
                                    content=self.redactor.redact_text(str(p)),
                                )
                            )
                        if c:
                            messages.append(
                                Message(
                                    id=f"{sid}-c{idx + 1}",
                                    role=MessageRole.ASSISTANT,
                                    content=self.redactor.redact_text(str(c)),
                                )
                            )

        return ConversationSession(
            id=sid,
            title=title,
            source_format="codex",
            messages=messages,
        )


def parse_transcript(
    data: Any,
    fmt: str = "generic",
    title: str | None = None,
    session_id: str | None = None,
    redactor: SecretRedactor | None = None,
) -> ConversationSession:
    """Factory helper to parse any supported transcript format."""
    normalized_fmt = fmt.lower().strip()
    if normalized_fmt in {"claude", "claude_code", "claude-code"}:
        parser = ClaudeCodeTranscriptParser(redactor=redactor)
    elif normalized_fmt in {"chatgpt", "openai"}:
        parser = ChatGPTTranscriptParser(redactor=redactor)
    elif normalized_fmt in {"codex", "copilot"}:
        parser = CodexTranscriptParser(redactor=redactor)
    else:
        parser = GenericTranscriptParser(redactor=redactor)

    return parser.parse(data, default_title=title, session_id=session_id)
