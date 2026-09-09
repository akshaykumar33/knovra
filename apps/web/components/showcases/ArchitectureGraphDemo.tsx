'use client';

import React, { useState } from 'react';
import {
  Layers,
  Server,
  Cpu,
  Database,
  Terminal,
  Network,
  Share2,
  HardDrive,
  Radio,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface ArchNode {
  id: string;
  name: string;
  layer: 'frontend' | 'runtime' | 'indexer' | 'engine' | 'storage';
  technology: string;
  role: string;
  port: number | string;
  protocols: string[];
  latency: string;
  invariant?: string;
}

const ARCH_NODES: ArchNode[] = [
  {
    id: 'web',
    name: 'apps/web',
    layer: 'frontend',
    technology: 'Next.js 14 + React',
    role: 'Visual product dashboard, graph explorer & agent showcase',
    port: 3000,
    protocols: ['HTTP/REST', 'JSON'],
    latency: '0.4ms',
    invariant: 'Invariant #7: Local-first offline UX resilience',
  },
  {
    id: 'api',
    name: 'apps/api',
    layer: 'frontend',
    technology: 'NestJS + TypeScript',
    role: 'SaaS tenancy, organization management & external webhooks',
    port: 4000,
    protocols: ['HTTP/REST', 'JWT'],
    latency: '1.2ms',
  },
  {
    id: 'runtime',
    name: 'services/runtime',
    layer: 'runtime',
    technology: 'Go 1.22 + MCP Server',
    role: 'Local agent daemon, MCP Gateway & file event orchestrator',
    port: 8080,
    protocols: ['MCP JSON-RPC', 'gRPC Client', 'HTTP/REST'],
    latency: '0.8ms',
    invariant: 'Invariant #2: Agent access strictly mediated via MCP Gateway',
  },
  {
    id: 'code-indexer',
    name: 'services/code-indexer',
    layer: 'indexer',
    technology: 'Rust + Tree-sitter',
    role: 'Fast incremental AST parser, symbol extractor & call graph builder',
    port: 50051,
    protocols: ['gRPC Server', 'Protobuf'],
    latency: '0.2ms',
    invariant: 'Invariant #4: Incremental file change indexing without full re-scans',
  },
  {
    id: 'context-engine',
    name: 'services/context-engine',
    layer: 'engine',
    technology: 'Python 3.11 + FastAPI',
    role: 'Semantic memory, vector embeddings, ADR graph & Context Planning',
    port: 8000,
    protocols: ['HTTP/REST', 'MCP Tool Provider'],
    latency: '2.1ms',
    invariant: 'Invariant #1: Knovra owns durable context, agents consume it',
  },
  {
    id: 'postgres',
    name: 'PostgreSQL + pgvector',
    layer: 'storage',
    technology: 'Postgres 16 + pgvector',
    role: 'Source of transactional truth, symbol vectors & session embeddings',
    port: 5432,
    protocols: ['TCP', 'Postgres Wire'],
    latency: '1.4ms',
  },
  {
    id: 'neo4j',
    name: 'Neo4j Graph Database',
    layer: 'storage',
    technology: 'Neo4j 5.20 Community',
    role: 'Call hierarchy, file dependency graphs & ADR supersession DAG',
    port: 7687,
    protocols: ['Bolt', 'Cypher'],
    latency: '2.8ms',
  },
  {
    id: 'nats',
    name: 'NATS JetStream',
    layer: 'storage',
    technology: 'NATS v2.10',
    role: 'High-throughput event streaming for file change & agent events',
    port: 4222,
    protocols: ['NATS Protocol'],
    latency: '0.3ms',
  },
];

export default function ArchitectureGraphDemo() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('runtime');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const selectedNode = ARCH_NODES.find((n) => n.id === selectedNodeId) || ARCH_NODES[0];

  const filteredNodes = ARCH_NODES.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'compute') return n.layer !== 'storage';
    if (activeFilter === 'storage') return n.layer === 'storage';
    return true;
  });

  const getLayerBadge = (layer: string) => {
    switch (layer) {
      case 'frontend': return 'stripe-badge-blue';
      case 'runtime': return 'stripe-badge-blue';
      case 'indexer': return 'stripe-badge-amber';
      case 'engine': return 'stripe-badge-purple';
      case 'storage': return 'stripe-badge-green';
      default: return 'stripe-badge';
    }
  };

  return (
    <div className="stripe-card" style={{ padding: '1.75rem' }}>
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: '6px',
                background: 'rgba(6, 182, 212, 0.12)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
              }}
            >
              <Network size={14} />
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Subsystem Topology & IPC Matrix
            </h3>
            <span className="stripe-badge stripe-badge-blue" style={{ fontSize: '0.68rem' }}>
              Polyglot Grid
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '620px', lineHeight: 1.5 }}>
            Knovra operates as a high-speed polyglot mesh: Go daemon & MCP gateway, Rust Tree-sitter AST engine, Python semantic brain, and Next.js visual surface.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-canvas)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
          {[
            { id: 'all', label: 'All Subsystems' },
            { id: 'compute', label: 'Engines & Services' },
            { id: 'storage', label: 'Storage & Bus' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: activeFilter === tab.id ? 'var(--bg-secondary)' : 'transparent',
                color: activeFilter === tab.id ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout: Service Cards + Details Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.8fr) 1.2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Node Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.85rem' }}>
          {filteredNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-primary)',
                  border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-default)'}`,
                  borderTop: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--border-highlight)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 16px rgba(59, 130, 246, 0.15)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <span className={`stripe-badge ${getLayerBadge(node.layer)}`}>
                    {node.layer}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--status-ok)', fontWeight: 600 }}>
                    {node.latency}
                  </span>
                </div>

                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#ffffff', marginBottom: '0.25rem' }}>
                  {node.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                  {node.technology}
                </div>

                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  {node.protocols.map((p) => (
                    <span
                      key={p}
                      style={{
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-mono)',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        backgroundColor: 'var(--bg-canvas)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Node Inspector */}
        <div
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-default)',
            borderTop: '1px solid var(--border-highlight)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Subsystem Inspector
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="pulsing-dot" />
              <span style={{ fontSize: '0.7rem', color: 'var(--status-ok)', fontWeight: 600 }}>ONLINE</span>
            </div>
          </div>

          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.2rem' }}>
            {selectedNode.name}
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
            {selectedNode.role}
          </p>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', display: 'grid', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Technology Stack</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedNode.technology}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Listening Interface & Port</div>
              <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                0.0.0.0:{selectedNode.port} ({selectedNode.latency} p99)
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Supported Wire Protocols</div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {selectedNode.protocols.map((proto) => (
                  <span
                    key={proto}
                    style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-canvas)',
                      color: 'var(--accent-blue)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    {proto}
                  </span>
                ))}
              </div>
            </div>

            {selectedNode.invariant && (
              <div
                style={{
                  marginTop: '0.4rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.2rem', color: 'var(--accent-blue)', fontSize: '0.72rem', fontWeight: 600 }}>
                  <Info size={13} />
                  Architectural Guarantee
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {selectedNode.invariant}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
