'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDown,
  FileCode2,
  GitBranch,
  ShieldCheck,
  Copy,
  Check,
  Layers,
  Activity,
  AlertTriangle,
  Flame,
  Zap,
  CheckCircle2,
  Terminal,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { IMPACT_SCENARIOS } from '../../lib/data';
import { SpotlightCard } from '../../components/SpotlightCard';
import { AuroraGlow } from '../../components/AuroraGlow';
import { KnovraButton } from '../../components/ui/KnovraButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { fireMicroSparkle } from '../../lib/confetti';

export default function ImpactPage() {
  const [selected, setSelected] = useState(IMPACT_SCENARIOS[0].id);
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<'callers' | 'files' | 'tests'>('callers');
  const [copied, setCopied] = useState(false);
  const scenario = IMPACT_SCENARIOS.find((s) => s.id === selected) || IMPACT_SCENARIOS[0];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical':
        return { text: '#EF4444', badge: 'red', bg: 'rgba(239, 68, 68, 0.12)' };
      case 'high':
        return { text: '#F59E0B', badge: 'amber', bg: 'rgba(245, 158, 11, 0.12)' };
      default:
        return { text: '#06B6D4', badge: 'blue', bg: 'rgba(6, 182, 212, 0.12)' };
    }
  };

  const risk = getRiskColor(scenario.riskLevel);

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify({ kind: 'knovra-impact-assessment', timestamp: new Date().toISOString(), ...scenario }, null, 2)
      );
      setCopied(true);
      toast.success('Impact simulation report copied to clipboard');
      fireMicroSparkle(0.85, 0.2);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      toast.error('Failed to copy report to clipboard');
    }
  }

  return (
    <div className="impact-workbench" style={{ display: 'grid', gap: '2.5rem', position: 'relative' }}>
      <AuroraGlow />
      {/* Header */}
      <header className="impact-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span className="eyebrow-serif" style={{ display: 'block', marginBottom: '8px' }}>BLAST-RADIUS PREDICTION</span>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(32px, 3.2vw, 44px)' }}>
            Impact <span className="font-calligraphy text-gradient-aurora">Simulator</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '620px', fontSize: '15px' }}>
            Follow multi-hop callers, downstream files, and suggested unit tests before merging changes into main branches.
          </p>
        </div>

        <KnovraButton
          variant="primary"
          onClick={copyReport}
          icon={copied ? <Check size={15} /> : <Copy size={15} />}
        >
          {copied ? 'Report Copied' : 'Export JSON Report'}
        </KnovraButton>
      </header>

      {/* Interactive Scenario Bar */}
      <div className="impact-disclosure glass-panel" style={{ padding: '12px 20px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="pulsing-dot" style={{ width: 6, height: 6 }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Interactive Change Scenarios</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>— Select a code modification to simulate AST blast-radius</span>
        </div>
        <StatusBadge tone="cyan">Neo4j Multi-Hop Engine</StatusBadge>
      </div>

      <div className="impact-layout">
        {/* Left Side: Scenarios Picker */}
        <aside className="impact-scenarios" style={{ display: 'grid', gap: '12px' }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 }}>
              01 / CHOOSE A CHANGE
            </span>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Pick a real-world refactor target:</p>
          </div>

          <div className="impact-mobile-picker" style={{ display: 'none' }}>
            <select
              aria-label="Example change"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                fontSize: '13px',
                outline: 'none',
              }}
            >
              {IMPACT_SCENARIOS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.targetSymbol.split('.').pop()} ({s.riskLevel.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {IMPACT_SCENARIOS.map((s, i) => {
            const isSelected = selected === s.id;
            const rColor = getRiskColor(s.riskLevel);
            return (
              <button
                type="button"
                key={s.id}
                aria-pressed={isSelected}
                onClick={() => setSelected(s.id)}
                className="glass-card"
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  textAlign: 'left',
                  border: isSelected ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-default)',
                  background: isSelected ? 'color-mix(in srgb, var(--accent-primary) 12%, var(--bg-card))' : 'var(--bg-card)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease',
                }}
              >
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    background: isSelected ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                    border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-strong)'}`,
                    display: 'grid',
                    placeItems: 'center',
                    color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    flexShrink: 0,
                  }}
                >
                  <FileCode2 size={18} />
                </span>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <small style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    SCENARIO 0{i + 1}
                  </small>
                  <strong style={{ fontSize: '13px', display: 'block', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.targetSymbol.split('.').pop()}
                  </strong>
                  <span style={{ fontSize: '11px', color: rColor.text, fontWeight: 600, textTransform: 'capitalize' }}>
                    {s.riskLevel} risk
                  </span>
                </div>

                <ArrowUpRight size={15} style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)', flexShrink: 0 }} />
              </button>
            );
          })}

          <div className="glass-panel-luxury" style={{ padding: '20px', borderRadius: '16px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', marginBottom: '8px' }}>
              <ShieldCheck size={18} />
              <strong style={{ fontSize: '13px' }}>Deterministic Evidence</strong>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Knovra validates all pull request blast radiuses against live Neo4j AST caller hierarchies to prevent breaking production changes.
            </p>
            <Link href="/repository" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '12px', textDecoration: 'none' }}>
              Inspect Source <ArrowUpRight size={13} />
            </Link>
          </div>
        </aside>

        {/* Right Side: Results & Evidence */}
        <div className="impact-results" style={{ display: 'grid', gap: '24px' }}>
          {/* Main Target Card */}
          <SpotlightCard className="glass-panel-luxury" style={{ padding: '28px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 }}>
                02 / TRACE THE BLAST RADIUS
              </span>
              <StatusBadge
                tone={scenario.riskLevel === 'critical' ? 'danger' : scenario.riskLevel === 'high' ? 'warning' : 'info'}
                pulse={scenario.riskLevel === 'critical'}
              >
                <Flame size={12} style={{ display: 'inline', marginRight: 4 }} />
                {scenario.riskLevel.toUpperCase()} RISK LEVEL
              </StatusBadge>
            </div>

            <h2 style={{ fontSize: 'clamp(22px, 2.5vw, 32px)', fontWeight: 800, margin: '20px 0 6px', letterSpacing: '-0.025em' }}>
              {scenario.targetSymbol}
            </h2>
            <code style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
              {scenario.targetFile}
            </code>

            {/* Impact Flow Metrics */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '16px',
                marginTop: '28px',
                paddingTop: '24px',
                borderTop: '1px solid var(--border-default)',
              }}
            >
              <SpotlightCard className="glass-card" style={{ padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <GitBranch size={20} style={{ color: 'var(--accent-primary)', margin: '0 auto 8px' }} />
                <strong style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', display: 'block' }}>
                  {scenario.affectedCallers.length}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Upstream Callers</span>
              </SpotlightCard>

              <SpotlightCard className="glass-card" style={{ padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <FileCode2 size={20} style={{ color: 'var(--accent-secondary)', margin: '0 auto 8px' }} />
                <strong style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', display: 'block' }}>
                  {scenario.downstreamFiles.length}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Affected Files</span>
              </SpotlightCard>

              <SpotlightCard className="glass-card" style={{ padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <ShieldCheck size={20} style={{ color: 'var(--status-ok)', margin: '0 auto 8px' }} />
                <strong style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', display: 'block' }}>
                  {scenario.impactedTests.length}
                </strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Suggested Tests</span>
              </SpotlightCard>
            </div>
          </SpotlightCard>

          {/* Evidence Tabs */}
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--accent-primary)' }}>
              <Layers size={20} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Follow the Evidence</h3>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <SegmentedTabs
                tabs={[
                  { id: 'callers', label: `Affected Callers (${scenario.affectedCallers.length})`, icon: <GitBranch size={13} /> },
                  { id: 'files', label: `Downstream Files (${scenario.downstreamFiles.length})`, icon: <FileCode2 size={13} /> },
                  { id: 'tests', label: `Suggested Tests (${scenario.impactedTests.length})`, icon: <ShieldCheck size={13} /> },
                ]}
                active={activeEvidenceTab}
                onChange={(t) => setActiveEvidenceTab(t as 'callers' | 'files' | 'tests')}
              />
            </div>

            {(() => {
              const tabData = {
                callers: {
                  items: scenario.affectedCallers,
                  desc: 'Direct and indirect entry points that call this symbol across all microservices.',
                },
                files: {
                  items: scenario.downstreamFiles,
                  desc: 'Files requiring recompilation or AST re-verification upon modifying this method.',
                },
                tests: {
                  items: scenario.impactedTests,
                  desc: 'Recommended test suites that provide regression coverage for this blast radius.',
                },
              }[activeEvidenceTab];

              return (
                <div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    {tabData.desc}
                  </p>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {tabData.items.map((item, idx) => (
                      <div
                        key={item}
                        className="glass-card"
                        style={{
                          padding: '12px 16px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', width: '20px' }}>
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <code style={{ fontSize: '12px', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{item}</code>
                        </div>
                        <FileCode2 size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
