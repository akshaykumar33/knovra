"""Pipeline functions for task classification, entity extraction, token budgeting, and markdown rendering."""

import math
import re

from app.planner.models import ContextBundle, ContextItem, TaskType

ADR_REGEX = re.compile(r"\b(?:ADR|adr)[-_]?(\d{1,4})\b", re.IGNORECASE)
FILE_REGEX = re.compile(
    r"(?:[a-zA-Z0-9_\-./\\]+\.(?:py|go|rs|ts|js|json|yaml|yml|md|toml|sql|cypher|sh))\b"
)
SYMBOL_REGEX = re.compile(r"`([a-zA-Z_][a-zA-Z0-9_]{2,})`|\b([a-z]+(?:[A-Z][a-z0-9]+)+|[a-z]{3,}_[a-z0-9_]+)\b")


def estimate_tokens(text: str) -> int:
    """Estimates the token count of a string using word/subword heuristic."""
    if not text:
        return 0
    # Average token length is ~3.8 characters for code and prose
    chars = len(text)
    words = len(text.split())
    approx = (chars / 3.8 + words * 1.2) / 2.0
    return max(1, math.ceil(approx))


def classify_task(prompt: str) -> TaskType:
    """Classifies task intent using keyword analysis."""
    p = prompt.lower()

    if any(kw in p for kw in ["fix", "bug", "error", "fail", "broken", "panic", "exception", "crash", "timeout", "issue"]):
        return TaskType.BUGFIX
    if any(kw in p for kw in ["refactor", "cleanup", "clean up", "restructure", "reorganize", "simplify"]):
        return TaskType.REFACTOR
    if any(kw in p for kw in ["adr", "architect", "decision", "design", "supersede", "tradeoff", "governance"]):
        return TaskType.ARCHITECTURE
    if any(kw in p for kw in ["review", "audit", "inspect code", "check quality", "critique"]):
        return TaskType.CODE_REVIEW
    if any(kw in p for kw in ["add", "implement", "create", "build", "new", "feature", "support", "extend"]):
        return TaskType.FEATURE

    return TaskType.GENERAL


def extract_task_entities(prompt: str, file_hints: list[str] | None = None) -> dict[str, list[str]]:
    """Extracts mentioned files, ADRs, and candidate symbol names from task prompt."""
    files: set[str] = set()
    if file_hints:
        for fh in file_hints:
            files.add(fh.replace("\\", "/"))

    # File regex
    for m in FILE_REGEX.findall(prompt):
        files.add(m.replace("\\", "/"))

    # ADR regex
    adrs: set[str] = set()
    for num in ADR_REGEX.findall(prompt):
        adrs.add(f"adr-{int(num):03d}")

    # Symbols regex
    symbols: set[str] = set()
    for backticked, identifier in SYMBOL_REGEX.findall(prompt):
        sym = backticked or identifier
        if sym and len(sym) > 3 and not sym.endswith((".py", ".go", ".rs", ".md", ".json")):
            symbols.add(sym)

    return {
        "files": sorted(files),
        "adrs": sorted(adrs),
        "symbols": sorted(symbols),
    }


def compress_content(content: str, max_chars: int = 600) -> str:
    """Clips and folds lengthy content to fit within tight context limits."""
    cleaned = content.strip()
    if len(cleaned) <= max_chars:
        return cleaned

    # Extract first few lines and last line
    lines = cleaned.splitlines()
    if len(lines) > 8:
        head = lines[:5]
        tail = lines[-2:]
        return "\n".join(head) + "\n... [content truncated for token budget] ...\n" + "\n".join(tail)

    return cleaned[:max_chars] + "... [truncated]"


def pack_context_items(
    items: list[ContextItem],
    max_tokens: int,
    category_weights: dict[str, float] | None = None,
) -> tuple[list[ContextItem], dict[str, int], int]:
    """Packs context items within a hard token budget using greedy weighted ranking."""
    weights = category_weights or {
        "rule": 1.5,
        "decision": 1.4,
        "error_solution": 1.3,
        "symbol": 1.2,
        "file": 1.1,
        "commit": 1.0,
        "conversation": 0.9,
    }

    # Sort items by weighted score
    def sort_key(item: ContextItem) -> float:
        w = weights.get(item.category, 1.0)
        return item.relevance_score * w

    sorted_items = sorted(items, key=sort_key, reverse=True)

    packed: list[ContextItem] = []
    category_usage: dict[str, int] = {}
    current_tokens = 0

    for item in sorted_items:
        t_count = item.token_count or estimate_tokens(item.content)
        item.token_count = t_count

        if current_tokens + t_count <= max_tokens:
            packed.append(item)
            current_tokens += t_count
            category_usage[item.category] = category_usage.get(item.category, 0) + t_count

    return packed, category_usage, current_tokens


def render_markdown_prompt(bundle: ContextBundle) -> str:
    """Renders a ContextBundle into clean, prompt-ready markdown for AI agents."""
    lines: list[str] = [
        f"# CONTEXT BUNDLE: {bundle.task}",
        f"> **Task Type**: `{bundle.task_type.value.upper()}` | **Tokens**: `{bundle.total_tokens}` | **Freshness**: `{bundle.freshness}`",
        "",
    ]

    if bundle.project_summary:
        lines.extend([
            "## 1. Project Overview",
            bundle.project_summary,
            "",
        ])

    if bundle.rules:
        lines.append("## 2. Mandatory Governance Rules & Constraints")
        for r in bundle.rules:
            sev = r.get("severity", "medium").upper()
            lines.append(f"- **[{sev}] {r.get('title', 'Rule')}** (Scope: `{r.get('scope', '*')}`): {r.get('instruction', '')}")
        lines.append("")

    if bundle.decisions:
        lines.append("## 3. Governing Architecture Decisions (ADRs)")
        for d in bundle.decisions:
            lines.append(f"- **{d.get('id', '').upper()}: {d.get('title', '')}** (Status: `{d.get('status', '').upper()}`)")
            if d.get("reason"):
                lines.append(f"  *Rationale*: {d.get('reason')}")
        lines.append("")

    if bundle.files or bundle.symbols:
        lines.append("## 4. Key Code Entities & Signatures")
        for f in bundle.files:
            lines.append(f"### File: `{f.get('path', '')}`")
            if f.get("snippet"):
                lines.extend(["```", f.get("snippet", ""), "```"])
        for s in bundle.symbols:
            lines.append(f"- Symbol `{s.get('name', '')}` ({s.get('kind', 'symbol')}) in `{s.get('file', '')}:{s.get('line', '')}`")
            if s.get("signature"):
                lines.append(f"  `{s.get('signature', '')}`")
        lines.append("")

    if bundle.prior_errors_solutions:
        lines.append("## 5. Prior Errors & Verified Solutions")
        for es in bundle.prior_errors_solutions:
            lines.append(f"- **Problem**: {es.get('error', '')}")
            lines.append(f"  **Solution**: {es.get('solution', '')}")
        lines.append("")

    if bundle.recent_changes:
        lines.append("## 6. Recent Relevant Commits")
        for c in bundle.recent_changes:
            adrs = f" [ADR: {', '.join(c.get('linked_decisions', []))}]" if c.get("linked_decisions") else ""
            lines.append(f"- `{c.get('short_hash', '')}` ({c.get('date', '')[:10]}) {c.get('author_name', '')}: {c.get('subject', '')}{adrs}")
        lines.append("")

    if bundle.relevant_conversations:
        lines.append("## 7. Relevant Historical Discussions")
        for conv in bundle.relevant_conversations:
            lines.append(f"- Session `{conv.get('session_id', '')}`: {conv.get('title', '')}")
            if conv.get("summary"):
                lines.append(f"  *Summary*: {conv.get('summary', '')}")
        lines.append("")

    return "\n".join(lines).strip()
