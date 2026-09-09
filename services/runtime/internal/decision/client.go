package decision

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

// Client communicates with Context Engine Decision and Rule endpoints
type Client struct {
	baseURL    string
	httpClient *http.Client
}

// NewClient initializes a new Decision API client
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

// RecordDecision posts a new architectural decision
func (c *Client) RecordDecision(dec Decision) (*Decision, error) {
	payload, err := json.Marshal(dec)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal decision: %w", err)
	}

	resp, err := c.httpClient.Post(fmt.Sprintf("%s/decisions", c.baseURL), "application/json", bytes.NewReader(payload))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to context engine: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("context engine returned %d: %s", resp.StatusCode, string(body))
	}

	var saved Decision
	if err := json.NewDecoder(resp.Body).Decode(&saved); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}
	return &saved, nil
}

// ListDecisions queries decisions with optional filters
func (c *Client) ListDecisions(status string, activeOnly bool, affectedEntity string) ([]Decision, error) {
	params := url.Values{}
	if status != "" {
		params.Set("status_filter", status)
	}
	if activeOnly {
		params.Set("active_only", "true")
	}
	if affectedEntity != "" {
		params.Set("affected_entity", affectedEntity)
	}

	u := fmt.Sprintf("%s/decisions?%s", c.baseURL, params.Encode())
	resp, err := c.httpClient.Get(u)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to context engine: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("context engine returned %d: %s", resp.StatusCode, string(body))
	}

	var decisions []Decision
	if err := json.NewDecoder(resp.Body).Decode(&decisions); err != nil {
		return nil, fmt.Errorf("failed to decode decisions: %w", err)
	}
	return decisions, nil
}

// GetDecisionLineage retrieves a decision with complete supersession lineage
func (c *Client) GetDecisionLineage(id string) (*DecisionLineage, error) {
	resp, err := c.httpClient.Get(fmt.Sprintf("%s/decisions/%s", c.baseURL, id))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to context engine: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("context engine returned %d: %s", resp.StatusCode, string(body))
	}

	var lineage DecisionLineage
	if err := json.NewDecoder(resp.Body).Decode(&lineage); err != nil {
		return nil, fmt.Errorf("failed to decode lineage: %w", err)
	}
	return &lineage, nil
}

// RecordRule registers a rule in the context engine
func (c *Client) RecordRule(r Rule) (*Rule, error) {
	payload, err := json.Marshal(r)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal rule: %w", err)
	}

	resp, err := c.httpClient.Post(fmt.Sprintf("%s/rules", c.baseURL), "application/json", bytes.NewReader(payload))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to context engine: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("context engine returned %d: %s", resp.StatusCode, string(body))
	}

	var saved Rule
	if err := json.NewDecoder(resp.Body).Decode(&saved); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}
	return &saved, nil
}

// ListRules retrieves project rules
func (c *Client) ListRules(category, severity, scope string) ([]Rule, error) {
	params := url.Values{}
	if category != "" {
		params.Set("category", category)
	}
	if severity != "" {
		params.Set("severity", severity)
	}
	if scope != "" {
		params.Set("scope", scope)
	}

	u := fmt.Sprintf("%s/rules?%s", c.baseURL, params.Encode())
	resp, err := c.httpClient.Get(u)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to context engine: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("context engine returned %d: %s", resp.StatusCode, string(body))
	}

	var rules []Rule
	if err := json.NewDecoder(resp.Body).Decode(&rules); err != nil {
		return nil, fmt.Errorf("failed to decode rules: %w", err)
	}
	return rules, nil
}

// CheckRules evaluates files against active rules
func (c *Client) CheckRules(filePaths []string, contents map[string]string) (*RuleCheckResponse, error) {
	reqBody := RuleCheckRequest{
		FilePaths: filePaths,
		Contents:  contents,
	}
	payload, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal rule check request: %w", err)
	}

	resp, err := c.httpClient.Post(fmt.Sprintf("%s/rules/check", c.baseURL), "application/json", bytes.NewReader(payload))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to context engine: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("context engine returned %d: %s", resp.StatusCode, string(body))
	}

	var checkResp RuleCheckResponse
	if err := json.NewDecoder(resp.Body).Decode(&checkResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}
	return &checkResp, nil
}
