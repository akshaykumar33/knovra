package planner

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// Client communicates with the Context Engine planner API.
type Client struct {
	BaseURL    string
	HTTPClient *http.Client
}

// NewClient creates a new Context Planner client.
func NewClient(baseURL string) *Client {
	if baseURL == "" {
		baseURL = "http://localhost:8000"
	}
	return &Client{
		BaseURL: baseURL,
		HTTPClient: &http.Client{
			Timeout: 45 * time.Second,
		},
	}
}

// GenerateBundle requests a structured ContextBundle for a task prompt.
func (c *Client) GenerateBundle(ctx context.Context, req *ContextPlanRequest) (*ContextBundle, error) {
	data, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal plan request: %w", err)
	}

	endpoint := fmt.Sprintf("%s/planner/bundle", c.BaseURL)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to call /planner/bundle: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("/planner/bundle returned status %d", resp.StatusCode)
	}

	var bundle ContextBundle
	if err := json.NewDecoder(resp.Body).Decode(&bundle); err != nil {
		return nil, fmt.Errorf("failed to decode context bundle: %w", err)
	}
	return &bundle, nil
}

// GeneratePrompt requests both the structured bundle and prompt-ready Markdown.
func (c *Client) GeneratePrompt(ctx context.Context, req *ContextPlanRequest) (*ContextPlanResponse, error) {
	data, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal plan request: %w", err)
	}

	endpoint := fmt.Sprintf("%s/planner/prompt", c.BaseURL)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to call /planner/prompt: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("/planner/prompt returned status %d", resp.StatusCode)
	}

	var res ContextPlanResponse
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return nil, fmt.Errorf("failed to decode plan response: %w", err)
	}
	return &res, nil
}
