package ingest

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const (
	KnovraDir      = ".knovra"
	ProjectJSON    = "project.json"
	DefaultYAML    = "knovra.yaml"
)

// SaveProjectMetadata persists the scanned metadata to .knovra/project.json
func SaveProjectMetadata(rootDir string, meta *ProjectMetadata) error {
	dir := filepath.Join(rootDir, KnovraDir)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create %s directory: %w", KnovraDir, err)
	}

	target := filepath.Join(dir, ProjectJSON)
	data, err := json.MarshalIndent(meta, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to serialize project metadata: %w", err)
	}

	if err := os.WriteFile(target, data, 0644); err != nil {
		return fmt.Errorf("failed to write %s: %w", target, err)
	}

	return nil
}

// LoadProjectMetadata loads the saved metadata from .knovra/project.json
func LoadProjectMetadata(rootDir string) (*ProjectMetadata, error) {
	target := filepath.Join(rootDir, KnovraDir, ProjectJSON)
	data, err := os.ReadFile(target)
	if err != nil {
		return nil, fmt.Errorf("could not read %s: %w", target, err)
	}

	var meta ProjectMetadata
	if err := json.Unmarshal(data, &meta); err != nil {
		return nil, fmt.Errorf("failed to parse %s: %w", target, err)
	}

	return &meta, nil
}

// InitProject initializes .knovra directory and knovra.yaml
func InitProject(rootDir string, projectName string) (*ProjectMetadata, error) {
	absRoot, err := filepath.Abs(rootDir)
	if err != nil {
		return nil, err
	}

	if projectName == "" {
		projectName = filepath.Base(absRoot)
	}

	// Create knovra.yaml if not present
	yamlPath := filepath.Join(absRoot, DefaultYAML)
	if _, err := os.Stat(yamlPath); os.IsNotExist(err) {
		starterYAML := fmt.Sprintf(`project:
  name: %s
  mode: local

indexing:
  exclude:
    - node_modules/**
    - dist/**
    - build/**
    - target/**
    - .next/**
  languages:
    - typescript
    - javascript
    - python
    - go
    - rust

context:
  max_token_budget: 12000
  include_recent_changes: true
  include_decisions: true
  include_rules: true
`, projectName)
		_ = os.WriteFile(yamlPath, []byte(starterYAML), 0644)
	}

	// Run initial scan
	meta, err := ScanProject(absRoot)
	if err != nil {
		return nil, err
	}
	meta.Name = projectName

	if err := SaveProjectMetadata(absRoot, meta); err != nil {
		return nil, err
	}

	return meta, nil
}

// FormatInspectReport produces a clean, structured CLI overview of the project
func FormatInspectReport(meta *ProjectMetadata) string {
	var sb strings.Builder

	sb.WriteString("======================================================================\n")
	sb.WriteString(fmt.Sprintf("  KNOVRA PROJECT INTELLIGENCE REPORT: %s\n", strings.ToUpper(meta.Name)))
	sb.WriteString("======================================================================\n\n")

	sb.WriteString(fmt.Sprintf("• Project ID:       %s\n", meta.ID))
	sb.WriteString(fmt.Sprintf("• Root Directory:   %s\n", meta.RootPath))
	sb.WriteString(fmt.Sprintf("• Scanned At:       %s\n", meta.ScannedAt.Format("2006-01-02 15:04:05 UTC")))
	sb.WriteString(fmt.Sprintf("• Total Files:      %d (approx. %.2f MB)\n", meta.TotalFiles, float64(meta.TotalBytes)/(1024*1024)))
	sb.WriteString(fmt.Sprintf("• Monorepo:         %t\n", meta.IsMonorepo))

	if meta.Git != nil && meta.Git.IsGitRepo {
		sb.WriteString(fmt.Sprintf("• Git Branch:       %s\n", meta.Git.Branch))
		if meta.Git.CommitHash != "" {
			sb.WriteString(fmt.Sprintf("• Commit HEAD:      %s\n", meta.Git.CommitHash))
		}
		if meta.Git.RemoteURL != "" {
			sb.WriteString(fmt.Sprintf("• Git Remote:       %s\n", meta.Git.RemoteURL))
		}
	} else {
		sb.WriteString("• Git Repository:   Not detected (standalone folder)\n")
	}

	sb.WriteString("\n----------------------------------------------------------------------\n")
	sb.WriteString("  PROGRAMMING LANGUAGES\n")
	sb.WriteString("----------------------------------------------------------------------\n")
	if len(meta.Languages) == 0 {
		sb.WriteString("  (No recognized source code files)\n")
	} else {
		for _, l := range meta.Languages {
			sb.WriteString(fmt.Sprintf("  - %-16s %4d files  (%5.1f%% of codebase)\n", l.Name, l.FileCount, l.Percentage))
		}
	}

	sb.WriteString("\n----------------------------------------------------------------------\n")
	sb.WriteString("  FRAMEWORKS & RUNTIMES\n")
	sb.WriteString("----------------------------------------------------------------------\n")
	if len(meta.Frameworks) == 0 {
		sb.WriteString("  (No specific frameworks detected)\n")
	} else {
		for _, f := range meta.Frameworks {
			sb.WriteString(fmt.Sprintf("  - %-16s [%-8s]  via %s\n", f.Name, f.Category, f.Manifest))
		}
	}

	sb.WriteString("\n----------------------------------------------------------------------\n")
	sb.WriteString("  PACKAGE MANAGERS & WORKSPACES\n")
	sb.WriteString("----------------------------------------------------------------------\n")
	if len(meta.PackageManagers) > 0 {
		var pms []string
		for _, pm := range meta.PackageManagers {
			pms = append(pms, pm.Name)
		}
		sb.WriteString(fmt.Sprintf("  • Package Managers: %s\n", strings.Join(pms, ", ")))
	}
	if len(meta.Workspaces) > 0 {
		sb.WriteString(fmt.Sprintf("  • Discovered Packages (%d):\n", len(meta.Workspaces)))
		for _, ws := range meta.Workspaces {
			sb.WriteString(fmt.Sprintf("    - %-24s (%s) at %s\n", ws.Name, ws.Type, ws.Path))
		}
	}

	sb.WriteString("\n----------------------------------------------------------------------\n")
	sb.WriteString("  INFRASTRUCTURE & ENVIRONMENT SIGNALS\n")
	sb.WriteString("----------------------------------------------------------------------\n")
	sb.WriteString(fmt.Sprintf("  • Docker / Containers: %t (%d files detected)\n", meta.Signals.HasDocker, len(meta.Signals.DockerFiles)))
	sb.WriteString(fmt.Sprintf("  • CI / CD Pipelines:   %t (%d workflows detected)\n", meta.Signals.HasCI, len(meta.Signals.CIFiles)))
	sb.WriteString(fmt.Sprintf("  • Cloud / IaC:         %t (%d IaC definitions detected)\n", meta.Signals.HasIaC, len(meta.Signals.IaCFiles)))
	sb.WriteString(fmt.Sprintf("  • Config Files:        %d detected\n", len(meta.Signals.ConfigFiles)))

	sb.WriteString("\n======================================================================\n")
	return sb.String()
}
