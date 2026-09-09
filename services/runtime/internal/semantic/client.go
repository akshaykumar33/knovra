package semantic

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Client communicates with the Python Context Engine HTTP API
type Client struct {
	baseURL    string
	httpClient *http.Client
}

// NewClient creates a new context engine API client
func NewClient(baseURL string) *Client {
	if baseURL == "" {
		baseURL = "http://localhost:8000"
	}
	return &Client{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// IndexBatch sends a batch of documents to be chunked and indexed
func (c *Client) IndexBatch(docs []DocumentInput, reembed bool) (*IndexBatchResponse, error) {
	reqBody := IndexBatchRequest{
		Documents: docs,
		Reembed:   reembed,
	}

	payload, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal index request: %w", err)
	}

	resp, err := c.httpClient.Post(fmt.Sprintf("%s/semantic/index", c.baseURL), "application/json", bytes.NewReader(payload))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to context engine at %s: %w", c.baseURL, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("context engine returned %d: %s", resp.StatusCode, string(body))
	}

	var indexResp IndexBatchResponse
	if err := json.NewDecoder(resp.Body).Decode(&indexResp); err != nil {
		return nil, fmt.Errorf("failed to decode index response: %w", err)
	}

	return &indexResp, nil
}

// Search executes a semantic vector query with optional filters
func (c *Client) Search(query string, docTypes []DocType, topK int, minScore float64) ([]SearchResult, error) {
	reqBody := SearchQuery{
		Query:    query,
		DocTypes: docTypes,
		TopK:     topK,
		MinScore: minScore,
	}

	payload, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal search request: %w", err)
	}

	resp, err := c.httpClient.Post(fmt.Sprintf("%s/semantic/search", c.baseURL), "application/json", bytes.NewReader(payload))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to context engine at %s: %w", c.baseURL, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("context engine returned %d: %s", resp.StatusCode, string(body))
	}

	var results []SearchResult
	if err := json.NewDecoder(resp.Body).Decode(&results); err != nil {
		return nil, fmt.Errorf("failed to decode search results: %w", err)
	}

	return results, nil
}

// GetStats queries the vector store inventory and stats
func (c *Client) GetStats() (*SemanticStats, error) {
	resp, err := c.httpClient.Get(fmt.Sprintf("%s/semantic/stats", c.baseURL))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to context engine at %s: %w", c.baseURL, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("context engine returned %d: %s", resp.StatusCode, string(body))
	}

	var stats SemanticStats
	if err := json.NewDecoder(resp.Body).Decode(&stats); err != nil {
		return nil, fmt.Errorf("failed to decode stats: %w", err)
	}

	return &stats, nil
}
