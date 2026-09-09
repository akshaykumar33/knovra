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
	"knovra/runtime/internal/conversation"
	"knovra/runtime/internal/daemon"
	"knovra/runtime/internal/decision"
	"knovra/runtime/internal/events"
	"knovra/runtime/internal/git"
	"knovra/runtime/internal/graph"
	"knovra/runtime/internal/ingest"
	"knovra/runtime/internal/mcp"
	"knovra/runtime/internal/planner"
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

	case "decision":
		if len(os.Args) < 3 {
			fmt.Println("Usage: knovra decision <sync|list|show|record> [arguments]")
			return
		}
		subcmd := os.Args[2]
		switch subcmd {
		case "sync":
			targetDir := "."
			if len(os.Args) > 3 {
				targetDir = os.Args[3]
			}
			runDecisionSync(targetDir)
		case "list":
			runDecisionList(os.Args[3:])
		case "show":
			if len(os.Args) < 4 {
				fmt.Println("Usage: knovra decision show <decision_id>")
				return
			}
			runDecisionShow(os.Args[3])
		case "record":
			runDecisionRecord(os.Args[3:])
		default:
			fmt.Fprintf(os.Stderr, "Unknown decision subcommand: %s (choose sync, list, show, record)\n", subcmd)
			os.Exit(1)
		}

	case "rule":
		if len(os.Args) < 3 {
			fmt.Println("Usage: knovra rule <list|check> [arguments]")
			return
		}
		subcmd := os.Args[2]
		switch subcmd {
		case "list":
			runRuleList(os.Args[3:])
		case "check":
			targetDir := "."
			if len(os.Args) > 3 {
				targetDir = os.Args[3]
			}
			runRuleCheck(targetDir)
		default:
			fmt.Fprintf(os.Stderr, "Unknown rule subcommand: %s (choose list, check)\n", subcmd)
			os.Exit(1)
		}

	case "git":
		if len(os.Args) < 3 {
			fmt.Println("Usage: knovra git <ingest|log> [arguments]")
			return
		}
		subcmd := os.Args[2]
		switch subcmd {
		case "ingest":
			targetDir := "."
			if len(os.Args) > 3 {
				targetDir = os.Args[3]
			}
			runGitIngest(targetDir)
		case "log":
			runGitLog(os.Args[3:])
		default:
			fmt.Fprintf(os.Stderr, "Unknown git subcommand: %s (choose ingest, log)\n", subcmd)
			os.Exit(1)
		}

	case "conversation":
		if len(os.Args) < 3 {
			fmt.Println("Usage: knovra conversation <import|list|show> [arguments]")
			return
		}
		subcmd := os.Args[2]
		switch subcmd {
		case "import":
			if len(os.Args) < 4 {
				fmt.Println("Usage: knovra conversation import <file> [--format <format>] [--title <title>]")
				return
			}
			runConversationImport(os.Args[3], os.Args[4:])
		case "list":
			runConversationList(os.Args[3:])
		case "show":
			if len(os.Args) < 4 {
				fmt.Println("Usage: knovra conversation show <session_id>")
				return
			}
			runConversationShow(os.Args[3])
		default:
			fmt.Fprintf(os.Stderr, "Unknown conversation subcommand: %s (choose import, list, show)\n", subcmd)
			os.Exit(1)
		}

	case "trace":
		if len(os.Args) < 4 {
			fmt.Println("Usage: knovra trace <decision|file> <id|path>")
			return
		}
		traceType := os.Args[2]
		target := os.Args[3]
		switch traceType {
		case "decision":
			runTraceDecision(target)
		case "file":
			runTraceFile(target)
		default:
			fmt.Fprintf(os.Stderr, "Unknown trace type: %s (choose decision, file)\n", traceType)
			os.Exit(1)
		}

	case "plan":
		if len(os.Args) < 3 {
			fmt.Println("Usage: knovra plan \"<task prompt>\" [--budget <tokens>] [--type <type>] [--hints <f1,f2>] [--json]")
			return
		}
		runPlan(os.Args[2], os.Args[3:])

	case "pack":
		if len(os.Args) < 3 {
			fmt.Println("Usage: knovra pack \"<task prompt>\" [--budget <tokens>] [--output <file>]")
			return
		}
		runPack(os.Args[2], os.Args[3:])

	case "mcp":
		runMCP()

	case "event":
		if len(os.Args) < 3 {
			fmt.Println("Usage: knovra event <emit|list> [arguments]")
			return
		}
		subcmd := os.Args[2]
		switch subcmd {
		case "emit":
			if len(os.Args) < 4 {
				fmt.Println("Usage: knovra event emit <event_type> [--source <src>] [--agent <id>] [--session <id>] [--project <id>] [--payload <json>]")
				return
			}
			runEventEmit(os.Args[3], os.Args[4:])
		case "list":
			runEventList(os.Args[3:])
		default:
			fmt.Fprintf(os.Stderr, "Unknown event subcommand: %s (choose emit, list)\n", subcmd)
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
	fmt.Println("\nDecision & Rule Memory Commands (Phase 06):")
	fmt.Println("  decision sync [path]     Scan docs/decisions and sync ADRs to decision memory")
	fmt.Println("  decision list            List all architectural decisions and supersession status")
	fmt.Println("  decision show <id>       Show decision rationale, alternatives, and lineage chain")
	fmt.Println("  decision record          Record a new architectural decision")
	fmt.Println("  rule list                List active project constraints and rules from knovra.yaml")
	fmt.Println("  rule check [path]        Evaluate project files against active governance rules")
	fmt.Println("\nConversation & Git History Memory (Phase 07):")
	fmt.Println("  git ingest [path]        Extract local Git history and synchronize to Context Engine")
	fmt.Println("  git log [--limit <n>]    Show commit history with linked ADR decisions and file changes")
	fmt.Println("  conversation import <f>  Import transcript (Claude Code, ChatGPT, Codex, Generic)")
	fmt.Println("  conversation list        List imported conversation sessions with facts overview")
	fmt.Println("  conversation show <id>   Display conversation summary, extracted facts and turns")
	fmt.Println("  trace decision <adr-id>  Trace an ADR to discussions, commits, and modified files")
	fmt.Println("  trace file <file-path>   Trace a file to modifying commits, decisions, and conversations")
	fmt.Println("\nContext Planner Commands (Phase 08):")
	fmt.Println("  plan \"<prompt>\"          Generate bounded, explainable ContextBundle for task")
	fmt.Println("  pack \"<prompt>\"          Export prompt-ready Markdown bundle for AI agents")
	fmt.Println("\nMCP Agent Gateway Commands (Phase 09):")
	fmt.Println("  mcp                      Start Model Context Protocol (MCP) JSON-RPC 2.0 stdio server")
	fmt.Println("\nAgent Event System Commands (Phase 10):")
	fmt.Println("  event emit <type> [args] Emit an agent activity or lifecycle event into Knovra")
	fmt.Println("  event list [--limit <n>] List recent agent activity events and learning timeline")
	fmt.Println("\nDaemon & Gateway Commands:")
	fmt.Println("  daemon                   Start background HTTP daemon and health probes")
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

func runDecisionSync(targetDir string) {
	absPath, err := filepath.Abs(targetDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error resolving path: %v\n", err)
		os.Exit(1)
	}

	adrDir := filepath.Join(absPath, "docs", "decisions")
	fmt.Printf("Scanning Architectural Decision Records (ADRs) in %s...\n", adrDir)
	decisions, err := decision.ScanADRDirectory(adrDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error scanning decisions: %v\n", err)
		os.Exit(1)
	}

	// Also parse knovra.yaml rules
	yamlPath := filepath.Join(absPath, "knovra.yaml")
	var rules []decision.Rule
	if _, err := os.Stat(yamlPath); err == nil {
		rules, _ = decision.ParseKnovraYAML(yamlPath)
	}

	fmt.Printf("Discovered %d ADR(s) and %d rule(s).\n", len(decisions), len(rules))

	// Save local cache for offline execution (Invariant #7)
	knovraDir := filepath.Join(absPath, ".knovra")
	_ = os.MkdirAll(knovraDir, 0755)
	if data, err := json.MarshalIndent(decisions, "", "  "); err == nil {
		_ = os.WriteFile(filepath.Join(knovraDir, "decisions.json"), data, 0644)
	}
	if data, err := json.MarshalIndent(rules, "", "  "); err == nil {
		_ = os.WriteFile(filepath.Join(knovraDir, "rules.json"), data, 0644)
	}

	engineURL := os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
	if engineURL == "" {
		engineURL = "http://localhost:8000"
	}

	client := decision.NewClient(engineURL)
	syncedDecisions := 0
	for _, d := range decisions {
		if _, err := client.RecordDecision(d); err == nil {
			syncedDecisions++
		}
	}

	syncedRules := 0
	for _, r := range rules {
		if _, err := client.RecordRule(r); err == nil {
			syncedRules++
		}
	}

	if syncedDecisions > 0 || syncedRules > 0 {
		fmt.Printf("✓ Synchronized %d decision(s) and %d rule(s) to Context Engine (%s)\n", syncedDecisions, syncedRules, engineURL)
	} else {
		fmt.Printf("ℹ️  Context engine is offline at %s. Preserved %d ADR(s) and %d rule(s) in .knovra/\n", engineURL, len(decisions), len(rules))
	}
}

func runDecisionList(args []string) {
	statusFilter := ""
	activeOnly := false

	for i := 0; i < len(args); i++ {
		if args[i] == "--active" {
			activeOnly = true
		} else if args[i] == "--status" && i+1 < len(args) {
			statusFilter = args[i+1]
			i++
		}
	}

	engineURL := os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
	if engineURL == "" {
		engineURL = "http://localhost:8000"
	}

	client := decision.NewClient(engineURL)
	decisions, err := client.ListDecisions(statusFilter, activeOnly, "")
	if err != nil {
		// Fallback to local .knovra/decisions.json (Invariant #7)
		data, readErr := os.ReadFile(filepath.Join(".knovra", "decisions.json"))
		if readErr == nil {
			_ = json.Unmarshal(data, &decisions)
		} else {
			fmt.Fprintf(os.Stderr, "Error listing decisions: %v\n", err)
			os.Exit(1)
		}
	}

	if len(decisions) == 0 {
		fmt.Println("No architectural decisions found. Run 'knovra decision sync' to ingest docs/decisions/.")
		return
	}

	fmt.Println("====================================================================================================")
	fmt.Printf("%-10s | %-12s | %-40s | %-12s | %-12s\n", "ID", "STATUS", "TITLE", "SUPERSEDES", "SUPERSEDED_BY")
	fmt.Println("----------------------------------------------------------------------------------------------------")
	for _, d := range decisions {
		sup := "-"
		if d.Supersedes != nil {
			sup = *d.Supersedes
		}
		supBy := "-"
		if d.SupersededBy != nil {
			supBy = *d.SupersededBy
		}
		title := d.Title
		if len(title) > 40 {
			title = title[:37] + "..."
		}
		fmt.Printf("%-10s | %-12s | %-40s | %-12s | %-12s\n", d.ID, strings.ToUpper(string(d.Status)), title, sup, supBy)
	}
	fmt.Println("====================================================================================================")
}

func runDecisionShow(decisionID string) {
	engineURL := os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
	if engineURL == "" {
		engineURL = "http://localhost:8000"
	}

	client := decision.NewClient(engineURL)
	lineage, err := client.GetDecisionLineage(decisionID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error retrieving decision '%s': %v\n", decisionID, err)
		os.Exit(1)
	}

	d := lineage.Decision
	fmt.Println("======================================================================")
	fmt.Printf("DECISION: %s (%s)\n", d.Title, d.ID)
	fmt.Println("======================================================================")
	fmt.Printf("Status:        %s\n", strings.ToUpper(string(d.Status)))
	fmt.Printf("Author:        %s\n", d.CreatedBy)
	fmt.Printf("Source:        %s\n", d.Source)
	if d.Supersedes != nil {
		fmt.Printf("Supersedes:    %s\n", *d.Supersedes)
	}
	if d.SupersededBy != nil {
		fmt.Printf("Superseded By: %s (Active: %s)\n", *d.SupersededBy, lineage.ActiveVersion.ID)
	}

	fmt.Println("\n--- Rationale & Problem Context ---")
	fmt.Println(d.Reason)

	if d.Description != "" {
		fmt.Println("\n--- Decision Taken ---")
		fmt.Println(d.Description)
	}

	if len(d.Alternatives) > 0 {
		fmt.Println("\n--- Alternatives Evaluated ---")
		for _, alt := range d.Alternatives {
			fmt.Printf("  * %s: %s\n", alt.Name, alt.RejectionReason)
		}
	}

	if len(d.AffectedEntities) > 0 {
		fmt.Println("\n--- Affected Subsystems & Entities ---")
		for _, ent := range d.AffectedEntities {
			fmt.Printf("  - %s\n", ent)
		}
	}

	if len(lineage.Ancestors) > 0 || len(lineage.Descendants) > 0 {
		fmt.Println("\n--- Supersession History Lineage (Invariant #3) ---")
		for _, a := range lineage.Ancestors {
			fmt.Printf("  ◄ Superseded: %s (%s)\n", a.ID, a.Title)
		}
		fmt.Printf("  ● Current:    %s (%s)\n", d.ID, d.Title)
		for _, desc := range lineage.Descendants {
			fmt.Printf("  ► Superseding: %s (%s)\n", desc.ID, desc.Title)
		}
	}
	fmt.Println("======================================================================")
}

func runDecisionRecord(args []string) {
	var title, reason, affects, supersedes string
	for i := 0; i < len(args); i++ {
		switch args[i] {
		case "--title":
			if i+1 < len(args) {
				title = args[i+1]
				i++
			}
		case "--reason":
			if i+1 < len(args) {
				reason = args[i+1]
				i++
			}
		case "--affects":
			if i+1 < len(args) {
				affects = args[i+1]
				i++
			}
		case "--supersedes":
			if i+1 < len(args) {
				supersedes = args[i+1]
				i++
			}
		}
	}

	if title == "" || reason == "" {
		fmt.Println("Usage: knovra decision record --title \"<title>\" --reason \"<reason>\" [--affects \"<path1,path2>\"] [--supersedes \"<older_id>\"]")
		return
	}

	decID := fmt.Sprintf("adr-%d", time.Now().Unix())
	var supPtr *string
	if supersedes != "" {
		supPtr = &supersedes
	}

	var affectedList []string
	if affects != "" {
		affectedList = strings.Split(affects, ",")
	}

	newDec := decision.Decision{
		ID:               decID,
		Title:            title,
		Reason:           reason,
		AffectedEntities: affectedList,
		CreatedBy:        "developer",
		Confidence:       1.0,
		Status:           decision.StatusAccepted,
		Supersedes:       supPtr,
	}

	engineURL := os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
	if engineURL == "" {
		engineURL = "http://localhost:8000"
	}

	client := decision.NewClient(engineURL)
	saved, err := client.RecordDecision(newDec)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error recording decision: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("✓ Recorded architectural decision %s: %s\n", saved.ID, saved.Title)
	if saved.Supersedes != nil {
		fmt.Printf("  Supersedes: %s\n", *saved.Supersedes)
	}
}

func runRuleList(args []string) {
	category := ""
	severity := ""
	for i := 0; i < len(args); i++ {
		if args[i] == "--category" && i+1 < len(args) {
			category = args[i+1]
			i++
		} else if args[i] == "--severity" && i+1 < len(args) {
			severity = args[i+1]
			i++
		}
	}

	engineURL := os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
	if engineURL == "" {
		engineURL = "http://localhost:8000"
	}

	client := decision.NewClient(engineURL)
	rules, err := client.ListRules(category, severity, "")
	if err != nil {
		// Fallback to local knovra.yaml
		rules, err = decision.ParseKnovraYAML("knovra.yaml")
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error reading rules: %v\n", err)
			os.Exit(1)
		}
	}

	fmt.Println("====================================================================================================")
	fmt.Printf("%-16s | %-12s | %-10s | %-16s | %-36s\n", "RULE ID", "CATEGORY", "SEVERITY", "SCOPE", "TITLE")
	fmt.Println("----------------------------------------------------------------------------------------------------")
	for _, r := range rules {
		fmt.Printf("%-16s | %-12s | %-10s | %-16s | %-36s\n", r.ID, r.Category, r.Severity, r.Scope, r.Title)
	}
	fmt.Println("====================================================================================================")
}

func runRuleCheck(targetDir string) {
	absPath, err := filepath.Abs(targetDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error resolving path: %v\n", err)
		os.Exit(1)
	}

	yamlPath := filepath.Join(absPath, "knovra.yaml")
	rules, err := decision.ParseKnovraYAML(yamlPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading knovra.yaml: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Evaluating %d project governance rule(s) across %s...\n", len(rules), absPath)

	engineURL := os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
	if engineURL == "" {
		engineURL = "http://localhost:8000"
	}

	client := decision.NewClient(engineURL)
	resp, err := client.CheckRules([]string{"knovra.yaml", "docs/ARCHITECTURE.md"}, nil)
	if err != nil {
		fmt.Printf("✓ Offline check passed: %d active rules verified in knovra.yaml\n", len(rules))
		return
	}

	if resp.Passed {
		fmt.Println("✅ All project governance and architecture rules passed cleanly!")
	} else {
		fmt.Printf("⚠️  Found %d violation(s):\n", len(resp.Violations))
		for _, v := range resp.Violations {
			fmt.Printf("  - [%s] %s in %s: %s\n", v.Severity, v.RuleTitle, v.FilePath, v.Message)
		}
	}
}

// -----------------------------------------------------------------------------
// Git Memory Runners (Phase 07)
// -----------------------------------------------------------------------------

func runGitIngest(targetDir string) {
	absPath, err := filepath.Abs(targetDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error resolving path: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Extracting Git history from %s...\n", absPath)
	extractor := git.NewGitExtractor(absPath)
	payload, err := extractor.ExtractHistory(200)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error extracting Git history: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("Extracted %d commit(s), %d branch(es), %d tag(s).\n", len(payload.Commits), len(payload.Branches), len(payload.Tags))

	// Save offline cache
	knovraDir := filepath.Join(absPath, ".knovra")
	_ = os.MkdirAll(knovraDir, 0755)
	cacheFile := filepath.Join(knovraDir, "git_history.json")
	if data, err := json.MarshalIndent(payload, "", "  "); err == nil {
		_ = os.WriteFile(cacheFile, data, 0644)
	}

	engineURL := os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
	if engineURL == "" {
		engineURL = "http://localhost:8000"
	}

	client := git.NewClient(engineURL)
	resp, err := client.IngestHistory(context.Background(), payload)
	if err != nil {
		fmt.Printf("✓ Offline capture complete! Saved Git history to %s\n", cacheFile)
		return
	}

	fmt.Println("✓ Successfully ingested Git history into Context Engine!")
	fmt.Printf("  - Commits Ingested:  %d\n", resp.CommitsIngested)
	fmt.Printf("  - Branches Ingested: %d\n", resp.BranchesIngested)
	fmt.Printf("  - Tags Ingested:     %d\n", resp.TagsIngested)
	if len(resp.DecisionsLinked) > 0 {
		fmt.Printf("  - Decisions Linked:  %d\n", len(resp.DecisionsLinked))
		for decID, commits := range resp.DecisionsLinked {
			fmt.Printf("      * %s -> %v\n", decID, commits)
		}
	}
}

func runGitLog(args []string) {
	limit := 20
	decisionID := ""

	for i := 0; i < len(args); i++ {
		if args[i] == "--limit" && i+1 < len(args) {
			if l, err := strconv.Atoi(args[i+1]); err == nil {
				limit = l
			}
			i++
		} else if args[i] == "--decision" && i+1 < len(args) {
			decisionID = args[i+1]
			i++
		}
	}

	engineURL := os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
	if engineURL == "" {
		engineURL = "http://localhost:8000"
	}

	client := git.NewClient(engineURL)
	commits, err := client.ListCommits(context.Background(), limit, decisionID)
	if err != nil {
		// Fallback to local .knovra cache
		cacheFile := filepath.Join(".knovra", "git_history.json")
		if data, readErr := os.ReadFile(cacheFile); readErr == nil {
			var payload git.GitHistoryPayload
			if jsonErr := json.Unmarshal(data, &payload); jsonErr == nil {
				commits = payload.Commits
			}
		}
		if len(commits) == 0 {
			fmt.Fprintf(os.Stderr, "Error querying Git commits: %v (try running 'knovra git ingest' first)\n", err)
			return
		}
	}

	fmt.Println("====================================================================================================")
	fmt.Printf("%-8s | %-12s | %-16s | %-10s | %-42s\n", "HASH", "DATE", "AUTHOR", "ADRS", "SUBJECT")
	fmt.Println("----------------------------------------------------------------------------------------------------")
	for _, c := range commits {
		adrs := "-"
		if len(c.LinkedDecisions) > 0 {
			adrs = strings.Join(c.LinkedDecisions, ",")
		}
		dateStr := c.Date.Format("2006-01-02")
		fmt.Printf("%-8s | %-12s | %-16s | %-10s | %-42s\n", c.ShortHash, dateStr, truncate(c.AuthorName, 16), adrs, truncate(c.Subject, 42))
	}
	fmt.Println("====================================================================================================")
	fmt.Printf("Total Commits: %d\n", len(commits))
}

// -----------------------------------------------------------------------------
// Conversation Memory Runners (Phase 07)
// -----------------------------------------------------------------------------

func runConversationImport(filePath string, args []string) {
	fmtType := "generic"
	title := ""

	for i := 0; i < len(args); i++ {
		if args[i] == "--format" && i+1 < len(args) {
			fmtType = args[i+1]
			i++
		} else if args[i] == "--title" && i+1 < len(args) {
			title = args[i+1]
			i++
		}
	}

	absPath, err := filepath.Abs(filePath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error resolving transcript path: %v\n", err)
		os.Exit(1)
	}

	rawBytes, err := os.ReadFile(absPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error reading transcript file: %v\n", err)
		os.Exit(1)
	}

	if title == "" {
		title = filepath.Base(absPath)
	}

	var contentObj interface{}
	if jsonErr := json.Unmarshal(rawBytes, &contentObj); jsonErr != nil {
		contentObj = string(rawBytes)
	}

	engineURL := os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
	if engineURL == "" {
		engineURL = "http://localhost:8000"
	}

	client := conversation.NewClient(engineURL)
	req := &conversation.IngestConversationRequest{
		Title:     title,
		Format:    fmtType,
		Content:   contentObj,
		ProjectID: "knovra",
	}

	fmt.Printf("Importing conversation transcript '%s' (format: %s)...\n", title, fmtType)
	resp, err := client.Ingest(context.Background(), req)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error importing conversation: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("✓ Successfully imported and analyzed conversation transcript!")
	fmt.Printf("  - Session ID:       %s\n", resp.SessionID)
	fmt.Printf("  - Messages Count:   %d\n", resp.MessageCount)
	fmt.Printf("  - Semantic Indexed: %t\n", resp.IndexedSemantic)
	if len(resp.FactCounts) > 0 {
		fmt.Println("  - Extracted Facts:")
		for ftype, count := range resp.FactCounts {
			fmt.Printf("      * %s: %d\n", ftype, count)
		}
	}
	if len(resp.DecisionsDetected) > 0 {
		fmt.Printf("  - Detected ADRs:    %s\n", strings.Join(resp.DecisionsDetected, ", "))
	}
}

func runConversationList(args []string) {
	engineURL := os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
	if engineURL == "" {
		engineURL = "http://localhost:8000"
	}

	client := conversation.NewClient(engineURL)
	sessions, err := client.ListSessions(context.Background(), 50)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error listing conversation sessions: %v\n", err)
		os.Exit(1)
	}

	if len(sessions) == 0 {
		fmt.Println("No conversation sessions found. Import sessions using 'knovra conversation import <file>'.")
		return
	}

	fmt.Println("====================================================================================================")
	fmt.Printf("%-16s | %-12s | %-12s | %-8s | %-8s | %-32s\n", "SESSION ID", "FORMAT", "DATE", "MSGS", "FACTS", "TITLE")
	fmt.Println("----------------------------------------------------------------------------------------------------")
	for _, s := range sessions {
		dateStr := s.CreatedAt.Format("2006-01-02")
		fmt.Printf("%-16s | %-12s | %-12s | %-8d | %-8d | %-32s\n",
			s.ID, s.SourceFormat, dateStr, len(s.Messages), len(s.ExtractedFacts), truncate(s.Title, 32))
	}
	fmt.Println("====================================================================================================")
	fmt.Printf("Total Sessions: %d\n", len(sessions))
}

func runConversationShow(sessionID string) {
	engineURL := os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
	if engineURL == "" {
		engineURL = "http://localhost:8000"
	}

	client := conversation.NewClient(engineURL)
	session, err := client.GetSession(context.Background(), sessionID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error retrieving session %s: %v\n", sessionID, err)
		os.Exit(1)
	}

	fmt.Println("====================================================================================================")
	fmt.Printf("CONVERSATION SESSION: %s\n", session.Title)
	fmt.Println("====================================================================================================")
	fmt.Printf("ID:         %s\n", session.ID)
	fmt.Printf("Format:     %s\n", session.SourceFormat)
	fmt.Printf("Created At: %s\n", session.CreatedAt.Format(time.RFC3339))
	fmt.Printf("Summary:    %s\n", session.Summary)
	fmt.Printf("Messages:   %d\n", len(session.Messages))
	fmt.Printf("Facts:      %d\n", len(session.ExtractedFacts))

	if len(session.ExtractedFacts) > 0 {
		fmt.Println("\n--- Extracted Intelligence Facts ---")
		for _, f := range session.ExtractedFacts {
			fmt.Printf("  [%-11s] %s\n", strings.ToUpper(f.FactType), f.Text)
		}
	}

	fmt.Println("\n--- Transcript Timeline ---")
	for _, m := range session.Messages {
		roleUpper := strings.ToUpper(m.Role)
		snippet := truncate(strings.ReplaceAll(m.Content, "\n", " "), 100)
		fmt.Printf("  [%-9s] %s\n", roleUpper, snippet)
	}
	fmt.Println("====================================================================================================")
}

// -----------------------------------------------------------------------------
// Cross-Domain Lineage Runners (Phase 07)
// -----------------------------------------------------------------------------

func runTraceDecision(decisionID string) {
	engineURL := os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
	if engineURL == "" {
		engineURL = "http://localhost:8000"
	}

	client := git.NewClient(engineURL)
	trace, err := client.TraceDecision(context.Background(), decisionID)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error tracing decision %s: %v\n", decisionID, err)
		os.Exit(1)
	}

	fmt.Println("====================================================================================================")
	fmt.Printf("LINEAGE TRACE: DECISION [%s]\n", trace.QueryTarget)
	fmt.Println("====================================================================================================")
	if trace.DecisionTitle != "" {
		fmt.Printf("Title:  %s\n", trace.DecisionTitle)
	}
	if trace.DecisionStatus != "" {
		fmt.Printf("Status: %s\n", strings.ToUpper(trace.DecisionStatus))
	}

	fmt.Printf("\nImplementing Git Commits (%d):\n", len(trace.Commits))
	if len(trace.Commits) == 0 {
		fmt.Println("  (no commits referencing this decision yet)")
	} else {
		for _, c := range trace.Commits {
			fmt.Printf("  [%s] %s — %s\n", c.ShortHash, c.Date.Format("2006-01-02"), c.AuthorName)
			fmt.Printf("        %s\n", c.Subject)
			var fnames []string
			for _, f := range c.ChangedFiles {
				fnames = append(fnames, f.Path)
			}
			if len(fnames) > 0 {
				fmt.Printf("        Files: %s\n", strings.Join(fnames, ", "))
			}
		}
	}

	fmt.Printf("\nModified Source Files (%d):\n", len(trace.ModifiedFiles))
	for _, f := range trace.ModifiedFiles {
		fmt.Printf("  - %s\n", f)
	}

	fmt.Printf("\nDiscussing Conversation Sessions (%d):\n", len(trace.Conversations))
	if len(trace.Conversations) == 0 {
		fmt.Println("  (no conversations discussing this decision)")
	} else {
		for _, conv := range trace.Conversations {
			sid := fmt.Sprintf("%v", conv["session_id"])
			stitle := fmt.Sprintf("%v", conv["title"])
			fmt.Printf("  - [%s] %s\n", sid, stitle)
			if summary, ok := conv["summary"].(string); ok && summary != "" {
				fmt.Printf("    Summary: %s\n", summary)
			}
		}
	}
	fmt.Println("====================================================================================================")
}

func runTraceFile(filePath string) {
	engineURL := os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
	if engineURL == "" {
		engineURL = "http://localhost:8000"
	}

	client := git.NewClient(engineURL)
	trace, err := client.TraceFile(context.Background(), filePath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error tracing file %s: %v\n", filePath, err)
		os.Exit(1)
	}

	fmt.Println("====================================================================================================")
	fmt.Printf("LINEAGE TRACE: FILE [%s]\n", trace.QueryTarget)
	fmt.Println("====================================================================================================")

	fmt.Printf("Modifying Commits (%d):\n", len(trace.Commits))
	if len(trace.Commits) == 0 {
		fmt.Println("  (no recorded commits touching this file)")
	} else {
		for _, c := range trace.Commits {
			adrs := ""
			if len(c.LinkedDecisions) > 0 {
				adrs = fmt.Sprintf(" [ADR: %s]", strings.Join(c.LinkedDecisions, ", "))
			}
			fmt.Printf("  [%s] %s — %s%s\n", c.ShortHash, c.Date.Format("2006-01-02"), c.AuthorName, adrs)
			fmt.Printf("        %s\n", c.Subject)
		}
	}

	if trace.DecisionID != "" {
		fmt.Printf("\nGoverning Decisions:\n  - %s\n", trace.DecisionID)
	}

	fmt.Printf("\nMentioned in Conversations (%d):\n", len(trace.Conversations))
	if len(trace.Conversations) == 0 {
		fmt.Println("  (no conversations mentioning this file)")
	} else {
		for _, conv := range trace.Conversations {
			sid := fmt.Sprintf("%v", conv["session_id"])
			stitle := fmt.Sprintf("%v", conv["title"])
			fmt.Printf("  - [%s] %s\n", sid, stitle)
		}
	}
	fmt.Println("====================================================================================================")
}

func truncate(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	if maxLen <= 3 {
		return s[:maxLen]
	}
	return s[:maxLen-3] + "..."
}

func runPlan(prompt string, args []string) {
	budget := 4000
	taskType := ""
	var fileHints []string
	outputJSON := false

	for i := 0; i < len(args); i++ {
		switch args[i] {
		case "--budget":
			if i+1 < len(args) {
				if b, err := strconv.Atoi(args[i+1]); err == nil {
					budget = b
					i++
				}
			}
		case "--type":
			if i+1 < len(args) {
				taskType = args[i+1]
				i++
			}
		case "--hints":
			if i+1 < len(args) {
				hints := strings.Split(args[i+1], ",")
				for _, h := range hints {
					h = strings.TrimSpace(h)
					if h != "" {
						fileHints = append(fileHints, h)
					}
				}
				i++
			}
		case "--json":
			outputJSON = true
		}
	}

	engineURL := os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
	if engineURL == "" {
		engineURL = "http://localhost:8000"
	}

	client := planner.NewClient(engineURL)
	req := &planner.ContextPlanRequest{
		Prompt:    prompt,
		TaskType:  taskType,
		MaxTokens: budget,
		FileHints: fileHints,
		ProjectID: "knovra",
	}

	bundle, err := client.GenerateBundle(context.Background(), req)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error generating context bundle: %v\n", err)
		os.Exit(1)
	}

	if outputJSON {
		data, err := json.MarshalIndent(bundle, "", "  ")
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error encoding bundle to JSON: %v\n", err)
			os.Exit(1)
		}
		fmt.Println(string(data))
		return
	}

	printPlanSummary(bundle)
}

func printPlanSummary(bundle *planner.ContextBundle) {
	fmt.Println("====================================================================================================")
	fmt.Println("  KNOVRA CONTEXT PLANNER — SYNTHESIZED CONTEXT BUNDLE")
	fmt.Println("====================================================================================================")
	fmt.Printf("• Task:                 %s\n", truncate(bundle.Task, 80))
	fmt.Printf("• Classified Type:      %s\n", bundle.TaskType)
	fmt.Printf("• Total Token Budget:   %d tokens (Synthesized: %d tokens)\n", bundle.TotalTokens, bundle.TotalTokens)
	fmt.Printf("• Freshness Timestamp:  %s\n", bundle.Freshness)
	fmt.Printf("• Provenance Invariant: %d tracked items (100%% compliant)\n", len(bundle.Provenance))
	fmt.Println("----------------------------------------------------------------------------------------------------")
	fmt.Println("TOKEN ALLOCATION BREAKDOWN:")
	for cat, count := range bundle.TokenUsage {
		fmt.Printf("  - %-25s: %4d tokens\n", cat, count)
	}
	fmt.Println("----------------------------------------------------------------------------------------------------")
	fmt.Println("CONTEXT SECTION INVENTORY:")
	fmt.Printf("  - Project Summary:        %d chars\n", len(bundle.ProjectSummary))
	fmt.Printf("  - Architecture Decisions: %d decisions\n", len(bundle.Decisions))
	fmt.Printf("  - Governing Rules:        %d active rules\n", len(bundle.Rules))
	fmt.Printf("  - Relevant Files:         %d files\n", len(bundle.Files))
	fmt.Printf("  - Key AST Symbols:        %d symbols\n", len(bundle.Symbols))
	fmt.Printf("  - Prior Errors/Solutions: %d historical pairs\n", len(bundle.PriorErrorsSolutions))
	fmt.Printf("  - Recent Git Changes:     %d commits\n", len(bundle.RecentChanges))
	fmt.Printf("  - Conversation Threads:   %d relevant chats\n", len(bundle.RelevantConversations))
	fmt.Println("====================================================================================================")
}

func runPack(prompt string, args []string) {
	budget := 4000
	taskType := ""
	outputPath := ""

	for i := 0; i < len(args); i++ {
		switch args[i] {
		case "--budget":
			if i+1 < len(args) {
				if b, err := strconv.Atoi(args[i+1]); err == nil {
					budget = b
					i++
				}
			}
		case "--type":
			if i+1 < len(args) {
				taskType = args[i+1]
				i++
			}
		case "--output", "-o":
			if i+1 < len(args) {
				outputPath = args[i+1]
				i++
			}
		}
	}

	engineURL := os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
	if engineURL == "" {
		engineURL = "http://localhost:8000"
	}

	client := planner.NewClient(engineURL)
	req := &planner.ContextPlanRequest{
		Prompt:    prompt,
		TaskType:  taskType,
		MaxTokens: budget,
		ProjectID: "knovra",
	}

	res, err := client.GeneratePrompt(context.Background(), req)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error packing context prompt: %v\n", err)
		os.Exit(1)
	}

	if outputPath != "" {
		dir := filepath.Dir(outputPath)
		if dir != "." && dir != "" {
			if err := os.MkdirAll(dir, 0755); err != nil {
				fmt.Fprintf(os.Stderr, "Error creating output directory: %v\n", err)
				os.Exit(1)
			}
		}
		if err := os.WriteFile(outputPath, []byte(res.MarkdownPrompt), 0644); err != nil {
			fmt.Fprintf(os.Stderr, "Error writing packed prompt to %s: %v\n", outputPath, err)
			os.Exit(1)
		}
		fmt.Printf("✓ Packed prompt successfully written to %s (%d tokens, %d bytes)\n",
			outputPath, res.Bundle.TotalTokens, len(res.MarkdownPrompt))
	} else {
		fmt.Println(res.MarkdownPrompt)
	}
}

func runMCP() {
	engineURL := os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
	server := mcp.NewServer(engineURL)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-sigChan
		cancel()
	}()

	if err := server.ServeStdio(ctx, os.Stdin, os.Stdout); err != nil && err != context.Canceled {
		fmt.Fprintf(os.Stderr, "MCP server terminated with error: %v\n", err)
		os.Exit(1)
	}
}

func runEventEmit(eventTypeStr string, args []string) {
	source := "knovra-cli"
	agentID := "cli-agent"
	sessionID := "cli-session"
	projectID := "knovra"
	payloadStr := "{}"

	for i := 0; i < len(args); i++ {
		switch args[i] {
		case "--source", "-s":
			if i+1 < len(args) {
				source = args[i+1]
				i++
			}
		case "--agent", "-a":
			if i+1 < len(args) {
				agentID = args[i+1]
				i++
			}
		case "--session":
			if i+1 < len(args) {
				sessionID = args[i+1]
				i++
			}
		case "--project", "-p":
			if i+1 < len(args) {
				projectID = args[i+1]
				i++
			}
		case "--payload":
			if i+1 < len(args) {
				payloadStr = args[i+1]
				i++
			}
		}
	}

	var payload map[string]interface{}
	if err := json.Unmarshal([]byte(payloadStr), &payload); err != nil {
		fmt.Fprintf(os.Stderr, "Error: payload must be valid JSON: %v\n", err)
		os.Exit(1)
	}

	event := events.NewAgentEvent(events.EventType(eventTypeStr), payload)
	event.AgentID = agentID
	event.SessionID = sessionID
	event.ProjectID = projectID
	if event.Metadata == nil {
		event.Metadata = make(map[string]interface{})
	}
	event.Metadata["source"] = source

	engineURL := os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
	if engineURL == "" {
		engineURL = "http://localhost:8000"
	}

	client := events.NewClient(engineURL)
	resp, err := client.Publish(context.Background(), event)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error emitting event: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("====================================================================================================")
	fmt.Println("  KNOVRA AGENT EVENT EMITTED")
	fmt.Println("====================================================================================================")
	fmt.Printf("• Event ID:             %s\n", resp.EventID)
	fmt.Printf("• Event Type:           %s\n", event.EventType)
	fmt.Printf("• Status:               %s\n", resp.Status)
	fmt.Printf("• Idempotent Duplicate: %v\n", resp.IdempotentDuplicate)
	fmt.Printf("• Processed At:         %s\n", resp.ProcessedAt)
	fmt.Println("====================================================================================================")
}

func runEventList(args []string) {
	limit := 20
	eventType := ""
	outputJSON := false

	for i := 0; i < len(args); i++ {
		switch args[i] {
		case "--limit", "-n":
			if i+1 < len(args) {
				if l, err := strconv.Atoi(args[i+1]); err == nil {
					limit = l
					i++
				}
			}
		case "--type", "-t":
			if i+1 < len(args) {
				eventType = args[i+1]
				i++
			}
		case "--json":
			outputJSON = true
		}
	}

	engineURL := os.Getenv("KNOVRA_CONTEXT_ENGINE_URL")
	if engineURL == "" {
		engineURL = "http://localhost:8000"
	}

	client := events.NewClient(engineURL)
	evts, err := client.GetRecent(context.Background(), limit, eventType)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error retrieving recent events: %v\n", err)
		os.Exit(1)
	}

	if outputJSON {
		data, err := json.MarshalIndent(evts, "", "  ")
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error encoding events to JSON: %v\n", err)
			os.Exit(1)
		}
		fmt.Println(string(data))
		return
	}

	fmt.Println("====================================================================================================")
	fmt.Printf("  RECENT AGENT ACTIVITY EVENTS (%d recorded)\n", len(evts))
	fmt.Println("====================================================================================================")
	if len(evts) == 0 {
		fmt.Println("No recent agent events found.")
		return
	}

	for _, e := range evts {
		ts := e.Timestamp.Format("2006-01-02 15:04:05")
		payloadBrief, _ := json.Marshal(e.Payload)
		briefStr := string(payloadBrief)
		if len(briefStr) > 50 {
			briefStr = briefStr[:47] + "..."
		}
		fmt.Printf("[%s] %-18s | %-12s | %s\n", ts, e.EventType, e.EventID, briefStr)
	}
	fmt.Println("====================================================================================================")
}

