'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  FileCode2,
  Network,
  ShieldCheck,
  Layers,
  Terminal,
  GitBranch,
  Cpu,
  Sparkles,
  Zap,
  CheckCircle2,
  HardDrive,
  Bot,
  Activity,
  ChevronRight,
  Search,
  Key,
} from 'lucide-react';
import { motion } from 'framer-motion';
import AuroraGlow from '../components/AuroraGlow';
import SpotlightCard from '../components/SpotlightCard';
import { KnovraButton } from '../components/ui/KnovraButton';

interface ChangeExample {
  name: string;
  file: string;
  rule: string;
  ruleSeverity: 'error' | 'warning' | 'info';
  detail: string;
  tokens: number;
  callers: number;
  astSnippet: string;
}

const EXAMPLES: ChangeExample[] = [
  {
    name: 'Authentication Boundary',
    file: 'auth.interceptor.go',
    rule: 'RULE-001: Tenant Isolation',
    ruleSeverity: 'error',
    detail: 'Cryptographically enforce tenant namespace isolation before any RPC routes to handler logic.',
    tokens: 380,
    callers: 14,
    astSnippet: 'func (a *AuthInterceptor) EnforceTenant(ctx context.Context, tenantID string) error',
  },
  {
    name: 'Data Access Engine',
    file: 'query.builder.rs',
    rule: 'RULE-004: Bounded Queries',
    ruleSeverity: 'warning',
    detail: 'AST-analyzed SQL queries must specify explicit LIMIT clauses and avoid unindexed table scans.',
    tokens: 520,
    callers: 8,
    astSnippet: 'pub fn build_bounded_query(filter: &QueryFilter, max_limit: u32) -> Result<QueryPlan>',
  },
  {
    name: 'API Gateway Router',
    file: 'gateway.service.ts',
    rule: 'RULE-007: Strict Schema Validation',
    ruleSeverity: 'info',
    detail: 'Incoming JSON payloads must validate against Protobuf generated contracts before dispatch.',
    tokens: 410,
    callers: 22,
    astSnippet: 'export async function dispatchGatewayRequest(req: FastifyRequest): Promise<RouteResult>',
  },
];

const INTEGRATIONS = [
  { name: 'Claude Code', type: 'Anthropic', color: '#A78BFA' },
  { name: 'Codex & Cursor', type: 'OpenAI / Cursor', color: '#34D399' },
  { name: 'Gemini CLI', type: 'Google', color: '#38BDF8' },
  { name: 'MCP Clients', type: 'JSON-RPC 2.0', color: '#FBBF24' },
  { name: 'Local Ollama', type: 'Air-Gapped / Private', color: '#22D3EE' },
];

export default function Home() {
  const [selected, setSelected] = useState(0);
  const item = EXAMPLES[selected];

  return (
    <>
      {/* Hero Section */}
      <div className="landing-hero" style={{ position: 'relative' }}>
        {/* Dynamic Aurora Glow */}
        <AuroraGlow />

        <motion.section
          className="landing-intro"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <Link href="/docs" className="glass-pill launch-note" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
            <span className="pulsing-dot" />
            <span style={{ fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: '0.04em' }}>KNOVRA RUNTIME</span>
            <span className="font-calligraphy" style={{ color: 'var(--text-secondary)' }}>Persistent project intelligence</span>
            <ArrowUpRight size={13} style={{ color: 'var(--accent-primary)' }}/>
          </Link>

          <h1 style={{ fontWeight: 800 }}>
            Great code starts with<br/>
            <em className="font-calligraphy text-gradient-aurora">the whole picture.</em>
          </h1>

          <p style={{ marginTop: '1.25rem', fontSize: '1.1rem', lineHeight: 1.75, color: 'var(--text-secondary)' }}>
            Your code relationships, architectural decisions, and governance invariants connected in one high-performance local graph. Ready for developers—or autonomous agents.
          </p>

          <div className="landing-actions" style={{ marginTop: '2.25rem', gap: '1rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <KnovraButton href="/projects" variant="primary" size="lg" iconTrailing={<ArrowRight size={16} />}>
              Launch Workspace
            </KnovraButton>
            <KnovraButton href="/graph" variant="secondary" size="lg" icon={<Network size={16} style={{ color: 'var(--accent-primary)' }} />}>
              Explore Graph
            </KnovraButton>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            <span className="glass-pill" style={{ fontSize: '11px', padding: '4px 12px' }}>
              <HardDrive size={13} style={{ color: 'var(--accent-primary)' }}/> Local-First & Air-Gapped
            </span>
            <span className="glass-pill" style={{ fontSize: '11px', padding: '4px 12px' }}>
              <Zap size={13} style={{ color: 'var(--status-ok)' }}/> Sub-millisecond AST Diffs
            </span>
            <span className="glass-pill" style={{ fontSize: '11px', padding: '4px 12px' }}>
              <ShieldCheck size={13} style={{ color: 'var(--accent-secondary)' }}/> Zero Cloud Leakage
            </span>
          </div>
        </motion.section>

        {/* Interactive Change Pipeline Stage */}
        <section className="landing-stage glass-panel-luxury" aria-label="Interactive project knowledge example" style={{ position: 'relative', zIndex: 1 }}>
          <div className="stage-toolbar" style={{ backdropFilter: 'blur(16px)', background: 'color-mix(in srgb, var(--bg-primary) 70%, transparent)' }}>
            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pulsing-dot" />
              <Network size={16} style={{ color: 'var(--accent-primary)' }}/>
              Live Context Pipeline
            </span>
            <span className="glass-pill" style={{ fontSize: '10px', padding: '3px 8px', fontFamily: 'var(--font-mono)' }}>
              DAEMON :8080 • ACTIVE
            </span>
          </div>

          <div className="stage-content">
            <div className="stage-files" style={{ background: 'color-mix(in srgb, var(--bg-canvas) 50%, transparent)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={13} style={{ color: 'var(--accent-primary)' }} />
                EXPLORE A TARGET
              </h3>
              {EXAMPLES.map((e, i) => (
                <button
                  key={e.name}
                  aria-pressed={selected === i}
                  onClick={() => setSelected(i)}
                  className="glass-card"
                  style={{
                    padding: '10px 14px',
                    marginBottom: '8px',
                    borderRadius: '10px',
                    borderColor: selected === i ? 'var(--accent-primary)' : 'var(--border-default)',
                    background: selected === i ? 'color-mix(in srgb, var(--accent-primary) 12%, var(--bg-card))' : 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <FileCode2 size={15} style={{ color: selected === i ? 'var(--accent-primary)' : 'var(--text-muted)' }}/>
                    <strong style={{ fontSize: '12px', color: selected === i ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{e.name}</strong>
                  </div>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{e.file}</span>
                </button>
              ))}
            </div>

            <div className="stage-graph">
              <div className="stage-flow">
                {/* Node 1 */}
                <div className="stage-node glass-card" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ padding: '6px', borderRadius: '6px', background: 'var(--accent-glow)', color: 'var(--accent-primary)' }}>
                    <Terminal size={15}/>
                  </span>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TRIGGER</div>
                    <strong style={{ fontSize: '12px' }}>{item.name}</strong>
                  </div>
                </div>

                {/* Node 2 (Active Target) */}
                <div className="stage-node active glass-panel-luxury" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ padding: '6px', borderRadius: '6px', background: 'color-mix(in srgb, var(--accent-primary) 25%, transparent)', color: 'var(--accent-primary)' }}>
                    <FileCode2 size={16}/>
                  </span>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--accent-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>AST SYMBOL</div>
                    <strong style={{ fontSize: '13px' }}>{item.file}</strong>
                  </div>
                  <span className="glass-pill" style={{ marginLeft: 'auto', fontSize: '10px', padding: '2px 6px' }}>
                    {item.tokens} tokens
                  </span>
                </div>

                {/* Node 3 */}
                <div className="stage-node glass-card" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ padding: '6px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--status-danger)' }}>
                    <ShieldCheck size={15}/>
                  </span>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>GOVERNANCE INVARIANT</div>
                    <strong style={{ fontSize: '12px' }}>{item.rule}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="stage-inspector glass-card" aria-live="polite">
              <h3>CONTEXT & PROVENANCE</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0 8px' }}>
                <GitBranch size={18} style={{ color: 'var(--accent-primary)' }}/>
                <strong style={{ fontSize: '15px' }}>{item.name}</strong>
              </div>
              <p style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{item.detail}</p>
              
              <div style={{ margin: '16px 0', padding: '10px', borderRadius: '8px', background: 'var(--bg-code)', border: '1px solid var(--code-border)' }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '4px' }}>AST DECLARATION:</div>
                <code style={{ fontSize: '11px', color: 'var(--text-code)', wordBreak: 'break-all' }}>{item.astSnippet}</code>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                <span>Upstream Callers: <strong style={{ color: 'var(--text-primary)' }}>{item.callers}</strong></span>
                <span>Budget: <strong style={{ color: 'var(--accent-primary)' }}>{item.tokens} toks</strong></span>
              </div>

              <Link href="/graph" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}>
                Inspect interactive graph <ArrowUpRight size={14}/>
              </Link>

              <label className="home-task-select" style={{ marginTop: '18px' }}>
                Quick Selector
                <select 
                  aria-label="Example task" 
                  value={selected} 
                  onChange={e=>setSelected(Number(e.target.value))}
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '8px', color: 'var(--text-primary)' }}
                >
                  {EXAMPLES.map((e,i)=><option key={e.name} value={i}>{e.name} ({e.file})</option>)}
                </select>
              </label>
            </div>
          </div>

          <div className="stage-caption" style={{ background: 'color-mix(in srgb, var(--bg-primary) 80%, transparent)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={13} style={{ color: 'var(--status-ok)' }} />
              AST Symbol · Graph Edge · Architectural Rule
            </span>
            <span>Deterministic context compilation. Zero guesswork.</span>
          </div>
        </section>
      </div>

      {/* Integrations Ribbon */}
      <div className="landing-integrations" style={{ borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)', padding: '24px 0' }}>
        <small className="eyebrow-serif" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Plug-and-play with any developer harness:
        </small>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {INTEGRATIONS.map((integ) => (
            <div key={integ.name} className="glass-card" style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '9999px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: integ.color, boxShadow: `0 0 8px ${integ.color}` }} />
              <strong style={{ fontSize: '13px', fontWeight: 600 }}>{integ.name}</strong>
              <small style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{integ.type}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Pillars */}
      <section className="landing-section">
        <div className="landing-section-header">
          <div>
            <span className="eyebrow-serif" style={{ display: 'block', marginBottom: '8px' }}>ARCHITECTURAL MEMORY</span>
            <h2>Less searching.<br/><span className="text-gradient-aurora">More understanding.</span></h2>
          </div>
          <p>
            Move seamlessly from an ambiguous question to the exact symbol, surrounded by the decisions and governance rules that shape it.
          </p>
        </div>

        <div className="landing-features">
          {[
            {
              icon: Network,
              title: 'Multi-Hop Code Graph',
              badge: 'Neo4j & AST',
              body: 'Follow callers, callees, database queries, and rule boundaries across polyglot microservices and monorepos.',
              href: '/graph',
              cta: 'Launch Code Graph',
            },
            {
              icon: Layers,
              title: 'Deterministic Context Studio',
              badge: 'Token Packing',
              body: 'Synthesize minimum sufficient context bundles packed by strict priority tiers: Invariants > ADRs > Call Trees.',
              href: '/context',
              cta: 'Open Context Studio',
            },
            {
              icon: ShieldCheck,
              title: 'Immutable Decision Lineage',
              badge: 'ADR Preservation',
              body: 'Capture the reasoning behind code modifications so future developer sessions and AI agents never repeat mistakes.',
              href: '/decisions',
              cta: 'Browse Decisions',
            },
          ].map((f) => (
            <Link key={f.title} href={f.href} style={{ textDecoration: 'none', display: 'flex' }}>
              <SpotlightCard
                className="landing-feature"
                spotlightColor="rgba(16, 185, 129, 0.24)"
                style={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '28px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--accent-glow)', border: '1px solid var(--accent-primary)', display: 'grid', placeItems: 'center', color: 'var(--accent-primary)' }}>
                    <f.icon size={22} />
                  </div>
                  <span className="glass-pill" style={{ fontSize: '10px' }}>{f.badge}</span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, margin: '14px 0 10px', color: 'var(--text-primary)' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1, margin: 0 }}>{f.body}</p>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '20px' }}>
                  {f.cta} <ArrowUpRight size={14} />
                </span>
              </SpotlightCard>
            </Link>
          ))}
        </div>
      </section>

      {/* High-Converting CTA Banner */}
      <section 
        className="landing-cta glass-panel-luxury" 
        style={{
          margin: '2rem 0 4rem',
          padding: '48px 40px',
          borderRadius: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          background: 'radial-gradient(ellipse at 80% 50%, var(--accent-glow), transparent 70%), var(--bg-card)',
        }}
      >
        <div>
          <span className="eyebrow-serif" style={{ display: 'block', marginBottom: '8px' }}>START EMPOWERING YOUR AGENTS</span>
          <h2 style={{ fontSize: 'clamp(28px, 3.2vw, 42px)', fontWeight: 800 }}>
            Your next task.<br/><span className="font-calligraphy text-gradient-aurora">A dramatically better starting point.</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '520px' }}>
            Run Knovra locally in your repository with zero cloud dependencies and immediate MCP interoperability.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <KnovraButton href="/projects" variant="primary" size="lg" iconTrailing={<ArrowRight size={16} />}>
            Open Workspace
          </KnovraButton>
          <KnovraButton href="/docs" variant="secondary" size="lg">
            Documentation
          </KnovraButton>
        </div>
      </section>
    </>
  );
}
