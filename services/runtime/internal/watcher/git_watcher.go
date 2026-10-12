package watcher

import (
	"bytes"
	"os/exec"
	"strings"
	"time"
)

// GitWatcher detects modified, added, and deleted files using Git status.
type GitWatcher struct {
	RepoDir string
}

// NewGitWatcher creates a watcher targeting a local git repository.
func NewGitWatcher(repoDir string) *GitWatcher {
	return &GitWatcher{RepoDir: repoDir}
}

// GetWorkingTreeChanges queries `git status --porcelain` and returns detected changes.
func (gw *GitWatcher) GetWorkingTreeChanges() ([]FileChangeEvent, error) {
	cmd := exec.Command("git", "status", "--porcelain")
	cmd.Dir = gw.RepoDir

	var out bytes.Buffer
	cmd.Stdout = &out

	if err := cmd.Run(); err != nil {
		return nil, err
	}

	var events []FileChangeEvent
	lines := strings.Split(out.String(), "\n")

	for _, line := range lines {
		line = strings.TrimRight(line, "\r\n")
		if len(line) < 4 {
			continue
		}

		statusCode := line[:2]
		filePath := strings.TrimSpace(line[3:])
		filePath = strings.ReplaceAll(filePath, "\\", "/")

		var ct ChangeType
		switch {
		case strings.Contains(statusCode, "M"):
			ct = ChangeModified
		case strings.Contains(statusCode, "A"), strings.Contains(statusCode, "?"):
			ct = ChangeCreated
		case strings.Contains(statusCode, "D"):
			ct = ChangeDeleted
		default:
			ct = ChangeModified
		}

		events = append(events, FileChangeEvent{
			Path:       filePath,
			ChangeType: ct,
			Timestamp:  time.Now().UTC(),
		})
	}

	return events, nil
}
