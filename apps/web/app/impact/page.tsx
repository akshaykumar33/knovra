'use client';

import React from 'react';
import {
  Activity,
  AlertTriangle,
  Play,
  Layers,
  TestTube2,
  FileCode2,
  Workflow,
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
              width: 30,
              height: 30,
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--status-danger)',
            }}
          >
            <Activity size={18} />
          </span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Impact Analysis & Blast-Radius Engine
          </h1>
          <span className="badge badge-danger">Phase 12 Core</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Trace upstream callers, downstream dependencies, and regression test suites before code modifications take place.
        </p>
      </div>

      {/* Interactive Impact Simulator */}
      <ImpactSimulatorDemo />
    </div>
  );
}
