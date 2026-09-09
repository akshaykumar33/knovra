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
  FileCheck,
} from 'lucide-react';
import { AGENTS, SESSIONS, ADRS } from '../../lib/data';

export default function MemoryTransferDemo() {
  const [sourceAgent, setSourceAgent] = useState('agent-codex-01');
  const [targetAgent, setTargetAgent] = useState('agent-claude-02');
  const [transferring, setTransferring] = useState(false);
  const [progressStep, setProgressStep] = useState<number>(0);
  const [completed, setCompleted] = useState(false);

  const source = AGENTS.find((a) => a.id === sourceAgent) || AGENTS[0];
  const target = AGENTS.find((a) => a.id === targetAgent) || AGENTS[1];

  const steps = [
    'Handshake & Session Discovery',
    'Extracting Durable Context (12 ADRs + 4 Rules)',
    'Synthesizing Working Memory & Symbol References',
    'Registering Vector Embeddings with MCP Gateway',
    'Verifying Zero-Knowledge-Loss Invariant',
  ];

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
    }, 650);
  };

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
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-blue)',
              }}
            >
              <Zap size={16} />
            </span>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Agent Memory Transfer Showcase
            </h3>
            <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
              Invariant #1
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '650px' }}>
            Demonstrates zero-loss memory transfer between heterogeneous AI agents. When you switch models or agent harnesses, Knovra injects the exact project context without losing conversational or architectural state.
          </p>
        </div>

        <button
          onClick={handleTransfer}
          disabled={transferring}
          className="btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '8px 18px',
            fontSize: '0.85rem',
            opacity: transferring ? 0.7 : 1,
            cursor: transferring ? 'not-allowed' : 'pointer',
          }}
        >
          {transferring ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              Transferring Context...
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1.25rem', alignItems: 'center', marginBottom: '2rem' }}>
        {/* Source Agent Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Source Agent
            </span>
            <span className="badge badge-ok" style={{ fontSize: '0.7rem' }}>Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-blue)',
              }}
            >
              <Bot size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{source.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{source.id}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'grid', gap: '0.3rem' }}>
            <div>Harness: <span style={{ color: 'var(--text-primary)' }}>{source.harness}</span></div>
            <div>Context Tokens: <span style={{ color: 'var(--accent-cyan)' }}>{(source.contextTokens || 0).toLocaleString()} tokens</span></div>
            <div>Known ADRs: <span style={{ color: 'var(--text-primary)' }}>12 Decisions</span></div>
          </div>
        </div>

        {/* Direction Indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: transferring ? 'var(--accent-blue)' : 'var(--text-muted)',
              boxShadow: transferring ? '0 0 12px rgba(59, 130, 246, 0.4)' : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            <ArrowRight size={18} />
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Knovra Hub
          </span>
        </div>

        {/* Target Agent Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Target Agent
            </span>
            <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>Standby</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-purple)',
              }}
            >
              <Bot size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{target.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{target.id}</div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'grid', gap: '0.3rem' }}>
            <div>Harness: <span style={{ color: 'var(--text-primary)' }}>{target.harness}</span></div>
            <div>Pending Memory: <span style={{ color: 'var(--accent-purple)' }}>Ready to hydrate</span></div>
            <div>Target Latency: <span style={{ color: 'var(--status-ok)' }}>&lt; 50ms</span></div>
          </div>
        </div>
      </div>

      {/* Transfer Pipeline Execution */}
      {(transferring || completed) && (
        <div
          style={{
            backgroundColor: 'rgba(17, 24, 39, 0.7)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Memory Pipeline Execution Status
            </span>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
              {completed ? '100% SYNCHRONIZED' : `${Math.round((progressStep / steps.length) * 100)}%`}
            </span>
          </div>

          {/* Progress bar */}
          <div
            style={{
              height: 6,
              width: '100%',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '999px',
              overflow: 'hidden',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(progressStep / steps.length) * 100}%`,
                background: 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))',
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          {/* Steps List */}
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {steps.map((stepText, idx) => {
              const isDone = progressStep > idx;
              const isCurrent = progressStep === idx;
              return (
                <div
                  key={stepText}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.8rem',
                    color: isDone ? 'var(--status-ok)' : isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
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
                        border: `1.5px solid ${isCurrent ? 'var(--accent-blue)' : 'var(--text-muted)'}`,
                      }}
                    />
                  )}
                  <span>{stepText}</span>
                  {isDone && <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>✓ verified</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Outcome Confirmation */}
      {completed && (
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <ShieldCheck size={20} color="var(--status-ok)" />
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <strong>Transfer Complete:</strong> Claude Code is now fully synchronized with project state. Zero hallucinations, verified rule constraints, and immediate access to 12 architectural decisions.
          </div>
        </div>
      )}
    </div>
  );
}
