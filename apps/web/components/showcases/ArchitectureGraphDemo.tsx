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
import { SYSTEM_SERVICES } from '../../lib/data';

interface ArchNode {
  id: string;
  name: string;
  layer: 'frontend' | 'runtime' | 'indexer' | 'engine' | 'storage';
  technology: string;
  role: string;
  port: number | string;
  protocols: string[];
  connections: string[];
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
    connections: ['api', 'runtime', 'context-engine'],
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
    connections: ['postgres', 'redis', 'nats'],
  },
  {
    id: 'runtime',
    name: 'services/runtime',
    layer: 'runtime',
    technology: 'Go 1.22 + MCP Server',
    role: 'Local agent daemon, MCP Gateway & file event orchestrator',
    port: 8080,
    protocols: ['MCP JSON-RPC', 'gRPC Client', 'HTTP/REST'],
    connections: ['code-indexer', 'context-engine', 'nats'],
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
    connections: ['neo4j'],
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
    connections: ['postgres', 'neo4j', 'redis'],
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
    connections: [],
  },
  {
    id: 'neo4j',
    name: 'Neo4j Graph Database',
    layer: 'storage',
    technology: 'Neo4j 5.20 Community',
    role: 'Call hierarchy, file dependency graphs & ADR supersession DAG',
    port: 7687,
    protocols: ['Bolt', 'Cypher'],
    connections: [],
  },
  {
    id: 'nats',
    name: 'NATS JetStream',
    layer: 'storage',
    technology: 'NATS v2.10',
    role: 'High-throughput event streaming for file change & agent events',
    port: 4222,
    protocols: ['NATS Protocol'],
    connections: [],
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

  const getLayerColor = (layer: string) => {
    switch (layer) {
      case 'frontend':
        return { text: 'var(--accent-blue)', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)' };
      case 'runtime':
        return { text: 'var(--accent-cyan)', bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.3)' };
      case 'indexer':
        return { text: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' };
      case 'engine':
        return { text: 'var(--accent-purple)', bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.3)' };
      case 'storage':
        return { text: 'var(--status-ok)', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' };
      default:
        return { text: 'var(--text-primary)', bg: 'var(--bg-tertiary)', border: 'var(--border-default)' };
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
              }}
            >
              <Network size={16} />
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Subsystem Topology & Architecture Graph
            </h3>
            <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>
              Multi-Service Grid
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '650px' }}>
            Knovra is built as a polyglot system: Go for daemon & MCP, Rust for fast AST indexing, Python for vector intelligence, and Next.js for visual control.
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { id: 'all', label: 'All Subsystems' },
            { id: 'compute', label: 'Engines & Services' },
            { id: 'storage', label: 'Storage & Bus' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: activeFilter === tab.id ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                color: activeFilter === tab.id ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Graph Grid & Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.8fr) 1.2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Node Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {filteredNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const style = getLayerColor(node.layer);
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                style={{
                  padding: '1.1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-tertiary)',
                  border: `1.5px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-default)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 16px rgba(59, 130, 246, 0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: style.bg,
                      color: style.text,
                      border: `1px solid ${style.border}`,
                      textTransform: 'uppercase',
                    }}
                  >
                    {node.layer}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    :{node.port}
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {node.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  {node.technology}
                </div>
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  {node.protocols.map((p) => (
                    <span
                      key={p}
                      style={{
                        fontSize: '0.65rem',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-default)',
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

        {/* Selected Node Inspector Drawer */}
        <div
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Subsystem Inspector
            </span>
            <span className="badge badge-ok" style={{ fontSize: '0.7rem' }}>ONLINE</span>
          </div>

          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {selectedNode.name}
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            {selectedNode.role}
          </p>

          <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '1rem', display: 'grid', gap: '0.85rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Technology Stack</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedNode.technology}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Listening Port & Interface</div>
              <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                0.0.0.0:{selectedNode.port}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Supported Protocols</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {selectedNode.protocols.map((proto) => (
                  <span
                    key={proto}
                    style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-secondary)',
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
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', color: 'var(--accent-blue)', fontSize: '0.75rem', fontWeight: 600 }}>
                  <Info size={14} />
                  Architectural Guarantee
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
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
