'use client';

import React, { useState } from 'react';
import {
  MessageSquareCode,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Bot,
  FileCode2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { SESSIONS, Session } from '../../lib/data';
import { SpotlightCard } from '../../components/SpotlightCard';
import { AuroraGlow } from '../../components/AuroraGlow';
import { StatusBadge } from '../../components/ui/StatusBadge';

export default function SessionsPage() {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(SESSIONS[0].id);
  const selectedSession = SESSIONS.find((s) => s.id === selectedSessionId) || SESSIONS[0];

  return (
    <div style={{ display: 'grid', gap: '2rem', position: 'relative' }}>
      <AuroraGlow />
      {/* Header */}
      <div>
        <span className="eyebrow-serif" style={{ display: 'block', marginBottom: '8px' }}>AGENT REASONING & MEMORY PROVENANCE</span>
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
              color: 'var(--accent-secondary)',
              border: '1px solid var(--accent-secondary)',
            }}
          >
            <MessageSquareCode size={18} />
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 3.2vw, 42px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
            Agent <span className="font-calligraphy text-gradient-aurora">Sessions</span>
          </h1>
          <StatusBadge tone="cyan" pulse={true}>
            {SESSIONS.length} Recorded Sessions
          </StatusBadge>
        </div>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '620px', lineHeight: 1.6 }}>
          Traceable facts and contextual decisions synthesized by AI agents with full file and commit-level provenance.
        </p>
      </div>

      {/* Two Column Layout: Sessions List on Left, Session Inspector on Right */}
      <div className="responsive-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Sessions List */}
        <div className="glass-panel-luxury" style={{ padding: '1.25rem', borderRadius: '16px', display: 'grid', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Sessions
          </div>
          {SESSIONS.map((session) => {
            const isSelected = selectedSessionId === session.id;
            return (
              <div
                key={session.id}
                onClick={() => setSelectedSessionId(session.id)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: isSelected ? 'color-mix(in srgb, var(--accent-primary) 12%, var(--bg-card))' : 'var(--bg-primary)',
                  border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
                    {session.id}
                  </span>
                  <StatusBadge tone="purple" size="sm">
                    {session.agentName}
                  </StatusBadge>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {session.topic}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{session.timestamp}</span>
                  <span>{session.facts.length} facts extracted</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Session Facts Inspector */}
        <SpotlightCard style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                Session: {selectedSession.id}
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedSession.topic}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <StatusBadge tone="cyan">{selectedSession.agentName}</StatusBadge>
              <StatusBadge tone="success">Verified Facts</StatusBadge>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
              Extracted Facts with Source Provenance ({selectedSession.facts.length})
            </h3>

            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {selectedSession.facts.map((fact) => (
                <div
                  key={fact.id}
                  style={{
                    padding: '1.1rem',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.45rem', gap: '10px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {fact.statement}
                    </div>
                    <StatusBadge tone="success" size="sm">
                      {Math.round((fact.confidence || 0.95) * 100)}% Conf
                    </StatusBadge>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <FileCode2 size={12} style={{ color: 'var(--accent-secondary)' }} />
                    <span>Provenance: </span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-secondary)' }}>
                      {fact.provenance}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
