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
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { AGENTS, Agent } from '../../lib/data';
import MemoryTransferDemo from '../../components/showcases/MemoryTransferDemo';
import { SpotlightCard } from '../../components/SpotlightCard';
import { AuroraGlow } from '../../components/AuroraGlow';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { KnovraButton } from '../../components/ui/KnovraButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { fireCelebrationConfetti } from '../../lib/confetti';

export default function AgentsPage() {
  const [activeTab, setActiveTab] = useState<'agents' | 'transfer'>('agents');

  const handleTransferClick = () => {
    fireCelebrationConfetti();
    toast.success('Agent memory transfer protocol initialized');
    setActiveTab('transfer');
  };

  return (
    <div style={{ display: 'grid', gap: '2rem', position: 'relative' }}>
      <AuroraGlow />
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span className="eyebrow-serif" style={{ display: 'block', marginBottom: '8px' }}>AUTONOMOUS AGENT HARNESSES</span>
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
                color: 'var(--accent-primary)',
                border: '1px solid var(--accent-primary)',
              }}
            >
              <Bot size={18} />
            </span>
            <h1 style={{ fontSize: 'clamp(28px, 3.2vw, 42px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
              Agent <span className="font-calligraphy text-gradient-aurora">Registry</span>
            </h1>
            <StatusBadge tone="success" pulse={true}>
              {AGENTS.length} Connected Harnesses
            </StatusBadge>
          </div>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '620px', lineHeight: 1.6 }}>
            Autonomous agent harnesses connected via MCP. Models are transient; Knovra maintains durable state across all harnesses.
          </p>
        </div>

        {/* Unified Segmented View Switcher */}
        <SegmentedTabs
          tabs={[
            { id: 'agents', label: `Registered Agents (${AGENTS.length})`, icon: <Bot size={14} /> },
            { id: 'transfer', label: 'Memory Transfer Flow', icon: <Zap size={14} /> },
          ]}
          active={activeTab}
          onChange={(tab) => {
            if (tab === 'transfer') fireCelebrationConfetti();
            setActiveTab(tab as 'agents' | 'transfer');
          }}
        />
      </div>

      {activeTab === 'transfer' ? (
        <MemoryTransferDemo />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1.25rem' }}>
          {AGENTS.map((agent) => (
            <SpotlightCard
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
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {agent.name}
                      </h3>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {agent.id}
                      </span>
                    </div>
                  </div>
                  <StatusBadge tone={agent.status === 'active' ? 'success' : 'purple'} pulse={agent.status === 'active'}>
                    {agent.status}
                  </StatusBadge>
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
                      {((agent.contextTokens || 0)).toLocaleString('en-US')} tokens
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Active Sessions:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{agent.sessionsCount || 4} sessions</strong>
                  </div>
                </div>

                {/* MCP Tool Capabilities */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
                    Granted MCP Tools
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {['knovra.query', 'knovra.impact', 'knovra.plan', 'knovra.adr'].map((tool) => (
                      <span
                        key={tool}
                        style={{
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-canvas)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
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
                <KnovraButton
                  variant="secondary"
                  size="sm"
                  icon={<Zap size={13} />}
                  onClick={handleTransferClick}
                >
                  Transfer Memory
                </KnovraButton>
              </div>
            </SpotlightCard>
          ))}
        </div>
      )}
    </div>
  );
}
