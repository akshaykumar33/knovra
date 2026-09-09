"""Tool definitions and input schemas for Knovra MCP Gateway."""

from typing import Any

from app.mcp.models import ToolDefinition

KNOVRA_TOOLS: list[ToolDefinition] = [
    ToolDefinition(
        name="knovra.search",
        description="Semantic and code search across project documentation, code symbols, decisions, conversations, and git history.",
        inputSchema={
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query text or natural language question"},
                "top_k": {"type": "integer", "default": 5, "description": "Maximum number of search results to return"},
                "doc_types": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Optional list of document types: doc, code_symbol, decision, rule, conversation, git_commit",
                },
                "project_id": {"type": "string", "default": "knovra", "description": "Project workspace identifier"},
            },
            "required": ["query"],
        },
    ),
    ToolDefinition(
        name="knovra.context",
        description="Synthesizes a task-specific bounded context bundle or prompt-ready markdown for an AI agent.",
        inputSchema={
            "type": "object",
            "properties": {
                "prompt": {"type": "string", "description": "The task or prompt the AI agent needs context for"},
                "budget": {"type": "integer", "default": 4000, "description": "Token budget cap for the context bundle"},
                "task_type": {
                    "type": "string",
                    "enum": ["bugfix", "feature", "refactor", "architecture", "code_review", "general"],
                    "description": "Optional classification override for the task intent",
                },
                "file_hints": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Optional filenames or paths relevant to the prompt",
                },
                "format": {
                    "type": "string",
                    "enum": ["markdown", "json"],
                    "default": "markdown",
                    "description": "Return format: prompt-ready markdown or structured JSON bundle",
                },
                "project_id": {"type": "string", "default": "knovra", "description": "Project workspace identifier"},
            },
            "required": ["prompt"],
        },
    ),
    ToolDefinition(
        name="knovra.project",
        description="Returns project metadata, detected languages, frameworks, topology, and memory health.",
        inputSchema={
            "type": "object",
            "properties": {
                "project_id": {"type": "string", "default": "knovra", "description": "Project workspace identifier"}
            },
        },
    ),
    ToolDefinition(
        name="knovra.architecture",
        description="Returns active architectural decisions, polyglot boundaries, active ADRs, and structural invariants.",
        inputSchema={
            "type": "object",
            "properties": {
                "project_id": {"type": "string", "default": "knovra", "description": "Project workspace identifier"}
            },
        },
    ),
    ToolDefinition(
        name="knovra.related_code",
        description="Returns related code files, AST symbols, callers, callees, and dependencies for a symbol or file path.",
        inputSchema={
            "type": "object",
            "properties": {
                "symbol_or_path": {"type": "string", "description": "AST Symbol name or file path"},
                "project_id": {"type": "string", "default": "knovra", "description": "Project workspace identifier"},
            },
            "required": ["symbol_or_path"],
        },
    ),
    ToolDefinition(
        name="knovra.dependencies",
        description="Returns external and internal package dependencies across Go, Python, Rust, Node, etc.",
        inputSchema={
            "type": "object",
            "properties": {
                "project_id": {"type": "string", "default": "knovra", "description": "Project workspace identifier"}
            },
        },
    ),
    ToolDefinition(
        name="knovra.decisions",
        description="Searches and lists Architectural Decision Records (ADRs) with status and supersession lineage.",
        inputSchema={
            "type": "object",
            "properties": {
                "query": {"type": "string", "default": "", "description": "Search query for decisions"},
                "status": {"type": "string", "default": "", "description": "Filter by status: PROPOSED, ACCEPTED, REJECTED, SUPERSEDED"},
                "project_id": {"type": "string", "default": "knovra", "description": "Project workspace identifier"},
            },
        },
    ),
    ToolDefinition(
        name="knovra.rules",
        description="Returns active project governance rules, constraints, and compliance checks.",
        inputSchema={
            "type": "object",
            "properties": {
                "category": {"type": "string", "default": "", "description": "Filter by category: architecture, testing, git, security, performance"},
                "severity": {"type": "string", "default": "", "description": "Filter by severity: error, warning, info"},
                "project_id": {"type": "string", "default": "knovra", "description": "Project workspace identifier"},
            },
        },
    ),
    ToolDefinition(
        name="knovra.history",
        description="Returns Git commit history, file modification log, and cross-domain lineage trace.",
        inputSchema={
            "type": "object",
            "properties": {
                "path": {"type": "string", "default": "", "description": "File path to trace history for"},
                "decision_id": {"type": "string", "default": "", "description": "Decision ID to trace commits for"},
                "limit": {"type": "integer", "default": 10, "description": "Maximum number of commits to return"},
                "project_id": {"type": "string", "default": "knovra", "description": "Project workspace identifier"},
            },
        },
    ),
    ToolDefinition(
        name="knovra.errors",
        description="Retrieves historical errors, troubleshooting tips, and recorded solutions from conversation memory.",
        inputSchema={
            "type": "object",
            "properties": {
                "query": {"type": "string", "default": "", "description": "Error message or symptom query"},
                "limit": {"type": "integer", "default": 5, "description": "Maximum number of error-solution pairs to return"},
                "project_id": {"type": "string", "default": "knovra", "description": "Project workspace identifier"},
            },
        },
    ),
    ToolDefinition(
        name="knovra.remember",
        description="Ingests an insight, decision, or solution into Knovra's persistent project memory.",
        inputSchema={
            "type": "object",
            "properties": {
                "text": {"type": "string", "description": "Knowledge, insight, error/solution, or decision text to store"},
                "category": {
                    "type": "string",
                    "enum": ["decision", "solution", "error", "insight", "rule"],
                    "default": "insight",
                    "description": "Category of fact or learning",
                },
                "project_id": {"type": "string", "default": "knovra", "description": "Project workspace identifier"},
            },
            "required": ["text"],
        },
    ),
    ToolDefinition(
        name="knovra.record_decision",
        description="Records a new Architectural Decision Record (ADR) into Knovra's memory.",
        inputSchema={
            "type": "object",
            "properties": {
                "id": {"type": "string", "description": "ADR identifier (e.g. 'ADR-006' or 'adr-006')"},
                "title": {"type": "string", "description": "Title of the architectural decision"},
                "status": {
                    "type": "string",
                    "enum": ["PROPOSED", "ACCEPTED", "REJECTED", "SUPERSEDED"],
                    "default": "PROPOSED",
                    "description": "Decision status",
                },
                "context": {"type": "string", "description": "Context and problem statement"},
                "decision": {"type": "string", "description": "The decision made"},
                "consequences": {"type": "string", "description": "Positive and negative consequences"},
                "supersedes": {"type": "string", "default": "", "description": "Prior ADR ID superseded by this decision (optional)"},
                "project_id": {"type": "string", "default": "knovra", "description": "Project workspace identifier"},
            },
            "required": ["id", "title", "context", "decision", "consequences"],
        },
    ),
]


def get_tool_definition(name: str) -> ToolDefinition | None:
    """Finds a tool definition by name."""
    for tool in KNOVRA_TOOLS:
        if tool.name == name:
            return tool
    return None


def get_all_tools_dict() -> list[dict[str, Any]]:
    """Returns list of tool dicts for tools/list response."""
    return [t.model_dump() for t in KNOVRA_TOOLS]
