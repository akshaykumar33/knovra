export interface Provenance {
  source: string;
  sourceId: string;
  createdAt: string;
  updatedAt: string;
  confidence: number;
  extractor: string;
  version: string;
}

export interface DecisionRecord {
  id: string;
  title: string;
  description: string;
  reason: string;
  alternatives: string[];
  affectedEntities: string[];
  status: 'active' | 'superseded' | 'deprecated';
  supersedes?: string;
  supersededBy?: string;
  provenance: Provenance;
}

export interface ContextBundle {
  taskId: string;
  query: string;
  projectSummary: string;
  architecture: string;
  rules: string[];
  files: Array<{ path: string; summary: string }>;
  symbols: Array<{ name: string; kind: string; file: string }>;
  decisions: DecisionRecord[];
  provenance: Provenance[];
  tokenUsage: {
    estimatedTokens: number;
    budget: number;
  };
}
