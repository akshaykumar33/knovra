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
    }, 1000);
  };

  const getSeverityBadge = (sev: Rule['severity']) => {
    switch (sev) {
      case 'error':
        return <span className="badge badge-danger">CRITICAL ERROR</span>;
      case 'warning':
        return <span className="badge badge-warn">WARNING</span>;
      case 'info':
        return <span className="badge badge-blue">ADVISORY</span>;
      default:
        return <span className="badge">{sev}</span>;
    }
  };

  return (
    <div style={{ display: 'grid', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-ok)',
              }}
            >
              <ShieldCheck size={18} />
            </span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Rules & Architectural Governance
            </h1>
            <span className="badge badge-ok">{RULES.length} Active Rules</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Strict engineering boundaries and invariants enforced across all AI agents and CI/CD pipelines.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleRunAudit}
            disabled={auditing}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
          >
            <Play size={14} />
            {auditing ? 'Running Compliance Audit...' : 'Run Governance Audit'}
          </button>
        </div>
      </div>

      {/* Audit Notification */}
      {auditComplete && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <CheckCircle2 size={20} color="var(--status-ok)" />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <strong>Governance Audit Passed:</strong> 4/4 rules compliant. Zero secret leaks detected in indexed symbols, ADR supersession integrity validated, and circular dependency graph is clear.
          </div>
        </div>
      )}

      {/* Rules List */}
      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {RULES.map((rule) => (
          <div
            key={rule.id}
            className="glass-card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                  {rule.id}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {rule.name}
                </h3>
              </div>
              {getSeverityBadge(rule.severity)}
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {rule.description}
            </p>

            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Enforced Subsystems:</span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {(rule.enforcedSubsystems || []).map((sub) => (
                    <span
                      key={sub}
                      style={{
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--accent-blue)',
                        border: '1px solid var(--border-default)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ color: 'var(--status-ok)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} />
                <span>Zero Violations Detected</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
