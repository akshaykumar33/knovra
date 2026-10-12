-- Initialize PostgreSQL extensions for Knovra
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Semantic Memory Table (Phase 05)
CREATE TABLE IF NOT EXISTS semantic_chunks (
    chunk_id VARCHAR(128) PRIMARY KEY,
    document_id VARCHAR(128) NOT NULL,
    project_id VARCHAR(128) NOT NULL,
    repository_id VARCHAR(128) NOT NULL,
    doc_type VARCHAR(64) NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    chunk_index INT NOT NULL,
    total_chunks INT NOT NULL,
    file_path TEXT NOT NULL,
    byte_start INT,
    byte_end INT,
    line_start INT,
    line_end INT,
    content_hash VARCHAR(64) NOT NULL,
    repo_name VARCHAR(128),
    metadata JSONB,
    embedding vector(384),
    model_name VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_semantic_chunks_doc ON semantic_chunks (document_id);
CREATE INDEX IF NOT EXISTS idx_semantic_chunks_proj_type ON semantic_chunks (project_id, doc_type);

-- Verify pgvector installed
DO $$
BEGIN
  RAISE NOTICE 'PostgreSQL initialized with uuid-ossp, vector extensions, and semantic_chunks table.';
END $$;

