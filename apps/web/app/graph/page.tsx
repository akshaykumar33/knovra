'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useDialogFocus } from '../../components/useDialogFocus';
import Link from 'next/link';
import { AuroraGlow } from '../../components/AuroraGlow';
import { fireMicroSparkle } from '../../lib/confetti';
import { CodeSnippet } from '../../components/ui/CodeSnippet';
import {
  Network,
  Search,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  Code2,
  FileCode,
  Shield,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  SlidersHorizontal,
  FolderTree,
  Filter,
  Check,
  Copy,
  Terminal,
  Database,
  ShieldAlert,
  Cpu,
  Boxes,
  Compass,
  Eye,
  Info,
  ChevronRight,
  ChevronDown,
  X,
  Play,
  Pause,
  Zap,
} from 'lucide-react';

// ============================================================================
// GRAPH TYPES & TAXONOMY (Prompt 5 Section 14 & 35)
// ============================================================================
export type NodeCategory = 'service' | 'function' | 'rule' | 'database' | 'skill';
export type EdgeType = 'CALLS' | 'GOVERNED_BY' | 'QUERIES' | 'IMPORTS' | 'APPLIES_SKILL';
export type LayoutMode = 'hierarchical' | 'radial' | 'force';

export interface GraphNode {
  id: string;
  name: string;
  category: NodeCategory;
  kind: string;
  file: string;
  language: string;
  tokens: number;
  description: string;
  x: number;
  y: number;
  callers: string[];
  callees: string[];
  rules: string[];
  astSnippet: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label: string;
}

// Canonical Graph Nodes Dataset
const INITIAL_NODES: GraphNode[] = [
  {
    id: 'AnalyzeBlastRadius',
    name: 'ImpactAnalyzer.AnalyzeBlastRadius',
    category: 'function',
    kind: 'method',
    file: 'services/runtime/internal/impact/analyzer.go',
    language: 'Go',
    tokens: 480,
    description: 'Traverses Neo4j multi-hop call graphs to calculate blast radius for pull requests.',
    x: 480,
    y: 220,
    callers: ['GatewayServer', 'cmd/knovra/impact.go'],
    callees: ['query_hierarchy', 'RULE-001', 'RULE-004'],
    rules: ['RULE-001 (Zero Secret Leakage)', 'RULE-004 (Call Depth Threshold)'],
    astSnippet: `func (a *ImpactAnalyzer) AnalyzeBlastRadius(ctx context.Context, req *BlastRadiusRequest) (*BlastRadiusResponse, error) {
    callers, err := a.storage.QueryHierarchy(ctx, req.Symbol, req.MaxDepth)
    if err != nil { return nil, err }
    violations := a.rules.FilterViolations(callers)
    return &BlastRadiusResponse{DirectCallers: callers, Violations: violations}, nil
}`,
  },
  {
    id: 'query_hierarchy',
    name: 'StorageEngine.query_hierarchy',
    category: 'function',
    kind: 'method',
    file: 'services/code-indexer/src/storage.rs',
    language: 'Rust',
    tokens: 520,
    description: 'High-performance zero-copy hierarchy retrieval from local embedded Neo4j graph.',
    x: 770,
    y: 190,
    callers: ['AnalyzeBlastRadius', 'IndexServer.QueryHierarchy'],
    callees: ['Neo4jDriver'],
    rules: ['RULE-002 (Immutable Decision History)'],
    astSnippet: `pub async fn query_hierarchy(&self, symbol: &str, depth: u32) -> Result<HierarchyResult, StorageError> {
    let cypher = "MATCH (n:Symbol {name: $s})-[r:CALLS*1..$d]->(m) RETURN n,r,m";
    let rows = self.driver.execute_cypher(cypher, params!{ "s" => symbol, "d" => depth }).await?;
    Ok(HierarchyResult::from_rows(rows))
}`,
  },
  {
    id: 'plan_context',
    name: 'ContextPlanner.plan_context',
    category: 'function',
    kind: 'method',
    file: 'services/context-engine/app/planner.py',
    language: 'Python',
    tokens: 410,
    description: 'Evaluates task prompt embeddings against topological graph distance to synthesize ContextBundle.',
    x: 480,
    y: 390,
    callers: ['GatewayServer'],
    callees: ['pgvector_search', 'tenant_safe_query'],
    rules: ['RULE-003 (Provenanced Context Ingestion)'],
    astSnippet: `async def plan_context(self, task: TaskIntent, budget: int = 8000) -> ContextBundle:
    graph_slice = await self.traversal.traverse_subgraph(task.domain, max_hops=3)
    rules = await self.rule_engine.resolve_applicable(graph_slice)
    return self.compiler.compile(graph_slice, rules, token_budget=budget)`,
  },
  {
    id: 'authenticate',
    name: 'AuthInterceptor.authenticate',
    category: 'function',
    kind: 'method',
    file: 'services/runtime/internal/auth/interceptor.go',
    language: 'Go',
    tokens: 280,
    description: 'Validates local Unix domain socket IPC credentials and enforces tenant isolation.',
    x: 190,
    y: 140,
    callers: ['GatewayServer'],
    callees: ['RULE-001'],
    rules: ['RULE-001 (Zero Secret Leakage)'],
    astSnippet: `func (i *AuthInterceptor) Authenticate(ctx context.Context, ucred *syscall.Ucred) error {
    if ucred.Uid != os.Getuid() { return ErrUnauthorizedLocalProcess }
    return nil
}`,
  },
  {
    id: 'GatewayServer',
    name: 'RuntimeGatewayServer',
    category: 'service',
    kind: 'daemon',
    file: 'services/runtime/cmd/server.go',
    language: 'Go',
    tokens: 360,
    description: 'Local IPC and MCP JSON-RPC gateway orchestrating all agent and IDE connections.',
    x: 190,
    y: 290,
    callers: ['AgentClient', 'ClaudeCodeHarness'],
    callees: ['AnalyzeBlastRadius', 'plan_context', 'authenticate', 'RULE-001'],
    rules: ['RULE-001 (Zero Secret Leakage)', 'RULE-004 (Call Depth Threshold)'],
    astSnippet: `type GatewayServer struct {
    impact   *ImpactAnalyzer
    planner  *ContextPlanner
    storage  *StorageEngine
    listener net.Listener
}`,
  },
  {
    id: 'Neo4jDriver',
    name: 'Embedded Neo4j Engine',
    category: 'database',
    kind: 'graph_db',
    file: 'storage/neo4j/cypher_engine',
    language: 'Cypher',
    tokens: 150,
    description: 'Local embedded graph database containing repository AST symbols, callers, and callees.',
    x: 1040,
    y: 190,
    callers: ['query_hierarchy'],
    callees: [],
    rules: ['RULE-002 (Immutable Decision History)'],
    astSnippet: `CREATE INDEX FOR (s:Symbol) ON (s.name, s.file);
MATCH (caller:Function)-[:CALLS]->(callee:Function) RETURN caller, callee;`,
  },
  {
    id: 'pgvector_search',
    name: 'pgvector Similarity DB',
    category: 'database',
    kind: 'vector_db',
    file: 'storage/vector/embedding_store',
    language: 'SQL',
    tokens: 180,
    description: 'Locally generated embeddings of symbol documentation, ADRs, and commit messages.',
    x: 770,
    y: 440,
    callers: ['plan_context'],
    callees: [],
    rules: ['RULE-003 (Provenanced Context Ingestion)'],
    astSnippet: `SELECT symbol, 1 - (embedding <=> $query_vec) AS similarity 
FROM symbol_embeddings ORDER BY similarity DESC LIMIT 10;`,
  },
  {
    id: 'RULE-001',
    name: 'RULE-001: Zero Secret Leakage',
    category: 'rule',
    kind: 'invariant',
    file: 'rules/security/zero_secret_leakage.rego',
    language: 'Rego',
    tokens: 95,
    description: 'Strict security invariant preventing any bearer tokens, API keys, or private salts from entering context.',
    x: 340,
    y: 60,
    callers: ['AnalyzeBlastRadius', 'authenticate', 'GatewayServer'],
    callees: [],
    rules: [],
    astSnippet: `package knovra.security
default allow = false
allow { not contains_secret_pattern(input.content) }`,
  },
  {
    id: 'RULE-004',
    name: 'RULE-004: Call Depth Threshold',
    category: 'rule',
    kind: 'governance',
    file: 'rules/architecture/depth_limit.rego',
    language: 'Rego',
    tokens: 110,
    description: 'Restricts recursive graph call expansions to max depth 4 to guarantee bounded context size.',
    x: 680,
    y: 60,
    callers: ['AnalyzeBlastRadius'],
    callees: [],
    rules: [],
    astSnippet: `package knovra.architecture
max_depth = 4
valid_traversal { input.depth <= max_depth }`,
  },
  {
    id: 'tenant_safe_query',
    name: 'skill: tenant-safe-query',
    category: 'skill',
    kind: 'skill',
    file: 'skills/database/tenant_safe_query.md',
    language: 'Markdown',
    tokens: 210,
    description: 'Agent behavioral skill enforcing mandatory tenant isolation clauses in dynamic Cypher/SQL queries.',
    x: 770,
    y: 320,
    callers: ['plan_context'],
    callees: [],
    rules: ['RULE-001'],
    astSnippet: `### Directive: Tenant Safe Query
Always append 'WHERE tenant_id = :tenant_id' to any Cypher or relational query.
Reject queries attempting wildcard cross-tenant scans.`,
  },
];

const INITIAL_EDGES: GraphEdge[] = [
  { id: 'e1', source: 'GatewayServer', target: 'authenticate', type: 'CALLS', label: 'validates' },
  { id: 'e2', source: 'GatewayServer', target: 'AnalyzeBlastRadius', type: 'CALLS', label: 'invokes' },
  { id: 'e3', source: 'GatewayServer', target: 'plan_context', type: 'CALLS', label: 'orchestrates' },
  { id: 'e4', source: 'AnalyzeBlastRadius', target: 'query_hierarchy', type: 'CALLS', label: 'queries hierarchy' },
  { id: 'e5', source: 'query_hierarchy', target: 'Neo4jDriver', type: 'QUERIES', label: 'cypher exec' },
  { id: 'e6', source: 'plan_context', target: 'pgvector_search', type: 'QUERIES', label: 'vector match' },
  { id: 'e7', source: 'plan_context', target: 'tenant_safe_query', type: 'APPLIES_SKILL', label: 'loads skill' },
  { id: 'e8', source: 'AnalyzeBlastRadius', target: 'RULE-001', type: 'GOVERNED_BY', label: 'governed by' },
  { id: 'e9', source: 'AnalyzeBlastRadius', target: 'RULE-004', type: 'GOVERNED_BY', label: 'governed by' },
  { id: 'e10', source: 'authenticate', target: 'RULE-001', type: 'GOVERNED_BY', label: 'governed by' },
  { id: 'e11', source: 'GatewayServer', target: 'RULE-001', type: 'GOVERNED_BY', label: 'governed by' },
];

export default function GraphExplorerPage() {
  const [nodes, setNodes] = useState<GraphNode[]>(INITIAL_NODES);
  const [edges] = useState<GraphEdge[]>(INITIAL_EDGES);

  const [selectedNodeId, setSelectedNodeId] = useState<string>('AnalyzeBlastRadius');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [depth, setDepth] = useState<number>(2);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('hierarchical');
  const [focusMode, setFocusMode] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSimulatingTrace, setIsSimulatingTrace] = useState(false);

  // Dragging Node State
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Responsive Canvas Zoom & Pan
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 20, y: 20 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Mobile Drawer State
  const symbolSearchRef = useRef<HTMLInputElement>(null);
  const [inspectorOpenMobile, setInspectorOpenMobile] = useState(false);
  const inspectorDialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(inspectorOpenMobile, inspectorDialogRef);
  useEffect(() => {
    if (!inspectorOpenMobile) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setInspectorOpenMobile(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [inspectorOpenMobile]);

  const canvasRef = useRef<SVGSVGElement>(null);
  const fitCanvas = () => {
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const scale = Math.min((bounds.width - 40) / 1200, (bounds.height - 100) / 560, 1);
    setZoom(Math.max(.2, scale));
    setPan({x:20,y:60});
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(fitCanvas);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Selected node object
  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  }, [nodes, selectedNodeId]);

  // Neighborhood: set of node IDs directly connected to selected or hovered node
  const activeTargetId = hoveredNodeId || selectedNodeId;
  const neighborhoodNodeIds = useMemo(() => {
    const s = new Set<string>();
    s.add(activeTargetId);
    edges.forEach((e) => {
      if (e.source === activeTargetId) s.add(e.target);
      if (e.target === activeTargetId) s.add(e.source);
    });
    return s;
  }, [activeTargetId, edges]);

  // Filtered nodes based on search and category
  const filteredNodes = useMemo(() => {
    return nodes.filter((n) => {
      if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return n.name.toLowerCase().includes(q) || n.file.toLowerCase().includes(q) || n.kind.toLowerCase().includes(q);
      }
      return true;
    });
  }, [nodes, categoryFilter, search]);

  // Handle Canvas Pan & Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !draggingNodeId) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      const svgRect = canvasRef.current?.getBoundingClientRect();
      if (!svgRect) return;
      const mouseX = (e.clientX - svgRect.left - pan.x) / zoom;
      const mouseY = (e.clientY - svgRect.top - pan.y) / zoom;
      setNodes((prevNodes) =>
        prevNodes.map((n) =>
          n.id === draggingNodeId ? { ...n, x: Math.round(mouseX), y: Math.round(mouseY) } : n
        )
      );
    } else if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setSelectedNodeId(nodeId);
    }
  };

  const handleZoomIn = () => setZoom((z) => Math.min(1.9, z + 0.15));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, z - 0.15));
  const handleResetView = () => {
    fitCanvas();
    
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedNode.astSnippet);
    setCopied(true);
    fireMicroSparkle(0.85, 0.25);
    setTimeout(() => setCopied(false), 1500);
  };

  // Helper colors based on node category
  const getCategoryColor = (cat: NodeCategory) => {
    switch (cat) {
      case 'function':
        return '#06B6D4'; // Electric Cyan
      case 'service':
        return '#3B82F6'; // Royal Blue
      case 'rule':
        return '#10B981'; // Cyber Emerald
      case 'database':
        return '#8B5CF6'; // Ultraviolet
      case 'skill':
        return '#F59E0B'; // Amber
      default:
        return 'var(--accent-primary)';
    }
  };

  return (
    <div className="graph-studio" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: 'calc(100vh - 130px)', position: 'relative' }}>
      <AuroraGlow />
      {/* Top Header & Breadcrumb Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <header className="studio-heading">
          <span className="eyebrow-serif" style={{ display: 'block', marginBottom: '6px' }}>NEO4J & AST TOPOLOGY</span>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(30px, 3vw, 42px)' }}>
            Code <span className="font-calligraphy text-gradient-aurora">Graph</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '15px' }}>
            Traverse multi-hop relationships between services, concrete syntax trees, and governance rules.
          </p>
          <span className="glass-pill" style={{ marginTop: '10px', fontSize: '11px', padding: '3px 10px' }}>
            <span className="pulsing-dot" style={{ width: 5, height: 5 }} />
            Neo4j Engine • {nodes.length} Active Nodes • {edges.length} Ingested Edges
          </span>
        </header>

        {/* Global Toolbar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button type="button" className="graph-browse" aria-expanded={showSymbols} onClick={()=>setShowSymbols(s=>!s)}>Browse symbols</button>
          {/* Simulate Call Trace Button */}
          <button
            type="button"
            onClick={() => setIsSimulatingTrace(!isSimulatingTrace)}
            className="knovra-btn-secondary knovra-btn-xs"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: isSimulatingTrace ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderColor: isSimulatingTrace ? 'var(--accent-primary)' : 'var(--border-default)',
            }}
          >
            {isSimulatingTrace ? <Pause size={13} /> : <Play size={13} />}
            <span>{isSimulatingTrace ? 'Live Energy Stream' : 'Stream Paused'}</span>
          </button>

          {/* Depth Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'var(--bg-secondary)',
              padding: '3px 8px',
              borderRadius: '8px',
              border: '1px solid var(--border-default)',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Depth:</span>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1, 2, 3, 4].map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDepth(d)}
                  style={{
                    width: 26,
                    height: 24,
                    borderRadius: '4px',
                    backgroundColor: depth === d ? 'var(--accent-primary)' : 'transparent',
                    color: depth === d ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Layout Selector */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.3rem',
              backgroundColor: 'var(--bg-secondary)',
              padding: '3px 6px',
              borderRadius: '8px',
              border: '1px solid var(--border-default)',
            }}
            className="layout-mode-picker"
          >
            {(['hierarchical', 'radial', 'force'] as LayoutMode[]).map((mode) => (
              <button
                type="button"
                key={mode}
                onClick={() => setLayoutMode(mode)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: layoutMode === mode ? 700 : 500,
                  backgroundColor: layoutMode === mode ? 'var(--bg-tertiary)' : 'transparent',
                  color: layoutMode === mode ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Mobile Drawer Toggles */}
          <button
            type="button"
            onClick={() => setShowSymbols(s=>!s)}
            className="knovra-btn-secondary knovra-btn-xs mobile-btn-only"
            style={{ display: 'none' }}
          >
            <FolderTree size={14} />
            <span>Symbol list</span>
          </button>

          <button
            type="button"
            onClick={() => setInspectorOpenMobile(!inspectorOpenMobile)}
            className="knovra-btn-secondary knovra-btn-xs mobile-btn-only"
            style={{ display: 'none' }}
          >
            <SlidersHorizontal size={14} />
            <span>Inspector</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SIGNATURE 3-PANE EXPLORER LAYOUT (Prompt 5 Section 14 & Prompt 6 Section 26)
          ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: focusMode ? '1fr' : '290px 1fr 360px',
          gap: '1rem',
          alignItems: 'stretch',
          position: 'relative',
        }}
        className="graph-3pane-container"
      >
        {/* =======================================================================
            PANE 1: LEFT REPOSITORY SUBSYSTEMS & SYMBOLS TREE
            ======================================================================= */}
        {!focusMode && showSymbols && (
          <aside
            className="glass-panel-luxury graph-sidebar-pane"
            style={{
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              height: '700px',
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                ref={symbolSearchRef}
                aria-label="Filter symbols and rules"
                type="text"
                placeholder="Filter symbols & rules..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 32px',
                  fontSize: '0.8rem',
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                }}
              />
            </div>

            {/* Category Filter Chips */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {(['all', 'function', 'service', 'rule', 'database', 'skill'] as const).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '5px',
                    fontSize: '0.75rem',
                    fontWeight: categoryFilter === cat ? 700 : 500,
                    backgroundColor: categoryFilter === cat ? 'var(--bg-secondary)' : 'transparent',
                    border: `1px solid ${categoryFilter === cat ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    color: categoryFilter === cat ? 'var(--accent-primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Subsystem Symbol List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '2px',
                }}
              >
                Indexed Nodes ({filteredNodes.length})
              </div>

              {filteredNodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const catColor = getCategoryColor(node.category);
                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      if (window.matchMedia('(max-width: 760px)').matches) setInspectorOpenMobile(true);
                    }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isSelected ? 'var(--bg-secondary)' : 'var(--bg-card)',
                      border: `1.5px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 0 16px var(--accent-glow)' : 'none',
                    }}
                    className="knovra-card-interactive"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: catColor,
                            flexShrink: 0,
                            boxShadow: `0 0 6px ${catColor}`,
                          }}
                        />
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            fontFamily: 'var(--font-mono)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '160px',
                          }}
                        >
                          {node.id}
                        </span>
                      </div>
                      <span
                        className="knovra-badge"
                        style={{
                          fontSize: '0.75rem',
                          padding: '1px 5px',
                          backgroundColor: `${catColor}20`,
                          color: catColor,
                          border: `1px solid ${catColor}50`,
                        }}
                      >
                        {node.category}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {node.file.split('/').slice(-2).join('/')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tree Summary Footer */}
            <div
              style={{
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Go · Rust · Python</span>
              <span style={{ fontWeight: 600 }}>{nodes.length} nodes · {edges.length} relationships</span>
            </div>
          </aside>
        )}

        {/* =======================================================================
            PANE 2: CENTER HIGH-TECH SVG GRAPH CANVAS (Linear / Datadog Tier)
            ======================================================================= */}
        <div
          className="glass-panel-luxury"
          style={{
            position: 'relative',
            height: '700px',
            overflow: 'hidden',
            backgroundColor: 'var(--bg-canvas)',
            cursor: draggingNodeId ? 'grabbing' : isPanning ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Canvas Background Grid Pattern */}
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              opacity: 0.45,
            }}
          >
            <defs>
              <pattern id="luxury-graph-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="var(--text-muted)" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#luxury-graph-grid)" />
          </svg>

          {/* Interactive SVG Canvas */}
          <svg
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              inset: 0,
            }}
          >
            <defs>
              {/* Directed Edge Arrow Marker */}
              <marker id="arrow" viewBox="0 0 10 10" refX="26" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--graph-edge)" />
              </marker>
              <marker id="arrow-active" viewBox="0 0 10 10" refX="26" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--accent-primary)" />
              </marker>

              {/* Radiant Glow Filter */}
              <filter id="nodeGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Edges Layer */}
              {edges.map((edge) => {
                const src = nodes.find((n) => n.id === edge.source);
                const tgt = nodes.find((n) => n.id === edge.target);
                if (!src || !tgt) return null;

                const isConnected =
                  edge.source === activeTargetId || edge.target === activeTargetId;

                // Curved bezier path
                const dx = tgt.x - src.x;
                const dy = tgt.y - src.y;
                const mx = (src.x + tgt.x) / 2;
                const my = (src.y + tgt.y) / 2 - (dx !== 0 ? 30 : 0);
                const pathD = `M ${src.x} ${src.y} Q ${mx} ${my} ${tgt.x} ${tgt.y}`;

                return (
                  <g key={edge.id} opacity={isConnected ? 1 : 0.28}>
                    {/* Base Curve */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isConnected ? 'var(--accent-primary)' : 'var(--graph-edge)'}
                      strokeWidth={isConnected ? 2.5 : 1.5}
                      markerEnd={isConnected ? 'url(#arrow-active)' : 'url(#arrow)'}
                      style={{ transition: 'stroke 0.2s ease, opacity 0.2s ease' }}
                    />

                    {/* Animated Traveling Photon Particles on active edges */}
                    {isSimulatingTrace && isConnected && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="var(--accent-secondary)"
                        strokeWidth="3"
                        className="edge-animated-stream"
                        opacity="0.9"
                      />
                    )}

                    {/* Edge Label on Hover/Selected */}
                    {isConnected && (
                      <text
                        x={mx}
                        y={my - 8}
                        fill="var(--text-primary)"
                        fontSize="10"
                        fontFamily="var(--font-mono)"
                        textAnchor="middle"
                        fontWeight="700"
                        style={{ pointerEvents: 'none' }}
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nodes Layer — High-Tech Glass Capsule Cards */}
              {nodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isInNeighborhood = neighborhoodNodeIds.has(node.id);
                const catColor = getCategoryColor(node.category);

                const opacity = neighborhoodNodeIds.size === 0 || isInNeighborhood ? 1 : 0.55;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    role="button" tabIndex={0} aria-label={node.name} aria-pressed={isSelected}
                    onKeyDown={(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelectedNodeId(node.id);}}}
                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                    }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    style={{ cursor: draggingNodeId === node.id ? 'grabbing' : 'grab', transition: 'opacity 0.2s ease' }}
                    opacity={opacity}
                  >
                    {/* Outer Specular Glow Halo when Selected */}
                    {isSelected && (
                      <rect
                        x="-88"
                        y="-30"
                        width="176"
                        height="60"
                        rx="14"
                        fill="none"
                        stroke="var(--accent-primary)"
                        strokeWidth="2"
                        strokeDasharray="4,4"
                        opacity="0.9"
                        filter="url(#nodeGlow)"
                      />
                    )}

                    {/* Glass Capsule Card Body */}
                    <rect
                      x="-85"
                      y="-27"
                      width="170"
                      height="54"
                      rx="12"
                      fill="var(--bg-card)"
                      stroke={isSelected ? 'var(--accent-primary)' : 'var(--border-default)'}
                      strokeWidth={isSelected ? 2 : 1.5}
                      filter="drop-shadow(0 10px 24px rgba(0,0,0,0.5))"
                    />

                    {/* Category Icon Capsule */}
                    <rect
                      x="-75"
                      y="-17"
                      width="34"
                      height="34"
                      rx="8"
                      fill={`${catColor}20`}
                      stroke={`${catColor}60`}
                      strokeWidth="1"
                    />
                    <circle cx="-58" cy="0" r="6" fill={catColor} />

                    {/* Node Title Label (Bold JetBrains Mono) */}
                    <text
                      x="-34"
                      y="-3"
                      fill="var(--text-primary)"
                      fontSize="11"
                      fontWeight="800"
                      fontFamily="var(--font-mono)"
                      style={{ pointerEvents: 'none' }}
                    >
                      {node.id.length > 13 ? node.id.slice(0, 12) + '…' : node.id}
                    </text>

                    {/* Subtitle with Language & Tokens */}
                    <text
                      x="-34"
                      y="13"
                      fill="var(--text-muted)"
                      fontSize="9"
                      fontFamily="var(--font-mono)"
                      style={{ pointerEvents: 'none' }}
                    >
                      {node.language} • {node.tokens}t
                    </text>

                    {/* Live Status Indicator Pip */}
                    <circle
                      cx="70"
                      cy="-15"
                      r="4"
                      fill={isSelected ? 'var(--accent-primary)' : catColor}
                      box-shadow={`0 0 6px ${catColor}`}
                    />
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Canvas Floating Breadcrumb Badge */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '14px',
              backgroundColor: 'var(--bg-card)',
              backdropFilter: 'blur(16px)',
              padding: '7px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.78rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
            }}
          >
            <Compass size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>
              knovra-monorepo &gt; {selectedNode.file.split('/').slice(0, 2).join('/')} &gt;{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{selectedNode.id}</strong>
            </span>
          </div>

          {/* Floating Zoom / Reset / Focus Buttons (Bottom Right) */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              backgroundColor: 'var(--bg-card)',
              backdropFilter: 'blur(16px)',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid var(--border-strong)',
              boxShadow: 'var(--shadow-md)',
              zIndex: 10,
            }}
          >
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In"
              style={{
                width: 32,
                height: 32,
                borderRadius: '6px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ZoomIn size={15} />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out"
              style={{
                width: 32,
                height: 32,
                borderRadius: '6px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ZoomOut size={15} />
            </button>
            <button
              type="button"
              onClick={handleResetView}
              title="Reset Zoom & Pan"
              style={{
                width: 32,
                height: 32,
                borderRadius: '6px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={14} />
            </button>
            <button
              type="button"
              onClick={() => setFocusMode(!focusMode)}
              title={focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
              style={{
                width: 32,
                height: 32,
                borderRadius: '6px',
                backgroundColor: focusMode ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                color: focusMode ? 'var(--text-inverse)' : 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {focusMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>

          {/* Minimap Preview Box (Bottom Left) */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              width: '130px',
              height: '85px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '8px',
              border: '1px solid var(--border-strong)',
              boxShadow: 'var(--shadow-md)',
              display: 'none',
              overflow: 'hidden',
              padding: '5px',
            }}
            className="graph-minimap-box"
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '2px' }}>
              Minimap • 14 Nodes
            </div>
            <svg width="100%" height="60" viewBox="0 0 1150 520">
              {edges.map((e) => {
                const s = nodes.find((n) => n.id === e.source);
                const t = nodes.find((n) => n.id === e.target);
                if (!s || !t) return null;
                return <line key={e.id} x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="var(--border-strong)" strokeWidth="10" />;
              })}
              {nodes.map((n) => (
                <circle key={n.id} cx={n.x} cy={n.y} r="28" fill={getCategoryColor(n.category)} />
              ))}
            </svg>
          </div>
        </div>

        {/* =======================================================================
            PANE 3: RIGHT NODE INSPECTOR & AST SIGNATURE VIEWER
            ======================================================================= */}
        {!focusMode && (
          <aside
            className="glass-panel-luxury graph-inspector-pane"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              height: '700px',
              overflowY: 'auto',
            }}
          >
            {/* Target Node Header Card */}
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                borderTop: `3px solid ${getCategoryColor(selectedNode.category)}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span
                  className="knovra-badge"
                  style={{
                    fontSize: '0.75rem',
                    backgroundColor: `${getCategoryColor(selectedNode.category)}20`,
                    color: getCategoryColor(selectedNode.category),
                    border: `1px solid ${getCategoryColor(selectedNode.category)}50`,
                  }}
                >
                  {selectedNode.category}
                </span>
                <span className="knovra-badge knovra-badge-purple">{selectedNode.language}</span>
              </div>

              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {selectedNode.name}
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                {selectedNode.file}
              </div>
            </div>

            {/* Node Description & Token Cost */}
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {selectedNode.description}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Token Weight</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  ~{selectedNode.tokens} tokens
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Graph Hop Depth</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                  Hop {depth}
                </div>
              </div>
            </div>

            {/* Upstream Callers Section */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--status-warn)',
                  marginBottom: '0.4rem',
                }}
              >
                <ArrowUpRight size={14} />
                <span>Upstream Callers ({selectedNode.callers.length})</span>
              </div>
              {selectedNode.callers.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {selectedNode.callers.map((c) => (
                    <div
                      key={c}
                      onClick={() => {
                        const target = nodes.find((n) => n.id === c || n.name === c);
                        if (target) setSelectedNodeId(target.id);
                      }}
                      style={{
                        padding: '6px 9px',
                        borderRadius: '5px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c}</span>
                      <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Top-level entrypoint (No upstream callers)
                </div>
              )}
            </div>

            {/* Downstream Invocations Section */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--accent-secondary)',
                  marginBottom: '0.4rem',
                }}
              >
                <ArrowDownLeft size={14} />
                <span>Downstream Invocations ({selectedNode.callees.length})</span>
              </div>
              {selectedNode.callees.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {selectedNode.callees.map((c) => (
                    <div
                      key={c}
                      onClick={() => {
                        const target = nodes.find((n) => n.id === c || n.name === c);
                        if (target) setSelectedNodeId(target.id);
                      }}
                      style={{
                        padding: '6px 9px',
                        borderRadius: '5px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c}</span>
                      <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Terminal node (No downstream invocations)
                </div>
              )}
            </div>

            {/* Governing Rules Section */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--status-ok)',
                  marginBottom: '0.4rem',
                }}
              >
                <Shield size={14} />
                <span>Governing Rules ({selectedNode.rules.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {selectedNode.rules.map((r) => (
                  <div
                    key={r}
                    style={{
                      padding: '6px 9px',
                      borderRadius: '5px',
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--status-ok)',
                      fontWeight: 600,
                    }}
                  >
                    {r}
                  </div>
                ))}
              </div>
            </div>

            {/* AST Signature Snippet */}
            <div>
              <CodeSnippet
                code={selectedNode.astSnippet}
                language={selectedNode.language.toLowerCase()}
                filename={`${selectedNode.name.split('.').pop()}.${selectedNode.language === 'Go' ? 'go' : selectedNode.language === 'Rust' ? 'rs' : selectedNode.language === 'Python' ? 'py' : 'ts'}`}
              />
            </div>
          </aside>
        )}
      </div>

      {/* =========================================================================
          MOBILE INSPECTOR BOTTOM SHEET
          ========================================================================= */}
      {inspectorOpenMobile && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 210,
            backgroundColor: 'var(--bg-overlay)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={() => setInspectorOpenMobile(false)}
        >
          <div
            ref={inspectorDialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Symbol inspector"
            style={{
              width: '100%',
              maxHeight: '75vh',
              backgroundColor: 'var(--bg-primary)',
              borderTop: '1.5px solid var(--border-strong)',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              padding: '1.25rem',
              overflowY: 'auto',
              boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="knovra-badge knovra-badge-blue">{selectedNode.category}</span>
                <span style={{ fontWeight: 600, fontSize: '14px', overflowWrap: 'anywhere', minWidth: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {selectedNode.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectorOpenMobile(false)}
                aria-label="Close inspector"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              {selectedNode.description}
            </div>

            <CodeSnippet
              code={selectedNode.astSnippet}
              language={selectedNode.language.toLowerCase()}
              filename={`${selectedNode.name.split('.').pop()}.${selectedNode.language === 'Go' ? 'go' : selectedNode.language === 'Rust' ? 'rs' : selectedNode.language === 'Python' ? 'py' : 'ts'}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
