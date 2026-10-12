"""Model Context Protocol (MCP) JSON-RPC 2.0 schemas and types."""

from typing import Any

from pydantic import BaseModel, Field


class JsonRpcRequest(BaseModel):
    """Standard JSON-RPC 2.0 request."""

    jsonrpc: str = "2.0"
    id: int | str | None = None
    method: str
    params: dict[str, Any] = Field(default_factory=dict)


class JsonRpcError(BaseModel):
    """Standard JSON-RPC 2.0 error."""

    code: int
    message: str
    data: Any | None = None


class JsonRpcResponse(BaseModel):
    """Standard JSON-RPC 2.0 response."""

    jsonrpc: str = "2.0"
    id: int | str | None = None
    result: Any | None = None
    error: JsonRpcError | None = None


class ContentItem(BaseModel):
    """MCP Content item within a tool result."""

    type: str = "text"
    text: str


class ToolCallResult(BaseModel):
    """MCP standard tool execution result."""

    content: list[ContentItem] = Field(default_factory=list)
    isError: bool = False


class ToolDefinition(BaseModel):
    """MCP Tool metadata and JSON Schema declaration."""

    name: str
    description: str
    inputSchema: dict[str, Any]
