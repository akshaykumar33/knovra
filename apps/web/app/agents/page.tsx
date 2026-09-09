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
                width: 30,
                height: 30,
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-blue)',
              }}
            >
              <Bot size={18} />
            </span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Agent Registry & Context Consumers
            </h1>
            <span className="badge badge-ok">{AGENTS.length} Connected</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Autonomous agent harnesses connected via MCP. Models are transient; Knovra maintains durable state across all harnesses.
          </p>
        </div>

        {/* View Switcher */}
        <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--bg-secondary)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
          <button
            onClick={() => setActiveTab('agents')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: activeTab === 'agents' ? 'var(--accent-blue)' : 'transparent',
              color: activeTab === 'agents' ? '#ffffff' : 'var(--text-secondary)',
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
              padding: '6px 14px',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: activeTab === 'transfer' ? 'var(--accent-blue)' : 'transparent',
              color: activeTab === 'transfer' ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Memory Transfer Showcase
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
              className="glass-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
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
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {agent.name}
                      </h3>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {agent.id}
                      </span>
                    </div>
                  </div>
                  <span className={`badge ${agent.status === 'active' ? 'badge-ok' : 'badge-purple'}`}>
                    {agent.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
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
                      {(agent.contextTokens || 0).toLocaleString()} tokens
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Active Sessions:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{agent.sessionsCount} sessions</strong>
                  </div>
                </div>

                {/* MCP Tool Capabilities */}
                <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Granted MCP Tools
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {['knovra.query', 'knovra.impact', 'knovra.plan', 'knovra.adr'].map((tool) => (
                      <span
                        key={tool}
                        style={{
                          fontSize: '0.7rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          backgroundColor: 'var(--bg-tertiary)',
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

              {/* Action */}
              <div style={{ borderTop: '1px solid var(--border-default)', marginTop: '1.25rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setActiveTab('transfer')}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Zap size={12} />
                  Transfer Memory
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
