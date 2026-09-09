'use client';

import React, { useState } from 'react';
import {
  GitPullRequest,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  FileCode2,
  Share2,
  Copy,
  Check,
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
              <GitPullRequest size={18} />
            </span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Architectural Decision Records (ADRs)
            </h1>
            <span className="badge badge-purple">{ADRS.length} Total Records</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Immutable architectural memory and lineage. Decisions are never deleted; historical choices are preserved through supersession graphs.
          </p>
        </div>

        {/* View Switcher */}
        <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--bg-secondary)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
          <button
            onClick={() => setActiveTab('timeline')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: activeTab === 'timeline' ? 'var(--accent-blue)' : 'transparent',
              color: activeTab === 'timeline' ? '#ffffff' : 'var(--text-secondary)',
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
              padding: '6px 14px',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: activeTab === 'grid' ? 'var(--accent-blue)' : 'transparent',
              color: activeTab === 'grid' ? '#ffffff' : 'var(--text-secondary)',
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {ADRS.map((adr) => (
            <div
              key={adr.id}
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
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    {adr.id}
                  </span>
                  <span className={`badge ${adr.status === 'accepted' ? 'badge-ok' : adr.status === 'superseded' ? 'badge-warn' : 'badge-cyan'}`}>
                    {adr.status.toUpperCase()}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {adr.title}
                </h3>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {adr.decision}
                </p>

                {adr.supersededBy && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={13} />
                    <span>Superseded by <strong>{adr.supersededBy}</strong></span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
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
