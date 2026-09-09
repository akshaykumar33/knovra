'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Code2,
  Terminal,
} from 'lucide-react';
import { AGENTS } from '../../lib/data';

export default function MemoryTransferDemo() {
  const [sourceAgent, setSourceAgent] = useState('agent-codex-01');
  const [targetAgent, setTargetAgent] = useState('agent-claude-02');
  const [transferring, setTransferring] = useState(false);
  const [progressStep, setProgressStep] = useState<number>(0);
  const [completed, setCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'payload'>('pipeline');
  const [copied, setCopied] = useState(false);

  const source = AGENTS.find((a) => a.id === sourceAgent) || AGENTS[0];
  const target = AGENTS.find((a) => a.id === targetAgent) || AGENTS[1];

  const steps = [
    'Handshake & Session State Extraction (24 facts)',
    'Synthesizing Durable Context (12 ADRs + 4 Rules)',
    'Sanitizing Private Credentials (Invariant #6 Zero Leakage)',
    'Generating Vector Signatures with pgvector',
    'Registering Durable Context with MCP Gateway (:8080)',
  ];

  const samplePayload = {
    event: 'knovra.memory.transfer',
    source_agent: source.id,
    target_agent: target.id,
    session_id: 'sess-transfer-demo-01',
    invariants_verified: [
      'Invariant #1: Knovra owns durable context',
      'Invariant #6: Zero secret leakage',
    ],
    transferred_context: {
      active_adrs: ['ADR-001', 'ADR-004', 'ADR-007', 'ADR-012'],
      governing_rules: ['RULE-001 (Zero Secrets)', 'RULE-004 (Depth <= 3)'],
      facts_count: 24,
      symbol_callers: ['ImpactAnalyzer.AnalyzeBlastRadius', 'StorageEngine.query_hierarchy'],
    },
    latency_ms: 12.4,
    status: 'SYNCHRONIZED',
  };

  const handleTransfer = () => {
    setTransferring(true);
    setProgressStep(0);
    setCompleted(false);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setProgressStep(step);
      if (step >= steps.length) {
        clearInterval(interval);
        setTransferring(false);
        setCompleted(true);
      }
    }, 600);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(samplePayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="stripe-card" style={{ padding: '1.75rem' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: '6px',
                background: 'rgba(59, 130, 246, 0.12)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-blue)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
              }}
            >
              <Zap size={14} />
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Agent Memory Transfer Flow
            </h3>
            <span className="stripe-badge stripe-badge-purple" style={{ fontSize: '0.68rem' }}>
              Invariant #1
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '620px', lineHeight: 1.5 }}>
            Demonstrates zero-loss memory transfer between heterogeneous AI agents. When switching harnesses, Knovra streams exact project state without loss of architectural context.
          </p>
        </div>

        <button
          onClick={handleTransfer}
          disabled={transferring}
          className="btn-stripe-primary"
          style={{ opacity: transferring ? 0.75 : 1, cursor: transferring ? 'wait' : 'pointer' }}
        >
          {transferring ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              Transferring Memory Packets...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Simulate Memory Transfer
            </>
          )}
        </button>
      </div>

      {/* Agents Pair Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1.25rem', alignItems: 'center', marginBottom: '1.75rem' }}>
        {/* Source Agent Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-default)',
            borderTop: '1px solid var(--border-highlight)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Source Harness
            </span>
            <span className="stripe-badge stripe-badge-green">Active</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-blue)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
              }}
            >
              <Bot size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#ffffff' }}>{source.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{source.id}</div>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'grid', gap: '0.3rem' }}>
            <div>Model: <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{source.model}</span></div>
            <div>Context Tokens: <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{(source.contextTokens || 18450).toLocaleString()} tokens</span></div>
            <div>Extracted Facts: <span style={{ color: 'var(--text-primary)' }}>18 facts verified</span></div>
          </div>
        </div>

        {/* Transfer Indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              border: `1.5px solid ${transferring ? 'var(--accent-blue)' : 'var(--border-default)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: transferring ? 'var(--accent-blue)' : 'var(--text-muted)',
              boxShadow: transferring ? '0 0 16px rgba(59, 130, 246, 0.4)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            <ArrowRight size={16} />
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: 600 }}>
            Knovra MCP Hub
          </span>
        </div>

        {/* Target Agent Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-default)',
            borderTop: '1px solid var(--border-highlight)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Target Harness
            </span>
            <span className="stripe-badge stripe-badge-purple">Standby</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                backgroundColor: 'rgba(139, 92, 246, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-purple)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
              }}
            >
              <Bot size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#ffffff' }}>{target.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{target.id}</div>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'grid', gap: '0.3rem' }}>
            <div>Model: <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{target.model}</span></div>
            <div>Pending Sync: <span style={{ color: 'var(--accent-purple)', fontWeight: 500 }}>Ready to ingest</span></div>
            <div>Verification SLA: <span style={{ color: 'var(--status-ok)', fontFamily: 'var(--font-mono)' }}>&lt; 15ms</span></div>
          </div>
        </div>
      </div>

      {/* Pipeline View Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-canvas)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
          <button
            onClick={() => setActiveTab('pipeline')}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: activeTab === 'pipeline' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'pipeline' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Pipeline Steps
          </button>
          <button
            onClick={() => setActiveTab('payload')}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: activeTab === 'payload' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'payload' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            JSON Payload
          </button>
        </div>

        {activeTab === 'payload' && (
          <button
            onClick={handleCopyPayload}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
              color: copied ? 'var(--status-ok)' : 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>
        )}
      </div>

      {/* Tab 1: Pipeline Execution */}
      {activeTab === 'pipeline' ? (
        <div
          style={{
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Execution Telemetry
            </span>
            <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
              {completed ? '100% SYNCHRONIZED (12.4ms)' : transferring ? `${Math.round((progressStep / steps.length) * 100)}%` : 'READY'}
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div
            style={{
              height: 4,
              width: '100%',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: 999,
              overflow: 'hidden',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                height: '100%',
                width: completed ? '100%' : `${(progressStep / steps.length) * 100}%`,
                background: 'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          {/* Steps List */}
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {steps.map((stepText, idx) => {
              const isDone = completed || progressStep > idx;
              const isCurrent = transferring && progressStep === idx;
              return (
                <div
                  key={stepText}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.78rem',
                    color: isDone ? 'var(--status-ok)' : isCurrent ? '#ffffff' : 'var(--text-muted)',
                  }}
                >
                  {isDone ? (
                    <CheckCircle2 size={14} color="var(--status-ok)" />
                  ) : (
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: `1.5px solid ${isCurrent ? 'var(--accent-blue)' : 'var(--border-default)'}`,
                      }}
                    />
                  )}
                  <span>{stepText}</span>
                  {isDone && <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>✓ verified</span>}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Tab 2: JSON Payload */
        <pre
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            overflowX: 'auto',
            maxHeight: '220px',
            lineHeight: 1.5,
          }}
        >
          {JSON.stringify(samplePayload, null, 2)}
        </pre>
      )}

      {/* Completion Banner */}
      {completed && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <ShieldCheck size={18} color="var(--status-ok)" />
          <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
            <strong>Context Memory Transfer Complete:</strong> 42 items indexed & broadcast across agent bus in 12ms. Claude Code has immediate access to 12 ADRs, 4 rules, and active working session memory.
          </div>
        </div>
      )}
    </div>
  );
}
