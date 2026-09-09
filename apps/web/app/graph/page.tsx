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
    <div style={{ display: 'grid', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: '8px',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
            }}
          >
            <Network size={18} />
          </span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Code Graph & Call Hierarchy Explorer
          </h1>
          <span className="badge badge-cyan">Neo4j + Tree-sitter</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Trace upstream callers, downstream callees, and architectural constraints across multi-language boundary lines.
        </p>
      </div>

      {/* Symbol Search & Depth Toolbar */}
      <div
        className="glass-card"
        style={{
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search function or symbol (e.g. query_hierarchy, AnalyzeBlastRadius)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 12px 6px 32px',
              fontSize: '0.85rem',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Graph Depth:</span>
          {[1, 2, 3, 4].map((d) => (
            <button
              key={d}
              onClick={() => setDepth(d)}
              style={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                backgroundColor: depth === d ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                color: depth === d ? '#ffffff' : 'var(--text-muted)',
                border: '1px solid var(--border-default)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Main Graph Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Symbol list */}
        <div className="glass-card" style={{ padding: '1rem', display: 'grid', gap: '0.5rem', maxHeight: '550px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Indexed Symbols
          </div>
          {filteredSymbols.map((sym) => {
            const isSelected = selectedSymbolName === sym.name;
            return (
              <div
                key={sym.name}
                onClick={() => setSelectedSymbolName(sym.name)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-tertiary)',
                  border: `1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-default)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {sym.name.split('.').pop()}
                  </span>
                  <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                    {sym.language}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {sym.file.split('/').slice(-2).join('/')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Graph Inspector */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          {/* Target Symbol Node Header */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--accent-cyan)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Target {selectedSymbol.kind}
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  {selectedSymbol.name}
                </h2>
              </div>
              <span className="badge badge-purple">{selectedSymbol.language}</span>
            </div>
            <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              Declared in: {selectedSymbol.file}
            </div>
          </div>

          {/* Call Hierarchy Diagram: Callers -> Target -> Callees */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* Upstream Callers */}
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--accent-amber)' }}>
                <ArrowUpRight size={16} />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  Upstream Callers ({selectedSymbol.callers.length})
                </h3>
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {selectedSymbol.callers.map((c) => (
                  <div
                    key={c}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-amber)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>

            {/* Downstream Callees */}
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--accent-blue)' }}>
                <ArrowDownLeft size={16} />
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  Downstream Invocations ({selectedSymbol.callees.length})
                </h3>
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {selectedSymbol.callees.map((c) => (
                  <div
                    key={c}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--accent-blue)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Governing Rules */}
          <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--status-ok)' }}>
              <Shield size={16} />
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                Governing Architectural Rules
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {selectedSymbol.rules.map((rule) => (
                <span
                  key={rule}
                  style={{
                    fontSize: '0.75rem',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: 'var(--status-ok)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    fontWeight: 600,
                  }}
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
