package graph

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// Client executes Cypher statements against Neo4j HTTP transactional endpoint
type Client struct {
	baseURL    string
	authHeader string
	httpClient *http.Client
}

type cypherStatement struct {
	Statement string `json:"statement"`
}

type neo4jTxRequest struct {
	Statements []cypherStatement `json:"statements"`
}

type neo4jTxResponse struct {
	Errors []struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	} `json:"errors"`
}

// GraphStats summarizes Neo4j graph population
type GraphStats struct {
	TotalNodes         int            `json:"totalNodes"`
	TotalRelationships int            `json:"totalRelationships"`
	NodeBreakdown      map[string]int `json:"nodeBreakdown"`
	RelBreakdown       map[string]int `json:"relBreakdown"`
}

func NewClient(baseURL, user, password string) *Client {
	if baseURL == "" {
		baseURL = "http://localhost:7474"
	}
	if user == "" {
		user = "neo4j"
	}
	if password == "" {
		password = "knovra_dev_password"
	}

	auth := base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s:%s", user, password)))
	return &Client{
		baseURL:    baseURL,
		authHeader: "Basic " + auth,
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

// CheckConnection returns true if Neo4j HTTP interface is reachable
func (c *Client) CheckConnection() bool {
	req, err := http.NewRequest(http.MethodGet, c.baseURL, nil)
	if err != nil {
		return false
	}
	req.Header.Set("Authorization", c.authHeader)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	return resp.StatusCode == http.StatusOK
}

// Execute commits a batch of Cypher statements in Neo4j
func (c *Client) Execute(statements []string) error {
	endpoint := fmt.Sprintf("%s/db/neo4j/tx/commit", c.baseURL)

	txReq := neo4jTxRequest{
		Statements: make([]cypherStatement, len(statements)),
	}
	for i, s := range statements {
		txReq.Statements[i] = cypherStatement{Statement: s}
	}

	bodyBytes, err := json.Marshal(txReq)
	if err != nil {
		return err
	}

	req, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", c.authHeader)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to contact Neo4j at %s: %w", endpoint, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("Neo4j returned HTTP %d", resp.StatusCode)
	}

	var txResp neo4jTxResponse
	if err := json.NewDecoder(resp.Body).Decode(&txResp); err == nil && len(txResp.Errors) > 0 {
		return fmt.Errorf("Neo4j error [%s]: %s", txResp.Errors[0].Code, txResp.Errors[0].Message)
	}

	return nil
}
