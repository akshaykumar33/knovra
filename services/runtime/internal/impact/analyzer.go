package impact

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// CodeIndexRaw matches .knovra/code_index.json structure
type CodeIndexRaw struct {
	RootPath        string `json:"root_path"`
	TotalSymbols    int    `json:"total_symbols"`
	Files           []struct {
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
	} `json:"files"`
	DependencyEdges []struct {
		From string `json:"from"`
		To   string `json:"to"`
		Type string `json:"type"`
	} `json:"dependency_edges"`
}

// LocalImpactAnalyzer performs graph-backed impact analysis offline
type LocalImpactAnalyzer struct {
	RootDir     string
	Index       *CodeIndexRaw
	reverseDeps map[string][]string                 // target -> []importers
	callers     map[string][]map[string]interface{} // callee -> []caller_info
	fileSymbols map[string][]string                 // file -> []symbol_names
	symbolKinds map[string]string                   // symbol_name -> kind
	allFiles    []string
}

// NewLocalImpactAnalyzer creates and indexes an offline local impact analyzer
func NewLocalImpactAnalyzer(rootDir string, customIndex *CodeIndexRaw) (*LocalImpactAnalyzer, error) {
	analyzer := &LocalImpactAnalyzer{
		RootDir:     rootDir,
		Index:       customIndex,
		reverseDeps: make(map[string][]string),
		callers:     make(map[string][]map[string]interface{}),
		fileSymbols: make(map[string][]string),
		symbolKinds: make(map[string]string),
		allFiles:    make([]string, 0),
	}

	if analyzer.Index == nil {
		indexPath := filepath.Join(rootDir, ".knovra", "code_index.json")
		if data, err := os.ReadFile(indexPath); err == nil {
			var raw CodeIndexRaw
			if err := json.Unmarshal(data, &raw); err == nil {
				analyzer.Index = &raw
			}
		}
	}

	if analyzer.Index != nil {
		analyzer.buildIndex()
	}

	return analyzer, nil
}

func (a *LocalImpactAnalyzer) buildIndex() {
	if a.Index == nil {
		return
	}

	for _, f := range a.Index.Files {
		normPath := filepath.ToSlash(f.FilePath)
		a.allFiles = append(a.allFiles, normPath)

		for _, s := range f.Symbols {
			a.fileSymbols[normPath] = append(a.fileSymbols[normPath], s.Name)
			a.symbolKinds[strings.ToLower(s.Name)] = s.Kind
		}

		for _, c := range f.Calls {
			calleeNorm := strings.ToLower(c.Callee)
			a.callers[calleeNorm] = append(a.callers[calleeNorm], map[string]interface{}{
				"file":   normPath,
				"caller": c.Caller,
				"line":   c.Line,
			})
		}

		for _, imp := range f.Imports {
			modNorm := filepath.ToSlash(imp.Module)
			if modNorm != "" {
				a.reverseDeps[modNorm] = append(a.reverseDeps[modNorm], normPath)
			}
			if imp.Symbol != "" {
				a.reverseDeps[strings.ToLower(imp.Symbol)] = append(a.reverseDeps[strings.ToLower(imp.Symbol)], normPath)
			}
		}
	}

	for _, edge := range a.Index.DependencyEdges {
		fromNorm := filepath.ToSlash(edge.From)
		toNorm := filepath.ToSlash(edge.To)
		if fromNorm != "" && toNorm != "" && fromNorm != toNorm {
			a.reverseDeps[toNorm] = append(a.reverseDeps[toNorm], fromNorm)
		}
	}
}

// DetectTargetType inspects the target query and returns the best-fit TargetType
func (a *LocalImpactAnalyzer) DetectTargetType(target string) TargetType {
	clean := strings.ToLower(filepath.ToSlash(target))

	if strings.HasPrefix(clean, "/") || strings.Contains(clean, "/api/") || strings.HasPrefix(clean, "post ") || strings.HasPrefix(clean, "get ") {
		return TargetAPIEndpoint
	}

	if clean == "chunks" || clean == "decisions" || clean == "rules" || clean == "sessions" || clean == "commits" || clean == "events" || strings.HasSuffix(clean, "_table") {
		return TargetDBTable
	}

	if clean == "runtime" || clean == "context-engine" || clean == "code-indexer" || clean == "gateway" {
		return TargetService
	}

	for _, ext := range []string{".go", ".py", ".rs", ".ts", ".js", ".json", ".yaml", ".sql"} {
		if strings.HasSuffix(clean, ext) {
			return TargetFile
		}
	}

	// Check if matches indexed symbol with known kind
	if kind, ok := a.symbolKinds[strings.ToLower(target)]; ok {
		kindLower := strings.ToLower(kind)
		if kindLower == "function" || kindLower == "method" {
			return TargetFunction
		}
		if kindLower == "struct" || kindLower == "class" || kindLower == "interface" || kindLower == "trait" {
			return TargetClass
		}
	}

	if len(target) > 0 && target[0] >= 'A' && target[0] <= 'Z' {
		return TargetClass
	}

	return TargetFunction
}

// FindAssociatedTests locates unit or regression tests associated with a source file
func (a *LocalImpactAnalyzer) FindAssociatedTests(targetFile string) []TestRecommendation {
	norm := filepath.ToSlash(targetFile)
	base := filepath.Base(norm)
	stem := strings.TrimSuffix(base, filepath.Ext(base))
	recs := make([]TestRecommendation, 0)
	seen := make(map[string]bool)

	// If target itself is a test
	if strings.HasSuffix(norm, "_test.go") || strings.HasPrefix(base, "test_") || strings.HasSuffix(norm, "_test.rs") {
		return []TestRecommendation{
			{
				TestFile:   norm,
				TargetFile: norm,
				Priority:   "critical",
				Reason:     "Target is already inside a test suite",
			},
		}
	}

	// Go test pattern: foo.go -> foo_test.go
	if strings.HasSuffix(norm, ".go") {
		cand := strings.TrimSuffix(norm, ".go") + "_test.go"
		recs = append(recs, TestRecommendation{
			TestFile:   cand,
			TargetFile: norm,
			Priority:   "critical",
			Reason:     fmt.Sprintf("Direct Go unit test suite for '%s'", base),
		})
		seen[cand] = true
	}

	// Python test pattern: foo.py -> test_foo.py
	if strings.HasSuffix(norm, ".py") {
		cand := filepath.ToSlash(filepath.Join(filepath.Dir(norm), "test_"+stem+".py"))
		recs = append(recs, TestRecommendation{
			TestFile:   cand,
			TargetFile: norm,
			Priority:   "critical",
			Reason:     fmt.Sprintf("Direct Python pytest suite for '%s'", base),
		})
		seen[cand] = true
	}

	// Rust test pattern: foo.rs -> tests/test_foo.rs
	if strings.HasSuffix(norm, ".rs") {
		cand := filepath.ToSlash(filepath.Join("tests", "test_"+stem+".rs"))
		recs = append(recs, TestRecommendation{
			TestFile:   cand,
			TargetFile: norm,
			Priority:   "critical",
			Reason:     fmt.Sprintf("Direct Rust integration test for '%s'", base),
		})
		seen[cand] = true
	}

	// Scan indexed files for tests referencing the component
	for _, f := range a.allFiles {
		if !seen[f] && (strings.Contains(f, "_test.") || strings.Contains(f, "test_")) && strings.Contains(strings.ToLower(f), strings.ToLower(stem)) {
			recs = append(recs, TestRecommendation{
				TestFile:   f,
				TargetFile: norm,
				Priority:   "high",
				Reason:     fmt.Sprintf("Component regression test suite matching '%s'", stem),
			})
			seen[f] = true
		}
	}

	return recs
}

// AnalyzeLocal executes offline graph-backed impact analysis
func (a *LocalImpactAnalyzer) AnalyzeLocal(req AnalysisRequest) *AnalysisResponse {
	start := time.Now()
	targetNorm := filepath.ToSlash(req.Target)
	tType := req.TargetType
	if tType == "" {
		tType = a.DetectTargetType(req.Target)
	}

	direct := make([]ImpactNode, 0)
	transitive := make([]ImpactNode, 0)
	tests := make([]TestRecommendation, 0)
	criticalPaths := make([]CriticalPath, 0)
	visited := make(map[string]bool)
	visited[targetNorm] = true

	// 1. Direct symbol callers if function or class
	if tType == TargetFunction || tType == TargetClass {
		if callers, ok := a.callers[strings.ToLower(req.Target)]; ok {
			for _, c := range callers {
				cFile, _ := c["file"].(string)
				cCaller, _ := c["caller"].(string)
				cLine, _ := c["line"].(int)
				name := fmt.Sprintf("%s:%s", cFile, cCaller)
				direct = append(direct, ImpactNode{
					Name:       name,
					TargetType: TargetFunction,
					ImpactType: ImpactDirect,
					Distance:   1,
					Confidence: 1.0,
					Reason:     fmt.Sprintf("Directly calls symbol '%s' at line %d", req.Target, cLine),
					Critical:   !strings.Contains(cFile, "test"),
					Provenance: c,
				})
			}
		}
	}

	// 2. Direct database table mapping
	if tType == TargetDBTable {
		tableConsumers := map[string][]string{
			"chunks":    {"services/context-engine/app/storage/vector_store.py", "services/runtime/internal/semantic/client.go"},
			"decisions": {"services/context-engine/app/decision/store.py", "services/runtime/internal/decision/client.go"},
			"rules":     {"services/context-engine/app/decision/store.py", "services/runtime/internal/planner/client.go"},
			"sessions":  {"services/context-engine/app/conversation/store.py", "services/runtime/internal/conversation/client.go"},
			"commits":   {"services/context-engine/app/git_memory/store.py", "services/runtime/internal/git/client.go"},
			"events":    {"services/context-engine/app/events/bus.py", "services/runtime/internal/events/client.go"},
		}
		if consumers, ok := tableConsumers[strings.ToLower(req.Target)]; ok {
			for _, c := range consumers {
				direct = append(direct, ImpactNode{
					Name:       c,
					TargetType: TargetFile,
					ImpactType: ImpactDirect,
					Distance:   1,
					Confidence: 1.0,
					Reason:     fmt.Sprintf("Queries and mutates schema table '%s'", req.Target),
					Critical:   true,
				})
			}
			criticalPaths = append(criticalPaths, CriticalPath{
				Path:        append([]string{req.Target}, consumers...),
				RiskLevel:   "critical",
				Description: fmt.Sprintf("Schema modification on '%s' directly affects storage and API layers", req.Target),
			})
		}
	}

	// 3. BFS traversal for reverse dependents / importers
	maxDepth := req.MaxDepth
	if maxDepth <= 0 {
		maxDepth = 3
	}

	type queueItem struct {
		node  string
		depth int
		path  []string
	}

	queue := []queueItem{{node: targetNorm, depth: 1, path: []string{targetNorm}}}
	for _, d := range direct {
		parts := strings.Split(d.Name, ":")
		queue = append(queue, queueItem{node: parts[0], depth: 2, path: []string{targetNorm, parts[0]}})
	}

	for len(queue) > 0 {
		item := queue[0]
		queue = queue[1:]

		if item.depth > maxDepth {
			continue
		}

		dependents := a.reverseDeps[item.node]
		// Partial stem match
		stem := strings.TrimSuffix(filepath.Base(item.node), filepath.Ext(item.node))
		for k, deps := range a.reverseDeps {
			if k != item.node && strings.HasSuffix(k, stem) {
				dependents = append(dependents, deps...)
			}
		}

		for _, dep := range dependents {
			if visited[dep] {
				continue
			}
			visited[dep] = true

			isDirect := item.depth == 1
			confidence := math.Round((1.0*math.Pow(0.75, float64(item.depth-1)))*100) / 100
			impType := ImpactDirect
			if !isDirect {
				impType = ImpactTransitive
			}

			reason := fmt.Sprintf("Directly imports '%s'", item.node)
			if !isDirect {
				reason = fmt.Sprintf("Transitively depends on '%s' via %s", targetNorm, strings.Join(item.path, " -> "))
			}

			node := ImpactNode{
				Name:       dep,
				TargetType: TargetFile,
				ImpactType: impType,
				Distance:   item.depth,
				Confidence: confidence,
				Reason:     reason,
				Critical:   item.depth <= 2 && (strings.Contains(dep, "cmd") || strings.Contains(dep, "main")),
			}

			if isDirect {
				direct = append(direct, node)
			} else {
				transitive = append(transitive, node)
			}

			newPath := append(append([]string{}, item.path...), dep)
			if req.IncludeTransitive && item.depth < maxDepth {
				queue = append(queue, queueItem{node: dep, depth: item.depth + 1, path: newPath})
			}
		}
	}

	// 4. Test discovery
	if req.IncludeTests {
		for f := range visited {
			tRecs := a.FindAssociatedTests(f)
			tests = append(tests, tRecs...)
		}
	}

	// 5. Related Decisions
	decisions := []RelatedDecision{
		{
			DecisionID: "ADR-0001",
			Title:      "Polyglot Monorepo Architecture",
			Status:     "ACCEPTED",
			Reason:     "Preserves local-first offline execution capability across Go, Python, and Rust.",
		},
		{
			DecisionID: "ADR-0012",
			Title:      "Graph-Backed Impact Analysis",
			Status:     "ACCEPTED",
			Reason:     "Ensures change impact is explainable and deterministic rather than LLM guesswork.",
		},
	}

	duration := float64(time.Since(start).Microseconds()) / 1000.0
	total := len(direct) + len(transitive)

	explanation := fmt.Sprintf(
		"Impact analysis for '%s' (%s): identified %d direct impacts and %d transitive dependents up to depth %d. %d test suites recommended.",
		req.Target, tType, len(direct), len(transitive), maxDepth, len(tests),
	)

	return &AnalysisResponse{
		Target:            req.Target,
		TargetType:        tType,
		DirectImpacts:     direct,
		TransitiveImpacts: transitive,
		TotalImpacted:     total,
		ConfidenceScore:   0.95,
		CriticalPaths:     criticalPaths,
		TestsToRun:        tests,
		RelatedDecisions:  decisions,
		GraphBacked:       true,
		Explanation:       explanation,
		ExecutionTimeMs:   duration,
		Timestamp:         time.Now().UTC(),
	}
}

// Client connects to context-engine API with automatic local fallback
type Client struct {
	BaseURL    string
	HTTPClient *http.Client
	local      *LocalImpactAnalyzer
}

// NewClient creates a new Impact Analysis client
func NewClient(baseURL string, rootDir string) *Client {
	localAnalyzer, _ := NewLocalImpactAnalyzer(rootDir, nil)
	return &Client{
		BaseURL: baseURL,
		HTTPClient: &http.Client{
			Timeout: 4 * time.Second,
		},
		local: localAnalyzer,
	}
}

// Analyze sends an impact analysis request to context-engine, falling back to local analysis on error
func (c *Client) Analyze(ctx context.Context, req AnalysisRequest) (*AnalysisResponse, error) {
	payload, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal impact request: %w", err)
	}

	url := fmt.Sprintf("%s/impact/analyze", strings.TrimRight(c.BaseURL, "/"))
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(payload))
	if err == nil {
		httpReq.Header.Set("Content-Type", "application/json")
		resp, err := c.HTTPClient.Do(httpReq)
		if err == nil && resp.StatusCode == http.StatusOK {
			defer resp.Body.Close()
			var res AnalysisResponse
			if err := json.NewDecoder(resp.Body).Decode(&res); err == nil {
				return &res, nil
			}
		}
	}

	// Resilient local-first fallback (Invariant #7)
	if c.local != nil {
		return c.local.AnalyzeLocal(req), nil
	}

	return nil, fmt.Errorf("impact analysis failed and local fallback unavailable")
}
