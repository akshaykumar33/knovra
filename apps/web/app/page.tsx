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
    { id: 'memory', label: 'Memory Transfer Demo', icon: Zap, badge: 'Invariant #1' },
    { id: 'impact', label: 'Impact Simulator', icon: Activity, badge: 'Phase 12' },
    { id: 'arch', label: 'Architecture Topology', icon: Network, badge: 'Polyglot' },
    { id: 'timeline', label: 'ADR Decision Timeline', icon: GitPullRequest, badge: 'History' },
  ] as const;

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Hero Welcome Banner */}
      <div
        className="glass-card"
        style={{
          padding: '2rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
          borderColor: 'rgba(59, 130, 246, 0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '720px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span className="badge badge-ok">Milestone V0.4 Live</span>
              <span className="badge badge-purple">Local-First Ready</span>
              {engineLive && <span className="badge badge-cyan">Context Engine :8000 Synced</span>}
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem', color: '#ffffff' }}>
              Knovra Project Intelligence Layer
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              Universal, durable context hub for AI development agents. Invariant #1: <em>Agents do not own context. Knovra owns context and agents consume it.</em>
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link href="/impact" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontSize: '0.85rem' }}>
                <Activity size={15} />
                Explore Impact Engine
              </Link>
              <Link href="/decisions" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontSize: '0.85rem' }}>
                <GitPullRequest size={15} />
                View 12 ADRs
              </Link>
            </div>
          </div>

          {/* Quick Metrics Capsule */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              minWidth: '280px',
            }}
          >
            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Indexed Symbols</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
                {METRICS.indexedSymbols.toLocaleString()}
              </div>
            </div>
            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active ADRs</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)' }}>
                {METRICS.activeDecisions}
              </div>
            </div>
            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Governance Rules</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--status-ok)', fontFamily: 'var(--font-mono)' }}>
                {METRICS.rulesCount}
              </div>
            </div>
            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Agent Sessions</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                {METRICS.agentSessions}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Showcase Demos Section */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Interactive Product Showcases
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Experience the core innovations of Knovra&apos;s architecture live in the browser
            </p>
          </div>

          {/* Tab buttons */}
          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              backgroundColor: 'var(--bg-secondary)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
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
                    gap: '0.5rem',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    backgroundColor: isActive ? 'var(--accent-blue)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Showcase active view */}
        <div>
          {activeShowcase === 'memory' && <MemoryTransferDemo />}
          {activeShowcase === 'impact' && <ImpactSimulatorDemo />}
          {activeShowcase === 'arch' && <ArchitectureGraphDemo />}
          {activeShowcase === 'timeline' && <DecisionTimelineDemo />}
        </div>
      </section>

      {/* Grid: Core Subsystems & Infrastructure */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Subsystems List */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Subsystem Grid
            </h3>
            <span className="badge badge-ok">All 6 Active</span>
          </div>
          <div style={{ display: 'grid', gap: '0.85rem' }}>
            {SYSTEM_SERVICES.map((svc) => (
              <div
                key={svc.name}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    {svc.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {svc.role}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    :{svc.port}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--status-ok)', fontWeight: 600 }}>
                    HEALTHY
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Provenance Activity */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Git Provenance
            </h3>
            <Link href="/history" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              Full History <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ display: 'grid', gap: '0.85rem' }}>
            {RECENT_COMMITS.map((cmt) => (
              <div
                key={cmt.hash}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-blue)' }}>
                    {cmt.hash}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {cmt.date}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.35rem' }}>
                  {cmt.message}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>{cmt.author}</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{cmt.filesChanged} files changed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
