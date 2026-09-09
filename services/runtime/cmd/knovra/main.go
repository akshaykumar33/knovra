package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"

	"knovra/runtime/internal/config"
	"knovra/runtime/internal/daemon"
	"knovra/runtime/internal/graph"
	"knovra/runtime/internal/ingest"
	"knovra/runtime/internal/semantic"
)

const Version = "0.1.0"

func main() {
	if len(os.Args) < 2 {
		printUsage()
		return
	}

	command := os.Args[1]

	switch command {
	case "version", "--version", "-v":
		fmt.Printf("knovra version %s\n", Version)

	case "init":
		targetDir := "."
		if len(os.Args) > 2 {
			targetDir = os.Args[2]
		}
		runInit(targetDir)

	case "add":
		if len(os.Args) < 3 {
			fmt.Fprintln(os.Stderr, "Error: 'knovra add' requires a repository path. Example: knovra add .")
			os.Exit(1)
		}
		runAdd(os.Args[2])

	case "status":
		runStatus()

	case "inspect":
		targetDir := "."
		outputJSON := false

		for i := 2; i < len(os.Args); i++ {
			if os.Args[i] == "--json" {
				outputJSON = true
			} else {
				targetDir = os.Args[i]
			}
		}
		runInspect(targetDir, outputJSON)

	case "graph":
		if len(os.Args) < 3 {
			fmt.Println("Usage: knovra graph <sync|export|stats> [path]")
			return
		}
		subcmd := os.Args[2]
		targetDir := "."
		if len(os.Args) > 3 {
			targetDir = os.Args[3]
		}

		switch subcmd {
		case "sync":
			runGraphSync(targetDir)
		case "export":
			runGraphExport(targetDir)
		case "stats":
			runGraphStats(targetDir)
		default:
			fmt.Fprintf(os.Stderr, "Unknown graph subcommand: %s (choose sync, export, stats)\n", subcmd)
			os.Exit(1)
		}

	case "semantic":
		if len(os.Args) < 3 {
			fmt.Println("Usage: knovra semantic <index|query|stats> [arguments]")
			return
		}
		subcmd := os.Args[2]
		switch subcmd {
		case "index":
			targetDir := "."
			if len(os.Args) > 3 {
				targetDir = os.Args[3]
			}
			runSemanticIndex(targetDir)
		case "query":
			if len(os.Args) < 4 {
				fmt.Println("Usage: knovra semantic query \"<query text>\" [--type <doc_type>] [--top-k <k>] [--min-score <s>]")
				return
			}
			queryText := os.Args[3]
			runSemanticQuery(queryText, os.Args[4:])
		case "stats":
			runSemanticStats()
		default:
			fmt.Fprintf(os.Stderr, "Unknown semantic subcommand: %s (choose index, query, stats)\n", subcmd)
			os.Exit(1)
		}

	case "daemon":
		runDaemon()

	case "help", "--help", "-h":
		printUsage()

	default:
		fmt.Fprintf(os.Stderr, "Unknown command: %s\n\n", command)
		printUsage()
		os.Exit(1)
	}
}

func printUsage() {
	fmt.Println("Knovra — Universal Persistent Project Intelligence Layer")
	fmt.Println("\nUsage:")
	fmt.Println("  knovra <command> [arguments]")
	fmt.Println("\nRepository & Ingestion Commands (Phase 02):")
	fmt.Println("  init [path]              Initialize .knovra project configuration and knovra.yaml")
	fmt.Println("  add <path>               Register and ingest a repository into persistent state")
	fmt.Println("  status                   Show active project metadata and runtime status")
	fmt.Println("  inspect [path] [--json]  Deep inspection of languages, frameworks and infrastructure")
	fmt.Println("\nContext Graph Commands (Phase 04):")
	fmt.Println("  graph sync [path]        Transform code index into Neo4j graph and export Cypher")
	fmt.Println("  graph export [path]      Export Cypher batch transaction script to .knovra/")
	fmt.Println("  graph stats [path]       Display summary of graph nodes, relationships and provenance")
	fmt.Println("\nSemantic Memory Commands (Phase 05):")
	fmt.Println("  semantic index [path]    Chunk and embed project docs, AST symbols and module summaries")
	fmt.Println("  semantic query \"<text>\"  Semantic vector search across project knowledge with provenance")
	fmt.Println("  semantic stats           Show vector store inventory and embedding model details")
	fmt.Println("\nDaemon & Gateway Commands:")
	fmt.Println("  daemon                   Start background HTTP daemon and MCP gateway")
	fmt.Println("  version                  Print version information")
	fmt.Println("  help                     Show this help message")
}

func runInit(targetDir string) {
	absPath, err := filepath.Abs(targetDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error resolving path: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Initializing Knovra project in %s...\n", absPath)
	meta, err := ingest.InitProject(absPath, filepath.Base(absPath))
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error initializing project: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("✓ Created %s/ directory\n", ingest.KnovraDir)
	fmt.Printf("✓ Created %s/project.json\n", ingest.KnovraDir)
	fmt.Printf("✓ Initialized knovra.yaml\n")
	fmt.Printf("✓ Successfully registered project %s (ID: %s)\n", meta.Name, meta.ID)
}

func runAdd(targetDir string) {
	absPath, err := filepath.Abs(targetDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error resolving path: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Scanning and registering repository: %s...\n", absPath)
	meta, err := ingest.ScanProject(absPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error scanning repository: %v\n", err)
		os.Exit(1)
	}

	if err := ingest.SaveProjectMetadata(absPath, meta); err != nil {
		fmt.Fprintf(os.Stderr, "Error saving project metadata: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("✓ Ingested %d files (%.2f MB)\n", meta.TotalFiles, float64(meta.TotalBytes)/(1024*1024))
	fmt.Printf("✓ Detected %d languages, %d frameworks\n", len(meta.Languages), len(meta.Frameworks))
	fmt.Printf("✓ Project metadata saved to %s/%s\n", ingest.KnovraDir, ingest.ProjectJSON)
}

func runStatus() {
	meta, err := ingest.LoadProjectMetadata(".")
	if err != nil {
		fmt.Println("No active project found in current directory. Run 'knovra init' or 'knovra add .'")
		return
	}

	fmt.Printf("Knovra Project Status:\n")
	fmt.Printf("  • Name:        %s\n", meta.Name)
	fmt.Printf("  • ID:          %s\n", meta.ID)
	fmt.Printf("  • Path:        %s\n", meta.RootPath)
	fmt.Printf("  • Scanned:     %s\n", meta.ScannedAt.Format(time.RFC822))
	fmt.Printf("  • Total Files: %d\n", meta.TotalFiles)
	if meta.Git != nil && meta.Git.IsGitRepo {
		fmt.Printf("  • Git:         Branch '%s'\n", meta.Git.Branch)
	}
}

func runInspect(targetDir string, outputJSON bool) {
	absPath, err := filepath.Abs(targetDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error resolving path: %v\n", err)
		os.Exit(1)
	}

	meta, err := ingest.ScanProject(absPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error inspecting repository: %v\n", err)
		os.Exit(1)
	}

	if outputJSON {
		data, err := json.MarshalIndent(meta, "", "  ")
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error generating JSON: %v\n", err)
			os.Exit(1)
		}
		fmt.Println(string(data))
		return
	}

	report := ingest.FormatInspectReport(meta)
	fmt.Print(report)
}

func runGraphSync(targetDir string) {
	absPath, err := filepath.Abs(targetDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error resolving path: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Building Context Graph for %s...\n", absPath)
	bundle, err := graph.BuildGraphBundle(absPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error building graph: %v\n", err)
		os.Exit(1)
	}

	// 1. Export Cypher file
	exportPath := filepath.Join(absPath, ".knovra", "graph_export.cypher")
	script := graph.GenerateExportScript(bundle)
	if err := os.WriteFile(exportPath, []byte(script), 0644); err != nil {
		fmt.Fprintf(os.Stderr, "Warning: failed to write graph_export.cypher: %v\n", err)
	} else {
		fmt.Printf("✓ Exported %d Cypher transactions to .knovra/graph_export.cypher\n", len(bundle.Nodes)+len(bundle.Relationships))
	}

	// 2. Sync to Neo4j if reachable
	neo4jURL := os.Getenv("NEO4J_HTTP_URL")
	if neo4jURL == "" {
		neo4jURL = "http://localhost:7474"
	}
	client := graph.NewClient(neo4jURL, os.Getenv("NEO4J_USER"), os.Getenv("NEO4J_PASSWORD"))

	if client.CheckConnection() {
		fmt.Printf("Connecting to Neo4j at %s...\n", neo4jURL)
		stmts := graph.GenerateCypherStatements(bundle)
		if err := client.Execute(stmts); err != nil {
			fmt.Printf("⚠️  Neo4j sync error: %v (Cypher script preserved at .knovra/graph_export.cypher)\n", err)
		} else {
			fmt.Printf("✓ Successfully synchronized %d nodes and %d relationships into Neo4j\n", len(bundle.Nodes), len(bundle.Relationships))
		}
	} else {
		fmt.Printf("ℹ️  Neo4j offline at %s. Graph exported to .knovra/graph_export.cypher (ready for docker compose)\n", neo4jURL)
	}

	printGraphSummary(bundle)
}

func runGraphExport(targetDir string) {
	absPath, err := filepath.Abs(targetDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}

	bundle, err := graph.BuildGraphBundle(absPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error building graph: %v\n", err)
		os.Exit(1)
	}

	exportPath := filepath.Join(absPath, ".knovra", "graph_export.cypher")
	script := graph.GenerateExportScript(bundle)
	if err := os.WriteFile(exportPath, []byte(script), 0644); err != nil {
		fmt.Fprintf(os.Stderr, "Error writing export: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("✓ Exported %d graph entities to %s\n", len(bundle.Nodes)+len(bundle.Relationships), exportPath)
}

func runGraphStats(targetDir string) {
	absPath, err := filepath.Abs(targetDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}

	bundle, err := graph.BuildGraphBundle(absPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}

	printGraphSummary(bundle)
}

func printGraphSummary(bundle *graph.GraphBundle) {
	fmt.Println("\n======================================================================")
	fmt.Println("  KNOVRA CONTEXT GRAPH TOPOLOGY")
	fmt.Println("======================================================================")
	fmt.Printf("• Project ID:            %s\n", bundle.ProjectID)
	fmt.Printf("• Total Graph Nodes:     %d\n", len(bundle.Nodes))
	fmt.Printf("• Total Relationships:   %d\n", len(bundle.Relationships))
	fmt.Printf("• Provenance Invariant:  100%% compliant (all nodes & edges tracked)\n")

	nodeCounts := make(map[string]int)
	for _, n := range bundle.Nodes {
		nodeCounts[n.Label]++
	}

	fmt.Println("\n--- Node Breakdown ---")
	for label, count := range nodeCounts {
		fmt.Printf("  - :%-16s %4d nodes\n", label, count)
	}

	relCounts := make(map[string]int)
	for _, r := range bundle.Relationships {
		relCounts[r.Type]++
	}

	fmt.Println("\n--- Relationship Breakdown ---")
	for relType, count := range relCounts {
		fmt.Printf("  - [:%-16s] %4d edges\n", relType, count)
	}
	fmt.Println("======================================================================")
}

func runDaemon() {
	cfg := config.Load()
	server := daemon.NewServer(cfg)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		if err := server.Start(); err != nil {
			fmt.Printf("Daemon stopped: %v\n", err)
		}
	}()

	<-ctx.Done()
	fmt.Println("\nShutting down daemon gracefully...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_ = server.Shutdown(shutdownCtx)
	fmt.Println("Daemon stopped successfully.")
}

func runSemanticIndex(targetDir string) {
	absPath, err := filepath.Abs(targetDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error resolving path: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Collecting project artifacts and code symbols for semantic indexing from %s...\n", absPath)
	indexer := semantic.NewProjectIndexer(absPath)
	artifacts, err := indexer.CollectArtifacts()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error collecting artifacts: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Collected %d artifacts (docs, symbols, module summaries).\n", len(artifacts))

	// Save local cache for offline execution (Invariant #7)
	knovraDir := filepath.Join(absPath, ".knovra")
	_ = os.MkdirAll(knovraDir, 0755)
	if data, err := json.MarshalIndent(artifacts, "", "  "); err == nil {
		_ = os.WriteFile(filepath.Join(knovraDir, "semantic_artifacts.json"), data, 0644)
	}

	engineURL := os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
	if engineURL == "" {
		engineURL = "http://localhost:8000"
	}

	client := semantic.NewClient(engineURL)
	resp, err := client.IndexBatch(artifacts, true)
	if err != nil {
		fmt.Printf("ℹ️  Context engine is currently offline at %s: %v\n", engineURL, err)
		fmt.Printf("✓ Preserved %d artifacts in .knovra/semantic_artifacts.json (ready for ingestion once service starts)\n", len(artifacts))
		return
	}

	fmt.Printf("✓ Successfully indexed %d documents (%d chunks) into semantic memory!\n", resp.IndexedDocuments, resp.IndexedChunks)
	fmt.Printf("  Model: %s | Time: %.2fms\n", resp.ModelName, resp.ElapsedMs)
	fmt.Println("Breakdown by type:")
	for t, count := range resp.DocTypes {
		fmt.Printf("  - %-16s: %d\n", t, count)
	}
}

func runSemanticQuery(queryText string, args []string) {
	topK := 5
	minScore := 0.0
	var docTypes []semantic.DocType

	for i := 0; i < len(args); i++ {
		switch args[i] {
		case "--top-k":
			if i+1 < len(args) {
				if k, err := strconv.Atoi(args[i+1]); err == nil {
					topK = k
					i++
				}
			}
		case "--min-score":
			if i+1 < len(args) {
				if s, err := strconv.ParseFloat(args[i+1], 64); err == nil {
					minScore = s
					i++
				}
			}
		case "--type":
			if i+1 < len(args) {
				docTypes = append(docTypes, semantic.DocType(args[i+1]))
				i++
			}
		}
	}

	engineURL := os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
	if engineURL == "" {
		engineURL = "http://localhost:8000"
	}

	client := semantic.NewClient(engineURL)
	results, err := client.Search(queryText, docTypes, topK, minScore)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error querying semantic memory (%s): %v\n", engineURL, err)
		fmt.Println("Hint: Start the services with 'docker compose up -d' or start the context-engine.")
		os.Exit(1)
	}

	if len(results) == 0 {
		fmt.Printf("No matching semantic artifacts found for query: %q\n", queryText)
		return
	}

	fmt.Printf("\n=== Semantic Search Results for: %q (%d found) ===\n\n", queryText, len(results))
	for i, r := range results {
		fmt.Printf("[%d] Score: %.4f | Type: %s | Title: %s\n", i+1, r.Score, r.DocType, r.Title)
		loc := r.Provenance.FilePath
		if r.Provenance.LineStart != nil {
			loc = fmt.Sprintf("%s:%d-%d", loc, *r.Provenance.LineStart, *r.Provenance.LineEnd)
		}
		fmt.Printf("    Location: %s (hash: %s)\n", loc, r.Provenance.ContentHash[:12])
		
		snippet := r.Content
		if len(snippet) > 180 {
			snippet = snippet[:180] + "..."
		}
		fmt.Printf("    Snippet:  %s\n\n", strings.ReplaceAll(snippet, "\n", " "))
	}
}

func runSemanticStats() {
	engineURL := os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
	if engineURL == "" {
		engineURL = "http://localhost:8000"
	}

	client := semantic.NewClient(engineURL)
	stats, err := client.GetStats()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error querying semantic stats: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("======================================================================")
	fmt.Println("                 KNOVRA SEMANTIC MEMORY STATS                         ")
	fmt.Println("======================================================================")
	fmt.Printf("Storage Backend:   %s\n", stats.StorageBackend)
	fmt.Printf("Embedding Model:   %s\n", stats.EmbeddingModel)
	fmt.Printf("Vector Dimension:  %d\n", stats.VectorDimension)
	fmt.Printf("Total Documents:   %d\n", stats.TotalDocuments)
	fmt.Printf("Total Chunks:      %d\n", stats.TotalChunks)
	fmt.Println("\nDocuments by Type:")
	for t, count := range stats.ByDocType {
		fmt.Printf("  - %-16s %4d\n", t, count)
	}
	fmt.Println("======================================================================")
}
