'use client';

import React from 'react';
import Link from 'next/link';
import {
  HardDrive,
  Cloud,
  ShieldCheck,
  Lock,
  Database,
  Terminal,
  ArrowRight,
  Sparkles,
  Server,
  FolderGit2,
  CheckCircle2,
  XCircle,
  EyeOff,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import { SpotlightCard } from '../../components/SpotlightCard';
import { AuroraGlow } from '../../components/AuroraGlow';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { KnovraButton } from '../../components/ui/KnovraButton';

export default function LocalFirstPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
      <AuroraGlow />
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div>
          <span className="eyebrow-serif" style={{ display: 'block', marginBottom: '8px' }}>AIR-GAPPED & PRIVACY ARCHITECTURE</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                backgroundColor: 'var(--accent-glow)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-ok)',
                border: '1px solid var(--status-ok)',
              }}
            >
              <HardDrive size={18} />
            </span>
            <h1 style={{ fontSize: 'clamp(28px, 3.2vw, 42px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
              Local-First <span className="font-calligraphy text-gradient-aurora">Runtime</span>
            </h1>
            <StatusBadge tone="success" pulse={true}>
              Air-Gapped Ready
            </StatusBadge>
          </div>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '620px', lineHeight: 1.6 }}>
            Your repository code, call graph, and architectural rules live on your local machine. Never uploaded to remote third-party cloud servers.
          </p>
        </div>

        <KnovraButton href="/graph" variant="primary" iconTrailing={<ArrowRight size={14} />}>
          Explore Local Graph
        </KnovraButton>
      </div>

      {/* Visual Architectural Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '1.5rem' }}>
        {/* Card 1: Customer Machine Runtime (Local-First) */}
        <SpotlightCard
          style={{
            padding: '1.5rem',
            border: '2px solid var(--accent-primary)',
            borderRadius: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <StatusBadge tone="success">Primary Architecture</StatusBadge>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--status-ok)' }}>100% Local</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Server size={22} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Customer Machine (Your Workstation / CI)
            </h2>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            All indexing, tree-sitter parsing, Cypher graph execution, rule evaluations, and context bundling execute natively
            within your local runtime.
          </p>

          {/* Local Subsystems Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {[
              { label: 'Source Repository', status: 'Never leaves disk (.git/, src/)' },
              { label: 'Embedded Neo4j Graph', status: 'Stored in local .knovra/neo4j/' },
              { label: 'Vector Similarity DB', status: 'Embedded pgvector / sqlite-vec' },
              { label: 'Architectural Rules', status: 'Local Open Policy Agent (Rego)' },
              { label: 'Provider API Keys', status: 'Encrypted in local OS keychain' },
              { label: 'IPC / MCP Gateway', status: 'Unix domain socket (/tmp/knovra.sock)' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.78rem',
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</span>
                <span style={{ color: 'var(--status-ok)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </SpotlightCard>

        {/* Card 2: Cloud Sync (Optional Enterprise Extension) */}
        <SpotlightCard
          style={{
            padding: '1.5rem',
            borderRadius: '18px',
            border: '1px solid var(--border-default)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <StatusBadge tone="purple">Optional Cloud Sync</StatusBadge>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Opt-In Only</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Cloud size={22} style={{ color: 'var(--accent-secondary)' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Knovra Cloud (Team Coordination)
            </h2>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Enterprise teams who opt into cloud synchronization only exchange cryptographically signed ADR hashes and rule policies.
            Raw source code is NEVER uploaded.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {[
              { label: 'Team Governance Policies', status: 'Synchronized across developers' },
              { label: 'Cross-Repo ADR Lineage', status: 'Shared architectural decisions' },
              { label: 'Audit & Compliance Logs', status: 'Cryptographic commit proofs' },
              { label: 'Raw Repository Code', status: 'STRICTLY FORBIDDEN (Never stored)' },
              { label: 'Proprietary IP', status: 'Never visible to Knovra Cloud' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.78rem',
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</span>
                <span
                  style={{
                    color: item.status.includes('FORBIDDEN') ? 'var(--status-danger)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    fontWeight: item.status.includes('FORBIDDEN') ? 800 : 500,
                  }}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </SpotlightCard>
      </div>

      {/* Security Invariants Callout */}
      <div
        className="glass-panel-luxury"
        style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <EyeOff size={24} style={{ color: 'var(--accent-primary)' }} />
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Air-Gapped Operation Supported Out-of-the-Box
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Running in classified or high-security networks? Use Ollama or local LLM weights with zero network adapters enabled.
            </p>
          </div>
        </div>

        <KnovraButton href="/providers" variant="secondary" size="sm" iconTrailing={<ArrowRight size={13} />}>
          View Air-Gapped Setup
        </KnovraButton>
      </div>
    </div>
  );
}
