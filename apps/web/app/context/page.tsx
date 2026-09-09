'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Sparkles,
  Sliders,
  Layers,
  FileCode2,
  GitPullRequest,
  ShieldCheck,
  Copy,
  Check,
  Terminal,
} from 'lucide-react';
import { ADRS, RULES } from '../../lib/data';

const SAMPLE_TASKS = [
  {
    id: 'task-auth',
    title: 'Refactor AuthInterceptor to support mTLS certificates',
    relevantAdrs: ['ADR-004', 'ADR-009'],
    relevantRules: ['RULE-001'],
    relevantSymbols: ['AuthInterceptor.authenticate', 'JWTValidator.VerifyToken'],
  },
  {
    id: 'task-impact',
    title: 'Expand Impact Analysis with Cypher multi-hop traversals',
    relevantAdrs: ['ADR-001', 'ADR-012'],
    relevantRules: ['RULE-004'],
    relevantSymbols: ['ImpactAnalyzer.AnalyzeBlastRadius', 'StorageEngine.query_hierarchy'],
  },
  {
    id: 'task-mcp',
    title: 'Add streaming prompt injection to MCP Agent Gateway',
    relevantAdrs: ['ADR-004', 'ADR-008'],
    relevantRules: ['RULE-002', 'RULE-003'],
    relevantSymbols: ['GatewayServer.HandleToolCall', 'ContextPlanner.plan_context'],
  },
];

export default function ContextExplorerPage() {
  const [selectedTask, setSelectedTask] = useState(SAMPLE_TASKS[0]);
  const [budgetTokens, setBudgetTokens] = useState<number>(8000);
  const [copied, setCopied] = useState(false);

  // Dynamic token allocation breakdown
  const invariantsTokens = 320;
  const adrTokens = selectedTask.relevantAdrs.length * 650;
  const symbolTokens = selectedTask.relevantSymbols.length * 480;
  const ruleTokens = selectedTask.relevantRules.length * 210;
  const totalAllocated = invariantsTokens + adrTokens + symbolTokens + ruleTokens;
  const remainingBudget = Math.max(0, budgetTokens - totalAllocated);

  const generatedPrompt = `### [KNOVRA CONTEXT INJECTION]
# Active Task: ${selectedTask.title}
# Budget Enforced: ${budgetTokens} tokens (Allocated: ${totalAllocated} tokens)

## 1. Architectural Invariants (Invariant #1, #2, #6)
- AI agents do not own context. Knovra owns context and agents consume it.
- Never write API keys, bearer tokens, or secrets to logs or transcripts.

## 2. Applicable Architectural Decisions
${selectedTask.relevantAdrs
  .map((id) => {
    const adr = ADRS.find((a) => a.id === id);
    return `### ${adr?.id}: ${adr?.title}\n- Decision: ${adr?.decision}\n- Consequences: ${adr?.consequences}`;
  })
  .join('\n\n')}

## 3. Targeted Symbol Signatures
${selectedTask.relevantSymbols.map((s) => `- ${s}`).join('\n')}

## 4. Governance Constraints
${selectedTask.relevantRules
  .map((rId) => {
    const r = RULES.find((rule) => rule.id === rId);
    return `- [${r?.severity.toUpperCase()}] ${r?.name}: ${r?.description}`;
  })
  .join('\n')}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

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
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-blue)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
            }}
          >
            <Cpu size={16} />
          </span>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#ffffff' }}>
            Context Explorer & Planning Studio
          </h1>
          <span className="stripe-badge stripe-badge-purple">Phase 08 Engine</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Deterministic token budget packing, semantic memory retrieval, and agent prompt synthesis.
        </p>
      </div>

      {/* Task Preset & Budget Controls */}
      <div
        className="stripe-card"
        style={{
          padding: '1.5rem',
          display: 'grid',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.45rem', letterSpacing: '0.04em' }}>
              Select Active Engineering Task
            </div>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {SAMPLE_TASKS.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: selectedTask.id === task.id ? 'var(--accent-blue)' : 'var(--bg-primary)',
                    color: selectedTask.id === task.id ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-default)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {task.title.split(' ').slice(0, 4).join(' ')}...
                </button>
              ))}
            </div>
          </div>

          {/* Budget Slider */}
          <div style={{ minWidth: '260px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Token Budget:</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                {budgetTokens.toLocaleString()} tokens
              </span>
            </div>
            <input
              type="range"
              min="2000"
              max="32000"
              step="1000"
              value={budgetTokens}
              onChange={(e) => setBudgetTokens(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Token Allocation Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <span>Allocated: <strong style={{ color: '#ffffff' }}>{totalAllocated} tokens</strong> ({Math.round((totalAllocated / budgetTokens) * 100)}%)</span>
            <span>Headroom: <strong style={{ color: 'var(--status-ok)' }}>{remainingBudget} tokens</strong></span>
          </div>
          <div style={{ height: 6, width: '100%', backgroundColor: 'var(--bg-canvas)', borderRadius: 999, overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${(invariantsTokens / budgetTokens) * 100}%`, backgroundColor: 'var(--accent-blue)' }} title="Invariants" />
            <div style={{ width: `${(adrTokens / budgetTokens) * 100}%`, backgroundColor: 'var(--accent-purple)' }} title="ADRs" />
            <div style={{ width: `${(symbolTokens / budgetTokens) * 100}%`, backgroundColor: 'var(--accent-cyan)' }} title="Symbols" />
            <div style={{ width: `${(ruleTokens / budgetTokens) * 100}%`, backgroundColor: 'var(--status-ok)' }} title="Rules" />
          </div>
        </div>
      </div>

      {/* Two Column Inspector & Output */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left: Pack Breakdown Details */}
        <div className="stripe-card" style={{ padding: '1.35rem', display: 'grid', gap: '0.85rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
            Context Tier Breakdown
          </h3>

          <div style={{ display: 'grid', gap: '0.65rem', fontSize: '0.8rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)', borderLeft: '3px solid var(--accent-blue)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--text-primary)' }}>
                <span>Tier 1: System Invariants</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)' }}>{invariantsTokens} tokens</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Mandatory rules, secret sanitization, context ownership invariant.
              </p>
            </div>

            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)', borderLeft: '3px solid var(--accent-purple)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--text-primary)' }}>
                <span>Tier 2: Relevant ADRs ({selectedTask.relevantAdrs.length})</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)' }}>{adrTokens} tokens</span>
              </div>
              <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.35rem' }}>
                {selectedTask.relevantAdrs.map((a) => (
                  <span key={a} className="stripe-badge stripe-badge-purple" style={{ fontSize: '0.68rem' }}>{a}</span>
                ))}
              </div>
            </div>

            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)', borderLeft: '3px solid var(--accent-cyan)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--text-primary)' }}>
                <span>Tier 3: AST Symbols ({selectedTask.relevantSymbols.length})</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{symbolTokens} tokens</span>
              </div>
              <div style={{ display: 'grid', gap: '0.2rem', marginTop: '0.35rem' }}>
                {selectedTask.relevantSymbols.map((s) => (
                  <span key={s} style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{s}</span>
                ))}
              </div>
            </div>

            <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)', borderLeft: '3px solid var(--status-ok)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--text-primary)' }}>
                <span>Tier 4: Governance Rules ({selectedTask.relevantRules.length})</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--status-ok)' }}>{ruleTokens} tokens</span>
              </div>
              <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.35rem' }}>
                {selectedTask.relevantRules.map((r) => (
                  <span key={r} className="stripe-badge stripe-badge-green" style={{ fontSize: '0.68rem' }}>{r}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Synthesized Context Prompt */}
        <div className="stripe-card" style={{ padding: '1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Terminal size={15} color="var(--accent-blue)" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                Synthesized Prompt Payload
              </h3>
            </div>
            <button
              onClick={handleCopy}
              className="btn-stripe-secondary"
              style={{ fontSize: '0.72rem', padding: '3px 8px' }}
            >
              {copied ? <Check size={12} color="var(--status-ok)" /> : <Copy size={12} />}
              <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
            </button>
          </div>

          <pre
            style={{
              padding: '1.15rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
              fontSize: '0.74rem',
              fontFamily: 'var(--font-mono)',
              overflowX: 'auto',
              maxHeight: '380px',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.55,
            }}
          >
            {generatedPrompt}
          </pre>
        </div>
      </div>
    </div>
  );
}
