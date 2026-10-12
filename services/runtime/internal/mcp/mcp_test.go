package mcp

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestMCPInitializeOffline(t *testing.T) {
	srv := NewServer("http://localhost:9999") // Intentionally offline

	req := []byte(`{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05"}}`)
	resp := srv.HandleLine(context.Background(), req)

	if resp == nil {
		t.Fatalf("expected response, got nil")
	}
	if resp.Error != nil {
		t.Fatalf("unexpected error: %v", resp.Error)
	}

	initRes, ok := resp.Result.(InitializeResult)
	if !ok {
		t.Fatalf("expected InitializeResult, got %T", resp.Result)
	}
	if initRes.ProtocolVersion != "2024-11-05" {
		t.Errorf("expected protocolVersion '2024-11-05', got '%s'", initRes.ProtocolVersion)
	}
	if initRes.ServerInfo.Name != "knovra" {
		t.Errorf("expected server name 'knovra', got '%s'", initRes.ServerInfo.Name)
	}
}

func TestMCPToolsList(t *testing.T) {
	srv := NewServer("http://localhost:9999")

	req := []byte(`{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}`)
	resp := srv.HandleLine(context.Background(), req)

	if resp == nil || resp.Error != nil {
		t.Fatalf("expected valid response, got error: %v", resp)
	}

	resMap, ok := resp.Result.(map[string]interface{})
	if !ok {
		t.Fatalf("expected map result, got %T", resp.Result)
	}

	tools, ok := resMap["tools"].([]ToolDefinition)
	if !ok {
		t.Fatalf("expected []ToolDefinition, got %T", resMap["tools"])
	}
	if len(tools) != 12 {
		t.Errorf("expected 12 tools, got %d", len(tools))
	}

	toolMap := make(map[string]bool)
	for _, tool := range tools {
		toolMap[tool.Name] = true
	}

	expectedTools := []string{
		"knovra.search", "knovra.context", "knovra.project", "knovra.architecture",
		"knovra.related_code", "knovra.dependencies", "knovra.decisions", "knovra.rules",
		"knovra.history", "knovra.errors", "knovra.remember", "knovra.record_decision",
	}

	for _, expected := range expectedTools {
		if !toolMap[expected] {
			t.Errorf("missing expected tool: %s", expected)
		}
	}
}

func TestMCPServeStdio(t *testing.T) {
	srv := NewServer("http://localhost:9999")

	input := strings.Join([]string{
		`{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}`,
		`{"jsonrpc":"2.0","method":"notifications/initialized"}`,
		`{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}`,
		`{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"knovra.project","arguments":{}}}`,
	}, "\n") + "\n"

	in := strings.NewReader(input)
	out := &bytes.Buffer{}

	err := srv.ServeStdio(context.Background(), in, out)
	if err != nil {
		t.Fatalf("ServeStdio error: %v", err)
	}

	lines := strings.Split(strings.TrimSpace(out.String()), "\n")
	if len(lines) != 3 { // Notification yields no response
		t.Fatalf("expected 3 responses, got %d: %s", len(lines), out.String())
	}

	var resp1, resp2, resp3 Response
	_ = json.Unmarshal([]byte(lines[0]), &resp1)
	_ = json.Unmarshal([]byte(lines[1]), &resp2)
	_ = json.Unmarshal([]byte(lines[2]), &resp3)

	if resp1.Error != nil {
		t.Errorf("resp1 error: %v", resp1.Error)
	}
	if resp2.Error != nil {
		t.Errorf("resp2 error: %v", resp2.Error)
	}
	if resp3.Error != nil {
		t.Errorf("resp3 error: %v", resp3.Error)
	}
}

func TestMCPProxyToContextEngine(t *testing.T) {
	// Mock Context Engine HTTP server
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/mcp/rpc" {
			http.NotFound(w, r)
			return
		}
		var req Request
		_ = json.NewDecoder(r.Body).Decode(&req)

		resp := Response{
			JSONRPC: JSONRPCVersion,
			ID:      req.ID,
			Result: ToolCallResult{
				Content: []ContentItem{
					{Type: "text", Text: "Proxied Context Engine Response"},
				},
				IsError: false,
			},
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(resp)
	}))
	defer mockServer.Close()

	srv := NewServer(mockServer.URL)

	req := []byte(`{"jsonrpc":"2.0","id":99,"method":"tools/call","params":{"name":"knovra.search","arguments":{"query":"test"}}}`)
	resp := srv.HandleLine(context.Background(), req)

	if resp == nil || resp.Error != nil {
		t.Fatalf("expected successful response, got error: %v", resp)
	}

	resBytes, _ := json.Marshal(resp.Result)
	if !strings.Contains(string(resBytes), "Proxied Context Engine Response") {
		t.Errorf("expected proxied response text, got: %s", string(resBytes))
	}
}
