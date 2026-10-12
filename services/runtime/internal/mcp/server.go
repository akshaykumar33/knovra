package mcp

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// Server implements an MCP JSON-RPC 2.0 server communicating via stdio or HTTP proxy.
type Server struct {
	EngineURL  string
	HTTPClient *http.Client
}

// NewServer creates a new MCP server.
func NewServer(engineURL string) *Server {
	if engineURL == "" {
		engineURL = os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
		if engineURL == "" {
			engineURL = "http://localhost:8000"
		}
	}
	return &Server{
		EngineURL: engineURL,
		HTTPClient: &http.Client{
			Timeout: 45 * time.Second,
		},
	}
}

// ServeStdio starts reading JSON-RPC messages from in and writing responses to out.
func (s *Server) ServeStdio(ctx context.Context, in io.Reader, out io.Writer) error {
	scanner := bufio.NewScanner(in)
	// Buffer up to 2MB per line for large context responses
	buf := make([]byte, 1024*1024)
	scanner.Buffer(buf, 2*1024*1024)

	encoder := json.NewEncoder(out)

	for scanner.Scan() {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		line := scanner.Bytes()
		if len(bytes.TrimSpace(line)) == 0 {
			continue
		}

		resp := s.HandleLine(ctx, line)
		if resp != nil {
			if err := encoder.Encode(resp); err != nil {
				fmt.Fprintf(os.Stderr, "[knovra-mcp] Error encoding JSON-RPC response: %v\n", err)
			}
		}
	}

	return scanner.Err()
}

// HandleLine parses and executes a single raw JSON-RPC message.
func (s *Server) HandleLine(ctx context.Context, data []byte) *Response {
	var req Request
	if err := json.Unmarshal(data, &req); err != nil {
		return &Response{
			JSONRPC: JSONRPCVersion,
			ID:      nil,
			Error: &ErrorObject{
				Code:    ParseError,
				Message: fmt.Sprintf("Parse error: %v", err),
			},
		}
	}

	// Notifications (e.g. initialized) do not require a response unless ID is present
	if req.ID == nil && (req.Method == "notifications/initialized" || req.Method == "initialized") {
		return nil
	}

	// Try proxying to Context Engine first
	resp, err := s.proxyToContextEngine(ctx, data)
	if err == nil && resp != nil {
		return resp
	}

	// Fallback: handle locally if context engine is unreachable
	return s.handleLocalFallback(&req)
}

func (s *Server) proxyToContextEngine(ctx context.Context, rawReq []byte) (*Response, error) {
	endpoint := fmt.Sprintf("%s/mcp/rpc", s.EngineURL)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(rawReq))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")

	httpResp, err := s.HTTPClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer httpResp.Body.Close()

	if httpResp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("context engine returned status %d", httpResp.StatusCode)
	}

	var resp Response
	if err := json.NewDecoder(httpResp.Body).Decode(&resp); err != nil {
		return nil, err
	}
	return &resp, nil
}

func (s *Server) handleLocalFallback(req *Request) *Response {
	switch req.Method {
	case "initialize":
		return &Response{
			JSONRPC: JSONRPCVersion,
			ID:      req.ID,
			Result: InitializeResult{
				ProtocolVersion: "2024-11-05",
				Capabilities: map[string]interface{}{
					"tools": map[string]interface{}{
						"listChanged": false,
					},
				},
				ServerInfo: ServerInfo{
					Name:        "knovra",
					Version:     "0.1.0",
					Description: "Knovra Universal AI Project Intelligence MCP Server (Offline Mode)",
				},
			},
		}

	case "ping":
		return &Response{
			JSONRPC: JSONRPCVersion,
			ID:      req.ID,
			Result:  map[string]interface{}{},
		}

	case "tools/list":
		return &Response{
			JSONRPC: JSONRPCVersion,
			ID:      req.ID,
			Result: map[string]interface{}{
				"tools": GetDefaultToolsList(),
			},
		}

	case "tools/call":
		var params struct {
			Name      string                 `json:"name"`
			Arguments map[string]interface{} `json:"arguments"`
		}
		if err := json.Unmarshal(req.Params, &params); err != nil {
			return &Response{
				JSONRPC: JSONRPCVersion,
				ID:      req.ID,
				Error: &ErrorObject{
					Code:    InvalidParams,
					Message: fmt.Sprintf("Invalid params: %v", err),
				},
			}
		}

		if params.Name == "knovra.project" {
			return &Response{
				JSONRPC: JSONRPCVersion,
				ID:      req.ID,
				Result: ToolCallResult{
					Content: []ContentItem{
						{
							Type: "text",
							Text: "### Knovra Project Overview (Offline Mode)\n- Architecture: Polyglot Monorepo (Go runtime, Python context-engine, Rust code-indexer)\n- Daemon/CLI: Active and listening via stdio JSON-RPC 2.0.",
						},
					},
					IsError: false,
				},
			}
		}

		return &Response{
			JSONRPC: JSONRPCVersion,
			ID:      req.ID,
			Result: ToolCallResult{
				Content: []ContentItem{
					{
						Type: "text",
						Text: fmt.Sprintf("Tool %s executed in offline fallback mode. Connect Knovra Context Engine at %s for full semantic search and context synthesis.", params.Name, s.EngineURL),
					},
				},
				IsError: false,
			},
		}

	default:
		return &Response{
			JSONRPC: JSONRPCVersion,
			ID:      req.ID,
			Error: &ErrorObject{
				Code:    MethodNotFound,
				Message: fmt.Sprintf("Method not found: %s", req.Method),
			},
		}
	}
}

// GetDefaultToolsList returns the 12 tool schemas for local offline discovery.
func GetDefaultToolsList() []ToolDefinition {
	return []ToolDefinition{
		{
			Name:        "knovra.search",
			Description: "Semantic and code search across project documentation, code symbols, decisions, conversations, and git history.",
			InputSchema: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"query":     map[string]interface{}{"type": "string"},
					"top_k":     map[string]interface{}{"type": "integer", "default": 5},
					"doc_types": map[string]interface{}{"type": "array", "items": map[string]interface{}{"type": "string"}},
				},
				"required": []string{"query"},
			},
		},
		{
			Name:        "knovra.context",
			Description: "Synthesizes a task-specific bounded context bundle or prompt-ready markdown for an AI agent.",
			InputSchema: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"prompt":     map[string]interface{}{"type": "string"},
					"budget":     map[string]interface{}{"type": "integer", "default": 4000},
					"task_type":  map[string]interface{}{"type": "string"},
					"file_hints": map[string]interface{}{"type": "array", "items": map[string]interface{}{"type": "string"}},
					"format":     map[string]interface{}{"type": "string", "default": "markdown"},
				},
				"required": []string{"prompt"},
			},
		},
		{
			Name:        "knovra.project",
			Description: "Returns project metadata, detected languages, frameworks, topology, and memory health.",
			InputSchema: map[string]interface{}{"type": "object"},
		},
		{
			Name:        "knovra.architecture",
			Description: "Returns active architectural decisions, polyglot boundaries, active ADRs, and structural invariants.",
			InputSchema: map[string]interface{}{"type": "object"},
		},
		{
			Name:        "knovra.related_code",
			Description: "Returns related code files, AST symbols, callers, callees, and dependencies for a symbol or file path.",
			InputSchema: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"symbol_or_path": map[string]interface{}{"type": "string"},
				},
				"required": []string{"symbol_or_path"},
			},
		},
		{
			Name:        "knovra.dependencies",
			Description: "Returns external and internal package dependencies across Go, Python, Rust, Node, etc.",
			InputSchema: map[string]interface{}{"type": "object"},
		},
		{
			Name:        "knovra.decisions",
			Description: "Searches and lists Architectural Decision Records (ADRs) with status and supersession lineage.",
			InputSchema: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"query":  map[string]interface{}{"type": "string"},
					"status": map[string]interface{}{"type": "string"},
				},
			},
		},
		{
			Name:        "knovra.rules",
			Description: "Returns active project governance rules, constraints, and compliance checks.",
			InputSchema: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"category": map[string]interface{}{"type": "string"},
					"severity": map[string]interface{}{"type": "string"},
				},
			},
		},
		{
			Name:        "knovra.history",
			Description: "Returns Git commit history, file modification log, and cross-domain lineage trace.",
			InputSchema: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"path":        map[string]interface{}{"type": "string"},
					"decision_id": map[string]interface{}{"type": "string"},
					"limit":       map[string]interface{}{"type": "integer", "default": 10},
				},
			},
		},
		{
			Name:        "knovra.errors",
			Description: "Retrieves historical errors, troubleshooting tips, and recorded solutions from conversation memory.",
			InputSchema: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"query": map[string]interface{}{"type": "string"},
					"limit": map[string]interface{}{"type": "integer", "default": 5},
				},
			},
		},
		{
			Name:        "knovra.remember",
			Description: "Ingests an insight, decision, or solution into Knovra's persistent project memory.",
			InputSchema: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"text":     map[string]interface{}{"type": "string"},
					"category": map[string]interface{}{"type": "string", "default": "insight"},
				},
				"required": []string{"text"},
			},
		},
		{
			Name:        "knovra.record_decision",
			Description: "Records a new Architectural Decision Record (ADR) into Knovra's memory.",
			InputSchema: map[string]interface{}{
				"type": "object",
				"properties": map[string]interface{}{
					"id":           map[string]interface{}{"type": "string"},
					"title":        map[string]interface{}{"type": "string"},
					"status":       map[string]interface{}{"type": "string", "default": "PROPOSED"},
					"context":      map[string]interface{}{"type": "string"},
					"decision":     map[string]interface{}{"type": "string"},
					"consequences": map[string]interface{}{"type": "string"},
					"supersedes":   map[string]interface{}{"type": "string"},
				},
				"required": []string{"id", "title", "context", "decision", "consequences"},
			},
		},
	}
}
