'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

interface GraphSymbol {
  name: string;
  kind: 'function' | 'struct' | 'interface' | 'method';
  file: string;
  language: string;
  callers: string[];
  callees: string[];
  rules: string[];
}

const SYMBOLS_GRAPH: GraphSymbol[] = [
  {
    name: 'ImpactAnalyzer.AnalyzeBlastRadius',
    kind: 'method',
    file: 'services/runtime/internal/impact/analyzer.go',
    language: 'Go',
    callers: ['cmd/knovra/impact.go', 'GatewayServer.HandleToolCall'],
    callees: ['StorageEngine.query_hierarchy', 'RuleEngine.FilterViolations'],
    rules: ['RULE-001 (Zero Secret Leakage)', 'RULE-004 (Call Depth Threshold)'],
  },
  {
    name: 'StorageEngine.query_hierarchy',
    kind: 'method',
    file: 'services/code-indexer/src/storage.rs',
    language: 'Rust',
    callers: ['ImpactAnalyzer.AnalyzeBlastRadius', 'IndexServer.QueryHierarchy'],
    callees: ['neo4j_driver.execute_cypher', 'sled_cache.get'],
    rules: ['RULE-002 (Immutable Decision History)'],
  },
  {
    name: 'ContextPlanner.plan_context',
    kind: 'method',
    file: 'services/context-engine/app/planner.py',
    language: 'Python',
    callers: ['app/main.py:POST /context/plan', 'mcp_gateway:knovra.plan'],
    callees: ['pgvector.similarity_search', 'neo4j.get_adr_lineage'],
    rules: ['RULE-003 (Provenanced Context Ingestion)'],
  },
  {
    name: 'AuthInterceptor.authenticate',
    kind: 'method',
    file: 'services/runtime/internal/auth/interceptor.go',
    language: 'Go',
    callers: ['GatewayServer.HandleToolCall', 'DaemonServer.ServeHTTP'],
    callees: ['JWTValidator.VerifyToken', 'TokenCache.Get'],
    rules: ['RULE-001 (Zero Secret Leakage)'],
  },
];

export default function GraphPage() {
  const [selectedSymbolName, setSelectedSymbolName] = useState<string>('ImpactAnalyzer.AnalyzeBlastRadius');
  const [search, setSearch] = useState('');
  const [depth, setDepth] = useState<number>(2);

  const selectedSymbol = SYMBOLS_GRAPH.find((s) => s.name === selectedSymbolName) || SYMBOLS_GRAPH[0];

  const filteredSymbols = SYMBOLS_GRAPH.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.file.toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: '6px',
              backgroundColor: 'rgba(6, 182, 212, 0.12)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
            }}
          >
            <Network size={16} />
          </span>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#ffffff' }}>
            Code Graph & Call Hierarchy
          </h1>
          <span className="stripe-badge stripe-badge-blue">Neo4j + Tree-sitter</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Trace upstream callers, downstream callees, and architectural constraints across multi-language boundary lines.
        </p>
      </div>

      {/* Symbol Search & Depth Toolbar */}
      <div
        className="stripe-panel"
        style={{
          padding: '0.85rem 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '8px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search function or symbol (e.g. query_hierarchy, AnalyzeBlastRadius)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 12px 6px 30px',
              fontSize: '0.82rem',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Graph Depth:</span>
          <div style={{ display: 'flex', gap: '0.2rem', backgroundColor: 'var(--bg-canvas)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
            {[1, 2, 3, 4].map((d) => (
              <button
                key={d}
                onClick={() => setDepth(d)}
                style={{
                  width: 26,
                  height: 24,
                  borderRadius: '4px',
                  backgroundColor: depth === d ? 'var(--accent-blue)' : 'transparent',
                  color: depth === d ? '#ffffff' : 'var(--text-muted)',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Graph Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Symbol list */}
        <div className="stripe-card" style={{ padding: '1.15rem', display: 'grid', gap: '0.45rem', maxHeight: '550px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
            Indexed Symbols
          </div>
          {filteredSymbols.map((sym) => {
            const isSelected = selectedSymbolName === sym.name;
            return (
              <div
                key={sym.name}
                onClick={() => setSelectedSymbolName(sym.name)}
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'var(--bg-primary)',
                  border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-default)'}`,
                  borderTop: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-highlight)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                    {sym.name.split('.').pop()}
                  </span>
                  <span className="stripe-badge stripe-badge-purple" style={{ fontSize: '0.65rem' }}>
                    {sym.language}
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {sym.file.split('/').slice(-2).join('/')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Graph Inspector */}
        <div className="stripe-card" style={{ padding: '1.5rem' }}>
          {/* Target Symbol Node Header */}
          <div
            style={{
              padding: '1.15rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--accent-cyan)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
              <div>
                <span className="stripe-badge stripe-badge-blue" style={{ fontSize: '0.68rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Target {selectedSymbol.kind}
                </span>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                  {selectedSymbol.name}
                </h2>
              </div>
              <span className="stripe-badge stripe-badge-purple">{selectedSymbol.language}</span>
            </div>
            <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              Declared in: {selectedSymbol.file}
            </div>
          </div>

          {/* Call Hierarchy Diagram: Callers -> Target -> Callees */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* Upstream Callers */}
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.15rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem', color: 'var(--accent-amber)' }}>
                <ArrowUpRight size={15} />
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  Upstream Callers ({selectedSymbol.callers.length})
                </h3>
              </div>
              <div style={{ display: 'grid', gap: '0.4rem' }}>
                {selectedSymbol.callers.map((c) => (
                  <div
                    key={c}
                    style={{
                      padding: '6px 9px',
                      backgroundColor: 'var(--bg-canvas)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-amber)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>

            {/* Downstream Callees */}
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.15rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem', color: 'var(--accent-blue)' }}>
                <ArrowDownLeft size={15} />
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  Downstream Invocations ({selectedSymbol.callees.length})
                </h3>
              </div>
              <div style={{ display: 'grid', gap: '0.4rem' }}>
                {selectedSymbol.callees.map((c) => (
                  <div
                    key={c}
                    style={{
                      padding: '6px 9px',
                      backgroundColor: 'var(--bg-canvas)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-blue)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Governing Rules */}
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.45rem', color: 'var(--status-ok)' }}>
              <Shield size={14} />
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                Governing Architectural Rules
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {selectedSymbol.rules.map((rule) => (
                <span
                  key={rule}
                  className="stripe-badge stripe-badge-green"
                  style={{ fontSize: '0.7rem' }}
                >
                  {rule}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
