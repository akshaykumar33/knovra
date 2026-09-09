package watcher

import (
	"strings"
	"time"
)

// DependencyLink represents a directed dependency from a source file to a target file or module.
type DependencyLink struct {
	FromFile string `json:"from_file"`
	ToFile   string `json:"to_file"`
	Type     string `json:"type"` // "IMPORTS", "CALLS"
}

// Invalidator calculates transitive dependencies impacted by changed files.
type Invalidator struct {
	reverseDeps map[string][]string
}

// NewInvalidator builds an invalidator index from dependency links.
func NewInvalidator(links []DependencyLink) *Invalidator {
	reverse := make(map[string][]string)
	for _, link := range links {
		fromNorm := strings.ReplaceAll(link.FromFile, "\\", "/")
		toNorm := strings.ReplaceAll(link.ToFile, "\\", "/")
		reverse[toNorm] = append(reverse[toNorm], fromNorm)
	}
	return &Invalidator{reverseDeps: reverse}
}

// Invalidate finds all downstream files transitively dependent on the changed files.
func (inv *Invalidator) Invalidate(changedFiles []string) []string {
	visited := make(map[string]bool)
	queue := make([]string, 0, len(changedFiles))

	changedSet := make(map[string]bool, len(changedFiles))
	for _, f := range changedFiles {
		norm := strings.ReplaceAll(f, "\\", "/")
		changedSet[norm] = true
		queue = append(queue, norm)
	}

	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]

		for target, sources := range inv.reverseDeps {
			if target == current || strings.HasSuffix(target, current) || strings.Contains(target, current) {
				for _, src := range sources {
					if !visited[src] && !changedSet[src] {
						visited[src] = true
						queue = append(queue, src)
					}
				}
			}
		}
	}

	result := make([]string, 0, len(visited))
	for f := range visited {
		result = append(result, f)
	}
	return result
}

// ComputeDelta partitions change events into modified, added, deleted, and calculates invalidated dependents.
func ComputeDelta(events []FileChangeEvent, links []DependencyLink) *IncrementalDelta {
	t0 := time.Now()
	var modified, added, deleted []string

	for _, e := range events {
		switch e.ChangeType {
		case ChangeModified:
			modified = append(modified, e.Path)
		case ChangeCreated:
			added = append(added, e.Path)
		case ChangeDeleted:
			deleted = append(deleted, e.Path)
		}
	}

	affected := append(append([]string{}, modified...), deleted...)
	inv := NewInvalidator(links)
	invalidated := inv.Invalidate(affected)

	return &IncrementalDelta{
		ModifiedFiles:           modified,
		AddedFiles:              added,
		DeletedFiles:            deleted,
		InvalidatedDependencies: invalidated,
		Timestamp:               time.Now().UTC(),
		DurationMs:              time.Since(t0).Milliseconds(),
	}
}
