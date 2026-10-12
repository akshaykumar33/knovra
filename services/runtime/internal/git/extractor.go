package git

import (
	"bytes"
	"fmt"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
	"time"
)

var (
	adrRegex = regexp.MustCompile(`(?i)\b(?:ADR|adr)[-_]?(\d{1,4})\b`)
	prRegex  = regexp.MustCompile(`(?i)(?:#|PR[-_]?)(\d{1,6})\b`)
)

// ExtractADRReferences scans text for architectural decision references (e.g. ADR-001 -> adr-001).
func ExtractADRReferences(text string) []string {
	matches := adrRegex.FindAllStringSubmatch(text, -1)
	if len(matches) == 0 {
		return nil
	}
	seen := make(map[string]struct{})
	var result []string
	for _, m := range matches {
		if len(m) > 1 {
			num, err := strconv.Atoi(m[1])
			if err == nil {
				id := fmt.Sprintf("adr-%03d", num)
				if _, exists := seen[id]; !exists {
					seen[id] = struct{}{}
					result = append(result, id)
				}
			}
		}
	}
	return result
}

// ExtractPRReferences scans text for pull request references (e.g. #42).
func ExtractPRReferences(text string) []string {
	matches := prRegex.FindAllStringSubmatch(text, -1)
	if len(matches) == 0 {
		return nil
	}
	seen := make(map[string]struct{})
	var result []string
	for _, m := range matches {
		if len(m) > 1 {
			pr := "#" + m[1]
			if _, exists := seen[pr]; !exists {
				seen[pr] = struct{}{}
				result = append(result, pr)
			}
		}
	}
	return result
}

// GitExtractor inspects a local Git repository offline.
type GitExtractor struct {
	RepoPath string
}

// NewGitExtractor creates a new Git extractor for the given repo path.
func NewGitExtractor(repoPath string) *GitExtractor {
	return &GitExtractor{RepoPath: repoPath}
}

// ExtractHistory extracts commit history, branches, and tags from the local Git repo.
func (g *GitExtractor) ExtractHistory(maxCommits int) (*GitHistoryPayload, error) {
	if maxCommits <= 0 {
		maxCommits = 200
	}

	commits, err := g.extractCommits(maxCommits)
	if err != nil {
		return nil, fmt.Errorf("failed to extract git commits: %w", err)
	}

	branches, err := g.extractBranches()
	if err != nil || branches == nil {
		branches = []GitBranch{}
	}

	tags, err := g.extractTags()
	if err != nil || tags == nil {
		tags = []GitTag{}
	}

	if commits == nil {
		commits = []GitCommit{}
	}

	return &GitHistoryPayload{
		ProjectID:    "knovra",
		RepositoryID: "knovra",
		Commits:      commits,
		Branches:     branches,
		Tags:         tags,
	}, nil
}

func (g *GitExtractor) extractCommits(maxCommits int) ([]GitCommit, error) {
	// Custom unit/record separator format:
	// Record: %H \x1f %h \x1f %an \x1f %ae \x1f %aI \x1f %s \x1f %P \x1f %b \x1e
	format := "%x1e%H%x1f%h%x1f%an%x1f%ae%x1f%aI%x1f%s%x1f%P%x1f%b"
	cmd := exec.Command("git", "log", fmt.Sprintf("-n%d", maxCommits), "-m", "--numstat", "--pretty=format:"+format)
	cmd.Dir = g.RepoPath

	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("git log failed: %s (%w)", stderr.String(), err)
	}

	return ParseGitLogOutput(stdout.String())
}

// ParseGitLogOutput parses the formatted git log stream.
func ParseGitLogOutput(raw string) ([]GitCommit, error) {
	if strings.TrimSpace(raw) == "" {
		return nil, nil
	}

	records := strings.Split(raw, "\x1e")
	var commits []GitCommit

	for _, rec := range records {
		rec = strings.TrimSpace(rec)
		if rec == "" {
			continue
		}

		parts := strings.Split(rec, "\x1f")
		if len(parts) < 7 {
			continue
		}

		fullHash := strings.TrimSpace(parts[0])
		shortHash := strings.TrimSpace(parts[1])
		authorName := strings.TrimSpace(parts[2])
		authorEmail := strings.TrimSpace(parts[3])
		dateStr := strings.TrimSpace(parts[4])
		subject := strings.TrimSpace(parts[5])
		parentsStr := strings.TrimSpace(parts[6])

		body := ""
		numstatStr := ""
		if len(parts) >= 8 {
			rest := parts[7]
			// The rest contains the commit body followed by numstat lines
			lines := strings.Split(rest, "\n")
			var bodyLines []string
			var statLines []string
			inStats := false

			for _, l := range lines {
				trimmedLine := strings.TrimSpace(l)
				if trimmedLine == "" {
					continue
				}
				// Numstat lines look like: "10\t5\tpath/to/file.go" or "-\t-\tbinary.png"
				fields := strings.Fields(trimmedLine)
				if len(fields) >= 3 && (isNumeric(fields[0]) || fields[0] == "-") && (isNumeric(fields[1]) || fields[1] == "-") {
					inStats = true
					statLines = append(statLines, trimmedLine)
				} else if !inStats {
					bodyLines = append(bodyLines, l)
				}
			}
			body = strings.TrimSpace(strings.Join(bodyLines, "\n"))
			numstatStr = strings.Join(statLines, "\n")
		}

		parsedDate, err := time.Parse(time.RFC3339, dateStr)
		if err != nil {
			parsedDate = time.Now().UTC()
		}

		var parents []string
		if parentsStr != "" {
			parents = strings.Fields(parentsStr)
		}

		changedFiles := parseNumstat(numstatStr)

		combinedText := subject + "\n" + body
		adrs := ExtractADRReferences(combinedText)
		prs := ExtractPRReferences(combinedText)

		commits = append(commits, GitCommit{
			Hash:            fullHash,
			ShortHash:       shortHash,
			AuthorName:      authorName,
			AuthorEmail:     authorEmail,
			Date:            parsedDate,
			Subject:         subject,
			Body:            body,
			Parents:         parents,
			ChangedFiles:    changedFiles,
			LinkedDecisions: adrs,
			PRReferences:    prs,
		})
	}

	return commits, nil
}

func parseNumstat(raw string) []FileChange {
	if strings.TrimSpace(raw) == "" {
		return nil
	}

	lines := strings.Split(raw, "\n")
	var changes []FileChange

	for _, line := range lines {
		fields := strings.Fields(line)
		if len(fields) < 3 {
			continue
		}
		additions, _ := strconv.Atoi(fields[0])
		deletions, _ := strconv.Atoi(fields[1])
		filePath := fields[2]

		status := "modified"
		if additions > 0 && deletions == 0 {
			status = "added"
		}

		changes = append(changes, FileChange{
			Path:      filePath,
			Status:    status,
			Additions: additions,
			Deletions: deletions,
		})
	}

	return changes
}

func (g *GitExtractor) extractBranches() ([]GitBranch, error) {
	cmd := exec.Command("git", "branch", "-a", "--format=%(refname:short)%x1f%(objectname)%x1f%(HEAD)")
	cmd.Dir = g.RepoPath

	out, err := cmd.Output()
	if err != nil {
		return nil, err
	}

	var branches []GitBranch
	for _, line := range strings.Split(string(out), "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		parts := strings.Split(line, "\x1f")
		if len(parts) >= 2 {
			isHead := false
			if len(parts) >= 3 && parts[2] == "*" {
				isHead = true
			}
			branches = append(branches, GitBranch{
				Name:       strings.TrimSpace(parts[0]),
				CommitHash: strings.TrimSpace(parts[1]),
				IsHead:     isHead,
			})
		}
	}
	return branches, nil
}

func (g *GitExtractor) extractTags() ([]GitTag, error) {
	cmd := exec.Command("git", "tag", "-l", "--format=%(refname:short)%x1f%(objectname)")
	cmd.Dir = g.RepoPath

	out, err := cmd.Output()
	if err != nil {
		return nil, err
	}

	var tags []GitTag
	for _, line := range strings.Split(string(out), "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		parts := strings.Split(line, "\x1f")
		if len(parts) >= 2 {
			tags = append(tags, GitTag{
				Name:       strings.TrimSpace(parts[0]),
				CommitHash: strings.TrimSpace(parts[1]),
			})
		}
	}
	return tags, nil
}

func isNumeric(s string) bool {
	_, err := strconv.Atoi(s)
	return err == nil
}
