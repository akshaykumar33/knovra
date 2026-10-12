package impact

import (
	"context"
	"testing"
)

func createTestIndex() *CodeIndexRaw {
	return &CodeIndexRaw{
		RootPath:     "d:/pro/knovra",
		TotalSymbols: 4,
		Files: []struct {
			FilePath    string `json:"file_path"`
			Language    string `json:"language"`
			Symbols     []struct {
				ID        string `json:"id"`
				Name      string `json:"name"`
				Kind      string `json:"kind"`
				LineStart int    `json:"line_start"`
				LineEnd   int    `json:"line_end"`
				Signature string `json:"signature"`
			} `json:"symbols"`
			Imports []struct {
				Symbol string `json:"symbol"`
				Module string `json:"module"`
				Line   int    `json:"line"`
			} `json:"imports"`
			Calls []struct {
				Caller string `json:"caller"`
				Callee string `json:"callee"`
				Line   int    `json:"line"`
			} `json:"calls"`
		}{
			{
				FilePath: "services/runtime/internal/watcher/models.go",
				Language: "go",
				Symbols: []struct {
					ID        string `json:"id"`
					Name      string `json:"name"`
					Kind      string `json:"kind"`
					LineStart int    `json:"line_start"`
					LineEnd   int    `json:"line_end"`
					Signature string `json:"signature"`
				}{
					{ID: "sym-1", Name: "ComputeDelta", Kind: "function", LineStart: 10, LineEnd: 20},
				},
				Imports: nil,
				Calls:   nil,
			},
			{
				FilePath: "services/runtime/internal/watcher/fs_watcher.go",
				Language: "go",
				Symbols: []struct {
					ID        string `json:"id"`
					Name      string `json:"name"`
					Kind      string `json:"kind"`
					LineStart int    `json:"line_start"`
					LineEnd   int    `json:"line_end"`
					Signature string `json:"signature"`
				}{
					{ID: "sym-2", Name: "ScanDiff", Kind: "function", LineStart: 15, LineEnd: 30},
				},
				Imports: []struct {
					Symbol string `json:"symbol"`
					Module string `json:"module"`
					Line   int    `json:"line"`
				}{
					{Symbol: "ComputeDelta", Module: "services/runtime/internal/watcher/models.go", Line: 5},
				},
				Calls: []struct {
					Caller string `json:"caller"`
					Callee string `json:"callee"`
					Line   int    `json:"line"`
				}{
					{Caller: "ScanDiff", Callee: "ComputeDelta", Line: 22},
				},
			},
			{
				FilePath: "services/runtime/cmd/knovra/main.go",
				Language: "go",
				Symbols:  nil,
				Imports: []struct {
					Symbol string `json:"symbol"`
					Module string `json:"module"`
					Line   int    `json:"line"`
				}{
					{Symbol: "", Module: "services/runtime/internal/watcher/fs_watcher.go", Line: 8},
				},
				Calls: nil,
			},
			{
				FilePath: "services/runtime/internal/watcher/watcher_test.go",
				Language: "go",
				Symbols:  nil,
				Imports:  nil,
				Calls:    nil,
			},
		},
		DependencyEdges: []struct {
			From string `json:"from"`
			To   string `json:"to"`
			Type string `json:"type"`
		}{
			{From: "services/runtime/internal/watcher/fs_watcher.go", To: "services/runtime/internal/watcher/models.go", Type: "IMPORTS"},
			{From: "services/runtime/cmd/knovra/main.go", To: "services/runtime/internal/watcher/fs_watcher.go", Type: "IMPORTS"},
		},
	}
}

func TestLocalImpactAnalyzer_DetectTargetType(t *testing.T) {
	analyzer, err := NewLocalImpactAnalyzer(".", createTestIndex())
	if err != nil {
		t.Fatalf("Failed to create analyzer: %v", err)
	}

	tests := []struct {
		target   string
		expected TargetType
	}{
		{"services/runtime/config.py", TargetFile},
		{"fs_watcher.go", TargetFile},
		{"chunks", TargetDBTable},
		{"decisions", TargetDBTable},
		{"/semantic/search", TargetAPIEndpoint},
		{"runtime", TargetService},
		{"ComputeDelta", TargetFunction},
	}

	for _, tc := range tests {
		got := analyzer.DetectTargetType(tc.target)
		if got != tc.expected {
			t.Errorf("DetectTargetType(%q) = %s; want %s", tc.target, got, tc.expected)
		}
	}
}

func TestLocalImpactAnalyzer_ReverseDependencyTraversal(t *testing.T) {
	analyzer, err := NewLocalImpactAnalyzer(".", createTestIndex())
	if err != nil {
		t.Fatalf("Failed to create analyzer: %v", err)
	}

	req := AnalysisRequest{
		Target:            "services/runtime/internal/watcher/models.go",
		MaxDepth:          3,
		IncludeTransitive: true,
		IncludeTests:      true,
	}

	res := analyzer.AnalyzeLocal(req)

	if res.Target != req.Target {
		t.Errorf("Target mismatch: got %s, want %s", res.Target, req.Target)
	}
	if res.TargetType != TargetFile {
		t.Errorf("TargetType mismatch: got %s, want %s", res.TargetType, TargetFile)
	}
	if res.TotalImpacted < 2 {
		t.Errorf("Expected at least 2 impacted entities, got %d", res.TotalImpacted)
	}

	// Verify direct impact includes fs_watcher.go
	foundDirect := false
	for _, d := range res.DirectImpacts {
		if d.Name == "services/runtime/internal/watcher/fs_watcher.go" {
			foundDirect = true
			if d.ImpactType != ImpactDirect {
				t.Errorf("Expected ImpactDirect, got %s", d.ImpactType)
			}
			if d.Distance != 1 {
				t.Errorf("Expected Distance 1, got %d", d.Distance)
			}
		}
	}
	if !foundDirect {
		t.Errorf("Direct impact services/runtime/internal/watcher/fs_watcher.go not found")
	}

	// Verify transitive impact includes main.go
	foundTransitive := false
	for _, tr := range res.TransitiveImpacts {
		if tr.Name == "services/runtime/cmd/knovra/main.go" {
			foundTransitive = true
			if tr.ImpactType != ImpactTransitive {
				t.Errorf("Expected ImpactTransitive, got %s", tr.ImpactType)
			}
			if tr.Distance < 2 {
				t.Errorf("Expected Distance >= 2, got %d", tr.Distance)
			}
		}
	}
	if !foundTransitive {
		t.Errorf("Transitive impact services/runtime/cmd/knovra/main.go not found")
	}
}

func TestLocalImpactAnalyzer_CallerImpact(t *testing.T) {
	analyzer, err := NewLocalImpactAnalyzer(".", createTestIndex())
	if err != nil {
		t.Fatalf("Failed to create analyzer: %v", err)
	}

	req := AnalysisRequest{
		Target: "ComputeDelta",
	}

	res := analyzer.AnalyzeLocal(req)

	if res.TargetType != TargetFunction {
		t.Errorf("Expected TargetFunction, got %s", res.TargetType)
	}

	foundCaller := false
	for _, d := range res.DirectImpacts {
		if d.Name == "services/runtime/internal/watcher/fs_watcher.go:ScanDiff" {
			foundCaller = true
			if d.Confidence != 1.0 {
				t.Errorf("Expected confidence 1.0, got %f", d.Confidence)
			}
		}
	}
	if !foundCaller {
		t.Errorf("Direct caller ScanDiff not found for ComputeDelta")
	}
}

func TestLocalImpactAnalyzer_FindAssociatedTests(t *testing.T) {
	analyzer, err := NewLocalImpactAnalyzer(".", createTestIndex())
	if err != nil {
		t.Fatalf("Failed to create analyzer: %v", err)
	}

	recs := analyzer.FindAssociatedTests("services/runtime/internal/watcher/fs_watcher.go")
	if len(recs) == 0 {
		t.Fatalf("Expected associated tests, got none")
	}

	if recs[0].TestFile != "services/runtime/internal/watcher/fs_watcher_test.go" && recs[0].TestFile != "services/runtime/internal/watcher/watcher_test.go" {
		t.Errorf("Unexpected test recommendation: %s", recs[0].TestFile)
	}
}

func TestClient_OfflineFallback(t *testing.T) {
	// Client configured with unreachable port, should gracefully fall back to local analyzer
	client := NewClient("http://127.0.0.1:59999", ".")
	client.local.Index = createTestIndex()
	client.local.buildIndex()

	req := AnalysisRequest{
		Target: "services/runtime/internal/watcher/models.go",
	}

	res, err := client.Analyze(context.Background(), req)
	if err != nil {
		t.Fatalf("Expected fallback to succeed, got error: %v", err)
	}

	if res.Target != req.Target {
		t.Errorf("Expected target %s, got %s", req.Target, res.Target)
	}
	if !res.GraphBacked {
		t.Errorf("Expected GraphBacked to be true")
	}
}
