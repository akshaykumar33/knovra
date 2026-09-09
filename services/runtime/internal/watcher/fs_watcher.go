package watcher

import (
	"context"
	"os"
	"path/filepath"
	"time"
)

// DefaultIgnoredDirs specifies directories to ignore during filesystem scanning.
var DefaultIgnoredDirs = map[string]bool{
	".git":          true,
	".knovra":       true,
	"node_modules":  true,
	"target":        true,
	".venv":         true,
	"venv":          true,
	"__pycache__":   true,
	".pytest_cache": true,
	".ruff_cache":   true,
	"dist":          true,
	"build":         true,
	".codegraph":    true,
}

// FSWatcher performs differential filesystem scanning with content hashing.
type FSWatcher struct {
	RootDir     string
	Cache       *HashCache
	IgnoredDirs map[string]bool
}

// NewFSWatcher instantiates a filesystem watcher for the specified root directory.
func NewFSWatcher(rootDir string, cache *HashCache) *FSWatcher {
	if cache == nil {
		cache = NewHashCache()
	}
	return &FSWatcher{
		RootDir:     rootDir,
		Cache:       cache,
		IgnoredDirs: DefaultIgnoredDirs,
	}
}

// ScanChanges walks the root directory, comparing current file hashes against the cache.
func (w *FSWatcher) ScanChanges() ([]FileChangeEvent, error) {
	var events []FileChangeEvent
	currentSeen := make(map[string]bool)

	err := filepath.Walk(w.RootDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}

		// Skip ignored directories
		if info.IsDir() {
			base := info.Name()
			if w.IgnoredDirs[base] {
				return filepath.SkipDir
			}
			return nil
		}

		// Only inspect regular files
		if !info.Mode().IsRegular() {
			return nil
		}

		relPath, err := filepath.Rel(w.RootDir, path)
		if err != nil {
			return nil
		}
		relNorm := filepath.ToSlash(relPath)
		currentSeen[relNorm] = true

		_, hadPrevious := w.Cache.Get(relNorm)
		changed, newHash, err := w.Cache.CheckAndUpdate(relNorm, path)
		if err != nil {
			return nil
		}

		if changed {
			changeType := ChangeModified
			if !hadPrevious {
				changeType = ChangeCreated
			}
			events = append(events, FileChangeEvent{
				Path:        relNorm,
				ChangeType:  changeType,
				ContentHash: newHash,
				Timestamp:   time.Now().UTC(),
			})
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Check for deleted files
	for relPath := range w.Cache.All() {
		if !currentSeen[relPath] {
			w.Cache.Delete(relPath)
			events = append(events, FileChangeEvent{
				Path:        relPath,
				ChangeType:  ChangeDeleted,
				Timestamp:   time.Now().UTC(),
			})
		}
	}

	return events, nil
}

// Watch runs a continuous polling loop with debounce and triggers the callback on changes.
func (w *FSWatcher) Watch(ctx context.Context, interval, debounce time.Duration, callback func([]FileChangeEvent)) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	var pendingEvents []FileChangeEvent
	var lastChange time.Time

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			evts, err := w.ScanChanges()
			if err == nil && len(evts) > 0 {
				pendingEvents = append(pendingEvents, evts...)
				lastChange = time.Now()
			}

			if len(pendingEvents) > 0 && time.Since(lastChange) >= debounce {
				callback(pendingEvents)
				pendingEvents = nil
			}
		}
	}
}
