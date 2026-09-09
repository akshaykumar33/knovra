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
        return <span className="badge badge-ok">ACCEPTED</span>;
      case 'superseded':
        return <span className="badge badge-warn">SUPERSEDED</span>;
      case 'proposed':
        return <span className="badge badge-cyan">PROPOSED</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '8px',
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-purple)',
              }}
            >
              <GitPullRequest size={16} />
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Architectural Decision Records (ADRs) & Supersession Timeline
            </h3>
            <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
              Invariant #3
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '650px' }}>
            Permanent institutional memory for AI agents. Decisions are immutable once approved; new realities create superseding decisions rather than silently rewriting history.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-tertiary)', padding: '2px', borderRadius: 'var(--radius-md)' }}>
            {(['all', 'accepted', 'superseded'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: filter === f ? 'var(--accent-blue)' : 'transparent',
                  color: filter === f ? '#ffffff' : 'var(--text-secondary)',
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
      </div>

      {/* Main Timeline Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Timeline List */}
        <div
          style={{
            display: 'grid',
            gap: '0.75rem',
            maxHeight: '480px',
            overflowY: 'auto',
            paddingRight: '0.5rem',
          }}
        >
          {filteredAdrs.map((adr) => {
            const isSelected = selectedAdrId === adr.id;
            return (
              <div
                key={adr.id}
                onClick={() => setSelectedAdrId(adr.id)}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-tertiary)',
                  border: `1.5px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-default)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    {adr.id}
                  </span>
                  {getStatusBadge(adr.status)}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  {adr.title}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{adr.date}</span>
                  {adr.supersededBy && (
                    <span style={{ color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <ArrowRight size={12} /> {adr.supersededBy}
                    </span>
                  )}
                  {adr.supersedes && (
                    <span style={{ color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      Supersedes {adr.supersedes}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed ADR Inspector */}
        <div
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
              {selectedAdr.id}
            </span>
            {getStatusBadge(selectedAdr.status)}
          </div>

          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            {selectedAdr.title}
          </h4>

          {/* Supersession Banner */}
          {selectedAdr.supersededBy && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                fontSize: '0.8rem',
                color: 'var(--accent-amber)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={15} />
              <span>
                Superseded by <strong>{selectedAdr.supersededBy}</strong>. This record is retained for provenance and legacy agent context.
              </span>
            </div>
          )}

          {selectedAdr.supersedes && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                fontSize: '0.8rem',
                color: 'var(--accent-purple)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Sparkles size={15} />
              <span>
                Supersedes previous architecture decision <strong>{selectedAdr.supersedes}</strong>.
              </span>
            </div>
          )}

          <div style={{ display: 'grid', gap: '0.85rem', fontSize: '0.85rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                Context & Problem Statement
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {selectedAdr.context}
              </p>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                Decision Outcome
              </div>
              <p style={{ color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.5 }}>
                {selectedAdr.decision}
              </p>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                Consequences & Invariants
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {selectedAdr.consequences}
              </p>
            </div>

            {/* Affected Files */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Impacted Code Paths ({selectedAdr.affectedFiles.length})
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {selectedAdr.affectedFiles.map((file) => (
                  <span
                    key={file}
                    style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-secondary)',
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
