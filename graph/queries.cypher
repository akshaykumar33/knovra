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
WHERE d.status = 'active'
RETURN d.id, d.title, d.reason, d.created_at
ORDER BY d.created_at DESC;
