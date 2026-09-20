/**
 * Canonical Project Intelligence & System State Dataset for Knovra Web Dashboard.
 * Represents the active state across all completed phases (Phases 01 - 12).
 */

export interface SystemService {
  name: string;
  subsystem: string;
  role: string;
  technology: string;
  port: number | string;
  status: 'healthy' | 'checking' | 'degraded';
  description: string;
}

export interface DecisionItem {
  id: string;
  title: string;
  status: 'accepted' | 'superseded' | 'proposed' | 'deprecated' | 'ACCEPTED' | 'SUPERSEDED' | 'PROPOSED' | 'DEPRECATED';
  phase: string;
  date: string;
  context: string;
  decision: string;
  consequences: string;
  alternatives?: Array<{ name: string; rejectedReason: string }>;
  supersededBy?: string;
  supersedes?: string;
  affectedFiles: string[];
}

export type ADR = DecisionItem;

export interface RuleItem {
  id: string;
  title?: string;
  name: string;
  category: 'architecture' | 'security' | 'convention' | 'project' | 'performance';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'error' | 'warning' | 'info';
  scope: string;
  instruction?: string;
  description: string;
  source?: string;
  enforcedSubsystems: string[];
}

export type Rule = RuleItem;

export interface AgentItem {
  id: string;
  name: string;
  type: string;
  harness?: string;
  model?: string;
  status: 'active' | 'idle';
  lastSeen: string;
  eventsEmitted: number;
  decisionsContributed: number;
  factsLearned: number;
  contextTokens?: number;
  sessionsCount?: number;
}

export type Agent = AgentItem;

export interface SessionFact {
  id?: string;
  type?: 'error' | 'solution' | 'insight' | 'decision';
  text?: string;
  statement: string;
  confidence: number;
  provenance: string;
}

export interface SessionItem {
  id: string;
  title?: string;
  topic: string;
  agent?: string;
  agentName: string;
  timestamp: string;
  turns?: number;
  summary?: string;
  facts: SessionFact[];
}

export type Session = SessionItem;

export interface CommitItem {
  hash: string;
  shortHash: string;
  author: string;
  date: string;
  subject: string;
  message: string;
  linkedAdr?: string;
  filesChanged: number;
  additions: number;
  deletions: number;
}

export type GitCommitItem = CommitItem;

export interface WorkspaceItem {
  id: string;
  name: string;
  path: string;
  language: string;
  primaryLanguage: string;
  role: string;
  filesCount: number;
  symbolsCount: number;
  status: 'active' | 'indexed' | 'scanning';
  activeBranch: string;
  lastIndexed: string;
}

export type Workspace = WorkspaceItem;

export interface ImpactScenarioDetail {
  id: string;
  targetSymbol: string;
  targetFile: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  affectedCallers: string[];
  downstreamFiles: string[];
  impactedTests: string[];
}

export interface ImpactScenario {
  target: string;
  targetType: string;
  confidence: number;
  executionMs: number;
  directImpacts: Array<{ name: string; type: string; reason: string; critical?: boolean }>;
  transitiveImpacts: Array<{ name: string; type: string; distance: number; reason: string }>;
  testsToRun: Array<{ testFile: string; priority: string; reason: string }>;
  criticalPaths: Array<{ path: string[]; risk: string; desc: string }>;
  governingDecisions: Array<{ id: string; title: string; reason: string }>;
}

export const KNOVRA_METRICS = {
  totalFiles: 284,
  totalSymbols: 14280,
  indexedSymbols: 14280,
  vectorChunks: 926,
  activeDecisions: 12,
  activeRules: 4,
  rulesCount: 4,
  agentSessions: 24,
  graphNodes: 412,
  graphEdges: 846,
  queryLatencyMs: 2.15,
  freshnessScore: 99.4,
};

export const METRICS = KNOVRA_METRICS;

export const SYSTEM_SERVICES: SystemService[] = [
  {
    name: 'Web Dashboard',
    subsystem: 'apps/web',
    role: 'Product UI & Graph Explorer',
    technology: 'Next.js 14 + React',
    port: 3000,
    status: 'healthy',
    description: 'Interactive product showcase, memory transfer simulator, and call hierarchy explorer.',
  },
  {
    name: 'Application API',
    subsystem: 'apps/api',
    role: 'SaaS Platform & Workspaces API',
    technology: 'NestJS + TypeScript',
    port: 4000,
    status: 'healthy',
    description: 'Tenancy, workspace credentials, organization management, and webhook ingress.',
  },
  {
    name: 'Runtime Daemon & CLI',
    subsystem: 'services/runtime',
    role: 'Local-First Orchestration & Watcher',
    technology: 'Go 1.22 + fsnotify',
    port: 8080,
    status: 'healthy',
    description: 'Differential filesystem watcher, hash cache, and MCP stdio gateway.',
  },
  {
    name: 'Code Indexer Engine',
    subsystem: 'services/code-indexer',
    role: 'AST Extraction & Call Graphs',
    technology: 'Rust 1.78 + Tree-sitter',
    port: 50051,
    status: 'healthy',
    description: 'High-speed incremental AST parsing across Go, Python, Rust, and TypeScript.',
  },
  {
    name: 'AI Context Engine',
    subsystem: 'services/context-engine',
    role: 'Semantic Memory & Impact Planner',
    technology: 'Python 3.11 + FastAPI + pgvector',
    port: 8000,
    status: 'healthy',
    description: '12-stage context planner, semantic vector retrieval, and graph-backed impact analysis.',
  },
  {
    name: 'PostgreSQL & pgvector',
    subsystem: 'infra/postgres',
    role: 'Transactional Truth & Vectors',
    technology: 'PostgreSQL 16 + pgvector',
    port: 5432,
    status: 'healthy',
    description: 'Cosine-distance embeddings index with 6-stage freshness lifecycle.',
  },
  {
    name: 'Neo4j Graph Database',
    subsystem: 'infra/neo4j',
    role: 'Context Graph & Provenance',
    technology: 'Neo4j 5 Community',
    port: 7474,
    status: 'healthy',
    description: 'AST call hierarchies, package boundaries, and ADR supersession lineage.',
  },
  {
    name: 'NATS JetStream',
    subsystem: 'infra/nats',
    role: 'Agent Event Streaming',
    technology: 'NATS 2.10',
    port: 4222,
    status: 'healthy',
    description: 'Pub/sub streaming event bus powering cross-agent continuous learning.',
  },
];

export const WORKSPACES: WorkspaceItem[] = [
  { id: 'ws-web', name: 'apps/web', path: 'apps/web', language: 'TypeScript (Next.js)', primaryLanguage: 'TypeScript', role: 'Product Dashboard & Showcase', filesCount: 38, symbolsCount: 142, status: 'active', activeBranch: 'feature/phase-13-web-dashboard', lastIndexed: '2 mins ago' },
  { id: 'ws-api', name: 'apps/api', path: 'apps/api', language: 'TypeScript (NestJS)', primaryLanguage: 'TypeScript', role: 'SaaS Platform & Workspaces API', filesCount: 42, symbolsCount: 210, status: 'indexed', activeBranch: 'develop', lastIndexed: '1 hour ago' },
  { id: 'ws-engine', name: 'services/context-engine', path: 'services/context-engine', language: 'Python 3.11 (FastAPI)', primaryLanguage: 'Python', role: 'Context Engine & Impact Brain', filesCount: 64, symbolsCount: 480, status: 'active', activeBranch: 'develop', lastIndexed: '15 mins ago' },
  { id: 'ws-runtime', name: 'services/runtime', path: 'services/runtime', language: 'Go 1.22', primaryLanguage: 'Go', role: 'Runtime Daemon, CLI & Watcher', filesCount: 52, symbolsCount: 390, status: 'active', activeBranch: 'develop', lastIndexed: '25 mins ago' },
  { id: 'ws-indexer', name: 'services/code-indexer', path: 'services/code-indexer', language: 'Rust 1.78', primaryLanguage: 'Rust', role: 'AST Code Intelligence Parser', filesCount: 28, symbolsCount: 215, status: 'indexed', activeBranch: 'develop', lastIndexed: '2 hours ago' },
  { id: 'ws-contracts', name: 'packages/contracts', path: 'packages/contracts', language: 'TypeScript', primaryLanguage: 'TypeScript', role: 'Type-Safe Protocol Definitions', filesCount: 18, symbolsCount: 120, status: 'indexed', activeBranch: 'develop', lastIndexed: '3 hours ago' },
  { id: 'ws-mcp', name: 'packages/mcp', path: 'packages/mcp', language: 'TypeScript', primaryLanguage: 'TypeScript', role: 'MCP Client & Tool Wrappers', filesCount: 24, symbolsCount: 165, status: 'indexed', activeBranch: 'develop', lastIndexed: '4 hours ago' },
  { id: 'ws-config', name: 'packages/config', path: 'packages/config', language: 'TypeScript', primaryLanguage: 'TypeScript', role: 'Shared Configuration Tokens', filesCount: 18, symbolsCount: 120, status: 'indexed', activeBranch: 'develop', lastIndexed: '5 hours ago' },
];

export const DECISIONS: DecisionItem[] = [
  {
    id: 'ADR-001',
    title: 'Polyglot Monorepo Architecture',
    status: 'accepted',
    phase: 'Phase 01',
    date: '2026-09-08',
    context: 'Knovra requires extreme AST parsing speed (Rust), local concurrency and CLI ergonomics (Go), and rich ML/embedding context processing (Python).',
    decision: 'Adopt a single polyglot monorepo partitioned into services/ with shared contracts.',
    consequences: 'Enables each engine to leverage its optimal language while preserving atomic versioning and shared CI/CD gates.',
    affectedFiles: ['package.json', 'infra/docker/docker-compose.yml', 'docs/GIT_RULES.md'],
  },
  {
    id: 'ADR-002',
    title: 'Raw SQLite Embedded Store',
    status: 'superseded',
    phase: 'Phase 02',
    date: '2026-09-08',
    context: 'Initial local storage prototype for file hashes and AST symbol cache.',
    decision: 'Use embedded SQLite database via CGo.',
    consequences: 'Encountered concurrency bottlenecks and lack of high-dimensional vector search support.',
    supersededBy: 'ADR-007',
    affectedFiles: ['services/runtime/internal/storage/sqlite.go'],
  },
  {
    id: 'ADR-003',
    title: 'Tree-sitter AST Multi-Language Parsing in Rust',
    status: 'accepted',
    phase: 'Phase 03',
    date: '2026-09-08',
    context: 'Knovra must extract function signatures, classes, imports, and calls across Go, Python, Rust, and TypeScript under 500ms.',
    decision: 'Implement knovra-core in Rust using Tree-sitter C bindings.',
    consequences: 'Sub-millisecond AST extraction per file with SHA-256 content hashing.',
    affectedFiles: ['services/code-indexer/Cargo.toml', 'services/code-indexer/src/main.rs'],
  },
  {
    id: 'ADR-004',
    title: 'Model Context Protocol (MCP) Standard for Agent Gateway',
    status: 'accepted',
    phase: 'Phase 04',
    date: '2026-09-08',
    context: 'Heterogeneous AI agents (Claude, Codex, Cursor, Windsurf) need a unified communication protocol to request context.',
    decision: 'Implement Anthropic Model Context Protocol (MCP) over stdio and HTTP JSON-RPC.',
    consequences: 'All AI agent harnesses consume Knovra context without proprietary plugin adapters.',
    affectedFiles: ['services/runtime/internal/mcp/gateway.go', 'packages/contracts/src/mcp.ts'],
  },
  {
    id: 'ADR-005',
    title: 'PostgreSQL with pgvector for Semantic Storage',
    status: 'accepted',
    phase: 'Phase 05',
    date: '2026-09-08',
    context: 'Need persistent vector storage that supports cosine distance search alongside relational ACID metadata.',
    decision: 'Use PostgreSQL 16 with the official pgvector extension.',
    consequences: 'Combines transactional safety with sub-second vector queries without needing a separate standalone vector cluster.',
    affectedFiles: ['services/context-engine/app/storage/vector_store.py'],
  },
  {
    id: 'ADR-006',
    title: 'Immutable Decision Records & Rule Governance',
    status: 'accepted',
    phase: 'Phase 06',
    date: '2026-09-08',
    context: 'AI agents frequently rewrite or disregard historical architectural decisions.',
    decision: 'Enforce immutable ADRs in Neo4j with explicit supersession edges (SUPERSEDES).',
    consequences: 'Historical context is preserved; agents can inspect the lineage of why an architecture evolved.',
    affectedFiles: ['services/context-engine/app/adrs/registry.py', 'docs/GIT_RULES.md'],
  },
  {
    id: 'ADR-007',
    title: 'Polyglot Persistence Architecture with Neo4j and PostgreSQL',
    status: 'accepted',
    phase: 'Phase 07',
    date: '2026-09-09',
    context: 'Replacing SQLite prototype to support graph traversals for call hierarchies and pgvector for semantic embeddings.',
    decision: 'Dual persistence: Neo4j for provenance/call hierarchy graphs, PostgreSQL for vector embeddings.',
    consequences: 'Optimal performance for both high-dimensional vector search and deep graph traversals.',
    supersedes: 'ADR-002',
    affectedFiles: ['infra/docker/docker-compose.yml', 'services/code-indexer/src/storage.rs'],
  },
  {
    id: 'ADR-008',
    title: 'Multi-Tier Context Planner with Bounded Token Budgets',
    status: 'accepted',
    phase: 'Phase 08',
    date: '2026-09-09',
    context: 'Agent context windows are finite and expensive. Naive dumping of repositories causes hallucinations and cost spikes.',
    decision: 'Implement greedy token-budget packing: Invariants > ADRs > Call Signatures > Session Facts.',
    consequences: 'Context is deterministically bounded to exact requested token limits (e.g. 8000 tokens).',
    affectedFiles: ['services/context-engine/app/planner.py'],
  },
  {
    id: 'ADR-009',
    title: 'Universal Agent Gateway over Stdio and TCP',
    status: 'accepted',
    phase: 'Phase 09',
    date: '2026-09-09',
    context: 'CLI tools and local IDE extensions require zero-config stdio MCP execution alongside networked TCP.',
    decision: 'Runtime daemon supports dual mode: stdio for direct sub-process agent invocation and TCP for remote hosts.',
    consequences: 'Agents connect with zero latency via local pipes or secure loopback.',
    affectedFiles: ['services/runtime/cmd/server/main.go'],
  },
  {
    id: 'ADR-010',
    title: 'NATS JetStream for Agent Telemetry & Learning',
    status: 'accepted',
    phase: 'Phase 10',
    date: '2026-09-09',
    context: 'Multiple agents working concurrently generate events (file changes, test runs, prompt feedback) requiring pub/sub distribution.',
    decision: 'Adopt NATS JetStream as the durable, low-latency agent event bus.',
    consequences: 'Sub-millisecond pub/sub streaming enabling agents to learn from peer agent actions in real time.',
    affectedFiles: ['services/runtime/internal/events/nats.go'],
  },
  {
    id: 'ADR-011',
    title: 'Differential File Watcher with 6-Property Freshness',
    status: 'accepted',
    phase: 'Phase 11',
    date: '2026-09-09',
    context: 'Continuous full-repository rescans waste CPU and trigger redundant re-embeddings.',
    decision: 'Differential fsnotify watcher tracking SHA-256 hash, mtime, and 6-stage freshness lifecycle.',
    consequences: 'Sub-second incremental index updates upon file save without full workspace scans.',
    affectedFiles: ['services/runtime/internal/watcher/fs_watcher.go'],
  },
  {
    id: 'ADR-012',
    title: 'Graph-Backed Deterministic Impact Analysis',
    status: 'accepted',
    phase: 'Phase 12',
    date: '2026-09-09',
    context: 'Before making code edits, agents must know the upstream blast radius and required test targets.',
    decision: 'Combine Rust call hierarchy extraction with Python graph impact engine to calculate risk and affected callers.',
    consequences: 'Sub-5ms blast radius calculation with zero hallucinations and verified test suites.',
    affectedFiles: ['services/context-engine/app/impact/analyzer.py', 'services/runtime/internal/impact/analyzer.go'],
  },
];

export const ADRS = DECISIONS;

export const RULES: RuleItem[] = [
  {
    id: 'RULE-001',
    name: 'Zero Secrets in Code or Logs',
    title: 'Zero Secrets in Code or Logs',
    severity: 'error',
    enforcedSubsystems: ['apps/web', 'services/runtime', 'services/context-engine'],
    description: 'All vector embeddings, agent transcripts, and log statements must be sanitized for API tokens and private keys.',
    category: 'security',
    scope: 'global',
    instruction: 'Zero secret leakage across agent and vector boundaries',
    source: 'Invariant #6',
  },
  {
    id: 'RULE-002',
    name: 'Immutable ADR Modifications',
    title: 'Immutable ADR Modifications',
    severity: 'error',
    enforcedSubsystems: ['services/context-engine', 'docs/adrs'],
    description: 'Accepted Architectural Decision Records cannot be mutated. Architectural evolution requires creating superseding records.',
    category: 'architecture',
    scope: 'docs/adrs',
    instruction: 'Never delete or rewrite an accepted ADR. Use supersededBy pointer.',
    source: 'Invariant #3',
  },
  {
    id: 'RULE-003',
    name: 'Maximum Circular Dependency Limit',
    title: 'Maximum Circular Dependency Limit',
    severity: 'warning',
    enforcedSubsystems: ['services/code-indexer', 'services/runtime'],
    description: 'Call graph cycles between distinct subsystems are rejected to maintain clear component boundaries and fast builds.',
    category: 'architecture',
    scope: 'services/*',
    instruction: 'Subsystem dependency graph must remain an acyclic DAG.',
    source: 'Architecture Spec',
  },
  {
    id: 'RULE-004',
    name: 'Maximum Call Graph Traversal Depth',
    title: 'Maximum Call Graph Traversal Depth',
    severity: 'info',
    enforcedSubsystems: ['services/runtime', 'services/code-indexer'],
    description: 'Impact queries default to 3 traversal hops to bound computation latency strictly under 5 milliseconds.',
    category: 'performance',
    scope: 'impact-analysis',
    instruction: 'Limit default BFS traversal depth to 3 hops.',
    source: 'Phase 12 Spec',
  },
];

export const AGENTS: AgentItem[] = [
  {
    id: 'agent-codex-01',
    name: 'Codex Autonomous Agent',
    type: 'Codex / GPT-4o',
    harness: 'OpenAI Code Interpreter',
    model: 'gpt-4o-2024-08-06',
    status: 'active',
    lastSeen: '1 minute ago',
    eventsEmitted: 142,
    decisionsContributed: 4,
    factsLearned: 18,
    contextTokens: 18450,
    sessionsCount: 8,
  },
  {
    id: 'agent-claude-02',
    name: 'Claude Code Agent',
    type: 'Claude 3.5 Sonnet',
    harness: 'Anthropic Agent Harness',
    model: 'claude-3-5-sonnet-20241022',
    status: 'active',
    lastSeen: 'Just now',
    eventsEmitted: 289,
    decisionsContributed: 6,
    factsLearned: 32,
    contextTokens: 24600,
    sessionsCount: 12,
  },
  {
    id: 'agent-cursor-03',
    name: 'Cursor Composer Agent',
    type: 'Cursor IDE Assistant',
    harness: 'Cursor Extension / MCP',
    model: 'claude-3-5-sonnet',
    status: 'idle',
    lastSeen: '25 minutes ago',
    eventsEmitted: 87,
    decisionsContributed: 2,
    factsLearned: 11,
    contextTokens: 12100,
    sessionsCount: 4,
  },
  {
    id: 'agent-windsurf-04',
    name: 'Windsurf Cascade Agent',
    type: 'Codeium Cascade Harness',
    harness: 'Windsurf MCP Gateway',
    model: 'cascade-v1',
    status: 'idle',
    lastSeen: '1 hour ago',
    eventsEmitted: 54,
    decisionsContributed: 0,
    factsLearned: 7,
    contextTokens: 8900,
    sessionsCount: 2,
  },
];

export const SESSIONS: SessionItem[] = [
  {
    id: 'sess-transfer-01',
    title: 'Resilient Vector Fallback & Offline Engine',
    topic: 'Resilient Vector Fallback & Offline Engine',
    agent: 'Codex Autonomous Agent',
    agentName: 'Codex Autonomous Agent',
    timestamp: '2026-09-09 10:45:12',
    turns: 8,
    summary: 'Codex validated that when PostgreSQL is unreachable, the system transparently falls back to in-memory cosine similarity.',
    facts: [
      {
        id: 'fact-01',
        type: 'solution',
        text: 'PostgreSQL connection failure automatically engages InMemoryVectorStore with sub-2ms cosine similarity.',
        statement: 'PostgreSQL connection failure automatically engages InMemoryVectorStore with sub-2ms cosine similarity.',
        confidence: 0.98,
        provenance: 'services/context-engine/app/storage/vector_store.py:L142',
      },
      {
        id: 'fact-02',
        type: 'decision',
        text: 'Context planner enforces strict 8000 token budget prioritizing Invariants > ADRs > Signatures.',
        statement: 'Context planner enforces strict 8000 token budget prioritizing Invariants > ADRs > Signatures.',
        confidence: 0.96,
        provenance: 'services/context-engine/app/planner.py:L78',
      },
    ],
  },
  {
    id: 'sess-transfer-02',
    title: 'Impact Analysis Graph Traversal Verification',
    topic: 'Impact Analysis Graph Traversal Verification',
    agent: 'Claude Code Agent',
    agentName: 'Claude Code Agent',
    timestamp: '2026-09-09 11:15:30',
    turns: 6,
    summary: 'Claude verified blast radius calculation and test target identification on watcher package changes.',
    facts: [
      {
        id: 'fact-03',
        type: 'insight',
        text: 'Change to ComputeDelta propagates upstream to fs_watcher.go and requires running watcher_test.go.',
        statement: 'Change to ComputeDelta propagates upstream to fs_watcher.go and requires running watcher_test.go.',
        confidence: 0.99,
        provenance: 'services/runtime/internal/watcher/fs_watcher.go:L55',
      },
      {
        id: 'fact-04',
        type: 'decision',
        text: 'ADR-0012 dictates deterministic risk calculation and test suite inference for all file edits.',
        statement: 'ADR-0012 dictates deterministic risk calculation and test suite inference for all file edits.',
        confidence: 0.97,
        provenance: 'docs/adrs/ADR-0012.md:L18',
      },
    ],
  },
];

export const RECENT_COMMITS: CommitItem[] = [
  {
    hash: 'dd7cc75',
    shortHash: 'dd7cc75',
    author: 'Akshay Kumar',
    date: '2026-09-09',
    subject: 'feat(impact): implement Graph-Backed Impact Analysis Engine (Phase 12)',
    message: 'feat(impact): implement Graph-Backed Impact Analysis Engine (Phase 12)',
    linkedAdr: 'ADR-0012',
    filesChanged: 15,
    additions: 2504,
    deletions: 5,
  },
  {
    hash: '22ae025',
    shortHash: '22ae025',
    author: 'Akshay Kumar',
    date: '2026-09-09',
    subject: 'feat(incremental): implement Incremental Indexing & Freshness lifecycle (Phase 11)',
    message: 'feat(incremental): implement Incremental Indexing & Freshness lifecycle (Phase 11)',
    linkedAdr: 'ADR-0011',
    filesChanged: 12,
    additions: 1840,
    deletions: 12,
  },
  {
    hash: '03f41af',
    shortHash: '03f41af',
    author: 'Akshay Kumar',
    date: '2026-09-09',
    subject: 'feat(events): implement Agent Event System & Continuous Learning (Phase 10)',
    message: 'feat(events): implement Agent Event System & Continuous Learning (Phase 10)',
    linkedAdr: 'ADR-0010',
    filesChanged: 14,
    additions: 2110,
    deletions: 8,
  },
  {
    hash: '3e1cb02',
    shortHash: '3e1cb02',
    author: 'Akshay Kumar',
    date: '2026-09-09',
    subject: 'feat(mcp): implement Universal MCP Gateway (Phase 09)',
    message: 'feat(mcp): implement Universal MCP Gateway (Phase 09)',
    linkedAdr: 'ADR-0005',
    filesChanged: 11,
    additions: 1650,
    deletions: 4,
  },
];

export const IMPACT_SCENARIOS: ImpactScenarioDetail[] = [
  {
    id: 'sc-auth',
    targetSymbol: 'AuthInterceptor.authenticate',
    targetFile: 'services/runtime/internal/auth/interceptor.go',
    riskLevel: 'critical',
    affectedCallers: [
      'GatewayServer.HandleToolCall',
      'DaemonServer.ServeHTTP',
      'CLIClient.ExecuteWithAuth',
    ],
    downstreamFiles: [
      'services/runtime/internal/auth/validator.go',
      'services/runtime/internal/auth/token_cache.go',
      'packages/contracts/src/auth.ts',
    ],
    impactedTests: [
      'services/runtime/internal/auth/auth_test.go',
      'services/runtime/tests/integration/gateway_test.go',
    ],
  },
  {
    id: 'sc-hierarchy',
    targetSymbol: 'StorageEngine.query_hierarchy',
    targetFile: 'services/code-indexer/src/storage.rs',
    riskLevel: 'high',
    affectedCallers: [
      'ImpactAnalyzer.AnalyzeBlastRadius',
      'IndexServer.QueryHierarchy',
      'Neo4jDriver.ExecuteTraversal',
    ],
    downstreamFiles: [
      'services/code-indexer/src/parser.rs',
      'services/context-engine/app/impact/analyzer.py',
    ],
    impactedTests: [
      'services/code-indexer/tests/storage_test.rs',
      'services/context-engine/tests/test_impact_analysis.py',
    ],
  },
  {
    id: 'sc-delta',
    targetSymbol: 'ComputeDelta',
    targetFile: 'services/runtime/internal/watcher/models.go',
    riskLevel: 'medium',
    affectedCallers: [
      'services/runtime/internal/watcher/fs_watcher.go:ScanDiff',
      'services/runtime/internal/watcher/invalidator.go:Invalidate',
    ],
    downstreamFiles: [
      'services/runtime/cmd/knovra/main.go',
      'services/runtime/internal/watcher/cache.go',
    ],
    impactedTests: [
      'services/runtime/internal/watcher/watcher_test.go',
    ],
  },
];
