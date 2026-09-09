package events

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestEventCreationAndEnvelope(t *testing.T) {
	payload := map[string]interface{}{
		"id":       "ADR-011",
		"title":    "NATS JetStream for Event Streaming",
		"decision": "Adopt NATS JetStream",
	}

	event := NewAgentEvent(EventTypeDecisionMade, payload)

	if !strings.HasPrefix(event.EventID, "evt-") {
		t.Errorf("expected event ID prefix 'evt-', got '%s'", event.EventID)
	}
	if event.EventType != EventTypeDecisionMade {
		t.Errorf("expected event type 'DecisionMade', got '%s'", event.EventType)
	}
	if event.SchemaVersion != "1.0.0" {
		t.Errorf("expected schema version '1.0.0', got '%s'", event.SchemaVersion)
	}
	if event.Timestamp.IsZero() {
		t.Errorf("expected non-zero timestamp")
	}
	if event.Payload["id"] != "ADR-011" {
		t.Errorf("expected payload id 'ADR-011', got '%v'", event.Payload["id"])
	}
}

func TestEventClientPublishAndRecent(t *testing.T) {
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/events/publish":
			var event AgentEvent
			_ = json.NewDecoder(r.Body).Decode(&event)
			resp := PublishResponse{
				EventID:             event.EventID,
				Status:              "acknowledged",
				IdempotentDuplicate: false,
				ProcessedAt:         time.Now().UTC().Format(time.RFC3339),
			}
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(resp)

		case "/events/recent":
			events := []*AgentEvent{
				NewAgentEvent(EventTypeTaskStarted, map[string]interface{}{"task": "build"}),
				NewAgentEvent(EventTypeFileModified, map[string]interface{}{"file": "main.go"}),
			}
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(events)

		default:
			http.NotFound(w, r)
		}
	}))
	defer mockServer.Close()

	client := NewClient(mockServer.URL)

	// Test Publish
	event := NewAgentEvent(EventTypeTaskStarted, map[string]interface{}{"task": "build"})
	resp, err := client.Publish(context.Background(), event)
	if err != nil {
		t.Fatalf("Publish error: %v", err)
	}
	if resp.Status != "acknowledged" {
		t.Errorf("expected status 'acknowledged', got '%s'", resp.Status)
	}
	if resp.EventID != event.EventID {
		t.Errorf("expected event ID '%s', got '%s'", event.EventID, resp.EventID)
	}

	// Test GetRecent
	recent, err := client.GetRecent(context.Background(), 5, "")
	if err != nil {
		t.Fatalf("GetRecent error: %v", err)
	}
	if len(recent) != 2 {
		t.Errorf("expected 2 recent events, got %d", len(recent))
	}
}
