'use client';

import React, { useState } from 'react';
import {
  Bot,
  Plus,
  Zap,
  Cpu,
  Layers,
  CheckCircle2,
  Terminal,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { AGENTS, Agent } from '../../lib/data';
import MemoryTransferDemo from '../../components/showcases/MemoryTransferDemo';

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState<'agents' | 'transfer'>('agents');

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
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-blue)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
              }}
            >
              <Bot size={16} />
            </span>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#ffffff' }}>
              Agent Registry & Context Consumers
            </h1>
            <span className="stripe-badge stripe-badge-green">{AGENTS.length} Connected</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Autonomous agent harnesses connected via MCP. Models are transient; Knovra maintains durable state across all harnesses.
          </p>
        </div>

        {/* View Switcher */}
        <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-canvas)', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
          <button
            onClick={() => setActiveTab('agents')}
            style={{
              padding: '5px 12px',
              fontSize: '0.78rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: activeTab === 'agents' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'agents' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Registered Agents ({AGENTS.length})
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            style={{
              padding: '5px 12px',
              fontSize: '0.78rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: activeTab === 'transfer' ? 'var(--bg-secondary)' : 'transparent',
              color: activeTab === 'transfer' ? '#ffffff' : 'var(--text-muted)',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Memory Transfer Flow
          </button>
        </div>
      </div>

      {activeTab === 'transfer' ? (
        <MemoryTransferDemo />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {AGENTS.map((agent) => (
            <div
              key={agent.id}
              className="stripe-card"
              style={{
                padding: '1.35rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                        {agent.name}
                      </h3>
                      <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {agent.id}
                      </span>
                    </div>
                  </div>
                  <span className={`stripe-badge ${agent.status === 'active' ? 'stripe-badge-green' : 'stripe-badge-purple'}`}>
                    {agent.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gap: '0.45rem', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Harness:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{agent.harness}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Default Model:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{agent.model}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Context Consumed:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)' }}>
                      {((agent.contextTokens || 0)).toLocaleString()} tokens
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Active Sessions:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{agent.sessionsCount || 4} sessions</strong>
                  </div>
                </div>

                {/* MCP Tool Capabilities */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
                    Granted MCP Tools
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {['knovra.query', 'knovra.impact', 'knovra.plan', 'knovra.adr'].map((tool) => (
                      <span
                        key={tool}
                        style={{
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          backgroundColor: 'var(--bg-canvas)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-default)',
                        }}
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '1.15rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setActiveTab('transfer')}
                  className="btn-stripe-secondary"
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  <Zap size={11} />
                  <span>Transfer Memory</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
