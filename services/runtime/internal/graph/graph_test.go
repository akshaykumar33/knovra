package graph

import (
	"strings"
	"testing"
	"time"
)

func TestGenerateCypherStatements(t *testing.T) {
	now := time.Now().UTC()
	prov := Provenance{
		Source:           "test-runner",
		SourceID:         "test-file.ts",
		CreatedAt:        now,
		UpdatedAt:        now,
		Confidence:       0.95,
		ExtractorVersion: "0.1.0",
		ProjectID:        "proj_123",
	}

	bundle := &GraphBundle{
		ProjectID: "proj_123",
		Nodes: []GraphNode{
			{
				ID:    "file_1",
				Label: "File",
				Properties: map[string]interface{}{
					"path":     "src/app.ts",
					"language": "typescript",
				},
				Provenance: prov,
			},
			{
				ID:    "sym_1",
				Label: "Symbol",
				Properties: map[string]interface{}{
					"name": "AppModule",
					"kind": "class",
				},
				Provenance: prov,
			},
		},
		Relationships: []GraphRelationship{
			{
				Type:       "DECLARES",
				FromNodeID: "file_1",
				FromLabel:  "File",
				ToNodeID:   "sym_1",
				ToLabel:    "Symbol",
				Properties: map[string]interface{}{"line": 10},
				Provenance: prov,
			},
		},
		GeneratedAt: now,
	}

	stmts := GenerateCypherStatements(bundle)

	if len(stmts) != 3 {
		t.Fatalf("expected 3 statements (2 nodes + 1 relationship), got %d", len(stmts))
	}

	// Verify node MERGE statement
	if !strings.Contains(stmts[0], "MERGE (n:File {id: 'file_1'})") {
		t.Errorf("expected File merge statement, got: %s", stmts[0])
	}
	if !strings.Contains(stmts[0], "n.provenance_source = 'test-runner'") {
		t.Errorf("expected provenance_source in statement, got: %s", stmts[0])
	}

	// Verify relationship statement
	if !strings.Contains(stmts[2], "MERGE (from)-[r:DECLARES]->(to)") {
		t.Errorf("expected DECLARES relationship, got: %s", stmts[2])
	}

	// Verify export script
	script := GenerateExportScript(bundle)
	if !strings.Contains(script, ":begin") || !strings.Contains(script, ":commit") {
		t.Errorf("expected transaction wrapper in export script")
	}
}
