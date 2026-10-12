package decision

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestParseADRFile(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "knovra-adr-test-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	adrContent := `# ADR-001: Use Neo4j Graph Database

## Metadata
* **ID**: adr-001
* **Status**: Accepted
* **Created**: 2026-09-09
* **Created By**: Lead Architect
* **Supersedes**: None
* **Superseded By**: None
* **Affected Entities**:
  - ` + "`services/runtime/internal/graph`" + `
  - ` + "`graph/schema.cypher`" + `

## Context & Problem Statement
Need native variable-length graph traversals for code intelligence.

## Decision
Adopt Neo4j Community/Enterprise property graph with Cypher language.

## Alternatives Considered
- **Postgres CTE**: Too slow at scale
- **In-Memory Petgraph**: Doesn't persist across CLI runs
`

	filePath := filepath.Join(tempDir, "ADR-001-neo4j.md")
	if err := os.WriteFile(filePath, []byte(adrContent), 0644); err != nil {
		t.Fatalf("failed to write ADR file: %v", err)
	}

	dec, err := ParseADRFile(filePath)
	if err != nil {
		t.Fatalf("ParseADRFile failed: %v", err)
	}

	if dec.ID != "adr-001" {
		t.Errorf("expected ID 'adr-001', got %q", dec.ID)
	}
	if dec.Status != StatusAccepted {
		t.Errorf("expected StatusAccepted, got %q", dec.Status)
	}
	if dec.Title != "ADR-001: Use Neo4j Graph Database" {
		t.Errorf("unexpected title: %q", dec.Title)
	}
	if len(dec.Alternatives) != 2 {
		t.Errorf("expected 2 alternatives, got %d", len(dec.Alternatives))
	}
	if len(dec.AffectedEntities) != 2 {
		t.Errorf("expected 2 affected entities, got %d", len(dec.AffectedEntities))
	}
}

func TestParseKnovraYAML(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "knovra-yaml-test-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	yamlContent := `project:
  name: test-proj

rules:
  - id: rule-sec-01
    title: No Secrets
    category: security
    severity: critical
    scope: "*"
    instruction: Never commit API keys
`

	yamlPath := filepath.Join(tempDir, "knovra.yaml")
	if err := os.WriteFile(yamlPath, []byte(yamlContent), 0644); err != nil {
		t.Fatalf("failed to write yaml: %v", err)
	}

	rules, err := ParseKnovraYAML(yamlPath)
	if err != nil {
		t.Fatalf("ParseKnovraYAML failed: %v", err)
	}

	if len(rules) != 1 {
		t.Fatalf("expected 1 rule, got %d", len(rules))
	}
	if rules[0].ID != "rule-sec-01" {
		t.Errorf("expected rule ID 'rule-sec-01', got %q", rules[0].ID)
	}
	if rules[0].Severity != SeverityCritical {
		t.Errorf("expected SeverityCritical, got %q", rules[0].Severity)
	}
}

func TestDecisionClient(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/decisions":
			if r.Method == http.MethodPost {
				w.WriteHeader(http.StatusCreated)
				var d Decision
				_ = json.NewDecoder(r.Body).Decode(&d)
				json.NewEncoder(w).Encode(d)
			} else {
				json.NewEncoder(w).Encode([]Decision{
					{ID: "adr-001", Title: "Test", Status: StatusAccepted},
				})
			}
		case "/decisions/adr-001":
			lineage := DecisionLineage{
				Decision:      Decision{ID: "adr-001", Title: "Test", Status: StatusAccepted},
				ActiveVersion: Decision{ID: "adr-001", Title: "Test", Status: StatusAccepted},
			}
			json.NewEncoder(w).Encode(lineage)
		case "/rules":
			if r.Method == http.MethodPost {
				w.WriteHeader(http.StatusCreated)
				var ruleItem Rule
				_ = json.NewDecoder(r.Body).Decode(&ruleItem)
				json.NewEncoder(w).Encode(ruleItem)


			} else {
				json.NewEncoder(w).Encode([]Rule{
					{ID: "rule-1", Title: "Rule 1", Category: CategoryProject},
				})
			}
		case "/rules/check":
			json.NewEncoder(w).Encode(RuleCheckResponse{
				TotalRulesEvaluated: 1,
				Passed:              true,
			})
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	client := NewClient(server.URL)

	// 1. Record decision
	dec, err := client.RecordDecision(Decision{
		ID:    "adr-001",
		Title: "Test",
	})
	if err != nil {
		t.Fatalf("RecordDecision failed: %v", err)
	}
	if dec.ID != "adr-001" {
		t.Errorf("expected ID adr-001, got %q", dec.ID)
	}

	// 2. Lineage
	lineage, err := client.GetDecisionLineage("adr-001")
	if err != nil {
		t.Fatalf("GetDecisionLineage failed: %v", err)
	}
	if lineage.ActiveVersion.ID != "adr-001" {
		t.Errorf("unexpected active version: %q", lineage.ActiveVersion.ID)
	}

	// 3. Rules check
	checkResp, err := client.CheckRules([]string{"test.go"}, nil)
	if err != nil {
		t.Fatalf("CheckRules failed: %v", err)
	}
	if !checkResp.Passed {
		t.Errorf("expected check to pass")
	}
}
