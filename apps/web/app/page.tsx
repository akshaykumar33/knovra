'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Code2,
  Terminal,
  Layers,
  Database,
  Shield,
  Activity,
  Cpu,
  RefreshCw,
  Zap,
  Lock,
  Bot,
  Sliders,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

const CODE_TABS = [
  {
    id: 'context-spec',
    label: '1. Universal Context Spec',
    filename: 'context.yaml — Knovra Context Definition',
    code: `// Define universal project intelligence bounds
export const projectContext = defineContextSpec({
  monorepo: "knovra",
  invariants: ["INV-001", "INV-006"],
  agents: ["claude-code", "codex", "cursor"],
  target: {
    symbol: "AuthInterceptor.authenticate",
    depth: 2,
    tokenBudget: 3500,
  },
});

// Synthesize deterministic context pack
const bundle = await knovra.synthesize(projectContext);
console.log(\`Packed \${bundle.totalTokens} tokens across 12 ADRs\`);`,
  },
  {
    id: 'mcp-gateway',
    label: '2. Model Context Protocol (MCP)',
    filename: 'mcp_client.ts — Autonomous Agent Harness',
    code: `import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Connect any agent to Knovra via standard JSON-RPC 2.0
const transport = new StdioClientTransport({
  command: "knovra",
  args: ["mcp", "serve"],
});
const client = new Client({ name: "claude-code", version: "1.0.0" });
await client.connect(transport);

// Fetch bounded context pack with zero secret leakage
const context = await client.callTool({
  name: "knovra.context",
  arguments: { prompt: "Fix authentication timeout", budget: 3500 },
});`,
  },
  {
    id: 'impact-ast',
    label: '3. Blast-Radius AST Engine',
    filename: 'impact.rs — Tree-sitter Call Graph Traversal',
    code: `// Execute sub-millisecond reverse dependency traversal in Rust
let analyzer = ImpactAnalyzer::new(&code_graph);
let blast_radius = analyzer.analyze_blast_radius(
    "AuthInterceptor.authenticate",
    TraversalDepth::Hops(3)
)?;

// Deterministic risk score: 0 (safe) to 100 (critical)
println!("Risk Score: {}", blast_radius.risk_score); // 94 (Critical)
println!("Upstream Callers: {:?}", blast_radius.callers);
println!("Targeted Test Suites: {:?}", blast_radius.test_suites);`,
  },
];

const ARCH_STANDARDS = [
  {
    num: 1,
    title: 'Context Sovereignty Axiom',
    description: 'AI agents do not own Knovra context. Knovra owns context and agents consume it. Models are replaceable; context is durable.',
    icon: Database,
    color: 'var(--accent-emerald)',
  },
  {
    num: 2,
    title: 'Mediated Agent Gateway',
    description: 'Agent interactions are strictly mediated via MCP JSON-RPC 2.0. Direct database access by autonomous models is prohibited.',
    icon: Lock,
    color: 'var(--accent-cyan)',
  },
  {
    num: 3,
    title: 'Immutable Decision DAG',
    description: 'Architecture Decision Records (ADRs) are strictly immutable. New decisions supersede existing records without rewriting history.',
    icon: Layers,
    color: 'var(--accent-purple)',
  },
  {
    num: 4,
    title: 'Incremental AST Diffing',
    description: 'Code modifications trigger Tree-sitter AST diffing, preserving sub-millisecond query responses without full repository re-scans.',
    icon: RefreshCw,
    color: 'var(--accent-blue)',
  },
  {
    num: 5,
    title: 'Deterministic Token Packing',
    description: '12-Stage Context Planner enforces mathematically bounded token budgets with priority tiering: Invariants first, followed by ADRs.',
    icon: Cpu,
    color: 'var(--accent-amber)',
  },
  {
    num: 6,
    title: 'Zero Secret Leakage',
    description: 'All symbol embeddings, agent transcripts, and memory snapshots are actively sanitized for high-entropy tokens and private keys.',
    icon: Shield,
    color: 'var(--accent-red)',
  },
];

const CAPABILITIES = [
  { subsystem: 'Runtime Daemon', layer: 'Orchestration', tech: 'Go 1.22', port: ':8080', latency: '0.8ms', protocol: 'MCP JSON-RPC', status: 'Active' },
  { subsystem: 'Code Indexer', layer: 'AST Intelligence', tech: 'Rust 1.78 + Tree-sitter', port: ':50051', latency: '0.2ms', protocol: 'gRPC Protobuf', status: 'Active' },
  { subsystem: 'Context Engine', layer: 'Semantic Brain', tech: 'Python 3.11 + FastAPI', port: ':8000', latency: '2.1ms', protocol: 'HTTP REST', status: 'Active' },
  { subsystem: 'Code Graph DB', layer: 'Graph Persistence', tech: 'Neo4j 5.20 Community', port: ':7687', latency: '2.8ms', protocol: 'Bolt / Cypher', status: 'Active' },
  { subsystem: 'Vector Store', layer: 'Vector Persistence', tech: 'PostgreSQL 16 + pgvector', port: ':5432', latency: '1.4ms', protocol: 'Postgres Wire', status: 'Active' },
  { subsystem: 'Event Mesh', layer: 'Telemetry Bus', tech: 'NATS v2.10 JetStream', port: ':4222', latency: '0.3ms', protocol: 'NATS Protocol', status: 'Active' },
];

export default function HomePage() {
  const [activeCodeTab, setActiveCodeTab] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  // Playground state (Swivora / Mongo style)
  const [playgroundTarget, setPlaygroundTarget] = useState('AuthInterceptor.authenticate');
  const [playgroundBudget, setPlaygroundBudget] = useState(3500);
  const [playgroundTask, setPlaygroundTask] = useState('bugfix');
  const [playgroundHarness, setPlaygroundHarness] = useState('claude');
  const [copiedPlayground, setCopiedPlayground] = useState(false);

  const handleCopyCode = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPlaygroundOutput = () => {
    switch (playgroundHarness) {
      case 'claude':
        return `// Lowered via Knovra MCP Gateway for Claude Code
{
  "jsonrpc": "2.0",
  "result": {
    "task": "${playgroundTask}",
    "target": "${playgroundTarget}",
    "token_budget": ${playgroundBudget},
    "tokens_packed": ${Math.round(playgroundBudget * 0.92)},
    "invariants_enforced": ["INV-001 (Sovereignty)", "INV-006 (Zero Secrets)"],
    "governing_adrs": ["ADR-001", "ADR-005"],
    "ast_callers": ["GatewayServer.HandleToolCall", "DaemonServer.ServeHTTP"],
    "recommended_tests": ["services/runtime/internal/auth/auth_test.go"],
    "context_freshness": "valid (0.18ms latency)"
  }
}`;
      case 'codex':
        return `### KNOVRA CONTEXT PACKET (CODEX HARNESS)
TASK: ${playgroundTask.toUpperCase()} | TARGET: ${playgroundTarget}
BOUNDED TOKENS: ${Math.round(playgroundBudget * 0.92)} / ${playgroundBudget}

## 1. Governing Architecture Invariants
- Invariant #1: Agents do not own context. Knovra owns context and models consume it.
- Invariant #6: Zero secret leakage strictly verified across all parameters.

## 2. Active ADR Lineage
- ADR-001: Polyglot Monorepo Architecture (ACCEPTED)
- ADR-005: Zero-Defect Git Intervention Gate (ACCEPTED)

## 3. Targeted Source Symbols
- services/runtime/internal/auth/interceptor.go:18
  func (a *AuthInterceptor) authenticate(ctx context.Context, token string) (User, error)`;
      case 'cursor':
        return `// Knovra Context Provider for Cursor IDE (.cursorrules)
{
  "contextType": "knovra.synthesized.bundle",
  "symbol": "${playgroundTarget}",
  "taskIntent": "${playgroundTask}",
  "tokenBudget": ${playgroundBudget},
  "astLineage": {
    "sourceFile": "services/runtime/internal/auth/interceptor.go",
    "callDepth": 2,
    "callersCount": 3,
    "testSuite": "services/runtime/internal/auth/auth_test.go"
  }
}`;
      case 'cli':
        return `$ knovra plan "${playgroundTarget}" --type ${playgroundTask} --budget ${playgroundBudget}

✓ Synthesized bounded context bundle in 0.18ms!
  • Target Symbol:   ${playgroundTarget}
  • Task Intent:     ${playgroundTask}
  • Allocated:       ${Math.round(playgroundBudget * 0.92)} tokens (Cap: ${playgroundBudget})
  • ADRs Attached:   2 decisions (ADR-001, ADR-005)
  • AST Callers:     3 upstream functions mapped
  • Invariants:      100% compliant (0 violations)`;
      default:
        return '';
    }
  };

  return (
    <div style={{ display: 'grid', gap: '5.5rem' }}>
      {/* 1. HERO SECTION (Swivora MorphDB Centered Style) */}
      <section style={{ textAlign: 'center', paddingTop: '2.5rem', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Top Category Pill */}
        <div style={{ display: 'inline-flex', marginBottom: '1.75rem' }}>
          <div className="category-pill">
            <Sparkles size={14} />
            <span>Universal Project Intelligence Layer (UPIL) for AI Agents</span>
          </div>
        </div>

        {/* Massive Gradient Headline */}
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.25rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.035em',
            marginBottom: '1.5rem',
            color: '#ffffff',
          }}
        >
          Models Are Transient.<br />
          <span className="text-gradient-emerald">Project Intelligence Is Permanent.</span>
        </h1>

        {/* High-Contrast Centered Subtitle */}
        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '780px',
            margin: '0 auto 2.5rem auto',
          }}
        >
          Knovra translates codebases, architectural decisions, and blast-radii across{' '}
          <strong style={{ color: '#ffffff' }}>Go</strong>, <strong style={{ color: '#ffffff' }}>Rust</strong>, and{' '}
          <strong style={{ color: '#ffffff' }}>Python</strong> while keeping autonomous AI coding agents 100% synchronized via the Model Context Protocol.
        </p>

        {/* Dual Call to Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/architecture" className="btn-morph-primary">
            <span>Explore Core Architecture</span>
            <ArrowRight size={16} />
          </Link>
          <a href="#playground" className="btn-morph-glass">
            <Terminal size={16} color="var(--accent-cyan)" />
            <span>Launch Context Playground</span>
          </a>
        </div>
      </section>

      {/* 2. INTERACTIVE CODE SWITCHER (macOS Window) */}
      <section style={{ maxWidth: '1050px', margin: '0 auto', width: '100%' }}>
        {/* Segmented Code Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          {CODE_TABS.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveCodeTab(idx)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: activeCodeTab === idx ? 700 : 500,
                color: activeCodeTab === idx ? '#000000' : 'var(--text-secondary)',
                background: activeCodeTab === idx ? 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)' : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${activeCodeTab === idx ? 'transparent' : 'var(--border-default)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeCodeTab === idx ? '0 0 16px rgba(16, 185, 129, 0.35)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* macOS Style Window Box */}
        <div className="macos-window">
          {/* Window Header */}
          <div className="macos-header">
            <div className="macos-dots">
              <span className="macos-dot-red" />
              <span className="macos-dot-yellow" />
              <span className="macos-dot-green" />
              <span style={{ marginLeft: '12px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {CODE_TABS[activeCodeTab].filename}
              </span>
            </div>

            <button
              onClick={() => handleCopyCode(CODE_TABS[activeCodeTab].code, setCopiedCode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: copiedCode ? 'var(--status-ok)' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {copiedCode ? <Check size={13} /> : <Copy size={13} />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Syntax Highlighted Code Content */}
          <div style={{ padding: '1.25rem 1.75rem', overflowX: 'auto', backgroundColor: '#060910' }}>
            <pre style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.84rem', lineHeight: 1.7, color: '#E2E8F0' }}>
              <code>{CODE_TABS[activeCodeTab].code}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* 3. REAL-TIME AST & CONTEXT PLAYGROUND (Swivora / Mongo Style) */}
      <section id="playground" style={{ maxWidth: '1250px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>
            <span className="category-pill">
              <Activity size={13} />
              <span>Interactive Live Engine Demo</span>
            </span>
          </div>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
            Real-Time AST Compilation & Context Playground
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto' }}>
            Edit parameters dynamically and observe how Knovra lowers query ASTs into target agent context packs and JSON-RPC envelopes.
          </p>
        </div>

        {/* Playground Split Window */}
        <div className="macos-window">
          {/* Playground Header Bar */}
          <div className="macos-header">
            <div className="macos-dots">
              <span className="macos-dot-red" />
              <span className="macos-dot-yellow" />
              <span className="macos-dot-green" />
              <span style={{ marginLeft: '12px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                knovra_runtime_daemon (Port 8080)
              </span>
            </div>

            {/* Target Harness Switcher Tabs */}
            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginRight: '6px' }}>Target Harness:</span>
              {[
                { id: 'claude', label: 'Claude Code' },
                { id: 'codex', label: 'Codex Agent' },
                { id: 'cursor', label: 'Cursor IDE' },
                { id: 'cli', label: 'Go CLI' },
              ].map((h) => (
                <button
                  key={h.id}
                  onClick={() => setPlaygroundHarness(h.id)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.74rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: playgroundHarness === h.id ? 'var(--status-ok)' : 'rgba(255, 255, 255, 0.05)',
                    color: playgroundHarness === h.id ? '#000000' : 'var(--text-secondary)',
                    fontWeight: playgroundHarness === h.id ? 700 : 500,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {/* Playground Body: Controls on Left, Lowered Code Output on Right */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.6fr', minHeight: '440px' }}>
            {/* Left Parameters Panel */}
            <div
              style={{
                backgroundColor: 'rgba(8, 12, 20, 0.95)',
                borderRight: '1px solid var(--border-default)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.35rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', letterSpacing: '0.04em' }}>
                  <Sliders size={14} color="var(--accent-cyan)" />
                  <span>SYNTHESIS PARAMETERS</span>
                </div>
                <span className="stripe-badge stripe-badge-green" style={{ fontSize: '0.62rem' }}>
                  <span className="pulsing-dot" />
                  Live Reactive
                </span>
              </div>

              {/* Input 1: Entity / Target Symbol */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Target AST Symbol:
                </label>
                <input
                  type="text"
                  value={playgroundTarget}
                  onChange={(e) => setPlaygroundTarget(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: 'var(--bg-code)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#ffffff',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Input 2: Task Intent */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Task Intent Classifier:
                </label>
                <select
                  value={playgroundTask}
                  onChange={(e) => setPlaygroundTask(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    backgroundColor: 'var(--bg-code)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#ffffff',
                    outline: 'none',
                  }}
                >
                  <option value="bugfix">Bugfix (Prioritize error history & caller diffs)</option>
                  <option value="feature">Feature (Prioritize active ADRs & invariants)</option>
                  <option value="refactor">Refactor (Prioritize call hierarchy & regression tests)</option>
                  <option value="code_review">Code Review (Audit governance rules & secrets)</option>
                </select>
              </div>

              {/* Input 3: Token Budget Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Bounded Token Budget:
                  </label>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    {playgroundBudget.toLocaleString()} tokens
                  </span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={8000}
                  step={250}
                  value={playgroundBudget}
                  onChange={(e) => setPlaygroundBudget(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-emerald)', cursor: 'pointer' }}
                />
              </div>

              {/* Telemetry Metrics */}
              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'grid',
                  gap: '0.4rem',
                  fontSize: '0.74rem',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>AST Traversal Pass:</span>
                  <span style={{ color: 'var(--accent-cyan)' }}>Tree-sitter (Pass 1)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Compiler Latency:</span>
                  <span style={{ color: 'var(--status-ok)' }}>&lt; 0.18 ms</span>
                </div>
              </div>
            </div>

            {/* Right Output Panel */}
            <div style={{ backgroundColor: '#05080E', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {playgroundHarness.toUpperCase()} COMPILED OUTPUT
                </div>
                <button
                  onClick={() => handleCopyCode(getPlaygroundOutput(), setCopiedPlayground)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: copiedPlayground ? 'var(--status-ok)' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    padding: '3px 9px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                  }}
                >
                  {copiedPlayground ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedPlayground ? 'Copied' : 'Copy Output'}</span>
                </button>
              </div>

              <pre
                style={{
                  flex: 1,
                  margin: 0,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  lineHeight: 1.65,
                  color: '#94A3B8',
                  overflowY: 'auto',
                }}
              >
                <code>{getPlaygroundOutput()}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ENTERPRISE ARCHITECTURE STANDARDS (3x2 Glass Cards) */}
      <section style={{ maxWidth: '1250px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
            Enterprise Architecture Standards
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto' }}>
            Architected following Clean Architecture, AST compiler lowering passes, and strict polyglot invariants.
          </p>
        </div>

        {/* 3x2 Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.35rem' }}>
          {ARCH_STANDARDS.map((std) => {
            const Icon = std.icon;
            return (
              <div
                key={std.num}
                className="stripe-card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '190px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-canvas)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: std.color,
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <span className="stripe-badge" style={{ color: std.color, backgroundColor: 'var(--bg-canvas)' }}>
                      Invariant #{std.num}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.45rem' }}>
                    {std.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {std.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. DYNAMIC CAPABILITY MATRIX */}
      <section style={{ maxWidth: '1250px', margin: '0 auto', width: '100%' }}>
        <div className="stripe-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.2rem' }}>
                Dynamic Subsystem Capability Matrix
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Polyglot micro-service network specifications, interfaces, and sub-millisecond SLAs.
              </p>
            </div>
            <span className="stripe-badge stripe-badge-green">
              <span className="pulsing-dot" />
              All 6 Engines Synchronized
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px 12px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>Subsystem</th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>Architecture Layer</th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>Technology</th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>Interface Port</th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>Wire Protocol</th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>Latency SLA</th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {CAPABILITIES.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
                    }}
                  >
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#ffffff' }}>{row.subsystem}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{row.layer}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{row.tech}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)' }}>{row.port}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className="stripe-badge stripe-badge-blue" style={{ fontSize: '0.65rem' }}>{row.protocol}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--status-ok)', fontWeight: 600 }}>{row.latency}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className="stripe-badge stripe-badge-green" style={{ fontSize: '0.65rem' }}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
