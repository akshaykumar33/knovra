'use client';

import React from 'react';
import {
  Activity,
  AlertTriangle,
  ShieldCheck,
  GitPullRequest,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import ImpactSimulatorDemo from '../../components/showcases/ImpactSimulatorDemo';

export default function ImpactPage() {
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
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--status-danger)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
            }}
          >
            <Activity size={16} />
          </span>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#ffffff' }}>
            Impact Analysis & Blast-Radius Engine
          </h1>
          <span className="stripe-badge stripe-badge-red">
            <span className="pulsing-dot" style={{ backgroundColor: 'var(--status-danger)' }} />
            Graph Traversal Active
          </span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Calculate deterministic caller/callee blast-radii, risk scoring (0-100), and targeted regression test suites prior to code execution.
        </p>
      </div>

      {/* Capabilities Stats Bar */}
      <div
        className="stripe-panel"
        style={{
          padding: '0.85rem 1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldCheck size={16} color="var(--accent-blue)" />
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Policy Gate</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>Invariant #4 Strict Enforce</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Layers size={16} color="var(--accent-cyan)" />
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Traversal Engine</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>Rust AST + Neo4j Cypher</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <GitPullRequest size={16} color="var(--accent-amber)" />
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Safety Threshold</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>Score &gt; 70 Requires Approval</div>
          </div>
        </div>
      </div>

      {/* Interactive Impact Simulator Showcase */}
      <ImpactSimulatorDemo />
    </div>
  );
}
