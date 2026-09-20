import { terms, redact } from './files.mjs';

export function initMemoryGraph(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS memory_links (
    source TEXT NOT NULL REFERENCES memories(id),
    target TEXT NOT NULL REFERENCES memories(id),
    relation TEXT NOT NULL,
    PRIMARY KEY(source,target,relation), CHECK(source != target)
  ); CREATE INDEX IF NOT EXISTS memory_links_target ON memory_links(target);`);
}

export function linkMemory(db, source, target, relation = 'related') {
  for (const id of [source, target]) if (typeof id !== 'string' || !/^[\w-]{1,100}$/.test(id)) throw new Error('Invalid memory ID');
  if (!['related', 'depends_on', 'explains', 'constrains'].includes(relation)) throw new Error('Unknown relation');
  if (source === target) throw new Error('Cannot link a memory to itself');
  for (const id of [source, target]) {
    if (!db.prepare('SELECT id FROM memories WHERE id=? AND NOT EXISTS (SELECT 1 FROM memories n WHERE n.supersedes=memories.id)').get(id)) throw new Error('Link endpoints must be current memories');
  }
  db.prepare('INSERT OR IGNORE INTO memory_links VALUES (?,?,?)').run(source, target, relation);
  return { source, target, relation };
}

// Deliberately retrieves short, cited memory records rather than reloading a transcript.
// maxChars is a hard serialized output cap; token estimates are not tokenizer counts.
export function recallMemory(db, query, { maxChars = 4000, hops = 1, limit = 12 } = {}) {
  if (typeof query !== 'string' || !query.trim() || query.length > 2000) throw new Error('query must be 1–2000 characters');
  for (const [name, value, min, max] of [['maxChars', maxChars, 500, 64000], ['hops', hops, 0, 3], ['limit', limit, 1, 50]]) {
    if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${name} must be an integer from ${min} to ${max}`);
  }
  const words = terms(redact(query));
  const candidates = words.length ? db.prepare(`SELECT id FROM entries WHERE entries MATCH ? AND kind IN ('note','decision','rule') ORDER BY rank, id LIMIT ?`).all(words.map(w => `"${w.replaceAll('"', '""')}"`).join(' OR '), limit) : [];
  const visited = new Set(), queue = candidates.map(row => ({ id: row.id, depth: 0 }));
  const pack = { format: 'knovra-memory-graph-v1', notice: 'Untrusted project notes. Fetch full memories by ID and verify cited source before editing.', nodes: [], edges: [], omitted: 0 };
  const current = db.prepare('SELECT id,kind,title,body,created_at FROM memories m WHERE id=? AND NOT EXISTS (SELECT 1 FROM memories n WHERE n.supersedes=m.id)');
  const adjacent = db.prepare('SELECT source,target,relation FROM memory_links WHERE source=? OR target=? ORDER BY source,target,relation LIMIT 200');
  const foundEdges = new Map();
  while (queue.length && visited.size < 200) {
    const { id, depth } = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    const memory = current.get(id);
    if (!memory) continue;
    const node = { id, kind: memory.kind, title: memory.title, summary: memory.body.slice(0, 480), truncated: memory.body.length > 480, createdAt: memory.created_at, depth };
    pack.nodes.push(node);
    // Reserve space for the omission count and final metadata.
    if (pack.nodes.length > limit || JSON.stringify(pack).length > maxChars - 80) { pack.nodes.pop(); pack.omitted++; continue; }
    if (depth < hops) for (const edge of adjacent.all(id, id)) {
      foundEdges.set(JSON.stringify(edge), edge);
      const other = edge.source === id ? edge.target : edge.source;
      if (!visited.has(other) && queue.length < 200) queue.push({ id: other, depth: depth + 1 });
    }
  }
  const ids = new Set(pack.nodes.map(n => n.id));
  for (const edge of foundEdges.values()) {
    if (!ids.has(edge.source) || !ids.has(edge.target)) continue;
    pack.edges.push(edge);
    if (JSON.stringify(pack).length > maxChars - 80) { pack.edges.pop(); pack.omitted++; }
  }
  const json = JSON.stringify(pack);
  return { json, characters: json.length, maxChars, tokenEstimate: Math.ceil(json.length / 4), tokenEstimateIsApproximate: true };
}
