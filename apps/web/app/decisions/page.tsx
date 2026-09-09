'use client';

import React, { useState } from 'react';
import {
  GitPullRequest,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  FileCode2,
} from 'lucide-react';
import { ADRS, ADR } from '../../lib/data';
import DecisionTimelineDemo from '../../components/showcases/DecisionTimelineDemo';

export default function DecisionsPage() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'grid'>('timeline');

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
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
              <GitPullRequest size={16} />
            </span>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#ffffff' }}>
              Architectural Decision Records (ADRs)
            </h1>
            <span className="stripe-badge stripe-badge-purple">{ADRS.length} Total Records</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Immutable architectural memory and lineage. Decisions are never deleted; historical choices are preserved through supersession graphs.
          </p>
        </div>

        {/* View Switcher */}
        <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-canvas)', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
          <button
            onClick={() => setActiveTab('timeline')}
            style={{
              padding: '5px 12px',
              fontSize: '0.78rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: activeTab === 'timeline' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'timeline' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Interactive Timeline & Inspector
          </button>
          <button
            onClick={() => setActiveTab('grid')}
            style={{
              padding: '5px 12px',
              fontSize: '0.78rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: activeTab === 'grid' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'grid' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Full ADR Catalog ({ADRS.length})
          </button>
        </div>
      </div>

      {/* Main View */}
      {activeTab === 'timeline' ? (
        <DecisionTimelineDemo />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.25rem' }}>
          {ADRS.map((adr) => (
            <div
              key={adr.id}
              className="stripe-card"
              style={{
                padding: '1.35rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    {adr.id}
                  </span>
                  <span className={`stripe-badge ${adr.status === 'accepted' ? 'stripe-badge-green' : adr.status === 'superseded' ? 'stripe-badge-amber' : 'stripe-badge-blue'}`}>
                    {adr.status.toUpperCase()}
                  </span>
                </div>

                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.4rem' }}>
                  {adr.title}
                </h3>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {adr.decision}
                </p>

                {adr.supersededBy && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={12} />
                    <span>Superseded by <strong>{adr.supersededBy}</strong></span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>{adr.date}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{adr.affectedFiles.length} affected files</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
