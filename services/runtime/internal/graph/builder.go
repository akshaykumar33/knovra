package graph

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"knovra/runtime/internal/ingest"
)

// CodeIndexFile matches the structure in .knovra/code_index.json
type CodeIndexFile struct {
	RootPath        string `json:"root_path"`
	TotalSymbols    int    `json:"total_symbols"`
	IndexedAt       int64  `json:"indexed_at"`
	Files           []struct {
		FilePath    string `json:"file_path"`
		Language    string `json:"language"`
		ContentHash string `json:"content_hash"`
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
		Exports []struct {
			Symbol string `json:"symbol"`
			Line   int    `json:"line"`
		} `json:"exports"`
	} `json:"files"`
	DependencyEdges []struct {
		From string `json:"from"`
		To   string `json:"to"`
		Type string `json:"type"`
	} `json:"dependency_edges"`
}

// BuildGraphBundle converts project metadata and code index into a GraphBundle
func BuildGraphBundle(rootDir string) (*GraphBundle, error) {
	// 1. Load project.json
	meta, err := ingest.LoadProjectMetadata(rootDir)
	if err != nil {
		return nil, fmt.Errorf("failed to load project metadata: %w", err)
	}

	// 2. Load code_index.json
	codeIndexPath := filepath.Join(rootDir, ".knovra", "code_index.json")
	var codeIndex CodeIndexFile
	if data, err := os.ReadFile(codeIndexPath); err == nil {
		_ = json.Unmarshal(data, &codeIndex)
	}

	now := time.Now().UTC()
	provBase := Provenance{
		Source:           "knovra-context-graph",
		SourceID:         meta.ID,
		CreatedAt:        now,
		UpdatedAt:        now,
		Confidence:       1.0,
		ExtractorVersion: "0.1.0",
		ProjectID:        meta.ID,
	}

	var nodes []GraphNode
	var rels []GraphRelationship

	// --- 1. Project Node ---
	nodes = append(nodes, GraphNode{
		ID:    meta.ID,
		Label: "Project",
		Properties: map[string]interface{}{
			"id":         meta.ID,
			"name":       meta.Name,
			"root_path":  meta.RootPath,
			"is_monorepo": meta.IsMonorepo,
			"total_files": meta.TotalFiles,
			"total_bytes": meta.TotalBytes,
		},
		Provenance: provBase,
	})

	// --- 2. Repository Node ---
	repoID := fmt.Sprintf("repo_%s", meta.ID)
	repoProps := map[string]interface{}{
		"id":         repoID,
		"project_id": meta.ID,
	}
	if meta.Git != nil && meta.Git.IsGitRepo {
		repoProps["branch"] = meta.Git.Branch
		repoProps["commit_hash"] = meta.Git.CommitHash
		repoProps["remote_url"] = meta.Git.RemoteURL
	}
	nodes = append(nodes, GraphNode{
		ID:         repoID,
		Label:      "Repository",
		Properties: repoProps,
		Provenance: provBase,
	})

	rels = append(rels, GraphRelationship{
		Type:       "HAS_REPOSITORY",
		FromNodeID: meta.ID,
		FromLabel:  "Project",
		ToNodeID:   repoID,
		ToLabel:    "Repository",
		Properties: map[string]interface{}{},
		Provenance: provBase,
	})

	// --- 3. Package Nodes (Workspaces) ---
	for _, ws := range meta.Workspaces {
		pkgID := fmt.Sprintf("pkg_%s_%s", meta.ID, ws.Name)
		nodes = append(nodes, GraphNode{
			ID:    pkgID,
			Label: "Package",
			Properties: map[string]interface{}{
				"id":         pkgID,
				"name":       ws.Name,
				"path":       ws.Path,
				"type":       ws.Type,
				"project_id": meta.ID,
			},
			Provenance: provBase,
		})

		rels = append(rels, GraphRelationship{
			Type:       "CONTAINS",
			FromNodeID: meta.ID,
			FromLabel:  "Project",
			ToNodeID:   pkgID,
			ToLabel:    "Package",
			Properties: map[string]interface{}{},
			Provenance: provBase,
		})
	}

	// --- 4. File & Symbol Nodes ---
	for _, file := range codeIndex.Files {
		fileID := fmt.Sprintf("file_%s_%s", meta.ID, file.FilePath)
		fileProv := provBase
		fileProv.SourceID = file.FilePath

		nodes = append(nodes, GraphNode{
			ID:    fileID,
			Label: "File",
			Properties: map[string]interface{}{
				"id":           fileID,
				"path":         file.FilePath,
				"language":     file.Language,
				"content_hash": file.ContentHash,
				"project_id":   meta.ID,
			},
			Provenance: fileProv,
		})

		rels = append(rels, GraphRelationship{
			Type:       "CONTAINS",
			FromNodeID: repoID,
			FromLabel:  "Repository",
			ToNodeID:   fileID,
			ToLabel:    "File",
			Properties: map[string]interface{}{},
			Provenance: fileProv,
		})

		// Symbols declared in this file
		for _, sym := range file.Symbols {
			symProv := fileProv
			symProv.SourceID = fmt.Sprintf("%s:%d", file.FilePath, sym.LineStart)

			nodes = append(nodes, GraphNode{
				ID:    sym.ID,
				Label: "Symbol",
				Properties: map[string]interface{}{
					"id":         sym.ID,
					"name":       sym.Name,
					"kind":       sym.Kind,
					"line_start": sym.LineStart,
					"line_end":   sym.LineEnd,
					"signature":  sym.Signature,
					"file_path":  file.FilePath,
					"project_id": meta.ID,
				},
				Provenance: symProv,
			})

			rels = append(rels, GraphRelationship{
				Type:       "DECLARES",
				FromNodeID: fileID,
				FromLabel:  "File",
				ToNodeID:   sym.ID,
				ToLabel:    "Symbol",
				Properties: map[string]interface{}{
					"line": sym.LineStart,
				},
				Provenance: symProv,
			})
		}
	}

	// --- 5. Dependency Edges (Imports & Calls) ---
	for _, edge := range codeIndex.DependencyEdges {
		fromID := fmt.Sprintf("file_%s_%s", meta.ID, edge.From)
		toID := fmt.Sprintf("file_%s_%s", meta.ID, edge.To)

		rels = append(rels, GraphRelationship{
			Type:       edge.Type,
			FromNodeID: fromID,
			FromLabel:  "File",
			ToNodeID:   toID,
			ToLabel:    "File",
			Properties: map[string]interface{}{
				"target": edge.To,
			},
			Provenance: provBase,
		})
	}

	return &GraphBundle{
		ProjectID:     meta.ID,
		Nodes:         nodes,
		Relationships: rels,
		GeneratedAt:   now,
	}, nil
}
