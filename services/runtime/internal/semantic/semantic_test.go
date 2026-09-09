package semantic

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestProjectIndexer(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "knovra-semantic-test-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	// Create test README.md
	readmePath := filepath.Join(tempDir, "README.md")
	if err := os.WriteFile(readmePath, []byte("# Knovra Core\nContext Engine documentation."), 0644); err != nil {
		t.Fatalf("failed to write readme: %v", err)
	}

	// Create .knovra/code_index.json
	knovraDir := filepath.Join(tempDir, ".knovra")
	_ = os.MkdirAll(knovraDir, 0755)
	codeIndex := map[string]interface{}{
		"files": []map[string]interface{}{
			{
				"file_path":    "internal/parser.go",
				"language":     "go",
				"content_hash": "hash123",
				"symbols": []map[string]interface{}{
					{
						"id":         "sym1",
						"name":       "ParseAST",
						"kind":       "function",
						"line_start": 10,
						"line_end":   20,
						"signature":  "func ParseAST(data []byte) (*AST, error)",
					},
				},
				"imports": []interface{}{},
				"exports": []interface{}{},
			},
		},
	}
	data, _ := json.Marshal(codeIndex)
	_ = os.WriteFile(filepath.Join(knovraDir, "code_index.json"), data, 0644)

	indexer := NewProjectIndexer(tempDir)
	artifacts, err := indexer.CollectArtifacts()
	if err != nil {
		t.Fatalf("CollectArtifacts failed: %v", err)
	}

	if len(artifacts) < 3 {
		t.Fatalf("expected at least 3 artifacts (doc, module, symbol), got %d", len(artifacts))
	}

	var foundDoc, foundMod, foundSym bool
	for _, a := range artifacts {
		if a.DocType == DocTypeDocument && a.Title == "Knovra Core" {
			foundDoc = true
		}
		if a.DocType == DocTypeModuleSummary && a.DocumentID == "mod:internal/parser.go" {
			foundMod = true
		}
		if a.DocType == DocTypeCodeSummary && a.Title == "Function ParseAST" {
			foundSym = true
		}
	}

	if !foundDoc {
		t.Errorf("expected to find doc artifact")
	}
	if !foundMod {
		t.Errorf("expected to find module summary artifact")
	}
	if !foundSym {
		t.Errorf("expected to find code summary artifact")
	}
}

func TestSemanticClient(t *testing.T) {
	// Mock Context Engine server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/semantic/index":
			resp := IndexBatchResponse{
				IndexedDocuments: 2,
				IndexedChunks:    4,
				DocTypes:         map[string]int{"doc": 1, "code_summary": 1},
				ModelName:        "knovra-deterministic-dense-v1",
				ElapsedMs:        12.5,
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(resp)

		case "/semantic/search":
			results := []SearchResult{
				{
					ChunkID:    "chunk-1",
					DocumentID: "doc-1",
					Score:      0.89,
					DocType:    DocTypeCodeSummary,
					Title:      "ParseAST",
					Content:    "Parses AST symbols",
					Provenance: Provenance{
						FilePath:    "internal/parser.go",
						ContentHash: "hash123",
					},
				},
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(results)

		case "/semantic/stats":
			stats := SemanticStats{
				TotalDocuments:  10,
				TotalChunks:     25,
				ByDocType:       map[string]int{"doc": 5, "code_summary": 20},
				EmbeddingModel:  "knovra-deterministic-dense-v1",
				VectorDimension: 384,
				StorageBackend:  "in-memory",
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(stats)

		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	client := NewClient(server.URL)

	// Test IndexBatch
	indexResp, err := client.IndexBatch([]DocumentInput{
		{
			DocumentID: "doc-1",
			DocType:    DocTypeDocument,
			Title:      "Test",
			Content:    "Test content",
			Provenance: Provenance{FilePath: "test.md", ContentHash: "abc"},
		},
	}, false)
	if err != nil {
		t.Fatalf("IndexBatch failed: %v", err)
	}
	if indexResp.IndexedDocuments != 2 || indexResp.IndexedChunks != 4 {
		t.Errorf("unexpected index response: %+v", indexResp)
	}

	// Test Search
	results, err := client.Search("syntax parser", []DocType{DocTypeCodeSummary}, 5, 0.5)
	if err != nil {
		t.Fatalf("Search failed: %v", err)
	}
	if len(results) != 1 || results[0].Score < 0.8 {
		t.Errorf("unexpected search results: %+v", results)
	}

	// Test Stats
	stats, err := client.GetStats()
	if err != nil {
		t.Fatalf("GetStats failed: %v", err)
	}
	if stats.TotalDocuments != 10 || stats.StorageBackend != "in-memory" {
		t.Errorf("unexpected stats: %+v", stats)
	}
}
