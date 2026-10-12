package planner

// TaskType categorizes the development intent of a prompt.
type TaskType string

const (
	TaskTypeBugfix       TaskType = "bugfix"
	TaskTypeFeature      TaskType = "feature"
	TaskTypeRefactor     TaskType = "refactor"
	TaskTypeArchitecture TaskType = "architecture"
	TaskTypeCodeReview   TaskType = "code_review"
	TaskTypeGeneral      TaskType = "general"
)

// ContextPlanRequest is the request payload sent to /planner/bundle or /planner/prompt.
type ContextPlanRequest struct {
	Prompt    string   `json:"prompt"`
	TaskType  string   `json:"task_type,omitempty"`
	MaxTokens int      `json:"max_tokens"`
	FileHints []string `json:"file_hints,omitempty"`
	ProjectID string   `json:"project_id"`
}

// ContextBundle represents the bounded, structured task intelligence package.
type ContextBundle struct {
	Task                  string                   `json:"task"`
	TaskType              string                   `json:"task_type"`
	ProjectSummary        string                   `json:"project_summary"`
	Architecture          []string                 `json:"architecture"`
	Rules                 []map[string]interface{} `json:"rules"`
	Files                 []map[string]interface{} `json:"files"`
	Symbols               []map[string]interface{} `json:"symbols"`
	Dependencies          []string                 `json:"dependencies"`
	Decisions             []map[string]interface{} `json:"decisions"`
	PriorErrorsSolutions  []map[string]interface{} `json:"prior_errors_solutions"`
	RecentChanges         []map[string]interface{} `json:"recent_changes"`
	RelevantConversations []map[string]interface{} `json:"relevant_conversations"`
	Provenance            []map[string]interface{} `json:"provenance"`
	Freshness             string                   `json:"freshness"`
	TokenUsage            map[string]int           `json:"token_usage"`
	TotalTokens           int                      `json:"total_tokens"`
}

// ContextPlanResponse is the unified response containing both the bundle and prompt-ready Markdown.
type ContextPlanResponse struct {
	Bundle         ContextBundle `json:"bundle"`
	MarkdownPrompt string        `json:"markdown_prompt"`
}
