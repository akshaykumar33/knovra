package git

import (
	"testing"
)

func TestExtractADRReferences(t *testing.T) {
	text := "Implement resilient storage per ADR-004 and deprecate adr-003. Also see ADR_001."
	adrs := ExtractADRReferences(text)

	expected := map[string]bool{
		"adr-004": true,
		"adr-003": true,
		"adr-001": true,
	}

	if len(adrs) != len(expected) {
		t.Fatalf("expected %d ADRs, got %d (%v)", len(expected), len(adrs), adrs)
	}

	for _, id := range adrs {
		if !expected[id] {
			t.Errorf("unexpected ADR extracted: %s", id)
		}
	}
}

func TestExtractPRReferences(t *testing.T) {
	text := "Merge pull request #123 from dev. Closes PR-456."
	prs := ExtractPRReferences(text)

	expected := map[string]bool{
		"#123": true,
		"#456": true,
	}

	if len(prs) != len(expected) {
		t.Fatalf("expected %d PR references, got %d (%v)", len(expected), len(prs), prs)
	}

	for _, pr := range prs {
		if !expected[pr] {
			t.Errorf("unexpected PR extracted: %s", pr)
		}
	}
}

func TestParseGitLogOutput(t *testing.T) {
	raw := "\x1e1111111111111111111111111111111111111111\x1f1111111\x1fDev Author\x1fdev@knovra.io\x1f2026-09-09T10:00:00Z\x1ffeat(core): implement ADR-001\x1fparent123\x1fThis commit sets up core monorepo architecture.\n\n10\t2\tservices/runtime/main.go\n5\t0\tservices/runtime/go.mod"

	commits, err := ParseGitLogOutput(raw)
	if err != nil {
		t.Fatalf("failed to parse git log output: %v", err)
	}

	if len(commits) != 1 {
		t.Fatalf("expected 1 commit, got %d", len(commits))
	}

	c := commits[0]
	if c.ShortHash != "1111111" {
		t.Errorf("expected short hash 1111111, got %s", c.ShortHash)
	}
	if c.AuthorName != "Dev Author" {
		t.Errorf("expected Dev Author, got %s", c.AuthorName)
	}
	if len(c.LinkedDecisions) != 1 || c.LinkedDecisions[0] != "adr-001" {
		t.Errorf("expected linked decision adr-001, got %v", c.LinkedDecisions)
	}
	if len(c.ChangedFiles) != 2 {
		t.Fatalf("expected 2 changed files, got %d", len(c.ChangedFiles))
	}
	if c.ChangedFiles[0].Path != "services/runtime/main.go" || c.ChangedFiles[0].Additions != 10 {
		t.Errorf("unexpected file change 0: %+v", c.ChangedFiles[0])
	}
}
