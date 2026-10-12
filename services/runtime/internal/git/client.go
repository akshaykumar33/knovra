package git

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"
)

// Client interacts with Context Engine Git memory and lineage endpoints.
type Client struct {
	BaseURL    string
	HTTPClient *http.Client
}

// NewClient creates a new Git memory client.
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

// IngestHistory sends git commits, branches, and tags to the context engine.
func (c *Client) IngestHistory(ctx context.Context, payload *GitHistoryPayload) (*IngestGitResponse, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal git history payload: %w", err)
	}

	endpoint := fmt.Sprintf("%s/git/ingest", c.BaseURL)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(data))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call /git/ingest: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("/git/ingest returned status %d", resp.StatusCode)
	}

	var res IngestGitResponse
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return nil, fmt.Errorf("failed to decode ingest response: %w", err)
	}
	return &res, nil
}

// ListCommits retrieves commits from the context engine with optional decision filtering.
func (c *Client) ListCommits(ctx context.Context, limit int, decisionID string) ([]GitCommit, error) {
	endpoint := fmt.Sprintf("%s/git/commits?limit=%d", c.BaseURL, limit)
	if decisionID != "" {
		endpoint += fmt.Sprintf("&decision_id=%s", url.QueryEscape(decisionID))
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call /git/commits: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("/git/commits returned status %d", resp.StatusCode)
	}

	var commits []GitCommit
	if err := json.NewDecoder(resp.Body).Decode(&commits); err != nil {
		return nil, fmt.Errorf("failed to decode commits: %w", err)
	}
	return commits, nil
}

// TraceDecision requests cross-domain lineage trace for a decision ID.
func (c *Client) TraceDecision(ctx context.Context, decisionID string) (*LineageTraceResult, error) {
	endpoint := fmt.Sprintf("%s/trace/decision/%s", c.BaseURL, url.PathEscape(decisionID))
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call /trace/decision: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("/trace/decision returned status %d", resp.StatusCode)
	}

	var res LineageTraceResult
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return nil, fmt.Errorf("failed to decode lineage trace: %w", err)
	}
	return &res, nil
}

// TraceFile requests cross-domain lineage trace for a file path.
func (c *Client) TraceFile(ctx context.Context, filePath string) (*LineageTraceResult, error) {
	endpoint := fmt.Sprintf("%s/trace/file/%s", c.BaseURL, filePath)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return nil, err
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call /trace/file: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("/trace/file returned status %d", resp.StatusCode)
	}

	var res LineageTraceResult
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return nil, fmt.Errorf("failed to decode lineage trace: %w", err)
	}
	return &res, nil
}
