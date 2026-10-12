package events

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"
)

// EventType defines the 14 core agent event types.
type EventType string

const (
	EventTypeAgentStarted    EventType = "AgentStarted"
	EventTypeTaskStarted     EventType = "TaskStarted"
	EventTypePromptReceived  EventType = "PromptReceived"
	EventTypeFileRead        EventType = "FileRead"
	EventTypeFileCreated     EventType = "FileCreated"
	EventTypeFileModified    EventType = "FileModified"
	EventTypeCommandExecuted EventType = "CommandExecuted"
	EventTypeTestExecuted    EventType = "TestExecuted"
	EventTypeTestFailed      EventType = "TestFailed"
	EventTypeTestPassed      EventType = "TestPassed"
	EventTypeDecisionMade    EventType = "DecisionMade"
	EventTypeErrorObserved   EventType = "ErrorObserved"
	EventTypeSolutionApplied EventType = "SolutionApplied"
	EventTypeTaskCompleted   EventType = "TaskCompleted"
)

// AgentEvent represents the canonical envelope for agent activity events.
type AgentEvent struct {
	EventID       string                 `json:"event_id"`
	EventType     EventType              `json:"event_type"`
	Timestamp     time.Time              `json:"timestamp"`
	ProjectID     string                 `json:"project_id"`
	AgentID       string                 `json:"agent_id"`
	SessionID     string                 `json:"session_id"`
	SchemaVersion string                 `json:"schema_version"`
	Payload       map[string]interface{} `json:"payload"`
	Metadata      map[string]interface{} `json:"metadata,omitempty"`
}

// NewAgentEvent instantiates an event with auto-generated UUID and UTC timestamp.
func NewAgentEvent(eventType EventType, payload map[string]interface{}) *AgentEvent {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	eventID := fmt.Sprintf("evt-%s", hex.EncodeToString(b))

	if payload == nil {
		payload = make(map[string]interface{})
	}

	return &AgentEvent{
		EventID:       eventID,
		EventType:     eventType,
		Timestamp:     time.Now().UTC(),
		ProjectID:     "knovra",
		AgentID:       "knovra-cli",
		SessionID:     "cli-session",
		SchemaVersion: "1.0.0",
		Payload:       payload,
		Metadata:      make(map[string]interface{}),
	}
}

// PublishResponse is returned from the context engine when publishing an event.
type PublishResponse struct {
	EventID             string `json:"event_id"`
	Status              string `json:"status"`
	IdempotentDuplicate bool   `json:"idempotent_duplicate"`
	ProcessedAt         string `json:"processed_at"`
}
