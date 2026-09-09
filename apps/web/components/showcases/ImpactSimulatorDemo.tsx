'use client';

import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  CheckCircle2,
  FileCode2,
  Layers,
  Play,
  ShieldAlert,
  TestTube2,
  Workflow,
  Copy,
  Check,
  Terminal,
} from 'lucide-react';
import { IMPACT_SCENARIOS, ImpactScenarioDetail } from '../../lib/data';

export default function ImpactSimulatorDemo() {
  const [selectedScenarioId, setSelectedScenarioId] = useState(IMPACT_SCENARIOS[0].id);
  const [maxDepth, setMaxDepth] = useState<number>(2);
  const [copiedCli, setCopiedCli] = useState(false);

  const currentScenario = IMPACT_SCENARIOS.find((s) => s.id === selectedScenarioId) || IMPACT_SCENARIOS[0];

  const getRiskScore = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'critical': return { score: 94, badge: 'stripe-badge-danger', text: 'Critical Risk', color: 'var(--status-danger)' };
      case 'high': return { score: 78, badge: 'stripe-badge-amber', text: 'High Risk', color: 'var(--accent-amber)' };
      case 'medium': return { score: 45, badge: 'stripe-badge-blue', text: 'Medium Risk', color: 'var(--accent-blue)' };
      default: return { score: 15, badge: 'stripe-badge-green', text: 'Low Risk', color: 'var(--status-ok)' };
    }
  };

  const riskMeta = getRiskScore(currentScenario.riskLevel);
  const cliSnippet = `knovra impact analyze --target "${currentScenario.targetSymbol}" --depth ${maxDepth}`;

  const handleCopyCli = () => {
    navigator.clipboard.writeText(cliSnippet);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 1500);
  };

  return (
    <div className="stripe-card" style={{ padding: '1.75rem' }}>
      {/* Header & Preset Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.12)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-danger)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
              }}
            >
              <Activity size={14} />
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Change Blast-Radius Simulator
            </h3>
            <span className="stripe-badge stripe-badge-blue" style={{ fontSize: '0.68rem' }}>
              Phase 12 Engine
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '620px', lineHeight: 1.5 }}>
            Calculates exact semantic blast radius, upstream callers, downstream dependencies, and regression test targets before committing changes.
          </p>
        </div>

        {/* Preset Buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {IMPACT_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setSelectedScenarioId(sc.id)}
              style={{
                padding: '5px 10px',
                fontSize: '0.78rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: selectedScenarioId === sc.id ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                color: selectedScenarioId === sc.id ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {sc.targetSymbol.split('.').pop()}
            </button>
          ))}
        </div>
      </div>

      {/* Target Details & Risk Radar Header Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-default)',
          borderTop: '1px solid var(--border-highlight)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Circular Risk Score Gauge */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              backgroundColor: 'var(--bg-canvas)',
              border: `2px solid ${riskMeta.color}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 16px ${riskMeta.color}33`,
            }}
          >
            <span style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: riskMeta.color }}>
              {riskMeta.score}
            </span>
            <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              RISK
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                {currentScenario.targetSymbol}
              </span>
              <span className={`stripe-badge ${riskMeta.badge}`}>
                {riskMeta.text}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {currentScenario.targetFile}
            </div>
          </div>
        </div>

        {/* Depth Controller */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Graph Depth:</span>
          <div style={{ display: 'flex', gap: '0.2rem', backgroundColor: 'var(--bg-canvas)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
            {[1, 2, 3].map((d) => (
              <button
                key={d}
                onClick={() => setMaxDepth(d)}
                style={{
                  width: 26,
                  height: 24,
                  borderRadius: '4px',
                  backgroundColor: maxDepth === d ? 'var(--accent-blue)' : 'transparent',
                  color: maxDepth === d ? '#ffffff' : 'var(--text-muted)',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CLI Snippet Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          backgroundColor: 'var(--bg-canvas)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.5rem',
          fontSize: '0.78rem',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          <Terminal size={13} color="var(--accent-cyan)" />
          <span style={{ color: 'var(--accent-cyan)' }}>$</span>
          <span>{cliSnippet}</span>
        </div>
        <button
          onClick={handleCopyCli}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.72rem',
            color: copiedCli ? 'var(--status-ok)' : 'var(--text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {copiedCli ? <Check size={12} /> : <Copy size={12} />}
          <span>{copiedCli ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* 3-Column Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        {/* Upstream Callers */}
        <div
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '1.15rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem', color: 'var(--accent-amber)' }}>
            <ArrowDownRight size={15} />
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Upstream Invocations ({currentScenario.affectedCallers.length})
            </h4>
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            {currentScenario.affectedCallers.map((caller) => (
              <div
                key={caller}
                style={{
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'var(--bg-canvas)',
                  padding: '5px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--accent-cyan)',
                }}
              >
                {caller}
              </div>
            ))}
          </div>
        </div>

        {/* Downstream Affected Files */}
        <div
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '1.15rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem', color: 'var(--accent-blue)' }}>
            <FileCode2 size={15} />
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Affected Files ({currentScenario.downstreamFiles.length})
            </h4>
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            {currentScenario.downstreamFiles.map((f) => (
              <div
                key={f}
                style={{
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'var(--bg-canvas)',
                  padding: '5px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Required Test Targets */}
        <div
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '1.15rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem', color: 'var(--status-ok)' }}>
            <TestTube2 size={15} />
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Required Test Suites ({currentScenario.impactedTests.length})
            </h4>
          </div>
          <div style={{ display: 'grid', gap: '0.35rem' }}>
            {currentScenario.impactedTests.map((t) => (
              <div
                key={t}
                style={{
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'rgba(16, 185, 129, 0.06)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  padding: '5px 8px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--status-ok)',
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
