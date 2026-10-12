package conversation

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"
)

// Message represents a conversation turn.
type Message struct {
	ID        string    `json:"id"`
	Role      string    `json:"role"`
	Content   string    `json:"content"`
	Timestamp time.Time `json:"timestamp"`
}

// ExtractedFact represents an intelligence item extracted from conversation.
type ExtractedFact struct {
	ID               string   `json:"id"`
	SessionID        string   `json:"session_id"`
	FactType         string   `json:"fact_type"`
	Text             string   `json:"text"`
	Confidence       float64  `json:"confidence"`
	RelatedEntities  []string `json:"related_entities"`
	RelatedDecisions []string `json:"related_decisions"`
}

// ConversationSession represents an imported conversation transcript.
type ConversationSession struct {
	ID             string          `json:"id"`
	Title          string          `json:"title"`
	SourceFormat   string          `json:"source_format"`
	CreatedAt      time.Time       `json:"created_at"`
	Messages       []Message       `json:"messages"`
	ExtractedFacts []ExtractedFact `json:"extracted_facts"`
	Summary        string          `json:"summary"`
}

// IngestConversationRequest payload for importing a transcript.
type IngestConversationRequest struct {
	Title     string      `json:"title,omitempty"`
	Format    string      `json:"format"`
	Content   interface{} `json:"content"`
	ProjectID string      `json:"project_id"`
}

// IngestConversationResponse is the server response from importing a transcript.
type IngestConversationResponse struct {
	SessionID         string         `json:"session_id"`
	Title             string         `json:"title"`
	MessageCount      int            `json:"message_count"`
	FactCounts        map[string]int `json:"fact_counts"`
	DecisionsDetected []string       `json:"decisions_detected"`
	IndexedSemantic   bool           `json:"indexed_into_semantic_memory"`
}

// Client interacts with the Context Engine conversation memory API.
type Client struct {
	BaseURL    string
	HTTPClient *http.Client
}

// NewClient creates a new conversation API client.
func NewClient(baseURL string) *Client {
	if baseURL == "" {
		baseURL = "http://localhost:8000"
	}
	return &Client{
		BaseURL: baseURL,
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// Ingest imports and analyzes a conversation transcript.
func (c *Client) Ingest(ctx context.Context, req *IngestConversationRequest) (*IngestConversationResponse, error) {
	data, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	endpoint := fmt.Sprintf("%s/conversations/ingest", c.BaseURL)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to call /conversations/ingest: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("/conversations/ingest returned status %d", resp.StatusCode)
	}

	var res IngestConversationResponse
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}
	return &res, nil
}

// ListSessions retrieves all imported conversation sessions.
func (c *Client) ListSessions(ctx context.Context, limit int) ([]ConversationSession, error) {
	endpoint := fmt.Sprintf("%s/conversations/sessions?limit=%d", c.BaseURL, limit)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call /conversations/sessions: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("/conversations/sessions returned status %d", resp.StatusCode)
	}

	var sessions []ConversationSession
	if err := json.NewDecoder(resp.Body).Decode(&sessions); err != nil {
		return nil, fmt.Errorf("failed to decode sessions: %w", err)
	}
	return sessions, nil
}

// GetSession retrieves full details for a conversation session.
func (c *Client) GetSession(ctx context.Context, sessionID string) (*ConversationSession, error) {
	endpoint := fmt.Sprintf("%s/conversations/sessions/%s", c.BaseURL, url.PathEscape(sessionID))
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call /conversations/sessions/%s: %w", sessionID, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("/conversations/sessions/%s returned status %d", sessionID, resp.StatusCode)
	}

	var session ConversationSession
	if err := json.NewDecoder(resp.Body).Decode(&session); err != nil {
		return nil, fmt.Errorf("failed to decode session: %w", err)
	}
	return &session, nil
}
