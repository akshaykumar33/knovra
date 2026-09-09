package graph

import "time"

// Provenance tracks the origin and confidence of any graph node or relationship
type Provenance struct {
	Source           string    `json:"source"`
	SourceID         string    `json:"sourceId"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
	Confidence       float64   `json:"confidence"`
	ExtractorVersion string    `json:"extractorVersion"`
	ProjectID        string    `json:"projectId"`
}

// GraphNode represents a node to be merged into Neo4j
type GraphNode struct {
	ID         string                 `json:"id"`
	Label      string                 `json:"label"` // e.g. "Project", "Repository", "Package", "File", "Symbol"
	Properties map[string]interface{} `json:"properties"`
	Provenance Provenance             `json:"provenance"`
}

// GraphRelationship represents a directed edge between two graph nodes
type GraphRelationship struct {
	Type        string                 `json:"type"` // e.g. "HAS_REPOSITORY", "CONTAINS", "DECLARES", "IMPORTS", "CALLS"
	FromNodeID  string                 `json:"fromNodeId"`
	FromLabel   string                 `json:"fromLabel"`
	ToNodeID    string                 `json:"toNodeId"`
	ToLabel     string                 `json:"toLabel"`
	Properties  map[string]interface{} `json:"properties"`
	Provenance  Provenance             `json:"provenance"`
}

// GraphBundle contains all nodes and relationships extracted for a project
type GraphBundle struct {
	ProjectID     string              `json:"projectId"`
	Nodes         []GraphNode         `json:"nodes"`
	Relationships []GraphRelationship `json:"relationships"`
	GeneratedAt   time.Time           `json:"generatedAt"`
}
