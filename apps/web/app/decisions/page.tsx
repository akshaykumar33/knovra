'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitPullRequest, Layers, AlertCircle, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import DecisionTimelineDemo from '../../components/showcases/DecisionTimelineDemo';
import { SpotlightCard } from '../../components/SpotlightCard';
import { AuroraGlow } from '../../components/AuroraGlow';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { StatusBadge } from '../../components/ui/StatusBadge';

interface ADRItem {
  id: string;
  title: string;
  date: string;
  status: 'accepted' | 'superseded' | 'proposed';
  supersededBy?: string;
  decision: string;
  affectedFiles: string[];
}

const ADRS: ADRItem[] = [
  {
    id: 'ADR-001',
    title: 'Polyglot Monorepo Architecture',
    date: '2026-01-15',
    status: 'accepted',
    decision: 'Selected Go (runtime), Rust (AST indexing), and Python (Context Planner) with gRPC/HTTP boundary mediation.',
    affectedFiles: ['services/runtime', 'services/code-indexer', 'services/context-engine'],
  },
  {
    id: 'ADR-002',
    title: 'Tree-sitter for Multi-Language AST Ingestion',
    date: '2026-02-01',
    status: 'accepted',
    decision: 'Used Rust Tree-sitter bindings for sub-millisecond AST extraction and concrete syntax tree diffing.',
    affectedFiles: ['services/code-indexer/src/indexer.rs', 'protobuf/code_indexer.proto'],
  },
  {
    id: 'ADR-003',
    title: 'Model Context Protocol (MCP) as Exclusive Gateway',
    date: '2026-02-14',
    status: 'accepted',
    decision: 'Strictly prohibited direct agent-to-DB access. Mediated all autonomous tools via JSON-RPC 2.0 stdio/HTTP.',
    affectedFiles: ['services/runtime/internal/mcp', 'apps/web/app/architecture'],
  },
  {
    id: 'ADR-004',
    title: 'Deterministic Token Packing via Priority Tiers',
    date: '2026-03-01',
    status: 'accepted',
    decision: 'Enforced mathematically bounded token limits with priority: Invariants > ADRs > Call Trees > Facts.',
    affectedFiles: ['services/context-engine/app/planner.py', 'apps/web/app/context'],
  },
];

export default function DecisionsPage() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'grid'>('timeline');

  return (
    <div style={{ display: 'grid', gap: '2rem', position: 'relative' }}>
      <AuroraGlow />
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span className="eyebrow-serif" style={{ display: 'block', marginBottom: '8px' }}>ARCHITECTURE GOVERNANCE</span>
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
                color: 'var(--accent-primary)',
                border: '1px solid var(--accent-primary)',
              }}
            >
              <GitPullRequest size={18} />
            </span>
            <h1 style={{ fontSize: 'clamp(28px, 3.2vw, 42px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
              Architectural <span className="font-calligraphy text-gradient-aurora">Decisions</span>
            </h1>
            <StatusBadge tone="purple" pulse={true}>
              {ADRS.length} Immutable ADRs
            </StatusBadge>
          </div>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '620px', lineHeight: 1.6 }}>
            Immutable architectural memory and lineage. Decisions are never deleted; historical choices are preserved through supersession DAG graphs.
          </p>
        </div>

        {/* View Switcher */}
        <SegmentedTabs
          tabs={[
            { id: 'timeline', label: 'Interactive Timeline & Inspector', icon: <GitPullRequest size={14} /> },
            { id: 'grid', label: `Full ADR Catalog (${ADRS.length})`, icon: <Layers size={14} /> },
          ]}
          active={activeTab}
          onChange={(tab) => setActiveTab(tab as 'timeline' | 'grid')}
        />
      </div>

      {/* Main View */}
      {activeTab === 'timeline' ? (
        <DecisionTimelineDemo />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.25rem' }}>
          {ADRS.map((adr) => (
            <SpotlightCard
              key={adr.id}
              className="knovra-card"
              style={{
                padding: '1.35rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-secondary)' }}>
                    {adr.id}
                  </span>
                  <StatusBadge tone={adr.status === 'accepted' ? 'success' : adr.status === 'superseded' ? 'warning' : 'info'}>
                    {adr.status.toUpperCase()}
                  </StatusBadge>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  {adr.title}
                </h3>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {adr.decision}
                </p>

                {adr.supersededBy && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--status-warn)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={12} />
                    <span>Superseded by <strong>{adr.supersededBy}</strong></span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>{adr.date}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{adr.affectedFiles.length} affected files</span>
              </div>
            </SpotlightCard>
          ))}
        </div>
      )}
    </div>
  );
}
