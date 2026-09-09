package decision

// DecisionStatus represents the lifecycle of an architectural decision
type DecisionStatus string

const (
	StatusProposed   DecisionStatus = "proposed"
	StatusAccepted   DecisionStatus = "accepted"
	StatusRejected   DecisionStatus = "rejected"
	StatusDeprecated DecisionStatus = "deprecated"
	StatusSuperseded DecisionStatus = "superseded"
)

// Alternative records an option considered during decision-making
type Alternative struct {
	Name            string   `json:"name"`
	Description     string   `json:"description,omitempty"`
	Pros            []string `json:"pros,omitempty"`
	Cons            []string `json:"cons,omitempty"`
	RejectionReason string   `json:"rejection_reason,omitempty"`
}

// Decision represents an Architectural Decision Record (ADR)
type Decision struct {
	ID               string                 `json:"id"`
	Title            string                 `json:"title"`
	Description      string                 `json:"description,omitempty"`
	Reason           string                 `json:"reason"`
	Alternatives     []Alternative          `json:"alternatives,omitempty"`
	AffectedEntities []string               `json:"affected_entities,omitempty"`
	CreatedBy        string                 `json:"created_by,omitempty"`
	Confidence       float64                `json:"confidence"`
	Status           DecisionStatus         `json:"status"`
	Source           string                 `json:"source,omitempty"`
	CreatedAt        string                 `json:"created_at,omitempty"`
	UpdatedAt        string                 `json:"updated_at,omitempty"`
	Supersedes       *string                `json:"supersedes,omitempty"`
	SupersededBy     *string                `json:"superseded_by,omitempty"`
	Metadata         map[string]interface{} `json:"metadata,omitempty"`
}

// DecisionLineage provides the supersession chain for a decision
type DecisionLineage struct {
	Decision      Decision   `json:"decision"`
	Ancestors     []Decision `json:"ancestors"`
	Descendants   []Decision `json:"descendants"`
	ActiveVersion Decision   `json:"active_version"`
}

// RuleCategory classifies project constraints
type RuleCategory string

const (
	CategoryProject      RuleCategory = "project"
	CategoryArchitecture RuleCategory = "architecture"
	CategorySecurity     RuleCategory = "security"
	CategoryConvention   RuleCategory = "convention"
)

// RuleSeverity indicates the importance of a rule
type RuleSeverity string

const (
	SeverityCritical RuleSeverity = "critical"
	SeverityHigh     RuleSeverity = "high"
	SeverityMedium   RuleSeverity = "medium"
	SeverityLow      RuleSeverity = "low"
	SeverityInfo     RuleSeverity = "info"
)

// Rule represents a project constraint or architectural rule
type Rule struct {
	ID          string       `json:"id"`
	Title       string       `json:"title"`
	Instruction string       `json:"instruction"`
	Category    RuleCategory `json:"category"`
	Severity    RuleSeverity `json:"severity"`
	Scope       string       `json:"scope"`
	Rationale   string       `json:"rationale,omitempty"`
	Source      string       `json:"source,omitempty"`
	Enforcement string       `json:"enforcement,omitempty"`
}

// RuleCheckRequest is sent to evaluate rules
type RuleCheckRequest struct {
	FilePaths []string          `json:"file_paths"`
	Contents  map[string]string `json:"contents,omitempty"`
}

// RuleCheckViolation represents a single violation
type RuleCheckViolation struct {
	RuleID    string       `json:"rule_id"`
	RuleTitle string       `json:"rule_title"`
	Severity  RuleSeverity `json:"severity"`
	FilePath  string       `json:"file_path"`
	Message   string       `json:"message"`
}

// RuleCheckResponse returns the evaluation outcome
type RuleCheckResponse struct {
	TotalRulesEvaluated int                  `json:"total_rules_evaluated"`
	Violations          []RuleCheckViolation `json:"violations"`
	Passed              bool                 `json:"passed"`
}
