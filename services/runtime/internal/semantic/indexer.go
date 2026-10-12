package semantic

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"knovra/runtime/internal/graph"
	"knovra/runtime/internal/ingest"
)

// ProjectIndexer scans the repository and assembles DocumentInput items
type ProjectIndexer struct {
	rootDir string
}

// NewProjectIndexer initializes an indexer for a given root directory
func NewProjectIndexer(rootDir string) *ProjectIndexer {
	return &ProjectIndexer{rootDir: rootDir}
}

// CollectArtifacts collects documentation, code symbol summaries, and module overviews
func (pi *ProjectIndexer) CollectArtifacts() ([]DocumentInput, error) {
	var documents []DocumentInput

	// 1. Collect Documentation (.md, .txt, docs)
	docFiles, err := pi.collectDocFiles()
	if err == nil {
		documents = append(documents, docFiles...)
	}

	// 2. Collect Code Summaries from .knovra/code_index.json
	codeSummaries, err := pi.collectCodeSummaries()
	if err == nil {
		documents = append(documents, codeSummaries...)
	}

	return documents, nil
}

func (pi *ProjectIndexer) collectDocFiles() ([]DocumentInput, error) {
	var docs []DocumentInput
	filter := ingest.NewIgnoreFilter(pi.rootDir)

	err := filepath.Walk(pi.rootDir, func(path string, info os.FileInfo, walkErr error) error {
		if walkErr != nil {
			return nil
		}

		if info.IsDir() {
			if filter.ShouldIgnoreDir(path) {
				return filepath.SkipDir
			}
			return nil
		}

		if filter.ShouldIgnoreFile(path) {
			return nil
		}


		ext := strings.ToLower(filepath.Ext(path))
		if ext != ".md" && ext != ".txt" && ext != ".rst" {
			return nil
		}

		relPath, _ := filepath.Rel(pi.rootDir, path)
		contentBytes, err := os.ReadFile(path)
		if err != nil {
			return nil
		}

		content := string(contentBytes)
		if strings.TrimSpace(content) == "" {
			return nil
		}

		h := sha256.Sum256(contentBytes)
		hashStr := hex.EncodeToString(h[:])

		docID := fmt.Sprintf("doc:%s", strings.ReplaceAll(relPath, string(filepath.Separator), "/"))
		title := filepath.Base(path)
		firstLine := strings.SplitN(content, "\n", 2)[0]
		if strings.HasPrefix(firstLine, "# ") {
			title = strings.TrimPrefix(firstLine, "# ")
		}

		docType := DocTypeDocument
		if strings.Contains(strings.ToLower(relPath), "decision") || strings.Contains(strings.ToLower(relPath), "adr") {
			docType = DocTypeDecision
		} else if strings.Contains(strings.ToLower(relPath), "req") || strings.Contains(strings.ToLower(relPath), "spec") {
			docType = DocTypeRequirement
		}

		byteStart := 0
		byteEnd := len(contentBytes)
		lineStart := 1
		lineEnd := len(strings.Split(content, "\n"))

		docs = append(docs, DocumentInput{
			DocumentID:   docID,
			ProjectID:    filepath.Base(pi.rootDir),
			RepositoryID: filepath.Base(pi.rootDir),
			DocType:      docType,
			Title:        title,
			Content:      content,
			Provenance: Provenance{
				FilePath:    relPath,
				ByteStart:   &byteStart,
				ByteEnd:     &byteEnd,
				LineStart:   &lineStart,
				LineEnd:     &lineEnd,
				ContentHash: hashStr,
				RepoName:    filepath.Base(pi.rootDir),
			},
			Metadata: map[string]interface{}{
				"file_name": filepath.Base(path),
				"extension": ext,
			},
		})

		return nil
	})

	return docs, err
}

func (pi *ProjectIndexer) collectCodeSummaries() ([]DocumentInput, error) {
	codeIndexPath := filepath.Join(pi.rootDir, ".knovra", "code_index.json")
	data, err := os.ReadFile(codeIndexPath)
	if err != nil {
		return nil, err
	}

	var index graph.CodeIndexFile
	if err := json.Unmarshal(data, &index); err != nil {
		return nil, err
	}

	var docs []DocumentInput
	repoName := filepath.Base(pi.rootDir)

	for _, file := range index.Files {
		// Module summary
		moduleID := fmt.Sprintf("mod:%s", file.FilePath)
		moduleContent := fmt.Sprintf(
			"Module '%s' (%s) contains %d symbols, %d imports, %d exports.",
			file.FilePath, file.Language, len(file.Symbols), len(file.Imports), len(file.Exports),
		)

		docs = append(docs, DocumentInput{
			DocumentID:   moduleID,
			ProjectID:    repoName,
			RepositoryID: repoName,
			DocType:      DocTypeModuleSummary,
			Title:        fmt.Sprintf("Module: %s", file.FilePath),
			Content:      moduleContent,
			Provenance: Provenance{
				FilePath:    file.FilePath,
				ContentHash: file.ContentHash,
				RepoName:    repoName,
			},
			Metadata: map[string]interface{}{
				"language": file.Language,
			},
		})

		// Symbol summaries
		for _, sym := range file.Symbols {
			symID := fmt.Sprintf("sym:%s", sym.ID)
			sig := sym.Signature
			if sig == "" {
				sig = fmt.Sprintf("%s %s", sym.Kind, sym.Name)
			}
			symContent := fmt.Sprintf(
				"%s '%s' declared in %s on lines %d-%d.\nSignature: %s",
				strings.Title(sym.Kind), sym.Name, file.FilePath, sym.LineStart, sym.LineEnd, sig,
			)

			lStart := sym.LineStart
			lEnd := sym.LineEnd

			docs = append(docs, DocumentInput{
				DocumentID:   symID,
				ProjectID:    repoName,
				RepositoryID: repoName,
				DocType:      DocTypeCodeSummary,
				Title:        fmt.Sprintf("%s %s", strings.Title(sym.Kind), sym.Name),
				Content:      symContent,
				Provenance: Provenance{
					FilePath:    file.FilePath,
					LineStart:   &lStart,
					LineEnd:     &lEnd,
					ContentHash: file.ContentHash,
					RepoName:    repoName,
				},
				Metadata: map[string]interface{}{
					"kind":      sym.Kind,
					"name":      sym.Name,
					"signature": sym.Signature,
					"language":  file.Language,
				},
			})
		}
	}

	return docs, nil
}
