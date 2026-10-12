import { Knovra, integer, text } from './index.mjs';
function response(id, result) { return { jsonrpc: '2.0', id, result }; }
function error(id, code, message) { return { jsonrpc: '2.0', id, error: { code, message } }; }
export function toolDefinitions() { return [
  { name: 'knovra_status', description: 'Show local project index status.', inputSchema: { type: 'object', properties: {} } },
  { name: 'knovra_index', description: 'Index local project files.', inputSchema: { type: 'object', properties: {} } },
  { name: 'knovra_search', description: 'Search indexed project text by keyword.', inputSchema: { type: 'object', properties: { query: { type: 'string' }, limit: { type: 'integer' } }, required: ['query'] } },
  { name: 'knovra_context', description: 'Build bounded source-cited context for a task.', inputSchema: { type: 'object', properties: { task: { type: 'string' }, max_chars: { type: 'integer' }, limit: { type: 'integer' } }, required: ['task'] } },
  { name: 'knovra_remember', description: 'Save a durable local note, decision, or rule.', inputSchema: { type: 'object', properties: { title: { type: 'string' }, body: { type: 'string' }, kind: { type: 'string' }, id: { type: 'string' }, supersedes: { type: 'string' } }, required: ['title', 'body'] } },
  { name: 'knovra_memories', description: 'List current durable memories.', inputSchema: { type: 'object', properties: {} } },
  { name: 'knovra_doctor', description: 'Check local storage and search health.', inputSchema: { type: 'object', properties: {} } },
  { name: 'knovra_export', description: 'Write a bounded context pack inside the project.', inputSchema: { type: 'object', properties: { task: { type: 'string' }, destination: { type: 'string' } }, required: ['task'] } },
]; }
export async function handle(request, project = process.cwd()) {
  const id = request.id ?? null;
  try {
    if (request.method === 'initialize') return response(id, { protocolVersion: '2025-11-25', capabilities: { tools: {} }, serverInfo: { name: 'knovra-local', version: '0.3.0' } });
    if (request.method === 'notifications/initialized') return null;
    if (request.method === 'ping') return response(id, {});
    if (request.method === 'tools/list') return response(id, { tools: toolDefinitions() });
    if (request.method !== 'tools/call') return error(id, -32601, `Method not found: ${request.method}`);
    const name = request.params?.name, args = request.params?.arguments ?? {}, k = new Knovra(project); let value;
    if (name === 'knovra_status') value = k.status();
    else if (name === 'knovra_index') value = k.index();
    else if (name === 'knovra_search') value = k.search(text(args.query, 'query', 2000), { limit: args.limit === undefined ? 8 : integer(args.limit, 'limit', 1, 50) });
    else if (name === 'knovra_context') value = k.context(text(args.task, 'task', 2000), { maxChars: args.max_chars ?? 12000, limit: args.limit ?? 12 });
    else if (name === 'knovra_remember') value = k.remember(args);
    else if (name === 'knovra_memories') value = k.memories();
    else if (name === 'knovra_doctor') value = k.doctor();
    else if (name === 'knovra_export') value = k.exportContext(text(args.task, 'task', 2000), args.destination ?? null);
    else { k.close(); return error(id, -32602, `Unknown tool: ${name}`); }
    k.close(); return response(id, { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }], structuredContent: value });
  } catch (e) { return response(id, { isError: true, content: [{ type: 'text', text: e instanceof Error ? e.message : String(e) }] }); }
}
