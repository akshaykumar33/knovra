package watcher

import "time"

// ChangeType specifies the nature of a filesystem or git change.
type ChangeType string

const (
	ChangeCreated  ChangeType = "created"
	ChangeModified ChangeType = "modified"
	ChangeDeleted  ChangeType = "deleted"
)

// Freshness represents the canonical 6-property freshness lifecycle model.
type Freshness struct {
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	ValidFrom    time.Time  `json:"valid_from"`
	ValidTo      *time.Time `json:"valid_to,omitempty"`
	Stale        bool       `json:"stale"`
	SupersededBy string     `json:"superseded_by,omitempty"`
}

// NewFreshness initializes an active, valid freshness state.
func NewFreshness() Freshness {
	now := time.Now().UTC()
	return Freshness{
		CreatedAt: now,
		UpdatedAt: now,
		ValidFrom: now,
		ValidTo:   nil,
		Stale:     false,
	}
}

// Invalidate marks the freshness record as stale with a superseded identifier.
func (f *Freshness) Invalidate(supersededBy string) {
	now := time.Now().UTC()
	f.Stale = true
	f.ValidTo = &now
	f.UpdatedAt = now
	f.SupersededBy = supersededBy
}

// FileChangeEvent represents an atomic or debounced change detected on a file.
type FileChangeEvent struct {
	Path        string     `json:"path"`
	ChangeType  ChangeType `json:"change_type"`
	ContentHash string     `json:"content_hash"`
	Timestamp   time.Time  `json:"timestamp"`
}

// IncrementalDelta summarizes the scope of an incremental update cycle.
type IncrementalDelta struct {
	ModifiedFiles           []string  `json:"modified_files"`
	AddedFiles              []string  `json:"added_files"`
	DeletedFiles            []string  `json:"deleted_files"`
	InvalidatedDependencies []string  `json:"invalidated_dependencies"`
	Timestamp               time.Time `json:"timestamp"`
	DurationMs              int64     `json:"duration_ms"`
}
