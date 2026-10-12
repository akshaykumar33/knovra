package watcher

import (
	"os"
	"path/filepath"
	"testing"
)

func TestFreshnessLifecycle(t *testing.T) {
	f := NewFreshness()
	if f.Stale {
		t.Fatalf("expected active freshness, got stale")
	}
	if f.ValidTo != nil {
		t.Fatalf("expected ValidTo to be nil for active record")
	}

	f.Invalidate("superseded-v2")
	if !f.Stale {
		t.Fatalf("expected record to be stale after Invalidate")
	}
	if f.ValidTo == nil {
		t.Fatalf("expected ValidTo to be populated after Invalidate")
	}
	if f.SupersededBy != "superseded-v2" {
		t.Fatalf("expected superseded_by to be 'superseded-v2', got %s", f.SupersededBy)
	}
}

func TestHashCacheOperations(t *testing.T) {
	cache := NewHashCache()

	tmpDir, err := os.MkdirTemp("", "knovra_hash_test_*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tmpDir)

	testFile := filepath.Join(tmpDir, "test.txt")
	if err := os.WriteFile(testFile, []byte("hello world"), 0644); err != nil {
		t.Fatal(err)
	}

	changed, hash1, err := cache.CheckAndUpdate("test.txt", testFile)
	if err != nil {
		t.Fatal(err)
	}
	if !changed {
		t.Fatalf("expected initial check to report changed=true")
	}
	if hash1 == "" {
		t.Fatalf("expected non-empty hash")
	}

	// Second check without modification should report changed=false
	changed, hash2, err := cache.CheckAndUpdate("test.txt", testFile)
	if err != nil {
		t.Fatal(err)
	}
	if changed {
		t.Fatalf("expected second check to report changed=false")
	}
	if hash1 != hash2 {
		t.Fatalf("hashes should match")
	}

	// Modify file
	if err := os.WriteFile(testFile, []byte("hello world modified"), 0644); err != nil {
		t.Fatal(err)
	}
	changed, hash3, err := cache.CheckAndUpdate("test.txt", testFile)
	if err != nil {
		t.Fatal(err)
	}
	if !changed {
		t.Fatalf("expected modification to report changed=true")
	}
	if hash3 == hash1 {
		t.Fatalf("expected new hash after modification")
	}

	// Test persistence
	jsonPath := filepath.Join(tmpDir, "cache.json")
	if err := cache.SaveToFile(jsonPath); err != nil {
		t.Fatal(err)
	}

	cache2 := NewHashCache()
	if err := cache2.LoadFromFile(jsonPath); err != nil {
		t.Fatal(err)
	}
	loadedHash, ok := cache2.Get("test.txt")
	if !ok || loadedHash != hash3 {
		t.Fatalf("cache restore failed: got %s, expected %s", loadedHash, hash3)
	}
}

func TestFSWatcherDifferentialScan(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "knovra_fswatch_test_*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tmpDir)

	file1 := filepath.Join(tmpDir, "a.go")
	file2 := filepath.Join(tmpDir, "b.py")
	_ = os.WriteFile(file1, []byte("package main"), 0644)
	_ = os.WriteFile(file2, []byte("def hello(): pass"), 0644)

	cache := NewHashCache()
	watcher := NewFSWatcher(tmpDir, cache)

	// Initial scan: all files should be created
	evts1, err := watcher.ScanChanges()
	if err != nil {
		t.Fatal(err)
	}
	if len(evts1) != 2 {
		t.Fatalf("expected 2 created events, got %d", len(evts1))
	}
	for _, e := range evts1 {
		if e.ChangeType != ChangeCreated {
			t.Fatalf("expected ChangeCreated, got %v", e.ChangeType)
		}
	}

	// Modify a.go
	_ = os.WriteFile(file1, []byte("package main // modified"), 0644)

	evts2, err := watcher.ScanChanges()
	if err != nil {
		t.Fatal(err)
	}
	if len(evts2) != 1 {
		t.Fatalf("expected 1 modified event, got %d", len(evts2))
	}
	if evts2[0].Path != "a.go" || evts2[0].ChangeType != ChangeModified {
		t.Fatalf("unexpected event: %+v", evts2[0])
	}

	// Delete b.py
	_ = os.Remove(file2)

	evts3, err := watcher.ScanChanges()
	if err != nil {
		t.Fatal(err)
	}
	if len(evts3) != 1 {
		t.Fatalf("expected 1 deleted event, got %d", len(evts3))
	}
	if evts3[0].Path != "b.py" || evts3[0].ChangeType != ChangeDeleted {
		t.Fatalf("unexpected event: %+v", evts3[0])
	}
}

func TestDependencyInvalidation(t *testing.T) {
	// A -> B -> C (A imports B, B imports C)
	links := []DependencyLink{
		{FromFile: "services/api/handler.go", ToFile: "services/core/auth.go", Type: "IMPORTS"},
		{FromFile: "services/core/auth.go", ToFile: "services/db/users.go", Type: "IMPORTS"},
		{FromFile: "services/worker/task.go", ToFile: "services/db/users.go", Type: "IMPORTS"},
	}

	inv := NewInvalidator(links)

	// Changing users.go should invalidate auth.go, handler.go, and task.go
	invalidated := inv.Invalidate([]string{"services/db/users.go"})
	if len(invalidated) != 3 {
		t.Fatalf("expected 3 invalidated files, got %d: %v", len(invalidated), invalidated)
	}

	invSet := make(map[string]bool)
	for _, f := range invalidated {
		invSet[f] = true
	}

	if !invSet["services/core/auth.go"] || !invSet["services/api/handler.go"] || !invSet["services/worker/task.go"] {
		t.Fatalf("transitive invalidation failed: %v", invalidated)
	}

	// ComputeDelta test
	events := []FileChangeEvent{
		{Path: "services/db/users.go", ChangeType: ChangeModified},
	}
	delta := ComputeDelta(events, links)
	if len(delta.ModifiedFiles) != 1 || delta.ModifiedFiles[0] != "services/db/users.go" {
		t.Fatalf("unexpected modified files: %v", delta.ModifiedFiles)
	}
	if len(delta.InvalidatedDependencies) != 3 {
		t.Fatalf("expected 3 invalidated dependencies in delta, got %d", len(delta.InvalidatedDependencies))
	}
}
