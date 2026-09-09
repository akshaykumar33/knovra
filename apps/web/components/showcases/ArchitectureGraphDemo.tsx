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
  ArrowDown,
  ArrowRight,
  Shield,
  Bot,
  Globe,
  ExternalLink,
} from 'lucide-react';

interface ArchNode {
  id: string;
  name: string;
  tier: 'surface' | 'runtime' | 'storage';
  tierLabel: string;
  technology: string;
  role: string;
  port: number | string;
  protocols: string[];
  latency: string;
  invariant?: string;
  repoPath: string;
}

const ARCH_NODES: ArchNode[] = [
  // Tier 1: Client & External Agent Surfaces
  {
    id: 'agents',
    name: 'MCP Agent Harnesses',
    tier: 'surface',
    tierLabel: 'TIER 1 • AGENT CLIENTS',
    technology: 'Claude Code, Cursor, Codex',
    role: 'Autonomous developer harnesses consuming bounded context packs',
    port: 'Client (stdio / SSE)',
    protocols: ['MCP JSON-RPC', 'Stdio Stream'],
    latency: '0.1ms',
    invariant: 'Invariant #1: Agents are unprivileged consumers; Knovra owns context',
    repoPath: 'services/runtime/internal/mcp/protocol.go',
  },
  {
    id: 'web',
    name: 'apps/web',
    tier: 'surface',
    tierLabel: 'TIER 1 • WEB SURFACE',
    technology: 'Next.js 14 + React',
    role: 'Product dashboard, code graph visualizer & developer documentation',
    port: '3000 (HTTP)',
    protocols: ['HTTP/REST', 'JSON'],
    latency: '0.4ms',
    invariant: 'Invariant #7: Local-first offline UX resilience',
    repoPath: 'apps/web/app/page.tsx',
  },
  {
    id: 'api',
    name: 'apps/api',
    tier: 'surface',
    tierLabel: 'TIER 1 • API GATEWAY',
    technology: 'NestJS + TypeScript',
    role: 'Multi-tenant organization gateway, SaaS billing & external webhooks',
    port: '4000 (HTTP)',
    protocols: ['HTTP/REST', 'JWT'],
    latency: '1.2ms',
    repoPath: 'apps/api/src/main.ts',
  },

  // Tier 2: Polyglot Core Runtime & Engines
  {
    id: 'runtime',
    name: 'services/runtime',
    tier: 'runtime',
    tierLabel: 'TIER 2 • ORCHESTRATION',
    technology: 'Go 1.22 + MCP Daemon',
    role: 'Local agent daemon, MCP Gateway & file event orchestrator',
    port: '8080 (HTTP / stdio)',
    protocols: ['MCP JSON-RPC', 'gRPC Client', 'HTTP/REST'],
    latency: '0.8ms',
    invariant: 'Invariant #2: Agent access strictly mediated via MCP Gateway',
    repoPath: 'services/runtime/cmd/knovra/main.go',
  },
  {
    id: 'code-indexer',
    name: 'services/code-indexer',
    tier: 'runtime',
    tierLabel: 'TIER 2 • AST INTELLIGENCE',
    technology: 'Rust 1.78 + Tree-sitter',
    role: 'Fast incremental AST parser, symbol extractor & call graph builder',
    port: '50051 (gRPC)',
    protocols: ['gRPC Server', 'Protobuf 3'],
    latency: '0.2ms',
    invariant: 'Invariant #4: Incremental file change indexing without full re-scans',
    repoPath: 'services/code-indexer/crates/core/src/lib.rs',
  },
  {
    id: 'context-engine',
    name: 'services/context-engine',
    tier: 'runtime',
    tierLabel: 'TIER 2 • REASONING BRAIN',
    technology: 'Python 3.11 + FastAPI',
    role: 'Semantic memory, vector embeddings, ADR graph & Context Planning',
    port: '8000 (HTTP)',
    protocols: ['HTTP/REST', 'MCP Tool Provider'],
    latency: '2.1ms',
    invariant: 'Invariant #5: Deterministic token budget packing',
    repoPath: 'services/context-engine/app/main.py',
  },

  // Tier 3: Distributed State & Event Mesh
  {
    id: 'neo4j',
    name: 'Neo4j Graph Database',
    tier: 'storage',
    tierLabel: 'TIER 3 • CONTEXT GRAPH',
    technology: 'Neo4j 5.20 Community',
    role: 'Code call hierarchies, file dependencies & immutable ADR supersession DAG',
    port: '7687 (Bolt)',
    protocols: ['Bolt', 'Cypher'],
    latency: '2.8ms',
    invariant: 'Invariant #3: Non-destructive supersession history preserved',
    repoPath: 'infra/docker/docker-compose.yml',
  },
  {
    id: 'postgres',
    name: 'PostgreSQL + pgvector',
    tier: 'storage',
    tierLabel: 'TIER 3 • VECTOR MEMORY',
    technology: 'Postgres 16 + pgvector',
    role: 'Transactional truth, symbol vectors & agent session embeddings',
    port: '5432 (Postgres Wire)',
    protocols: ['TCP', 'Postgres Wire'],
    latency: '1.4ms',
    invariant: 'Invariant #6: Zero secret leakage in stored embeddings',
    repoPath: 'services/context-engine/app/storage/vector_store.py',
  },
  {
    id: 'nats',
    name: 'NATS JetStream',
    tier: 'storage',
    tierLabel: 'TIER 3 • EVENT FABRIC',
    technology: 'NATS v2.10 JetStream',
    role: 'High-throughput event bus for file changes & continuous agent learning',
    port: '4222 (NATS Protocol)',
    protocols: ['NATS Protocol', 'JetStream'],
    latency: '0.3ms',
    repoPath: 'services/context-engine/app/events/bus.py',
  },
];

export default function ArchitectureGraphDemo() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('runtime');
  const [activeTier, setActiveTier] = useState<string>('all');

  const selectedNode = ARCH_NODES.find((n) => n.id === selectedNodeId) || ARCH_NODES[3];

  const filteredNodes = ARCH_NODES.filter((n) => {
    if (activeTier === 'all') return true;
    return n.tier === activeTier;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'surface': return 'var(--accent-cyan)';
      case 'runtime': return 'var(--accent-blue)';
      case 'storage': return 'var(--accent-purple)';
      default: return 'var(--text-muted)';
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'surface': return 'stripe-badge-blue';
      case 'runtime': return 'stripe-badge-purple';
      case 'storage': return 'stripe-badge-green';
      default: return 'stripe-badge';
    }
  };

  return (
    <div className="stripe-card" style={{ padding: '1.75rem' }}>
      {/* Header & Tier Filters */}
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
              Subsystem Topology & Polyglot Mesh
            </h3>
            <span className="stripe-badge stripe-badge-blue" style={{ fontSize: '0.68rem' }}>
              9 Mesh Nodes
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '640px' }}>
            3-Tier polyglot architecture: External Agent Harnesses ➔ Core Go/Rust/Python Orchestration ➔ Persistent Graph & Event Fabric.
          </p>
        </div>

        {/* Tier Segmented Filter */}
        <div style={{ display: 'flex', gap: '0.2rem', backgroundColor: 'var(--bg-canvas)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          {[
            { id: 'all', label: 'All 3 Tiers' },
            { id: 'surface', label: 'Tier 1: Surfaces' },
            { id: 'runtime', label: 'Tier 2: Engines' },
            { id: 'storage', label: 'Tier 3: Storage' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTier(tab.id)}
              style={{
                padding: '4px 10px',
                fontSize: '0.74rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: activeTier === tab.id ? 'var(--bg-secondary)' : 'transparent',
                color: activeTier === tab.id ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: activeTier === tab.id ? 700 : 500,
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: 9 Nodes (3x3 Balanced) + Detailed Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.85fr) 1.15fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Node Grid: 3 columns x 3 rows = 9 cards perfectly balanced */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }}>
          {filteredNodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-primary)',
                  border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-default)'}`,
                  borderTop: isSelected ? '2px solid var(--accent-blue)' : '1px solid var(--border-highlight)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? '0 0 16px rgba(59, 130, 246, 0.2)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '135px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: getTierColor(node.tier), letterSpacing: '0.04em' }}>
                      {node.tierLabel.split('•')[1] || node.tier}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--status-ok)', fontWeight: 600 }}>
                      {node.latency}
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#ffffff', marginBottom: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                    {node.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                    {node.technology}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  {node.protocols.slice(0, 2).map((p) => (
                    <span
                      key={p}
                      style={{
                        fontSize: '0.62rem',
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

        {/* Detailed Inspector Drawer */}
        <div
          style={{
            backgroundColor: 'var(--bg-primary)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-default)',
            borderTop: '2px solid var(--accent-blue)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              NODE TELEMETRY
            </span>
            <span className="stripe-badge stripe-badge-green" style={{ fontSize: '0.68rem' }}>
              <span className="pulsing-dot" style={{ backgroundColor: 'var(--status-ok)' }} />
              ONLINE
            </span>
          </div>

          <div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
              {selectedNode.name}
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              {selectedNode.role}
            </p>
          </div>

          <div style={{ display: 'grid', gap: '0.65rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Technology Runtime</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                {selectedNode.technology}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Port & Listening Interface</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                {selectedNode.port}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Wire Protocols</div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {selectedNode.protocols.map((p) => (
                  <span key={p} className="stripe-badge stripe-badge-blue" style={{ fontSize: '0.68rem' }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {selectedNode.invariant && (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-blue)', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                  <Shield size={12} />
                  <span>Enforced Architectural Invariant</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#ffffff', lineHeight: 1.4 }}>
                  {selectedNode.invariant}
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Subsystem Source Location</div>
              <code style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                {selectedNode.repoPath}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
