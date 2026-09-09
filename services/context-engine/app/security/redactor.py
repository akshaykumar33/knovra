"""Knovra Context Engine - Secret Redactor.

Enforces Invariant #6: Zero secret leakage in logs, embeddings, or vector storage.
Scans content for high-entropy tokens, API keys, passwords, and private keys,
replacing them with safe redaction markers before chunking and embedding.
"""

import re
from typing import Tuple

SECRET_PATTERNS = [
    # AWS access key ID
    (re.compile(r"\b(AKIA[0-9A-Z]{16})\b"), "[REDACTED_AWS_KEY]"),
    # AWS secret access key (assignment pattern)
    (re.compile(r"(?i)(aws_secret_access_key|aws_key|secret_key)\s*[:=]\s*['\"]?([a-zA-Z0-9/+=]{40})['\"]?"), r"\1=[REDACTED_AWS_SECRET]"),
    # GitHub Personal Access Token (classic & fine-grained)
    (re.compile(r"\b(gh[pousr]_[A-Za-z0-9_]{36,255})\b"), "[REDACTED_GITHUB_TOKEN]"),
    # Generic bearer / API keys
    (re.compile(r"(?i)(bearer\s+|api[_-]?key\s*[:=]\s*['\"]?)([a-zA-Z0-9_\-\.]{20,})['\"]?"), r"\1[REDACTED_API_KEY]"),
    # Private RSA / EC / SSH keys
    (re.compile(r"-----BEGIN\s+[A-Z\s]+PRIVATE\s+KEY-----[\s\S]+?-----END\s+[A-Z\s]+PRIVATE\s+KEY-----"), "[REDACTED_PRIVATE_KEY]"),
    # Common password assignments
    (re.compile(r"(?i)(password|passwd|secret)\s*[:=]\s*['\"][^'\"]{6,}['\"]"), r"\1=\"[REDACTED_PASSWORD]\""),
    # Database connection strings with credentials
    (re.compile(r"://([^:@\s]+):([^@\s]+)@"), r"://\1:[REDACTED_PWD]@"),
]


def redact_secrets(text: str) -> Tuple[str, int]:
    """Scans text and replaces any detected secrets with redaction markers.

    Returns:
        (sanitized_text, count_of_redactions)
    """
    if not text:
        return text, 0

    sanitized = text
    total_redacted = 0

    for pattern, replacement in SECRET_PATTERNS:
        matches = len(pattern.findall(sanitized))
        if matches > 0:
            sanitized = pattern.sub(replacement, sanitized)
            total_redacted += matches

    return sanitized, total_redacted
