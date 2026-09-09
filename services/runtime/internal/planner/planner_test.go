package planner

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestContextPlanRequestSerialization(t *testing.T) {
	req := ContextPlanRequest{
		Prompt:    "Fix connection timeout in postgres",
		TaskType:  string(TaskTypeBugfix),
		MaxTokens: 3000,
		FileHints: []string{"services/context-engine/app/main.py"},
		ProjectID: "knovra",
	}

	data, err := json.Marshal(req)
	if err != nil {
		t.Fatalf("failed to marshal request: %v", err)
	}

	var decoded ContextPlanRequest
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("failed to unmarshal request: %v", err)
	}

	if decoded.Prompt != req.Prompt || decoded.TaskType != "bugfix" || decoded.MaxTokens != 3000 {
		t.Errorf("mismatched decoded request: %+v", decoded)
	}
}

func TestPlannerClientEndpoints(t *testing.T) {
	mockBundle := ContextBundle{
		Task:           "Implement planner",
		TaskType:       "feature",
		ProjectSummary: "Knovra Monorepo",
		TotalTokens:    850,
		Rules: []map[string]interface{}{
			{"title": "Rule 1", "instruction": "Test instruction"},
		},
	}

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if r.URL.Path == "/planner/bundle" {
			w.WriteHeader(http.StatusOK)
			_ = json.NewEncoder(w).Encode(mockBundle)
		} else if r.URL.Path == "/planner/prompt" {
			w.WriteHeader(http.StatusOK)
			_ = json.NewEncoder(w).Encode(ContextPlanResponse{
				Bundle:         mockBundle,
				MarkdownPrompt: "# CONTEXT BUNDLE\n\nPrompt ready markdown.",
			})
		} else {
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	defer server.Close()

	client := NewClient(server.URL)
	req := &ContextPlanRequest{
		Prompt:    "Implement planner",
		MaxTokens: 2000,
		ProjectID: "knovra",
	}

	// 1. GenerateBundle
	bundle, err := client.GenerateBundle(context.Background(), req)
	if err != nil {
		t.Fatalf("GenerateBundle failed: %v", err)
	}
	if bundle.TaskType != "feature" || bundle.TotalTokens != 850 {
		t.Errorf("unexpected bundle: %+v", bundle)
	}

	// 2. GeneratePrompt
	res, err := client.GeneratePrompt(context.Background(), req)
	if err != nil {
		t.Fatalf("GeneratePrompt failed: %v", err)
	}
	if res.MarkdownPrompt == "" || res.Bundle.TotalTokens != 850 {
		t.Errorf("unexpected plan response: %+v", res)
	}
}
