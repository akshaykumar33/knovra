package ingest

import (
	"bufio"
	"os"
	"path/filepath"
	"strings"
)

var defaultIgnoredDirs = map[string]bool{
	".git":         true,
	"node_modules": true,
	"dist":         true,
	"build":        true,
	"target":       true,
	"out":          true,
	".next":        true,
	"vendor":       true,
	"__pycache__":  true,
	".venv":        true,
	"venv":         true,
	"bin":          true,
	".turbo":       true,
	".cache":       true,
	".idea":        true,
	".vscode":      true,
	".pytest_cache": true,
	"coverage":     true,
	".knovra":      true,
}

var defaultIgnoredExtensions = map[string]bool{
	".exe":   true,
	".dll":   true,
	".so":    true,
	".dylib": true,
	".bin":   true,
	".o":     true,
	".a":     true,
	".zip":   true,
	".tar":   true,
	".gz":    true,
	".tgz":   true,
	".7z":    true,
	".png":   true,
	".jpg":   true,
	".jpeg":  true,
	".gif":   true,
	".ico":   true,
	".webp":  true,
	".mp4":   true,
	".mp3":   true,
	".wav":   true,
	".pdf":   true,
	".pyc":   true,
	".pyo":   true,
	".swp":   true,
	".swo":   true,
	".rdb":   true,
}

// IgnoreFilter handles exclusion logic
type IgnoreFilter struct {
	ignoredDirs  map[string]bool
	ignoredExts  map[string]bool
	customRules  []string
}

// NewIgnoreFilter creates a filter with default exclusions and optional custom patterns
func NewIgnoreFilter(rootDir string) *IgnoreFilter {
	filter := &IgnoreFilter{
		ignoredDirs: make(map[string]bool),
		ignoredExts: make(map[string]bool),
		customRules: make([]string, 0),
	}

	for k, v := range defaultIgnoredDirs {
		filter.ignoredDirs[k] = v
	}
	for k, v := range defaultIgnoredExtensions {
		filter.ignoredExts[k] = v
	}

	// Load .knovraignore if present
	ignorePath := filepath.Join(rootDir, ".knovraignore")
	if file, err := os.Open(ignorePath); err == nil {
		defer file.Close()
		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			if line != "" && !strings.HasPrefix(line, "#") {
				filter.customRules = append(filter.customRules, line)
			}
		}
	}

	return filter
}

// ShouldIgnoreDir returns true if a directory should not be traversed
func (f *IgnoreFilter) ShouldIgnoreDir(name string) bool {
	cleanName := strings.Trim(name, "/\\")
	base := filepath.Base(cleanName)
	return f.ignoredDirs[base]
}

// ShouldIgnoreFile returns true if a file should not be ingested
func (f *IgnoreFilter) ShouldIgnoreFile(name string) bool {
	ext := strings.ToLower(filepath.Ext(name))
	if f.ignoredExts[ext] {
		return true
	}
	base := filepath.Base(name)
	for _, rule := range f.customRules {
		matched, _ := filepath.Match(rule, base)
		if matched {
			return true
		}
	}
	return false
}
