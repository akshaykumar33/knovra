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

export default function SessionsPage() {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(SESSIONS[0].id);
  const selectedSession = SESSIONS.find((s) => s.id === selectedSessionId) || SESSIONS[0];

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: '6px',
              backgroundColor: 'rgba(6, 182, 212, 0.12)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
            }}
          >
            <MessageSquareCode size={16} />
          </span>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#ffffff' }}>
            Agent Sessions & Fact Provenance
          </h1>
          <span className="stripe-badge stripe-badge-blue">{SESSIONS.length} Recorded Sessions</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Traceable facts synthesized by AI agents with full file and commit-level provenance.
        </p>
      </div>

      {/* Two Column Layout: Sessions List on Left, Session Inspector on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Sessions List */}
        <div className="stripe-card" style={{ padding: '1.25rem', display: 'grid', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Sessions
          </div>
          {SESSIONS.map((session) => {
            const isSelected = selectedSessionId === session.id;
            return (
              <div
                key={session.id}
                onClick={() => setSelectedSessionId(session.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-primary)',
                  border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-default)'}`,
                  borderTop: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--border-highlight)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    {session.id}
                  </span>
                  <span className="stripe-badge stripe-badge-purple" style={{ fontSize: '0.65rem' }}>
                    {session.agentName}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff', marginBottom: '0.25rem' }}>
                  {session.topic}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <span>{session.timestamp}</span>
                  <span>{session.facts.length} facts extracted</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Session Facts Inspector */}
        <div className="stripe-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                Session: {selectedSession.id}
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                {selectedSession.topic}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <span className="stripe-badge stripe-badge-blue">{selectedSession.agentName}</span>
              <span className="stripe-badge stripe-badge-green">Verified Facts</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Sparkles size={14} color="var(--accent-purple)" />
              Extracted Facts with Source Provenance ({selectedSession.facts.length})
            </h3>

            <div style={{ display: 'grid', gap: '0.85rem' }}>
              {selectedSession.facts.map((fact) => (
                <div
                  key={fact.id}
                  style={{
                    padding: '1.1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-default)',
                    borderTop: '1px solid var(--border-highlight)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.45rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {fact.statement}
                    </div>
                    <span
                      className="stripe-badge stripe-badge-green"
                      style={{ whiteSpace: 'nowrap', marginLeft: '0.75rem' }}
                    >
                      {Math.round((fact.confidence || 0.95) * 100)}% Conf
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <FileCode2 size={12} color="var(--accent-blue)" />
                    <span>Provenance: </span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                      {fact.provenance}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
