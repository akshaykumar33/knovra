export interface ProjectConfig {
  name: string;
  mode: 'local' | 'cloud';
  indexing: {
    exclude: string[];
    languages: string[];
  };
  context: {
    max_token_budget: number;
    include_recent_changes: boolean;
    include_decisions: boolean;
    include_rules: boolean;
  };
  rules?: Array<{
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    instruction: string;
  }>;
}

export function validateProjectConfig(raw: unknown): ProjectConfig {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Config must be a valid object');
  }
  const obj = raw as Record<string, any>;
  if (!obj.project?.name) {
    throw new Error('Missing project.name in configuration');
  }
  return {
    name: String(obj.project.name),
    mode: obj.project.mode === 'cloud' ? 'cloud' : 'local',
    indexing: {
      exclude: Array.isArray(obj.indexing?.exclude) ? obj.indexing.exclude : ['node_modules/**', 'dist/**'],
      languages: Array.isArray(obj.indexing?.languages) ? obj.indexing.languages : ['typescript', 'javascript', 'python', 'go', 'rust']
    },
    context: {
      max_token_budget: Number(obj.context?.max_token_budget) || 12000,
      include_recent_changes: Boolean(obj.context?.include_recent_changes ?? true),
      include_decisions: Boolean(obj.context?.include_decisions ?? true),
      include_rules: Boolean(obj.context?.include_rules ?? true)
    },
    rules: Array.isArray(obj.rules) ? obj.rules : []
  };
}
