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
  ShieldCheck,
  Code2,
  Network,
  Activity,
  Check,
} from 'lucide-react';
import ArchitectureGraphDemo from '../../components/showcases/ArchitectureGraphDemo';

const OPERATIONAL_INVARIANTS = [
  {
    num: 2,
    title: 'Mediated Agent Access',
    subtitle: 'BOUNDARY ENFORCEMENT',
    description: 'Agent interactions are strictly mediated via the Model Context Protocol (MCP) Gateway. Direct database connections by autonomous models are prohibited.',
    technology: 'Go JSON-RPC 2.0 • Port 8080',
    verification: '12 Standard Tools Sanitized',
    icon: Lock,
    color: 'var(--accent-cyan)',
    badgeClass: 'stripe-badge-blue',
  },
  {
    num: 3,
    title: 'Non-Destructive Decision Lineage',
    subtitle: 'HISTORY PRESERVATION',
    description: 'Architectural Decision Records (ADRs) are strictly immutable once approved. New decisions supersede existing records via DAG edges rather than rewriting history.',
    technology: 'Neo4j Cypher • Port 7687',
    verification: '(:ADR)-[:SUPERSEDES]->(:ADR)',
    icon: Layers,
    color: 'var(--accent-purple)',
    badgeClass: 'stripe-badge-purple',
  },
  {
    num: 4,
    title: 'Incremental AST Diff Indexing',
    subtitle: 'PERFORMANCE SLA',
    description: 'Code modifications trigger incremental Tree-sitter AST diffing, preserving sub-millisecond query responses without full repository re-scans.',
    technology: 'Rust Tree-sitter • Port 50051',
    verification: '0.2ms Incremental Parse SLA',
    icon: RefreshCw,
    color: 'var(--status-ok)',
    badgeClass: 'stripe-badge-green',
  },
  {
    num: 5,
    title: 'Deterministic Budget Packing',
    subtitle: 'RESOURCE GOVERNANCE',
    description: 'Context Planner enforces mathematically bounded token budgets with priority tiering: Invariants first, followed by ADRs, call hierarchies, and recent facts.',
    technology: 'Python 12-Stage Planner • Port 8000',
    verification: 'Bounded Token Guarantee',
    icon: Cpu,
    color: 'var(--accent-amber)',
    badgeClass: 'stripe-badge-amber',
  },
  {
    num: 6,
    title: 'Zero Secret Leakage',
    subtitle: 'SECURITY & AUDIT',
    description: 'All symbol embeddings, agent transcripts, and memory snapshots are actively sanitized for API keys, bearer tokens, and private credentials before storage.',
    technology: 'Shannon Entropy + Regex Redactor',
    verification: 'High-Entropy Masking',
    icon: Shield,
    color: 'var(--status-danger)',
    badgeClass: 'stripe-badge-red',
  },
  {
    num: 7,
    title: 'Local-First Offline Resilience',
    subtitle: 'AIR-GAPPED COMPATIBILITY',
    description: 'Core runtime operates fully offline with embedded deterministic dense models and local Sled storage without external cloud egress dependencies.',
    technology: 'Local Dense Embeddings + Sled',
    verification: 'Zero Cloud Egress Required',
    icon: Zap,
    color: 'var(--accent-purple)',
    badgeClass: 'stripe-badge-purple',
  },
];

const IPC_CHANNELS = [
  {
    from: 'Agent Harnesses',
    to: 'Runtime Daemon',
    protocol: 'MCP JSON-RPC 2.0',
    port: '8080 / stdio',
    latency: '< 0.5ms',
    security: 'Invariant #6 Redacted',
    purpose: 'Standardized tool invocation, bounded context packet injection & fact extraction',
  },
  {
    from: 'Runtime Daemon',
    to: 'Code Indexer',
    protocol: 'gRPC Protobuf 3',
    port: '50051 (TCP)',
    latency: '< 0.2ms',
    security: 'Local Loopback Socket',
    purpose: 'Sub-millisecond AST symbol extraction, incremental diffs & call hierarchy querying',
  },
  {
    from: 'Web Dashboard',
    to: 'Core Services',
    protocol: 'HTTP / REST',
    port: '3000 -> 8000/8080',
    latency: '< 1.0ms',
    security: 'CORS Restricted',
    purpose: 'Real-time product dashboard, graph visualization & interactive showcase triggers',
  },
  {
    from: 'Context Engine',
    to: 'pgvector & Neo4j',
    protocol: 'PostgreSQL Wire + Bolt',
    port: '5432 / 7687',
    latency: '< 2.5ms',
    security: 'Encrypted Internal Mesh',
    purpose: '384-dimensional semantic similarity search & Cypher call graph traversal',
  },
  {
    from: 'File Watcher',
    to: 'Event Bus',
    protocol: 'NATS JetStream',
    port: '4222 (TCP)',
    latency: '< 0.3ms',
    security: 'At-Least-Once Delivery',
    purpose: 'Filesystem modification notifications, agent activity stream & continuous learning',
  },
];

export default function ArchitecturePage() {
  return (
    <div style={{ display: 'grid', gap: '2.5rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: '6px',
              backgroundColor: 'rgba(139, 92, 246, 0.12)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-purple)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
            }}
          >
            <Layers size={16} />
          </span>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#ffffff' }}>
            System Architecture & Seven Invariants
          </h1>
          <span className="stripe-badge stripe-badge-purple">Formal Guarantees</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Knovra decouples context persistence from ephemeral AI agent harnesses. Explore the foundational axioms, polyglot topology, and IPC protocol matrix.
        </p>
      </div>

      {/* FEATURED HERO: Invariant #1 — The Context Sovereignty Axiom */}
      <div
        className="stripe-card"
        style={{
          padding: '1.75rem 2rem',
          border: '1px solid var(--accent-blue)',
          borderTop: '2px solid var(--accent-blue)',
          background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.08) 0%, rgba(16, 18, 26, 0.95) 100%)',
          boxShadow: '0 0 25px rgba(59, 130, 246, 0.12)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: '6px',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-blue)',
              }}
            >
              <Database size={15} />
            </span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-cyan)', letterSpacing: '0.05em' }}>
              INVARIANT #1 • THE CONTEXT SOVEREIGNTY AXIOM
            </span>
          </div>
          <span className="stripe-badge stripe-badge-green" style={{ fontSize: '0.7rem' }}>
            <Check size={11} style={{ marginRight: '3px' }} />
            STRICTLY ENFORCED VIA MCP
          </span>
        </div>

        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '0.6rem' }}>
          AI Agents Do Not Own Context; Knovra Owns Context and Agents Consume It
        </h2>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '900px', marginBottom: '1.25rem' }}>
          Autonomous coding models (Codex, Claude, Antigravity, Cursor) are transient and swappable workers. Project intelligence—architectural decisions, blast-radius boundaries, and domain rules—is permanent, version-controlled, and durable. Agents interact with Knovra as unprivileged consumers through bounded token packs.
        </p>

        {/* Code Proof Snippet */}
        <div
          style={{
            backgroundColor: 'var(--bg-canvas)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            padding: '0.85rem 1.15rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Code2 size={15} color="var(--accent-blue)" />
            <code style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              bundle, err := planner.SynthesizeContext(ctx, prompt, MaxTokenBudget)
            </code>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            services/runtime/internal/planner/client.go
          </span>
        </div>
      </div>

      {/* 6 OPERATIONAL INVARIANTS: Balanced 3x2 Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Operational Invariants (Invariants #2 — #7)
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Balanced 6-Axiom Governance Grid
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.15rem' }}>
          {OPERATIONAL_INVARIANTS.map((inv) => {
            const Icon = inv.icon;
            return (
              <div
                key={inv.num}
                className="stripe-card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '210px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: inv.color,
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <Icon size={14} />
                    </div>
                    <span className={`stripe-badge ${inv.badgeClass}`} style={{ fontSize: '0.65rem' }}>
                      Invariant #{inv.num}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
                    {inv.title}
                  </h3>
                  <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: inv.color, fontWeight: 700, letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                    {inv.subtitle}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    {inv.description}
                  </p>
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.6rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.7rem',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>{inv.technology}</span>
                  <span style={{ color: 'var(--status-ok)' }}>✓ Enforced</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subsystem Topology Showcase: Balanced 3-Tier Polyglot Mesh */}
      <ArchitectureGraphDemo />

      {/* Inter-Process Communication (IPC) Protocol Matrix */}
      <div className="stripe-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.2rem' }}>
              Inter-Process Communication (IPC) Matrix
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Deterministic latency budgets, wire encodings, and network interfaces across all polyglot boundaries.
            </p>
          </div>
          <span className="stripe-badge stripe-badge-blue">
            <span className="pulsing-dot" style={{ backgroundColor: 'var(--accent-blue)' }} />
            Active Mesh
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px 12px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>IPC Channel Flow</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>Wire Protocol</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>Port / Interface</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>Latency SLA</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>Security Guarantee</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>Operational Purpose</th>
              </tr>
            </thead>
            <tbody>
              {IPC_CHANNELS.map((ch, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
                  }}
                >
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap' }}>
                    {ch.from} <span style={{ color: 'var(--accent-blue)', margin: '0 4px' }}>➔</span> {ch.to}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span className="stripe-badge stripe-badge-purple" style={{ fontSize: '0.68rem' }}>{ch.protocol}</span>
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    {ch.port}
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--status-ok)', fontWeight: 600 }}>
                    {ch.latency}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {ch.security}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                    {ch.purpose}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
