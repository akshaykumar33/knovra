// =============================================================================
// Knovra Context Graph Schema (Neo4j)
// Constraints & Indexes for fast graph traversals and provenance tracking
// =============================================================================

// Organization, Project & Package
CREATE CONSTRAINT org_id_unique IF NOT EXISTS FOR (o:Organization) REQUIRE o.id IS UNIQUE;
CREATE CONSTRAINT project_id_unique IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT repo_id_unique IF NOT EXISTS FOR (r:Repository) REQUIRE r.id IS UNIQUE;
CREATE CONSTRAINT package_id_unique IF NOT EXISTS FOR (pkg:Package) REQUIRE pkg.id IS UNIQUE;

// Code & Structure
CREATE CONSTRAINT file_id_unique IF NOT EXISTS FOR (f:File) REQUIRE f.id IS UNIQUE;
CREATE CONSTRAINT module_id_unique IF NOT EXISTS FOR (m:Module) REQUIRE m.id IS UNIQUE;
CREATE CONSTRAINT symbol_id_unique IF NOT EXISTS FOR (s:Symbol) REQUIRE s.id IS UNIQUE;

// Memory, Decisions & History
CREATE CONSTRAINT decision_id_unique IF NOT EXISTS FOR (d:Decision) REQUIRE d.id IS UNIQUE;
CREATE CONSTRAINT rule_id_unique IF NOT EXISTS FOR (ru:Rule) REQUIRE ru.id IS UNIQUE;
CREATE CONSTRAINT commit_id_unique IF NOT EXISTS FOR (co:Commit) REQUIRE co.hash IS UNIQUE;
CREATE CONSTRAINT session_id_unique IF NOT EXISTS FOR (se:Session) REQUIRE se.id IS UNIQUE;
CREATE CONSTRAINT agent_id_unique IF NOT EXISTS FOR (ag:Agent) REQUIRE ag.id IS UNIQUE;

// Fast Query Indexes
CREATE INDEX file_path_idx IF NOT EXISTS FOR (f:File) ON (f.path);
CREATE INDEX symbol_name_idx IF NOT EXISTS FOR (s:Symbol) ON (s.name);
CREATE INDEX symbol_kind_idx IF NOT EXISTS FOR (s:Symbol) ON (s.kind);
CREATE INDEX symbol_proj_idx IF NOT EXISTS FOR (s:Symbol) ON (s.project_id);
CREATE INDEX file_proj_idx IF NOT EXISTS FOR (f:File) ON (f.project_id);
CREATE INDEX decision_status_idx IF NOT EXISTS FOR (d:Decision) ON (d.status);
CREATE INDEX rule_category_idx IF NOT EXISTS FOR (ru:Rule) ON (ru.category);

