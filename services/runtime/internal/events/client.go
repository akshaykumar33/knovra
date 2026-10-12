package events

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"
)

// Client communicates with the Context Engine agent event API.
type Client struct {
	BaseURL    string
	HTTPClient *http.Client
}

// NewClient creates a new event client.
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

// Publish sends a single AgentEvent to the Context Engine.
func (c *Client) Publish(ctx context.Context, event *AgentEvent) (*PublishResponse, error) {
	data, err := json.Marshal(event)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal agent event: %w", err)
	}

	endpoint := fmt.Sprintf("%s/events/publish", c.BaseURL)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to publish event: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("publish returned status %d", resp.StatusCode)
	}

	var pubResp PublishResponse
	if err := json.NewDecoder(resp.Body).Decode(&pubResp); err != nil {
		return nil, fmt.Errorf("failed to decode publish response: %w", err)
	}
	return &pubResp, nil
}

// PublishBatch sends multiple AgentEvents in a single batch request.
func (c *Client) PublishBatch(ctx context.Context, events []*AgentEvent) ([]*PublishResponse, error) {
	data, err := json.Marshal(events)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal events batch: %w", err)
	}

	endpoint := fmt.Sprintf("%s/events/batch", c.BaseURL)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to publish batch: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("batch publish returned status %d", resp.StatusCode)
	}

	var pubResps []*PublishResponse
	if err := json.NewDecoder(resp.Body).Decode(&pubResps); err != nil {
		return nil, fmt.Errorf("failed to decode batch response: %w", err)
	}
	return pubResps, nil
}

// GetRecent retrieves recent events from the Context Engine.
func (c *Client) GetRecent(ctx context.Context, limit int, eventType string) ([]*AgentEvent, error) {
	params := url.Values{}
	if limit > 0 {
		params.Set("limit", fmt.Sprintf("%d", limit))
	}
	if eventType != "" {
		params.Set("event_type", eventType)
	}

	endpoint := fmt.Sprintf("%s/events/recent?%s", c.BaseURL, params.Encode())
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent events: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("recent events query returned status %d", resp.StatusCode)
	}

	var events []*AgentEvent
	if err := json.NewDecoder(resp.Body).Decode(&events); err != nil {
		return nil, fmt.Errorf("failed to decode recent events: %w", err)
	}
	return events, nil
}
