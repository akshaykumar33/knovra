package semantic

// DocType represents the category of indexed knowledge
type DocType string

const (
	DocTypeDocument      DocType = "doc"
	DocTypeCodeSummary   DocType = "code_summary"
	DocTypeModuleSummary DocType = "module_summary"
	DocTypeDecision      DocType = "decision"
	DocTypeRequirement   DocType = "requirement"
	DocTypeIssue         DocType = "issue"
	DocTypeConversation  DocType = "conversation"
	DocTypeErrorSolution DocType = "error_solution"
)

// Provenance tracks exact source attribution and invariants
type Provenance struct {
	FilePath    string `json:"file_path"`
	ByteStart   *int   `json:"byte_start,omitempty"`
	ByteEnd     *int   `json:"byte_end,omitempty"`
	LineStart   *int   `json:"line_start,omitempty"`
	LineEnd     *int   `json:"line_end,omitempty"`
	ContentHash string `json:"content_hash"`
	RepoName    string `json:"repo_name,omitempty"`
}

// DocumentInput is the payload sent to the context-engine for chunking and embedding
type DocumentInput struct {
	DocumentID   string                 `json:"document_id"`
	ProjectID    string                 `json:"project_id"`
	RepositoryID string                 `json:"repository_id"`
	DocType      DocType                `json:"doc_type"`
	Title        string                 `json:"title"`
	Content      string                 `json:"content"`
	Provenance   Provenance             `json:"provenance"`
	Metadata     map[string]interface{} `json:"metadata,omitempty"`
}

// SearchQuery specifies semantic search parameters
type SearchQuery struct {
	Query        string    `json:"query"`
	ProjectID    string    `json:"project_id,omitempty"`
	RepositoryID string    `json:"repository_id,omitempty"`
	DocTypes     []DocType `json:"doc_types,omitempty"`
	TopK         int       `json:"top_k"`
	MinScore     float64   `json:"min_score"`
}

// SearchResult represents a retrieved semantic chunk with provenance
type SearchResult struct {
	ChunkID    string                 `json:"chunk_id"`
	DocumentID string                 `json:"document_id"`
	Score      float64                `json:"score"`
	DocType    DocType                `json:"doc_type"`
	Title      string                 `json:"title"`
	Content    string                 `json:"content"`
	Provenance Provenance             `json:"provenance"`
	Metadata   map[string]interface{} `json:"metadata,omitempty"`
	ModelName  string                 `json:"model_name,omitempty"`
}

// IndexBatchRequest is sent to POST /semantic/index
type IndexBatchRequest struct {
	Documents []DocumentInput `json:"documents"`
	Reembed   bool            `json:"reembed"`
}

// IndexBatchResponse is returned by POST /semantic/index
type IndexBatchResponse struct {
	IndexedDocuments int            `json:"indexed_documents"`
	IndexedChunks    int            `json:"indexed_chunks"`
	DocTypes         map[string]int `json:"doc_types"`
	ModelName        string         `json:"model_name"`
	ElapsedMs        float64        `json:"elapsed_ms"`
}

// SemanticStats describes the state of the vector store
type SemanticStats struct {
	TotalDocuments  int            `json:"total_documents"`
	TotalChunks     int            `json:"total_chunks"`
	ByDocType       map[string]int `json:"by_doc_type"`
	EmbeddingModel  string         `json:"embedding_model"`
	VectorDimension int            `json:"vector_dimension"`
	StorageBackend  string         `json:"storage_backend"`
}
