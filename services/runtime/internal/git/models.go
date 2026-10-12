package git

import "time"

// FileChange represents a file affected by a Git commit.
type FileChange struct {
	Path      string `json:"path"`
	Status    string `json:"status"`
	Additions int    `json:"additions"`
	Deletions int    `json:"deletions"`
	OldPath   string `json:"old_path,omitempty"`
}

// GitCommit represents a single commit record with ADR and PR references.
type GitCommit struct {
	Hash            string       `json:"hash"`
	ShortHash       string       `json:"short_hash"`
	AuthorName      string       `json:"author_name"`
	AuthorEmail     string       `json:"author_email"`
	Date            time.Time    `json:"date"`
	Subject         string       `json:"subject"`
	Body            string       `json:"body"`
	Parents         []string     `json:"parents"`
	ChangedFiles    []FileChange `json:"changed_files"`
	LinkedDecisions []string     `json:"linked_decisions"`
	PRReferences    []string     `json:"pr_references"`
}

// GitBranch represents a local or remote branch pointer.
type GitBranch struct {
	Name       string `json:"name"`
	CommitHash string `json:"commit_hash"`
	IsHead     bool   `json:"is_head"`
}

// GitTag represents a repository tag.
type GitTag struct {
	Name       string `json:"name"`
	CommitHash string `json:"commit_hash"`
	Tagger     string `json:"tagger,omitempty"`
	Message    string `json:"message,omitempty"`
}

// GitHistoryPayload contains the complete Git extraction batch.
type GitHistoryPayload struct {
	ProjectID    string      `json:"project_id"`
	RepositoryID string      `json:"repository_id"`
	Commits      []GitCommit `json:"commits"`
	Branches     []GitBranch `json:"branches"`
	Tags         []GitTag    `json:"tags"`
}

// IngestGitResponse is the response returned by the Context Engine /git/ingest endpoint.
type IngestGitResponse struct {
	CommitsIngested  int                 `json:"commits_ingested"`
	BranchesIngested int                 `json:"branches_ingested"`
	TagsIngested     int                 `json:"tags_ingested"`
	DecisionsLinked  map[string][]string `json:"decisions_linked"`
}

// LineageTraceResult is the unified response for cross-domain lineage traces.
type LineageTraceResult struct {
	QueryType      string                   `json:"query_type"`
	QueryTarget    string                   `json:"query_target"`
	DecisionID     string                   `json:"decision_id,omitempty"`
	DecisionTitle  string                   `json:"decision_title,omitempty"`
	DecisionStatus string                   `json:"decision_status,omitempty"`
	Commits        []GitCommit              `json:"commits"`
	ModifiedFiles  []string                 `json:"modified_files"`
	Conversations  []map[string]interface{} `json:"conversations"`
}
