package decision

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"gopkg.in/yaml.v3"
)

// ParseADRFile extracts structured decision attributes from a markdown ADR
func ParseADRFile(filePath string) (*Decision, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open ADR file: %w", err)
	}
	defer file.Close()

	dec := &Decision{
		Confidence: 1.0,
		Status:     StatusAccepted,
		Source:     filePath,
		Metadata:   make(map[string]interface{}),
	}

	scanner := bufio.NewScanner(file)
	currentSection := ""
	var sectionContent strings.Builder

	flushSection := func() {
		content := strings.TrimSpace(sectionContent.String())
		switch currentSection {
		case "context":
			dec.Reason = content
		case "decision":
			dec.Description = content
		case "alternatives":
			// Parse bullet points
			lines := strings.Split(content, "\n")
			for _, line := range lines {
				line = strings.TrimSpace(line)
				if strings.HasPrefix(line, "- **") || strings.HasPrefix(line, "* **") {
					parts := strings.SplitN(line, ":", 2)
					name := strings.Trim(parts[0], "-* ")
					name = strings.Trim(name, "*")
					reason := ""
					if len(parts) > 1 {
						reason = strings.TrimSpace(parts[1])
					}
					dec.Alternatives = append(dec.Alternatives, Alternative{
						Name:            name,
						RejectionReason: reason,
					})
				}
			}
		}
		sectionContent.Reset()
	}

	for scanner.Scan() {
		line := scanner.Text()
		trimmed := strings.TrimSpace(line)

		// 1. Top header: # Title
		if strings.HasPrefix(trimmed, "# ") && dec.Title == "" {
			dec.Title = strings.TrimPrefix(trimmed, "# ")
			continue
		}

		// 2. Metadata bullets: * **Key**: Value (only in top header or ## Metadata section)
		if (currentSection == "" || currentSection == "metadata") && (strings.HasPrefix(trimmed, "* **") || strings.HasPrefix(trimmed, "- **")) {
			parts := strings.SplitN(trimmed, ":", 2)
			if len(parts) == 2 {
				key := strings.ToLower(strings.Trim(parts[0], "* -`"))
				val := strings.Trim(parts[1], " *`")
				switch key {
				case "id":
					dec.ID = val
				case "status":
					dec.Status = DecisionStatus(strings.ToLower(val))
				case "created":
					dec.CreatedAt = val
				case "created by":
					dec.CreatedBy = val
				case "supersedes":
					if val != "" && !strings.EqualFold(val, "none") {
						dec.Supersedes = &val
					}
				case "superseded by":
					if val != "" && !strings.EqualFold(val, "none") {
						dec.SupersededBy = &val
					}
				}
			}
			continue
		}

		// Affected entity list item (in metadata section)
		if (currentSection == "" || currentSection == "metadata") && strings.HasPrefix(trimmed, "- `") && strings.HasSuffix(trimmed, "`") {
			entity := strings.Trim(trimmed, "- `")
			dec.AffectedEntities = append(dec.AffectedEntities, entity)
			continue
		}

		// 3. Section headers
		if strings.HasPrefix(trimmed, "## ") {
			flushSection()
			header := strings.ToLower(strings.TrimPrefix(trimmed, "## "))
			if strings.Contains(header, "metadata") {
				currentSection = "metadata"
			} else if strings.Contains(header, "context") || strings.Contains(header, "problem") {
				currentSection = "context"
			} else if strings.Contains(header, "decision") {
				currentSection = "decision"
			} else if strings.Contains(header, "alternative") {
				currentSection = "alternatives"
			} else {
				currentSection = ""
			}
			continue
		}


		if currentSection != "" {
			sectionContent.WriteString(line)
			sectionContent.WriteString("\n")
		}
	}

	flushSection()

	if dec.ID == "" {
		// Derive ID from filename
		base := filepath.Base(filePath)
		dec.ID = strings.TrimSuffix(base, filepath.Ext(base))
	}

	return dec, nil
}

// ScanADRDirectory scans a directory for markdown ADR files
func ScanADRDirectory(dirPath string) ([]Decision, error) {
	var decisions []Decision
	entries, err := os.ReadDir(dirPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to read decisions directory: %w", err)
	}

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		if strings.HasSuffix(strings.ToLower(entry.Name()), ".md") {
			fullPath := filepath.Join(dirPath, entry.Name())
			dec, err := ParseADRFile(fullPath)
			if err == nil && dec != nil {
				decisions = append(decisions, *dec)
			}
		}
	}

	return decisions, nil
}

// KnovraYAMLConfig represents the root knovra.yaml structure
type KnovraYAMLConfig struct {
	Rules []struct {
		ID          string `yaml:"id"`
		Title       string `yaml:"title"`
		Instruction string `yaml:"instruction"`
		Category    string `yaml:"category"`
		Severity    string `yaml:"severity"`
		Scope       string `yaml:"scope"`
		Rationale   string `yaml:"rationale"`
		Enforcement string `yaml:"enforcement"`
	} `yaml:"rules"`
}

// ParseKnovraYAML parses project rules from knovra.yaml
func ParseKnovraYAML(yamlPath string) ([]Rule, error) {
	data, err := os.ReadFile(yamlPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read knovra.yaml: %w", err)
	}

	var cfg KnovraYAMLConfig
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("failed to parse knovra.yaml: %w", err)
	}

	var rules []Rule
	for _, r := range cfg.Rules {
		scope := r.Scope
		if scope == "" {
			scope = "*"
		}
		enforcement := r.Enforcement
		if enforcement == "" {
			enforcement = "strict"
		}

		rules = append(rules, Rule{
			ID:          r.ID,
			Title:       r.Title,
			Instruction: strings.TrimSpace(r.Instruction),
			Category:    RuleCategory(r.Category),
			Severity:    RuleSeverity(r.Severity),
			Scope:       scope,
			Rationale:   r.Rationale,
			Source:      filepath.Base(yamlPath),
			Enforcement: enforcement,
		})
	}

	return rules, nil
}
