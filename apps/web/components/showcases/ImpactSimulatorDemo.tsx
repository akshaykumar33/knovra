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
} from 'lucide-react';
import { IMPACT_SCENARIOS } from '../../lib/data';

export default function ImpactSimulatorDemo() {
  const [selectedScenarioId, setSelectedScenarioId] = useState(IMPACT_SCENARIOS[0].id);
  const [maxDepth, setMaxDepth] = useState<number>(2);
  const [analyzing, setAnalyzing] = useState(false);

  const currentScenario = IMPACT_SCENARIOS.find((s) => s.id === selectedScenarioId) || IMPACT_SCENARIOS[0];

  const handleSimulate = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
    }, 450);
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'critical':
        return { text: 'var(--status-danger)', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)' };
      case 'high':
        return { text: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)' };
      case 'medium':
        return { text: 'var(--accent-blue)', bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)' };
      default:
        return { text: 'var(--status-ok)', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)' };
    }
  };

  const riskStyle = getRiskColor(currentScenario.riskLevel);

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
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-danger)',
              }}
            >
              <Activity size={16} />
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Change Impact Simulator
            </h3>
            <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
              Phase 12 Engine
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '650px' }}>
            Calculates exact semantic blast radius, upstream callers, downstream dependencies, and regression test suites before code is modified.
          </p>
        </div>

        {/* Preset Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {IMPACT_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => {
                setSelectedScenarioId(sc.id);
                handleSimulate();
              }}
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: selectedScenarioId === sc.id ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                color: selectedScenarioId === sc.id ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {sc.targetSymbol}
            </button>
          ))}
        </div>
      </div>

      {/* Target Analysis Header Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              backgroundColor: riskStyle.bg,
              border: `1px solid ${riskStyle.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: riskStyle.text,
            }}
          >
            <ShieldAlert size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                {currentScenario.targetSymbol}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  backgroundColor: riskStyle.bg,
                  color: riskStyle.text,
                  border: `1px solid ${riskStyle.border}`,
                  textTransform: 'uppercase',
                }}
              >
                {currentScenario.riskLevel} Risk
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {currentScenario.targetFile}
            </div>
          </div>
        </div>

        {/* Depth Controller */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Graph Depth:</span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {[1, 2, 3].map((d) => (
              <button
                key={d}
                onClick={() => setMaxDepth(d)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '6px',
                  backgroundColor: maxDepth === d ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                  color: maxDepth === d ? '#ffffff' : 'var(--text-muted)',
                  border: '1px solid var(--border-default)',
                  fontSize: '0.8rem',
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

      {/* Impact Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Upstream Callers */}
        <div
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <ArrowDownRight size={16} color="var(--accent-amber)" />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Upstream Invocations ({currentScenario.affectedCallers.length})
            </h4>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Call sites that will be impacted if signature or behavior changes:
          </p>
          <div style={{ display: 'grid', gap: '0.4rem' }}>
            {currentScenario.affectedCallers.map((caller) => (
              <div
                key={caller}
                style={{
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--accent-cyan)',
                }}
              >
                {caller}
              </div>
            ))}
          </div>
        </div>

        {/* Downstream Files */}
        <div
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <FileCode2 size={16} color="var(--accent-blue)" />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Affected Files ({currentScenario.downstreamFiles.length})
            </h4>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Files requiring compilation check or interface updates:
          </p>
          <div style={{ display: 'grid', gap: '0.4rem' }}>
            {currentScenario.downstreamFiles.map((f) => (
              <div
                key={f}
                style={{
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
              >
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Required Test Suites */}
        <div
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <TestTube2 size={16} color="var(--status-ok)" />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Required Test Suites ({currentScenario.impactedTests.length})
            </h4>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Mandatory test targets to run before committing changes:
          </p>
          <div style={{ display: 'grid', gap: '0.4rem' }}>
            {currentScenario.impactedTests.map((t) => (
              <div
                key={t}
                style={{
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '6px 10px',
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
