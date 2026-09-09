export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export const KNOVRA_MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'knovra_search',
    description: 'Perform semantic and keyword search across indexed project intelligence',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term or question' },
        limit: { type: 'number', description: 'Max results (default: 10)' }
      },
      required: ['query']
    }
  },
  {
    name: 'knovra_context',
    description: 'Retrieve a bounded context bundle tailored to a specific coding task',
    inputSchema: {
      type: 'object',
      properties: {
        task: { type: 'string', description: 'Description of the coding task or question' },
        token_budget: { type: 'number', description: 'Maximum tokens allowed in response' }
      },
      required: ['task']
    }
  },
  {
    name: 'knovra_record_decision',
    description: 'Record an architectural decision and rationale into persistent memory',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Decision title' },
        reason: { type: 'string', description: 'Why this decision was made' },
        alternatives: { type: 'array', items: { type: 'string' }, description: 'Alternatives considered' },
        affected_entities: { type: 'array', items: { type: 'string' } }
      },
      required: ['title', 'reason']
    }
  }
];
