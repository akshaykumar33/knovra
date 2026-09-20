'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  ArrowRight,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Gauge,
  Info,
  ChevronRight,
  ExternalLink,
  Code2,
  Boxes,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { ADRS, RULES } from '../../lib/data';
import { SpotlightCard } from '../../components/SpotlightCard';
import { AuroraGlow } from '../../components/AuroraGlow';
import { KnovraButton } from '../../components/ui/KnovraButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { CodeSnippet } from '../../components/ui/CodeSnippet';
import { fireMicroSparkle } from '../../lib/confetti';

interface ContextTask {
  id: string;
  title: string;
  domain: string;
  candidateTokens: number;
  relevantAdrs: string[];
  relevantRules: string[];
  selectedSymbols: Array<{ name: string; file: string; tokens: number; reason: string }>;
  rejectedSymbols: Array<{ name: string; file: string; tokens: number; reason: string }>;
  skills: Array<{ name: string; reason: string }>;
}

const SAMPLE_TASKS: ContextTask[] = [
  {
    id: 'task-auth',
    title: 'Refactor AuthInterceptor to support mTLS certificates',
    domain: 'services/runtime/internal/auth',
    candidateTokens: 284500,
    relevantAdrs: ['ADR-004', 'ADR-009'],
    relevantRules: ['RULE-001'],
    selectedSymbols: [
      {
        name: 'AuthInterceptor.authenticate',
        file: 'services/runtime/internal/auth/interceptor.go',
        tokens: 380,
        reason: 'DIRECT_TASK_DEPENDENCY (Primary modified method)',
      },
      {
        name: 'JWTValidator.VerifyToken',
        file: 'services/runtime/internal/auth/jwt.go',
        tokens: 420,
        reason: 'UPSTREAM_CALLER_BOUNDARY (Token verification entrypoint)',
      },
      {
        name: 'TokenCache.Get',
        file: 'services/runtime/internal/auth/cache.go',
        tokens: 240,
        reason: 'DOWNSTREAM_INVOCATION (Cached credential store)',
      },
    ],
    rejectedSymbols: [
      {
        name: 'ImpactAnalyzer.AnalyzeBlastRadius',
        file: 'services/runtime/internal/impact/analyzer.go',
        tokens: 1450,
        reason: 'OUT_OF_DOMAIN_SCOPE (Unrelated to auth traversal)',
      },
      {
        name: 'StorageEngine.query_hierarchy',
        file: 'services/code-indexer/src/storage.rs',
        tokens: 3200,
        reason: 'EXCEEDS_BUDGET (Graph query engine not touched in mTLS)',
      },
      {
        name: 'ContextPlanner.plan_context',
        file: 'services/context-engine/app/planner.py',
        tokens: 2800,
        reason: 'UNTOUCHED_SUBSYSTEM (Context planner is downstream)',
      },
    ],
    skills: [
      { name: 'mTLS-handshake-verifier', reason: 'CERTIFICATE_VALIDATION_DIRECTIVE' },
      { name: 'tenant-safe-query', reason: 'PREVENTS_CROSS_TENANT_LEAK' },
    ],
  },
  {
    id: 'task-impact',
    title: 'Expand Impact Analysis with Cypher multi-hop traversals',
    domain: 'services/runtime/internal/impact',
    candidateTokens: 318400,
    relevantAdrs: ['ADR-001', 'ADR-012'],
    relevantRules: ['RULE-004'],
    selectedSymbols: [
      {
        name: 'ImpactAnalyzer.AnalyzeBlastRadius',
        file: 'services/runtime/internal/impact/analyzer.go',
        tokens: 480,
        reason: 'DIRECT_TASK_DEPENDENCY (Target method to expand)',
      },
      {
        name: 'StorageEngine.query_hierarchy',
        file: 'services/code-indexer/src/storage.rs',
        tokens: 520,
        reason: 'DOWNSTREAM_INVOCATION (Executes Cypher multi-hop query)',
      },
      {
        name: 'Neo4jDriver.execute_cypher',
        file: 'storage/neo4j/driver.go',
        tokens: 310,
        reason: 'DATABASE_ADAPTER (Low-level query execution boundary)',
      },
    ],
    rejectedSymbols: [
      {
        name: 'AuthInterceptor.authenticate',
        file: 'services/runtime/internal/auth/interceptor.go',
        tokens: 950,
        reason: 'OUT_OF_DOMAIN_SCOPE (Auth pipeline is unaffected)',
      },
      {
        name: 'SessionMemory.RecordTurn',
        file: 'services/memory/store.go',
        tokens: 1800,
        reason: 'EXCEEDS_BUDGET (Transcript memory irrelevant to Cypher hops)',
      },
    ],
    skills: [
      { name: 'blast-radius-tracer', reason: 'RECURSIVE_TRAVERSAL_DIRECTIVE' },
      { name: 'cypher-index-optimizer', reason: 'ENFORCES_QUERY_PERFORMANCE' },
    ],
  },
  {
    id: 'task-mcp',
    title: 'Add streaming prompt injection to MCP Agent Gateway',
    domain: 'services/runtime/gateway',
    candidateTokens: 342000,
    relevantAdrs: ['ADR-004', 'ADR-008'],
    relevantRules: ['RULE-002', 'RULE-003'],
    selectedSymbols: [
      {
        name: 'GatewayServer.HandleToolCall',
        file: 'services/runtime/cmd/server.go',
        tokens: 490,
        reason: 'DIRECT_TASK_DEPENDENCY (MCP JSON-RPC handler)',
      },
      {
        name: 'ContextPlanner.plan_context',
        file: 'services/context-engine/app/planner.py',
        tokens: 410,
        reason: 'DOWNSTREAM_INVOCATION (Generates streaming context bundle)',
      },
    ],
    rejectedSymbols: [
      {
        name: 'GitProvenance.verify_commit',
        file: 'services/provenance/git.rs',
        tokens: 2400,
        reason: 'OUT_OF_DOMAIN_SCOPE (Git SHA validation not needed for prompt stream)',
      },
    ],
    skills: [
      { name: 'mcp-jsonrpc-streaming', reason: 'SSE_CHUNK_FORMATTER' },
    ],
  },
];

export default function ContextPlannerStudioPage() {
  const [selectedTask, setSelectedTask] = useState<ContextTask>(SAMPLE_TASKS[0]);
  const [customTaskInput, setCustomTaskInput] = useState('');
  const [budgetTokens, setBudgetTokens] = useState<number>(8000);
  const [activeTab, setActiveTab] = useState<'selected' | 'rejected' | 'governance' | 'bundle'>('selected');
  const [copied, setCopied] = useState(false);

  // Dynamic token calculation
  const invariantsTokens = 320;
  const adrTokens = selectedTask.relevantAdrs.length * 620;
  const symbolTokens = selectedTask.selectedSymbols.reduce((acc, s) => acc + s.tokens, 0);
  const ruleTokens = selectedTask.relevantRules.length * 180;
  const skillTokens = selectedTask.skills.length * 240;
  const totalAllocated = invariantsTokens + adrTokens + symbolTokens + ruleTokens + skillTokens;
  const remainingBudget = Math.max(0, budgetTokens - totalAllocated);

  const tokenReductionPercent = (
    ((selectedTask.candidateTokens - totalAllocated) / selectedTask.candidateTokens) *
    100
  ).toFixed(1);

  // Synthesized JSON ContextBundle
  const contextBundleJson = JSON.stringify(
    {
      version: '0.4.0',
      taskIntent: selectedTask.title,
      domain: selectedTask.domain,
      budget: {
        enforcedLimit: budgetTokens,
        allocatedTokens: totalAllocated,
        remainingTokens: remainingBudget,
        reductionPercent: `${tokenReductionPercent}%`,
      },
      selectedSymbols: selectedTask.selectedSymbols.map((s) => ({
        symbol: s.name,
        file: s.file,
        tokens: s.tokens,
        reason: s.reason,
      })),
      governingRules: selectedTask.relevantRules.map((rId) => {
        const r = RULES.find((item) => item.id === rId);
        return { id: rId, name: r?.name, severity: r?.severity };
      }),
      applicableADRs: selectedTask.relevantAdrs.map((aId) => {
        const adr = ADRS.find((item) => item.id === aId);
        return { id: aId, title: adr?.title, decision: adr?.decision };
      }),
      agentSkills: selectedTask.skills,
    },
    null,
    2
  );

  const handleCopyBundle = () => {
    navigator.clipboard.writeText(contextBundleJson);
    setCopied(true);
    toast.success('ContextBundle JSON copied to clipboard');
    fireMicroSparkle(0.85, 0.2);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="context-workspace" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', position: 'relative' }}>
      <AuroraGlow />
      {/* Top Header */}
      <div
        className="context-workspace-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '0.65rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                backgroundColor: 'var(--accent-glow)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
                border: '1px solid var(--accent-primary)',
              }}
            >
              <Cpu size={18} />
            </span>
            <h1 style={{ fontSize: 'clamp(24px, 2.5vw, 32px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
              Context <span className="font-calligraphy text-gradient-aurora">Studio</span>
            </h1>
            <StatusBadge tone="info">Compiler v0.4</StatusBadge>
            <StatusBadge tone="success" pulse={true}>
              Deterministic Packaging
            </StatusBadge>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Observe how raw task queries are pruned, bounded, and compiled into transparent, minimum sufficient ContextBundles.
          </p>
        </div>

        {/* Action button */}
        <KnovraButton
          variant="primary"
          size="sm"
          onClick={handleCopyBundle}
          icon={copied ? <Check size={14} /> : <Copy size={14} />}
        >
          {copied ? 'Bundle Copied' : 'Copy ContextBundle JSON'}
        </KnovraButton>
      </div>

      {/* =========================================================================
          TELEMETRY STRIP (Prompt 5 Section 13 & 15)
          ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))',
          gap: '1rem',
        }}
      >
        <SpotlightCard className="knovra-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Uncompressed Candidate Context
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {(selectedTask.candidateTokens / 1000).toFixed(1)}k tokens
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--status-danger)' }}>Raw repo dump without Knovra</div>
        </SpotlightCard>

        <SpotlightCard className="knovra-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Knovra Compiled Context
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
            {(totalAllocated / 1000).toFixed(2)}k tokens
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--status-ok)' }}>Bounded minimum sufficient slice</div>
        </SpotlightCard>

        <SpotlightCard className="knovra-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Token Reduction Ratio
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-secondary)', fontFamily: 'var(--font-mono)' }}>
            {tokenReductionPercent}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tokens eliminated from prompt</div>
        </SpotlightCard>

        <SpotlightCard className="knovra-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Compiler Latency
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--status-warn)', fontFamily: 'var(--font-mono)' }}>
            18.4ms
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Local embedded Neo4j + AST</div>
        </SpotlightCard>
      </div>

      {/* =========================================================================
          TASK PROMPT SELECTOR & BUDGET CONTROLS
          ========================================================================= */}
      <div
        className="knovra-card"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            Select Active Developer Intent
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Simulate how Knovra routes different tasks through the graph compiler
          </span>
        </div>

        {/* Task Preset Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '0.65rem' }}>
          {SAMPLE_TASKS.map((t) => {
            const isSelected = selectedTask.id === t.id;
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => setSelectedTask(t)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? 'var(--bg-secondary)' : 'var(--bg-card)',
                  border: `1.5px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
                className="knovra-card-interactive"
              >
                <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>{t.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Domain: {t.domain}
                </div>
              </button>
            );
          })}
        </div>

        {/* Token Budget Slider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sliders size={16} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Hard Token Budget Limit:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-primary)' }}>
              {budgetTokens.toLocaleString('en-US')} tokens
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, maxWidth: '380px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>4k</span>
            <input
              type="range"
              min={4000}
              max={32000}
              step={1000}
              value={budgetTokens}
              onChange={(e) => setBudgetTokens(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>32k</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          6-STAGE PIPELINE VISUALIZATION (Prompt 5 Section 15 & 47)
          ========================================================================= */}
      <div
        className="knovra-card"
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
          Autonomous 6-Stage Compilation Traversal
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
            gap: '0.75rem',
          }}
        >
          {[
            { step: '1. Task Analyzed', desc: 'Intent parsed via embeddings', status: 'done' },
            { step: '2. Domain Identified', desc: selectedTask.domain.split('/').pop(), status: 'done' },
            { step: '3. Graph Traversed', desc: 'Embedded Neo4j 3-hop query', status: 'done' },
            { step: '4. Rules Discovered', desc: `${selectedTask.relevantRules.length} governance rules`, status: 'done' },
            { step: '5. Skills Ingested', desc: `${selectedTask.skills.length} behavioral skills`, status: 'done' },
            { step: '6. Bundle Compiled', desc: `${totalAllocated} tokens compiled`, status: 'active' },
          ].map((item, idx) => (
            <div
              key={item.step}
              style={{
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: item.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)',
                border: `1px solid ${item.status === 'active' ? 'var(--accent-primary)' : 'var(--border-default)'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '3px' }}>
                <CheckCircle2 size={13} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.step}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          TRANSPARENT CONTEXT INSPECTOR TABS (Prompt 5 Section 15)
          ========================================================================= */}
      <div className="knovra-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Tab Headers */}
        <div style={{ marginBottom: '0.5rem' }}>
          <SegmentedTabs
            tabs={[
              { id: 'selected', label: `Selected Symbols (${selectedTask.selectedSymbols.length})`, icon: <FileCode2 size={13} /> },
              { id: 'rejected', label: `Pruned Nodes (${selectedTask.rejectedSymbols.length})`, icon: <Filter size={13} /> },
              { id: 'governance', label: `Governing Rules & ADRs (${selectedTask.relevantRules.length + selectedTask.relevantAdrs.length})`, icon: <ShieldCheck size={13} /> },
              { id: 'bundle', label: 'Synthesized ContextBundle JSON', icon: <Terminal size={13} /> },
            ]}
            active={activeTab}
            onChange={(tab) => setActiveTab(tab as any)}
          />
        </div>

        {/* Tab 1: Selected Symbols with Selection Rationale */}
        {activeTab === 'selected' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {selectedTask.selectedSymbols.map((sym) => (
              <div
                key={sym.name}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {sym.name}
                    </span>
                    <span className="knovra-badge knovra-badge-green" style={{ fontSize: '0.75rem' }}>
                      Included
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Declared in: {sym.file}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '4px', fontWeight: 600 }}>
                    Selection Reason: {sym.reason}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    ~{sym.tokens} tokens
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Compiled AST slice</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Pruned / Rejected Nodes with Justification */}
        {activeTab === 'rejected' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {selectedTask.rejectedSymbols.map((sym) => (
              <div
                key={sym.name}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  opacity: 0.85,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {sym.name}
                    </span>
                    <span className="knovra-badge knovra-badge-red" style={{ fontSize: '0.75rem' }}>
                      Pruned
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {sym.file}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--status-warn)', marginTop: '4px', fontWeight: 600 }}>
                    Pruned Reason: {sym.reason}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--status-danger)' }}>
                    -{sym.tokens} tokens saved
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Omitted from prompt</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Governance Rules & ADR Lineage */}
        {activeTab === 'governance' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--status-ok)', marginBottom: '0.5rem' }}>
                Governing Rules ({selectedTask.relevantRules.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedTask.relevantRules.map((rId) => {
                  const rule = RULES.find((r) => r.id === rId);
                  return (
                    <div
                      key={rId}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--status-ok)', marginBottom: '2px' }}>
                        {rule?.name || rId}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{rule?.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}>
                Applicable ADRs ({selectedTask.relevantAdrs.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedTask.relevantAdrs.map((aId) => {
                  const adr = ADRS.find((a) => a.id === aId);
                  return (
                    <div
                      key={aId}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                        {adr?.id}: {adr?.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{adr?.decision}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Raw Synthesized ContextBundle JSON */}
        {activeTab === 'bundle' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Target ContextBundle Schema (RFC-004 compliant)
            </span>
            <CodeSnippet
              code={contextBundleJson}
              language="json"
              filename="context-bundle.json"
            />
          </div>
        )}
      </div>
    </div>
  );
}
