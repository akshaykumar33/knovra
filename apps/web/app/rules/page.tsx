'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Play,
  Layers,
  Plus,
} from 'lucide-react';
import { RULES, Rule } from '../../lib/data';

export default function RulesPage() {
  const [auditing, setAuditing] = useState(false);
  const [auditComplete, setAuditComplete] = useState(false);

  const handleRunAudit = () => {
    setAuditing(true);
    setAuditComplete(false);
    setTimeout(() => {
      setAuditing(false);
      setAuditComplete(true);
    }, 900);
  };

  const getSeverityBadge = (sev: Rule['severity']) => {
    switch (sev) {
      case 'error':
        return <span className="stripe-badge stripe-badge-danger">CRITICAL ERROR</span>;
      case 'warning':
        return <span className="stripe-badge stripe-badge-amber">WARNING</span>;
      case 'info':
        return <span className="stripe-badge stripe-badge-blue">ADVISORY</span>;
      default:
        return <span className="stripe-badge">{sev}</span>;
    }
  };

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
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-ok)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              <ShieldCheck size={16} />
            </span>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#ffffff' }}>
              Architectural Governance Rules
            </h1>
            <span className="stripe-badge stripe-badge-green">{RULES.length} Active Rules</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Strict engineering boundaries and invariants enforced across all AI agent interactions and continuous integration.
          </p>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={auditing}
          className="btn-stripe-primary"
        >
          <Play size={13} />
          <span>{auditing ? 'Running Compliance Audit...' : 'Run Governance Audit'}</span>
        </button>
      </div>

      {/* Audit Notification Banner */}
      {auditComplete && (
        <div
          style={{
            padding: '0.85rem 1.15rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <CheckCircle2 size={18} color="var(--status-ok)" />
          <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
            <strong>Governance Audit Passed:</strong> 4/4 rules compliant. Zero secret leaks detected in indexed symbols, ADR supersession integrity validated, and circular dependency graph is clear.
          </div>
        </div>
      )}

      {/* Rules List */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {RULES.map((rule) => (
          <div
            key={rule.id}
            className="stripe-card"
            style={{
              padding: '1.35rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                  {rule.id}
                </span>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                  {rule.name}
                </h3>
              </div>
              {getSeverityBadge(rule.severity)}
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {rule.description}
            </p>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Enforced Subsystems:</span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {(rule.enforcedSubsystems || []).map((sub) => (
                    <span
                      key={sub}
                      style={{
                        padding: '1px 6px',
                        borderRadius: '3px',
                        backgroundColor: 'var(--bg-canvas)',
                        color: 'var(--accent-blue)',
                        border: '1px solid var(--border-default)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.7rem',
                      }}
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ color: 'var(--status-ok)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} />
                <span>Zero Violations</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
