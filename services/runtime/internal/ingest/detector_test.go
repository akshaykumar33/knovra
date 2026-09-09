package ingest

import (
	"os"
	"path/filepath"
	"testing"
)

func TestIgnoreFilter(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "knovra-test-ignore-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	filter := NewIgnoreFilter(tmpDir)

	// Test ignored dirs
	if !filter.ShouldIgnoreDir("node_modules") {
		t.Errorf("expected node_modules to be ignored")
	}
	if !filter.ShouldIgnoreDir("dist") {
		t.Errorf("expected dist to be ignored")
	}
	if !filter.ShouldIgnoreDir(".git") {
		t.Errorf("expected .git to be ignored")
	}
	if filter.ShouldIgnoreDir("src") {
		t.Errorf("expected src NOT to be ignored")
	}

	// Test ignored files
	if !filter.ShouldIgnoreFile("app.exe") {
		t.Errorf("expected app.exe to be ignored")
	}
	if !filter.ShouldIgnoreFile("image.png") {
		t.Errorf("expected image.png to be ignored")
	}
	if filter.ShouldIgnoreFile("index.ts") {
		t.Errorf("expected index.ts NOT to be ignored")
	}
	if filter.ShouldIgnoreFile("main.go") {
		t.Errorf("expected main.go NOT to be ignored")
	}
}

func TestLanguageDetection(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "knovra-test-lang-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	// Create test files
	_ = os.WriteFile(filepath.Join(tmpDir, "index.ts"), []byte("console.log('hi');"), 0644)
	_ = os.WriteFile(filepath.Join(tmpDir, "main.go"), []byte("package main\n"), 0644)
	_ = os.WriteFile(filepath.Join(tmpDir, "app.py"), []byte("print('hello')\n"), 0644)
	_ = os.WriteFile(filepath.Join(tmpDir, "lib.rs"), []byte("pub fn test() {}\n"), 0644)

	filter := NewIgnoreFilter(tmpDir)
	stats, totalFiles, _ := DetectLanguages(tmpDir, filter)

	if totalFiles != 4 {
		t.Errorf("expected 4 files, got %d", totalFiles)
	}

	langMap := make(map[string]bool)
	for _, s := range stats {
		langMap[s.Name] = true
	}

	for _, expected := range []string{"TypeScript", "Go", "Python", "Rust"} {
		if !langMap[expected] {
			t.Errorf("expected language %s to be detected", expected)
		}
	}
}

func TestSaveAndLoadMetadata(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "knovra-test-store-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	meta, err := ScanProject(tmpDir)
	if err != nil {
		t.Fatalf("failed to scan temp project: %v", err)
	}

	if err := SaveProjectMetadata(tmpDir, meta); err != nil {
		t.Fatalf("failed to save metadata: %v", err)
	}

	loaded, err := LoadProjectMetadata(tmpDir)
	if err != nil {
		t.Fatalf("failed to load metadata: %v", err)
	}

	if loaded.ID != meta.ID {
		t.Errorf("expected ID %s, got %s", meta.ID, loaded.ID)
	}
}
