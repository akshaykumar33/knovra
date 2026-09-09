package graph

import (
	"fmt"
	"strings"
	"time"
)

// GenerateCypherStatements creates idempotent MERGE Cypher queries for a GraphBundle
func GenerateCypherStatements(bundle *GraphBundle) []string {
	var statements []string

	// 1. Merge Nodes
	for _, node := range bundle.Nodes {
		var setProps []string
		for k, v := range node.Properties {
			if k == "id" {
				continue
			}
			setProps = append(setProps, fmt.Sprintf("n.%s = %s", k, formatCypherVal(v)))
		}

		// Provenance properties
		setProps = append(setProps, fmt.Sprintf("n.provenance_source = %s", formatCypherVal(node.Provenance.Source)))
		setProps = append(setProps, fmt.Sprintf("n.provenance_source_id = %s", formatCypherVal(node.Provenance.SourceID)))
		setProps = append(setProps, fmt.Sprintf("n.provenance_created_at = %s", formatCypherVal(node.Provenance.CreatedAt.Format(time.RFC3339))))
		setProps = append(setProps, fmt.Sprintf("n.provenance_confidence = %s", formatCypherVal(node.Provenance.Confidence)))
		setProps = append(setProps, fmt.Sprintf("n.project_id = %s", formatCypherVal(node.Provenance.ProjectID)))

		stmt := fmt.Sprintf(
			"MERGE (n:%s {id: %s})\nON CREATE SET %s\nON MATCH SET %s;",
			node.Label,
			formatCypherVal(node.ID),
			strings.Join(setProps, ", "),
			strings.Join(setProps, ", "),
		)
		statements = append(statements, stmt)
	}

	// 2. Merge Relationships
	for _, rel := range bundle.Relationships {
		var setRelProps []string
		for k, v := range rel.Properties {
			setRelProps = append(setRelProps, fmt.Sprintf("r.%s = %s", k, formatCypherVal(v)))
		}
		setRelProps = append(setRelProps, fmt.Sprintf("r.project_id = %s", formatCypherVal(rel.Provenance.ProjectID)))
		setRelProps = append(setRelProps, fmt.Sprintf("r.provenance_source = %s", formatCypherVal(rel.Provenance.Source)))

		setClause := ""
		if len(setRelProps) > 0 {
			setClause = fmt.Sprintf("\nON CREATE SET %s", strings.Join(setRelProps, ", "))
		}

		stmt := fmt.Sprintf(
			"MATCH (from:%s {id: %s}), (to:%s {id: %s})\nMERGE (from)-[r:%s]->(to)%s;",
			rel.FromLabel,
			formatCypherVal(rel.FromNodeID),
			rel.ToLabel,
			formatCypherVal(rel.ToNodeID),
			rel.Type,
			setClause,
		)
		statements = append(statements, stmt)
	}

	return statements
}

// GenerateExportScript produces a standalone .cypher transaction file
func GenerateExportScript(bundle *GraphBundle) string {
	var sb strings.Builder

	sb.WriteString("// =============================================================================\n")
	sb.WriteString(fmt.Sprintf("// Knovra Context Graph Export (Project: %s)\n", bundle.ProjectID))
	sb.WriteString(fmt.Sprintf("// Generated: %s\n", bundle.GeneratedAt.Format(time.RFC3339)))
	sb.WriteString(fmt.Sprintf("// Nodes: %d | Relationships: %d\n", len(bundle.Nodes), len(bundle.Relationships)))
	sb.WriteString("// =============================================================================\n\n")

	sb.WriteString(":begin\n\n")

	stmts := GenerateCypherStatements(bundle)
	for _, stmt := range stmts {
		sb.WriteString(stmt)
		sb.WriteString("\n\n")
	}

	sb.WriteString(":commit\n")
	return sb.String()
}

func formatCypherVal(v interface{}) string {
	switch val := v.(type) {
	case string:
		escaped := strings.ReplaceAll(val, "\\", "\\\\")
		escaped = strings.ReplaceAll(escaped, "'", "\\'")
		escaped = strings.ReplaceAll(escaped, "\n", " ")
		escaped = strings.ReplaceAll(escaped, "\r", "")
		return fmt.Sprintf("'%s'", escaped)
	case int, int64, int32:
		return fmt.Sprintf("%d", val)
	case float64:
		return fmt.Sprintf("%.2f", val)
	case bool:
		return fmt.Sprintf("%t", val)
	default:
		return fmt.Sprintf("'%v'", val)
	}
}
