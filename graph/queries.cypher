// =============================================================================
// Knovra Pre-built Cypher Queries
// =============================================================================

// 1. Get complete project architecture overview
MATCH (p:Project {id: $project_id})-[:HAS_REPOSITORY]->(r:Repository)
OPTIONAL MATCH (p)-[:CONTAINS]->(pkg:Package)
OPTIONAL MATCH (r)-[:CONTAINS]->(f:File)
RETURN p, r, collect(DISTINCT pkg) AS packages, count(DISTINCT f) AS file_count;

// 2. Find all symbols declared in a file
MATCH (f:File {path: $file_path, project_id: $project_id})-[:DECLARES]->(s:Symbol)
RETURN s.name AS name, s.kind AS kind, s.line_start AS line_start, s.line_end AS line_end, s.signature AS signature
ORDER BY s.line_start ASC;

// 3. Find all dependencies imported by a file
MATCH (f:File {path: $file_path, project_id: $project_id})-[:IMPORTS]->(target)
RETURN target;

// 4. Find all files that import a given file (reverse dependency / impact analysis)
MATCH (importer:File)-[:IMPORTS]->(target:File {path: $file_path, project_id: $project_id})
RETURN importer.path AS impacted_file, importer.language AS language;

// 5. Find call hierarchy for a function
MATCH (caller:Symbol {name: $symbol_name, project_id: $project_id})-[:CALLS]->(callee:Symbol)
RETURN caller.name AS caller, callee.name AS callee, callee.file_path AS callee_file;

// 6. Find all active decisions affecting a subsystem or project
MATCH (d:Decision {project_id: $project_id})
WHERE d.status = 'accepted' AND d.superseded_by IS NULL
RETURN d.id, d.title, d.reason, d.created_at
ORDER BY d.created_at DESC;

// 7. Trace complete decision supersession lineage (Invariant #3)
MATCH (d:Decision {id: $decision_id})
OPTIONAL MATCH path = (d)-[:SUPERSEDES*]->(older:Decision)
OPTIONAL MATCH revPath = (newer:Decision)-[:SUPERSEDES*]->(d)
RETURN d, nodes(path) AS older_decisions, nodes(revPath) AS newer_decisions;

// 8. Find all decisions affecting a specific file, module or symbol
MATCH (d:Decision)-[:AFFECTS]->(entity)
WHERE entity.id = $entity_id OR entity.path = $file_path
RETURN d.id AS decision_id, d.title AS title, d.status AS status, d.reason AS reason;

// 9. Find rules constraining a file or scope
MATCH (r:Rule)
WHERE r.scope = '*' OR $file_path STARTS WITH r.scope
RETURN r.id AS rule_id, r.title AS title, r.severity AS severity, r.instruction AS instruction, r.category AS category
ORDER BY CASE r.severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END ASC;

// 10. Trace Decision to implementing Commits and modified Files (Phase 07)
MATCH (d:Decision {id: $decision_id})-[:IMPLEMENTED_BY]->(c:Commit)-[m:MODIFIES]->(f:File)
RETURN d.id AS decision_id, c.hash AS commit_hash, c.subject AS commit_subject, f.path AS file_path, m.additions AS additions, m.deletions AS deletions
ORDER BY c.date DESC;

// 11. Trace File to modifying Commits, Authors, and governing Decisions (Phase 07)
MATCH (f:File {path: $file_path})<-[m:MODIFIES]-(c:Commit)
OPTIONAL MATCH (c)<-[:IMPLEMENTED_BY]-(d:Decision)
RETURN f.path AS file_path, c.hash AS commit_hash, c.author AS author, c.date AS commit_date, c.subject AS commit_subject, d.id AS decision_id, d.title AS decision_title
ORDER BY c.date DESC;

// 12. Trace Decision to discussing Conversation Sessions and Messages (Phase 07)
MATCH (d:Decision {id: $decision_id})<-[:DISCUSSES]-(s:Session)
OPTIONAL MATCH (s)-[:HAS_MESSAGE]->(m:Message)
RETURN d.id AS decision_id, s.id AS session_id, s.title AS session_title, s.created_at AS session_date, count(m) AS message_count
ORDER BY s.created_at DESC;

