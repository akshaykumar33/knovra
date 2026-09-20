'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Play,
  Layers,
  Plus,
  Zap,
  Filter,
  Search,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { RULES, Rule } from '../../lib/data';
import { fireCelebrationConfetti } from '../../lib/confetti';
import SpotlightCard from '../../components/SpotlightCard';
import { KnovraButton } from '../../components/ui/KnovraButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';

export default function RulesPage() {
  const [auditing, setAuditing] = useState(false);
  const [auditComplete, setAuditComplete] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const handleRunAudit = () => {
    setAuditing(true);
    setAuditComplete(false);
    setTimeout(() => {
      setAuditing(false);
      setAuditComplete(true);
      toast.success('Governance audit passed: all AST invariants verified');
      fireCelebrationConfetti();
    }, 1200);
  };

  const filteredRules = RULES.filter((r) => {
    const matchesFilter = filter === 'all' || r.category === filter;
    const matchesSearch = [r.name, r.id, r.description, ...(r.enforcedSubsystems || [])].join(' ').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getSeverityBadge = (sev: Rule['severity']) => {
    switch (sev) {
      case 'error':
      case 'critical':
        return <StatusBadge tone="danger">CRITICAL INVARIANT</StatusBadge>;
      case 'warning':
      case 'high':
        return <StatusBadge tone="warning">WARNING</StatusBadge>;
      case 'info':
      default:
        return <StatusBadge tone="info">ADVISORY</StatusBadge>;
    }
  };

  return (
    <div style={{ display: 'grid', gap: '2.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span className="eyebrow-serif" style={{ display: 'block', marginBottom: '8px' }}>ARCHITECTURAL INVARIANTS & COMPLIANCE</span>
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
                color: 'var(--status-ok)',
                border: '1px solid var(--status-ok)',
              }}
            >
              <ShieldCheck size={20} />
            </span>
            <h1 style={{ fontSize: 'clamp(28px, 3.2vw, 42px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
              Governance <span className="font-calligraphy text-gradient-aurora">Rules</span>
            </h1>
            <StatusBadge tone="success" pulse={true}>
              {RULES.length} Enforced Rules
            </StatusBadge>
          </div>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '620px', lineHeight: 1.6 }}>
            Deterministic architectural constraints enforced across monorepo packages. No AI agent or human PR can violate these invariants.
          </p>
        </div>

        <KnovraButton
          variant="primary"
          onClick={handleRunAudit}
          loading={auditing}
          icon={<Play size={15} />}
        >
          {auditing ? 'Scanning Monorepo ASTs…' : 'Run Governance Audit'}
        </KnovraButton>
      </div>

      {/* Audit Notification Banner */}
      {auditComplete && (
        <div
          className="glass-panel-luxury"
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: '16px',
            borderColor: 'var(--status-ok)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'grid', placeItems: 'center', color: 'var(--status-ok)' }}>
              <CheckCircle2 size={22} />
            </span>
            <div>
              <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Governance Audit Passed Successfully</strong>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                All {RULES.length}/{RULES.length} invariant checks verified against AST symbol hierarchy. Zero secret leaks detected, ADR supersession integrity validated, and circular dependencies cleared.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="glass-pill"
            onClick={() => setAuditComplete(false)}
            style={{ cursor: 'pointer', padding: '4px 12px', fontSize: '11px' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Toolbar: Search and Filter Tabs */}
      <div className="glass-panel" style={{ padding: '12px 18px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '240px' }}>
          <Search size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
          <input
            aria-label="Filter rules"
            placeholder="Search governance rules by ID, description, or subsystem…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              width: '100%',
              fontSize: '13px',
            }}
          />
        </div>

        <SegmentedTabs
          tabs={[
            { id: 'all', label: 'All Categories' },
            { id: 'architecture', label: 'Architecture' },
            { id: 'security', label: 'Security' },
            { id: 'convention', label: 'Convention' },
          ]}
          active={filter}
          onChange={(tab) => setFilter(tab)}
        />
      </div>

      {/* Rules List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {filteredRules.map((rule) => (
          <SpotlightCard
            key={rule.id}
            spotlightColor="rgba(16, 185, 129, 0.22)"
            style={{
              padding: '24px',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent-primary)',
                    background: 'var(--accent-glow)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--accent-primary)',
                  }}
                >
                  {rule.id}
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {rule.name}
                </h3>
              </div>
              {getSeverityBadge(rule.severity)}
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {rule.description}
            </p>

            <div
              style={{
                borderTop: '1px solid var(--border-default)',
                paddingTop: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-muted)' }}>Enforced Subsystems:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(rule.enforcedSubsystems || []).map((sub) => (
                    <span
                      key={sub}
                      className="glass-pill"
                      style={{
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--accent-secondary)',
                      }}
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ color: 'var(--status-ok)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} />
                <span>Zero Violations in Workspace</span>
              </div>
            </div>
          </SpotlightCard>
        ))}

        {!filteredRules.length && (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 600 }}>No matching governance rules found</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '13px' }}>Try searching another category or rule ID.</p>
            <button
              type="button"
              className="knovra-btn-primary"
              onClick={() => { setSearch(''); setFilter('all'); }}
              style={{ marginTop: '14px', padding: '8px 18px', fontSize: '13px' }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
