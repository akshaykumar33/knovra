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
    <div style={{ display: 'grid', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span
            style={{
              width: 30,
              height: 30,
              borderRadius: '8px',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
            }}
          >
            <MessageSquareCode size={18} />
          </span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Agent Sessions & Fact Provenance
          </h1>
          <span className="badge badge-cyan">{SESSIONS.length} Recorded Sessions</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Traceable facts synthesized by AI agents with full file and commit-level provenance.
        </p>
      </div>

      {/* Two Column Layout: Sessions List on Left, Session Inspector on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Sessions List */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'grid', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Active Sessions
          </div>
          {SESSIONS.map((session) => {
            const isSelected = selectedSessionId === session.id;
            return (
              <div
                key={session.id}
                onClick={() => setSelectedSessionId(session.id)}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-tertiary)',
                  border: `1.5px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-default)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                    {session.id}
                  </span>
                  <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                    {session.agentName}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {session.topic}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>{session.timestamp}</span>
                  <span>{session.facts.length} facts extracted</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Session Facts Inspector */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Session: {selectedSession.id}
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedSession.topic}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="badge badge-blue">{selectedSession.agentName}</span>
              <span className="badge badge-ok">Verified Facts</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="var(--accent-purple)" />
              Extracted Facts with Source Provenance ({selectedSession.facts.length})
            </h3>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {selectedSession.facts.map((fact) => (
                <div
                  key={fact.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {fact.statement}
                    </div>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: 'var(--status-ok)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {Math.round((fact.confidence || 0.95) * 100)}% Confidence
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <FileCode2 size={13} color="var(--accent-blue)" />
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
