'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  Cpu,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Layers,
  Network,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  Zap,
  Terminal,
  Copy,
  Check,
  Code2,
  Database,
  Lock,
} from 'lucide-react';
import {
  METRICS,
  SYSTEM_SERVICES,
  RECENT_COMMITS,
  ADRS,
  RULES,
  AGENTS,
} from '../lib/data';
import { getSystemStatus } from '../lib/api';
import MemoryTransferDemo from '../components/showcases/MemoryTransferDemo';
import ImpactSimulatorDemo from '../components/showcases/ImpactSimulatorDemo';
import ArchitectureGraphDemo from '../components/showcases/ArchitectureGraphDemo';
import DecisionTimelineDemo from '../components/showcases/DecisionTimelineDemo';

export default function OverviewPage() {
  const [activeShowcase, setActiveShowcase] = useState<'memory' | 'impact' | 'arch' | 'timeline'>('memory');
  const [engineLive, setEngineLive] = useState<boolean>(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'mcp' | 'cli' | 'rest'>('mcp');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getSystemStatus().then((status) => {
      if (isMounted) setEngineLive(status.contextEngine);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const showcaseTabs = [
    { id: 'memory', label: 'Memory Transfer', icon: Zap, badge: 'Invariant #1' },
    { id: 'impact', label: 'Impact Simulator', icon: Activity, badge: 'Phase 12' },
    { id: 'arch', label: 'Architecture Topology', icon: Network, badge: 'Polyglot' },
    { id: 'timeline', label: 'ADR Decision Timeline', icon: GitPullRequest, badge: 'History' },
  ] as const;

  const codeSnippets = {
    mcp: `// Connect any agent harness via Model Context Protocol
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "knovra",
  args: ["mcp", "serve"]
});
const client = new Client({ name: "claude-code", version: "1.0.0" });
await client.connect(transport);

// Fetch bounded context pack with zero hallucinations
const context = await client.callTool({
  name: "knovra.plan",
  arguments: { task: "refactor auth interceptor", budget_tokens: 8000 }
});`,
    cli: `# 1. Fast incremental AST parsing with Tree-sitter
knovra status --workspace apps/web

# 2. Estimate blast radius before committing changes
knovra impact analyze --target "AuthInterceptor.authenticate" --depth 2

# 3. Query pgvector semantic memory across 14,280 symbols
knovra semantic query --prompt "where are token budgets validated"

# 4. Synthesize durable context bundle for active agent
knovra plan pack --task "implement call hierarchy visitor" --out context.md`,
    rest: `# Query pgvector semantic context engine (FastAPI :8000)
curl -X POST "http://localhost:8000/context/plan" \\
  -H "Content-Type: application/json" \\
  -d '{
    "task": "Refactor AuthInterceptor to support mTLS",
    "budget_tokens": 8000,
    "include_invariants": true,
    "enforce_provenance": true
  }'`,
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  return (
    <div style={{ display: 'grid', gap: '2.5rem' }}>
      {/* Stripe-Grade Hero Section */}
      <div
        className="stripe-card"
        style={{
          padding: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(24, 28, 46, 0.8) 0%, rgba(10, 12, 20, 0.95) 100%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.25)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.3fr) 1.2fr', gap: '2.5rem', alignItems: 'center' }}>
          {/* Hero Content Left */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span className="stripe-badge stripe-badge-green">
                <span className="pulsing-dot" style={{ width: 5, height: 5 }} />
                Milestone V0.4 Live
              </span>
              <span className="stripe-badge stripe-badge-purple">Local-First Ready</span>
              {engineLive && (
                <span className="stripe-badge stripe-badge-blue">Engine :8000 Synced</span>
              )}
            </div>

            <h1
              style={{
                fontSize: '2.25rem',
                fontWeight: 800,
                letterSpacing: '-0.035em',
                lineHeight: 1.15,
                color: '#FFFFFF',
                marginBottom: '1rem',
              }}
            >
              Universal Project Intelligence Layer
            </h1>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.75rem', maxWidth: '540px' }}>
              Durable context hub for AI development agents. Invariant #1: <em>Agents do not own context. Knovra owns context and agents consume it.</em> Models are replaceable; project intelligence is permanent.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href="/impact" className="btn-stripe-primary">
                <Activity size={15} />
                <span>Simulate Change Impact</span>
              </Link>
              <Link href="/decisions" className="btn-stripe-secondary">
                <GitPullRequest size={15} />
                <span>Explore 12 ADRs</span>
              </Link>
            </div>
          </div>

          {/* Stripe-Style Code Playground Right */}
          <div className="code-playground" style={{ boxShadow: 'var(--shadow-lg)' }}>
            {/* Header with Tabs */}
            <div className="code-header">
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {(['mcp', 'cli', 'rest'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCodeTab(tab)}
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: activeCodeTab === tab ? 'var(--bg-tertiary)' : 'transparent',
                      color: activeCodeTab === tab ? '#ffffff' : 'var(--text-muted)',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    {tab === 'mcp' ? 'TypeScript (MCP)' : tab === 'cli' ? 'Go CLI' : 'cURL / REST'}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopyCode}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.7rem',
                  color: copiedCode ? 'var(--status-ok)' : 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {copiedCode ? <Check size={11} /> : <Copy size={11} />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Code Body */}
            <pre
              style={{
                padding: '1rem',
                margin: 0,
                color: '#E2E8F0',
                fontSize: '0.74rem',
                lineHeight: 1.55,
                overflowX: 'auto',
                maxHeight: '260px',
              }}
            >
              {codeSnippets[activeCodeTab]}
            </pre>
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Metric Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div className="stripe-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Indexed Symbols
            </span>
            <span className="stripe-badge stripe-badge-blue">+342 delta</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-mono)', letterSpacing: '-0.03em' }}>
            {METRICS.indexedSymbols.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Tree-sitter AST indexed in 0.2ms
          </div>
        </div>

        <div className="stripe-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Decisions
            </span>
            <span className="stripe-badge stripe-badge-purple">12 ADRs</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.03em' }}>
            {METRICS.activeDecisions}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Immutable supersession DAG
          </div>
        </div>

        <div className="stripe-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Governance Rules
            </span>
            <span className="stripe-badge stripe-badge-green">0 Violations</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--status-ok)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.03em' }}>
            {METRICS.rulesCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Zero secret leaks detected
          </div>
        </div>

        <div className="stripe-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Connected Agents
            </span>
            <span className="stripe-badge stripe-badge-blue">MCP 2.0</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.03em' }}>
            {AGENTS.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Codex, Claude, Cursor, Windsurf
          </div>
        </div>
      </section>

      {/* Interactive Showcase Demos Section */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Interactive Product Showcase Lab
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Test Knovra&apos;s core architectural innovations live in your browser
            </p>
          </div>

          {/* Segmented Control Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '0.25rem',
              backgroundColor: 'var(--bg-canvas)',
              padding: '3px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
            }}
          >
            {showcaseTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeShowcase === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveShowcase(tab.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={13} color={isActive ? 'var(--accent-blue)' : 'var(--text-muted)'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Showcase */}
        <div>
          {activeShowcase === 'memory' && <MemoryTransferDemo />}
          {activeShowcase === 'impact' && <ImpactSimulatorDemo />}
          {activeShowcase === 'arch' && <ArchitectureGraphDemo />}
          {activeShowcase === 'timeline' && <DecisionTimelineDemo />}
        </div>
      </section>

      {/* Grid: Subsystem Telemetry & Recent Provenance */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Subsystem Health Table */}
        <div className="stripe-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
              Subsystem Grid & Latency
            </h3>
            <span className="stripe-badge stripe-badge-green">All 6 Healthy</span>
          </div>

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {SYSTEM_SERVICES.map((svc) => (
              <div
                key={svc.name}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#ffffff' }}>
                    {svc.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {svc.role}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    :{svc.port}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--status-ok)', fontWeight: 600 }}>
                    ACTIVE
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Git Provenance */}
        <div className="stripe-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
              Recent Git Provenance
            </h3>
            <Link href="/history" style={{ fontSize: '0.78rem', color: 'var(--accent-blue)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              Full History <ArrowRight size={12} />
            </Link>
          </div>

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {RECENT_COMMITS.map((cmt) => (
              <div
                key={cmt.hash}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {cmt.hash}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {cmt.date}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#E2E8F0', fontWeight: 500, marginBottom: '0.25rem' }}>
                  {cmt.message}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span>{cmt.author}</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{cmt.filesChanged} files modified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
