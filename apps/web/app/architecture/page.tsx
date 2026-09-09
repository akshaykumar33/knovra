'use client';

import React from 'react';
import {
  Layers,
  Shield,
  CheckCircle2,
  Server,
  Zap,
  Lock,
  RefreshCw,
  Cpu,
  Database,
  ArrowRight,
} from 'lucide-react';
import ArchitectureGraphDemo from '../../components/showcases/ArchitectureGraphDemo';

const GOLDEN_INVARIANTS = [
  {
    num: 1,
    title: 'Knovra Owns Context',
    description: 'AI agents do not own Knovra context. Knovra owns context and agents consume it. Models are transient and replaceable; context is durable and persistent.',
    icon: Database,
    color: 'var(--accent-blue)',
  },
  {
    num: 2,
    title: 'Mediated Agent Access',
    description: 'Agent interactions are strictly mediated via the Model Context Protocol (MCP) Gateway. Direct database access by autonomous agents is prohibited.',
    icon: Lock,
    color: 'var(--accent-cyan)',
  },
  {
    num: 3,
    title: 'Immutable Decision Provenance',
    description: 'Architectural Decision Records (ADRs) are strictly immutable once approved. New decisions supersede existing records rather than rewriting history.',
    icon: Layers,
    color: 'var(--accent-purple)',
  },
  {
    num: 4,
    title: 'Incremental AST Indexing',
    description: 'Code changes are parsed and indexed incrementally using Tree-sitter AST diffing, preserving sub-second latency without full repository re-scans.',
    icon: RefreshCw,
    color: 'var(--status-ok)',
  },
  {
    num: 5,
    title: 'Deterministic Budget Packing',
    description: 'Context Planner enforces strict token budget packing with priority tiering: invariants first, followed by ADRs, call hierarchies, and recent facts.',
    icon: Cpu,
    color: 'var(--accent-amber)',
  },
  {
    num: 6,
    title: 'Zero Secret Leakage',
    description: 'All symbol embeddings, agent transcripts, and memory snapshots are actively sanitized for API keys, bearer tokens, and private credentials.',
    icon: Shield,
    color: 'var(--status-danger)',
  },
  {
    num: 7,
    title: 'Local-First Offline Resilience',
    description: 'Core runtime operates fully offline with embedded models and local storage. Cloud features augment capabilities without introducing a hard dependency.',
    icon: Zap,
    color: 'var(--accent-purple)',
  },
];

const PROTOCOLS = [
  { subsystem: 'Runtime Daemon <-> Agents', protocol: 'MCP JSON-RPC', port: '8080 / stdio', purpose: 'Standardized agent tool invocation & prompt injection' },
  { subsystem: 'Runtime <-> Code Indexer', protocol: 'gRPC / Protobuf', port: '50051', purpose: 'High-speed AST symbol extraction & call hierarchy querying' },
  { subsystem: 'Web Dashboard <-> Services', protocol: 'HTTP / REST', port: '3000 -> 8000/8080', purpose: 'Product UI data retrieval & interactive exploration' },
  { subsystem: 'Context Engine <-> Storage', protocol: 'PostgreSQL Wire + Bolt', port: '5432 / 7687', purpose: 'pgvector semantic search & Neo4j graph traversal' },
  { subsystem: 'File Watcher <-> Runtime', protocol: 'NATS JetStream', port: '4222', purpose: 'Real-time filesystem change events & agent telemetry' },
];

export default function ArchitecturePage() {
  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: '8px',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-purple)',
            }}
          >
            <Layers size={18} />
          </span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            System Architecture & Golden Invariants
          </h1>
          <span className="badge badge-purple">7 Core Invariants</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Foundational guarantees, communication topology, and polyglot subsystem interaction matrix.
        </p>
      </div>

      {/* Interactive Topology Graph Demo */}
      <ArchitectureGraphDemo />

      {/* 7 Golden Invariants Grid */}
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Seven Golden Architectural Invariants
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {GOLDEN_INVARIANTS.map((inv) => {
            const Icon = inv.icon;
            return (
              <div
                key={inv.num}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: inv.color,
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <span className="badge" style={{ fontSize: '0.7rem', color: inv.color }}>
                      Invariant #{inv.num}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {inv.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {inv.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Communication Protocol Matrix */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Subsystem Inter-Process Communication (IPC) Matrix
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>Subsystem Channel</th>
                <th style={{ padding: '10px 12px' }}>Protocol</th>
                <th style={{ padding: '10px 12px' }}>Interface / Port</th>
                <th style={{ padding: '10px 12px' }}>Operational Purpose</th>
              </tr>
            </thead>
            <tbody>
              {PROTOCOLS.map((proto, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid var(--border-default)',
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
                  }}
                >
                  <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{proto.subsystem}</td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-blue">{proto.protocol}</span>
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{proto.port}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{proto.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
