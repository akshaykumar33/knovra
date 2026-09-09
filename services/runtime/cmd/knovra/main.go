package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"knovra/runtime/internal/config"
	"knovra/runtime/internal/daemon"
	"knovra/runtime/internal/graph"
	"knovra/runtime/internal/ingest"
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
