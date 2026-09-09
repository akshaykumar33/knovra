package impact

import "time"

// TargetType represents the classification of the impact target
type TargetType string

const (
	TargetFile        TargetType = "file"
	TargetFunction    TargetType = "function"
	TargetClass       TargetType = "class"
	TargetModule      TargetType = "module"
	TargetDBTable     TargetType = "db_table"
	TargetAPIEndpoint TargetType = "api_endpoint"
	TargetService     TargetType = "service"
)

// ImpactType defines the proximity of the impact
type ImpactType string

const (
	ImpactDirect     ImpactType = "direct"
	ImpactTransitive ImpactType = "transitive"
)

// ImpactNode represents an impacted entity in the project
type ImpactNode struct {
	Name       string                 `json:"name"`
	TargetType TargetType             `json:"target_type"`
	ImpactType ImpactType             `json:"impact_type"`
	Distance   int                    `json:"distance"`
	Confidence float64                `json:"confidence"`
	Reason     string                 `json:"reason"`
	Critical   bool                   `json:"critical"`
	Provenance map[string]interface{} `json:"provenance,omitempty"`
}

// CriticalPath traces a high-risk cascading failure path
type CriticalPath struct {
	Path        []string `json:"path"`
	RiskLevel   string   `json:"risk_level"`
	Description string   `json:"description"`
}

// TestRecommendation suggests a test suite to run for regression prevention
type TestRecommendation struct {
	TestFile   string `json:"test_file"`
	TestName   string `json:"test_name,omitempty"`
	TargetFile string `json:"target_file"`
	Priority   string `json:"priority"`
	Reason     string `json:"reason"`
}

// RelatedDecision captures an ADR or rule governing the impacted entity
type RelatedDecision struct {
	DecisionID string                   `json:"decision_id"`
	Title      string                   `json:"title"`
	Status     string                   `json:"status"`
	Reason     string                   `json:"reason"`
	Rules      []map[string]interface{} `json:"rules,omitempty"`
}

// AnalysisRequest configures the impact analysis query
type AnalysisRequest struct {
	Target            string     `json:"target"`
	TargetType        TargetType `json:"target_type,omitempty"`
	MaxDepth          int        `json:"max_depth"`
	IncludeTransitive bool       `json:"include_transitive"`
	IncludeTests      bool       `json:"include_tests"`
	IncludeDecisions  bool       `json:"include_decisions"`
	IncludeCommits    bool       `json:"include_commits"`
}

// AnalysisResponse contains the full explainable impact analysis
type AnalysisResponse struct {
	Target           string                   `json:"target"`
	TargetType       TargetType               `json:"target_type"`
	DirectImpacts    []ImpactNode             `json:"direct_impacts"`
	TransitiveImpacts []ImpactNode            `json:"transitive_impacts"`
	TotalImpacted    int                      `json:"total_impacted"`
	ConfidenceScore  float64                  `json:"confidence_score"`
	CriticalPaths    []CriticalPath           `json:"critical_paths"`
	TestsToRun       []TestRecommendation     `json:"tests_to_run"`
	RelatedDecisions []RelatedDecision        `json:"related_decisions"`
	RecentCommits    []map[string]interface{} `json:"recent_commits,omitempty"`
	GraphBacked      bool                     `json:"graph_backed"`
	Explanation      string                   `json:"explanation"`
	ExecutionTimeMs  float64                  `json:"execution_time_ms"`
	Timestamp        time.Time                `json:"timestamp"`
}
