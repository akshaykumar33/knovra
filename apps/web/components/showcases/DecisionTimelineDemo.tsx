'use client';

import React, { useState } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  FileCode2,
  Users,
  Search,
  BookOpen,
} from 'lucide-react';
import { ADRS, ADR } from '../../lib/data';

export default function DecisionTimelineDemo() {
  const [selectedAdrId, setSelectedAdrId] = useState<string>('ADR-007');
  const [filter, setFilter] = useState<'all' | 'accepted' | 'superseded'>('all');
  const [search, setSearch] = useState('');

  const selectedAdr = ADRS.find((a) => a.id === selectedAdrId) || ADRS[0];

  const filteredAdrs = ADRS.filter((adr) => {
    if (filter === 'accepted' && adr.status !== 'accepted') return false;
    if (filter === 'superseded' && adr.status !== 'superseded') return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        adr.title.toLowerCase().includes(q) ||
        adr.id.toLowerCase().includes(q) ||
        adr.decision.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: ADR['status']) => {
    switch (status) {
      case 'accepted':
        return <span className="stripe-badge stripe-badge-green">ACCEPTED</span>;
      case 'superseded':
        return <span className="stripe-badge stripe-badge-amber">SUPERSEDED</span>;
      case 'proposed':
        return <span className="stripe-badge stripe-badge-blue">PROPOSED</span>;
      default:
        return <span className="stripe-badge">{status}</span>;
    }
  };

  return (
    <div className="stripe-card" style={{ padding: '1.75rem' }}>
      {/* Header & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: '6px',
                background: 'rgba(139, 92, 246, 0.12)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-purple)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
              }}
            >
              <GitPullRequest size={14} />
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Architectural Decision Records (ADR) Explorer
            </h3>
            <span className="stripe-badge stripe-badge-purple" style={{ fontSize: '0.68rem' }}>
              Invariant #3
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '620px', lineHeight: 1.5 }}>
            Institutional architecture memory for AI agents. Decisions are immutable once approved; architectural evolution creates superseding records rather than rewriting history.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-canvas)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
          {(['all', 'accepted', 'superseded'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: filter === f ? 'var(--bg-secondary)' : 'transparent',
                color: filter === f ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: ADR List */}
        <div
          style={{
            display: 'grid',
            gap: '0.5rem',
            maxHeight: '480px',
            overflowY: 'auto',
            paddingRight: '0.35rem',
          }}
        >
          {filteredAdrs.map((adr) => {
            const isSelected = selectedAdrId === adr.id;
            return (
              <div
                key={adr.id}
                onClick={() => setSelectedAdrId(adr.id)}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-primary)',
                  border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-default)'}`,
                  borderTop: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--border-highlight)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    {adr.id}
                  </span>
                  {getStatusBadge(adr.status)}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#ffffff', marginBottom: '0.3rem' }}>
                  {adr.title}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>{adr.date}</span>
                  {adr.supersededBy && (
                    <span style={{ color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <ArrowRight size={11} /> {adr.supersededBy}
                    </span>
                  )}
                  {adr.supersedes && (
                    <span style={{ color: 'var(--accent-purple)' }}>
                      Supersedes {adr.supersedes}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed ADR Reader */}
        <div
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-default)',
            borderTop: '1px solid var(--border-highlight)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
              {selectedAdr.id}
            </span>
            {getStatusBadge(selectedAdr.status)}
          </div>

          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
            {selectedAdr.title}
          </h4>

          {/* Supersession Banner */}
          {selectedAdr.supersededBy && (
            <div
              style={{
                marginBottom: '0.85rem',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                fontSize: '0.78rem',
                color: 'var(--accent-amber)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <AlertCircle size={14} />
              <span>
                Superseded by <strong>{selectedAdr.supersededBy}</strong>. Retained for historical provenance.
              </span>
            </div>
          )}

          {selectedAdr.supersedes && (
            <div
              style={{
                marginBottom: '0.85rem',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(139, 92, 246, 0.08)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                fontSize: '0.78rem',
                color: 'var(--accent-purple)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <Sparkles size={14} />
              <span>
                Supersedes previous architecture choice <strong>{selectedAdr.supersedes}</strong>.
              </span>
            </div>
          )}

          <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.82rem' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem', letterSpacing: '0.04em' }}>
                Context & Problem Statement
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {selectedAdr.context}
              </p>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem', letterSpacing: '0.04em' }}>
                Decision Outcome
              </div>
              <p style={{ color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.55 }}>
                {selectedAdr.decision}
              </p>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem', letterSpacing: '0.04em' }}>
                Consequences & Invariants
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {selectedAdr.consequences}
              </p>
            </div>

            {/* Impacted Code Paths */}
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
                Impacted Code Paths ({selectedAdr.affectedFiles.length})
              </div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {selectedAdr.affectedFiles.map((file) => (
                  <span
                    key={file}
                    style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-canvas)',
                      color: 'var(--accent-blue)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    {file}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
