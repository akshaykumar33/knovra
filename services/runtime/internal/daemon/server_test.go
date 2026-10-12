package daemon

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"knovra/runtime/internal/config"
)

func TestHealthzEndpoint(t *testing.T) {
	cfg := &config.Config{Port: "8080", Environment: "test", LogLevel: "error"}
	srv := NewServer(cfg)
	handler := srv.Routes()

	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rr.Code)
	}

	var resp HealthResponse
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resp.Status != "ok" {
		t.Errorf("expected status 'ok', got %q", resp.Status)
	}
	if resp.Service != "knovra-runtime-daemon" {
		t.Errorf("expected service 'knovra-runtime-daemon', got %q", resp.Service)
	}
}

func TestReadyzEndpoint(t *testing.T) {
	cfg := &config.Config{Port: "8080", Environment: "test", LogLevel: "error"}
	srv := NewServer(cfg)
	handler := srv.Routes()

	req := httptest.NewRequest(http.MethodGet, "/readyz", nil)
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, rr.Code)
	}
}
