'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AuroraGlow } from '../../components/AuroraGlow';
import { fireMicroSparkle } from '../../lib/confetti';
import { CodeSnippet } from '../../components/ui/CodeSnippet';
import { KnovraButton } from '../../components/ui/KnovraButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { toast } from 'sonner';
import {
  BookOpen,
  Search,
  Terminal,
  Cpu,
  Network,
  ShieldCheck,
  FolderGit2,
  Key,
  Layers,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Code2,
  FileCode,
  Info,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Menu,
  X,
  Compass,
} from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  category: string;
  badge?: string;
  headings: { id: string; title: string }[];
  content: {
    summary: string;
    callout?: { type: 'note' | 'tip' | 'warning'; text: string };
    codeSnippet?: {
      filename: string;
      language: string;
      code: string;
    };
    terminalSnippet?: string;
    steps?: { title: string; desc: string }[];
    details: string[];
  };
}

const DOC_PAGES: DocSection[] = [
  {
    id: 'intro',
    title: 'Introduction & Core Concepts',
    category: 'GETTING STARTED',
    badge: 'Overview',
    headings: [
      { id: 'what-is-knovra', title: 'What is Knovra?' },
      { id: 'why-local-first', title: 'Why Local-First Intelligence?' },
      { id: 'invariants', title: 'Core Architectural Invariants' },
    ],
    content: {
      summary:
        'Knovra is a local-first project intelligence runtime for AI agents. It decouples persistent repository understanding from ephemeral model harnesses (Claude Code, Codex, Gemini, local LLMs).',
      callout: {
        type: 'tip',
        text: 'Invariant #1: AI agents do not own context. Knovra owns persistent context, and agents consume deterministic ContextBundles on demand.',
      },
      codeSnippet: {
        filename: 'architecture-pipeline.txt',
        language: 'text',
        code: `Repository
  → AST & Tree-sitter Symbols
  → Embedded Neo4j Context Graph
  → Architectural Rules & Governance
  → Agent Skills & Transcripts
  → Context Compiler
  → Agent ContextBundle (Minimum Sufficient Context)
  → Validation & Feedback Loop`,
      },
      details: [
        'Decoupled Intelligence: If you switch from Claude 3.7 to Codex or a local Llama model, the project knowledge, architectural decisions, and symbol call graphs remain identical.',
        'Zero Code Leakage: The intelligence graph is stored exclusively in your local repository root (.knovra/) in SQLite, Neo4j, or sled embedded storage.',
        'Deterministic Compilation: Eliminates hallucinated API signatures by verifying symbol existence against tree-sitter AST nodes before generating prompts.',
      ],
    },
  },
  {
    id: 'quickstart',
    title: 'Quick Start & Installation',
    category: 'GETTING STARTED',
    headings: [
      { id: 'install-binary', title: 'Install CLI Binary' },
      { id: 'init-repo', title: 'Initialize Repository' },
      { id: 'index-symbols', title: 'Run Initial Indexing' },
    ],
    content: {
      summary:
        'Get up and running with Knovra in under 60 seconds. Knovra runs as a standalone daemon binary or an npm package.',
      callout: {
        type: 'note',
        text: 'Knovra requires no remote cloud accounts. All parsing, graph synthesis, and context generation run natively on your machine.',
      },
      terminalSnippet: `$ npm install -g @knovra/cli
$ cd /path/to/your/monorepo
$ knovra init
✓ Detected monorepo structure (Go, Rust, Python, TypeScript)
✓ Created .knovra/ configuration
✓ Embedded Neo4j & sled runtime initialized on port 7474

$ knovra index
✓ Parsed 1,842 source files in 2.4s (Tree-sitter)
✓ Extracted 9,214 symbols & 14,631 call graph edges
✓ Indexed 12 Architectural Decision Records (ADRs)
✓ Validated 7 Golden Invariants: 0 violations
✓ Local-first intelligence runtime ready`,
      steps: [
        {
          title: '1. Initialize repository',
          desc: 'Run `knovra init` in your project root to generate the .knovra/ manifest and local embedded storage.',
        },
        {
          title: '2. Index AST symbols & dependencies',
          desc: 'Run `knovra index` to scan all languages (Go, Rust, Python, TS) and build the call graph.',
        },
        {
          title: '3. Connect your AI agent',
          desc: 'Start the MCP daemon via `knovra daemon` or link with Claude Code via `claude mcp add knovra -- knovra mcp`.',
        },
      ],
      details: [
        'Automatic language detection: Tree-sitter grammars are embedded within the Knovra binary.',
        'Incremental watchers: File changes automatically trigger sub-second delta re-indexing.',
      ],
    },
  },
  {
    id: 'context-graph',
    title: 'Context Graph & Neo4j Traversal',
    category: 'PROJECT INTELLIGENCE',
    badge: 'Signature',
    headings: [
      { id: 'graph-topology', title: 'Graph Topology & Schema' },
      { id: 'multi-hop-traversal', title: 'Multi-Hop Traversal' },
      { id: 'cypher-queries', title: 'Custom Cypher Queries' },
    ],
    content: {
      summary:
        'The Context Graph is an embedded Neo4j graph that stores semantic relationships between functions, interfaces, database tables, ADRs, and security rules.',
      callout: {
        type: 'tip',
        text: 'The graph connects across multi-language boundary lines. For example, a Go HTTP handler calling a Rust FFI binding that queries a Postgres database.',
      },
      codeSnippet: {
        filename: 'queries/blast_radius.cypher',
        language: 'cypher',
        code: `// Find all upstream callers within 3 hops of modified method
MATCH (target:Function {name: 'AnalyzeBlastRadius'})<-[:CALLS*1..3]-(caller:Function)
MATCH (target)-[:GOVERNED_BY]->(rule:Rule)
RETURN caller.name AS Caller, caller.file AS File, rule.id AS RuleLimit;`,
      },
      details: [
        'Node Types: Function, Struct, Interface, File, Service, Database, Rule, Skill, ADR.',
        'Edge Types: CALLS, IMPORTS, GOVERNED_BY, QUERIES, IMPLEMENTS, TESTED_BY.',
        'Cypher Execution: Developers can write custom Cypher queries in the Web Explorer or via CLI (`knovra query`).',
      ],
    },
  },
  {
    id: 'compiler',
    title: 'Context Compiler & Budgeting',
    category: 'CONTEXT ENGINE',
    headings: [
      { id: 'minimum-sufficient-context', title: 'Minimum Sufficient Context' },
      { id: 'token-reduction', title: '95.4% Token Reduction' },
      { id: 'context-bundle-spec', title: 'ContextBundle JSON Schema' },
    ],
    content: {
      summary:
        'Instead of dumping entire repositories (300k+ tokens) into LLM context windows, the Context Compiler synthesizes only the precise subgraph nodes, governing rules, and AST signatures required for the task.',
      callout: {
        type: 'warning',
        text: 'Token bloat increases LLM hallucination rates and costs. Knovra guarantees bounded token allocations while maximizing semantic precision.',
      },
      codeSnippet: {
        filename: 'context-bundle.json',
        language: 'json',
        code: `{
  "taskIntent": "Refactor AuthInterceptor to support mTLS",
  "budgetAllocated": 1850,
  "budgetRemaining": 6150,
  "invariants": ["RULE-001 Zero Secret Leakage"],
  "adrs": ["ADR-004 Local Domain Socket IPC"],
  "symbols": [
    { "name": "AuthInterceptor.Authenticate", "tokens": 280 },
    { "name": "JWTValidator.VerifyToken", "tokens": 420 }
  ],
  "tokenReductionPercent": 95.4
}`,
      },
      details: [
        'Dynamic Budgeting: Set token budgets from 2,000 to 32,000 tokens.',
        'Pruning Rationale: Every omitted file includes a structured justification (e.g. EXCEEDS_BUDGET, OUT_OF_DOMAIN_SCOPE).',
      ],
    },
  },
  {
    id: 'rules',
    title: 'Rules Engine & Architectural Invariants',
    category: 'KNOWLEDGE & GOVERNANCE',
    headings: [
      { id: 'golden-invariants', title: '7 Golden Invariants' },
      { id: 'rego-policies', title: 'Open Policy Agent (Rego)' },
      { id: 'pre-commit-enforcement', title: 'Pre-Commit Enforcement' },
    ],
    content: {
      summary:
        'Knovra enforces architectural governance through deterministic Open Policy Agent (Rego) rules. AI agent proposals that violate governance rules are flagged before code generation.',
      callout: {
        type: 'note',
        text: 'Rules are not optional suggestions; they are compiled directly into the agent prompt instructions and verified by the validation pipeline.',
      },
      codeSnippet: {
        filename: 'rules/security/zero_secret_leakage.rego',
        language: 'rego',
        code: `package knovra.security

default allow = false

# Invariant: Never log or emit API keys, bearer tokens, or secrets
allow {
    not input_contains_sensitive_patterns(input.tokens)
    not references_unencrypted_keychain(input.symbols)
}`,
      },
      details: [
        'RULE-001 (Zero Secret Leakage): Blocks context generation if environment variables or secrets appear in symbol docstrings.',
        'RULE-004 (Call Depth Threshold): Caps recursive call graph expansions at depth 4 to prevent exponential token explosion.',
      ],
    },
  },
  {
    id: 'cli',
    title: 'CLI Reference & Commands',
    category: 'CLI REFERENCE',
    headings: [
      { id: 'knovra-init', title: 'knovra init' },
      { id: 'knovra-index', title: 'knovra index' },
      { id: 'knovra-status', title: 'knovra status' },
      { id: 'knovra-context', title: 'knovra context' },
      { id: 'knovra-doctor', title: 'knovra doctor' },
    ],
    content: {
      summary:
        'The Knovra CLI provides complete command-line control over repository indexing, status inspection, graph querying, and context bundle generation.',
      terminalSnippet: `$ knovra --help
Knovra - Local-First Project Intelligence Runtime for AI Agents (v0.4.0)

USAGE:
  knovra [COMMAND] [OPTIONS]

COMMANDS:
  init         Initialize .knovra/ metadata and embedded Neo4j store in current repo
  index        Perform Tree-sitter AST parsing and rebuild call graph
  status       Check health of runtime daemon, Neo4j, and symbol counts
  graph        Query call hierarchy or inspect symbol relationships
  context      Compile minimum sufficient ContextBundle for a given task prompt
  doctor       Verify environment prerequisites (Go, Rust, Python, Tree-sitter)
  daemon       Start the background IPC and MCP JSON-RPC service (port 7474)

OPTIONS:
  -v, --verbose    Enable verbose debug logging
  --depth <N>      Set max traversal depth (default: 2)
  --json           Output raw JSON instead of formatted terminal tables`,
      details: [
        'Every command supports `--json` output for automated CI/CD scripting.',
        'Full shell completion scripts are provided for bash, zsh, and fish.',
      ],
    },
  },
];

export default function DocsPage() {
  const [activeDocId, setActiveDocId] = useState<string>('intro');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const activeDoc = useMemo(() => {
    return DOC_PAGES.find((d) => d.id === activeDocId) || DOC_PAGES[0];
  }, [activeDocId]);

  const activeIndex = DOC_PAGES.findIndex((d) => d.id === activeDocId);
  const prevDoc = activeIndex > 0 ? DOC_PAGES[activeIndex - 1] : null;
  const nextDoc = activeIndex < DOC_PAGES.length - 1 ? DOC_PAGES[activeIndex + 1] : null;

  // Filter sections by search query
  const filteredDocs = useMemo(() => {
    if (!search) return DOC_PAGES;
    const q = search.toLowerCase();
    return DOC_PAGES.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.content.summary.toLowerCase().includes(q)
    );
  }, [search]);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Code copied to clipboard');
    fireMicroSparkle(0.8, 0.25);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minHeight: 'calc(100vh - 140px)', position: 'relative' }}>
      <AuroraGlow />
      {/* Docs Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.25rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <StatusBadge tone="purple">
              <Sparkles size={11} style={{ display: 'inline', marginRight: 3 }} />
              SYSTEM CODEX & SPECIFICATIONS
            </StatusBadge>
            <StatusBadge tone="success" pulse={true}>
              v1.4.0 LOCAL DAEMON
            </StatusBadge>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)',
                flexShrink: 0,
              }}
            >
              <BookOpen size={22} />
            </span>
            <div>
              <h1
                style={{
                  fontSize: 'clamp(1.75rem, 3.2vw, 2.4rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: 'var(--text-primary)',
                  margin: 0,
                  lineHeight: 1.15,
                }}
              >
                Runtime <span className="font-calligraphy italic text-gradient-aurora">Architecture Codex</span>
              </h1>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.5 }}>
                Multi-hop graph algorithms, deterministic AST extraction, context compilers, and MCP protocols.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Trigger */}
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(true)}
          className="knovra-btn-secondary knovra-btn-sm mobile-btn-only"
          style={{ display: 'none', alignItems: 'center', gap: '0.4rem' }}
        >
          <Menu size={15} />
          <span>Table of Contents</span>
        </button>
      </div>

      {/* =========================================================================
          3-PANE DOCUMENTATION GRID (Prompt 5 Section 16 & Prompt 6 Section 25)
          ========================================================================= */}
      <div className="docs-layout-grid">
        {/* =======================================================================
            PANE 1: LEFT DOCUMENTATION CATEGORY TREE
            ======================================================================= */}
        <aside
          className="glass-panel docs-sidebar-pane"
          style={{
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            height: 'fit-content',
            maxHeight: 'calc(100vh - 180px)',
            overflowY: 'auto',
          }}
        >
          {/* Quick Filter */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search guides..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                fontSize: '0.78rem',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          {/* Navigation Links Grouped by Category */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {Array.from(new Set(filteredDocs.map((d) => d.category))).map((cat) => (
              <div key={cat}>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontFamily: 'var(--font-mono)',
                    marginBottom: '0.4rem',
                  }}
                >
                  {cat}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  {filteredDocs
                    .filter((d) => d.category === cat)
                    .map((doc) => {
                      const isActive = activeDocId === doc.id;
                      return (
                        <button
                          type="button"
                          key={doc.id}
                          onClick={() => {
                            setActiveDocId(doc.id);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            backgroundColor: isActive ? 'var(--bg-secondary)' : 'transparent',
                            border: `1px solid ${isActive ? 'var(--accent-primary)' : 'transparent'}`,
                            color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            fontSize: '0.82rem',
                            fontWeight: isActive ? 700 : 500,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{ minWidth: 0, whiteSpace: 'normal', overflowWrap: 'anywhere', lineHeight: 1.5, textAlign: 'left' }}>
                            {doc.title}
                          </span>
                          {doc.badge && (
                            <StatusBadge tone="success">
                              {doc.badge}
                            </StatusBadge>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* =======================================================================
            PANE 2: CENTER DOCUMENTATION CONTENT ARTICLE
            ======================================================================= */}
        <article style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', minWidth: 0 }}>
          {/* Breadcrumbs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.76rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span>Docs</span>
            <ChevronRight size={13} />
            <span>{activeDoc.category}</span>
            <ChevronRight size={13} />
            <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{activeDoc.title}</span>
          </div>

          {/* Doc Title & Summary */}
          <div>
            <h1
              style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                lineHeight: 1.2,
                marginBottom: '0.75rem',
              }}
            >
              {activeDoc.title}
            </h1>
            <p style={{ fontSize: '1.02rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {activeDoc.content.summary}
            </p>
          </div>

          {/* Semantic Callout Alert */}
          {activeDoc.content.callout && (
            <div
              className="glass-card"
              style={{
                padding: '1.25rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor:
                  activeDoc.content.callout.type === 'tip'
                    ? 'rgba(16, 185, 129, 0.08)'
                    : activeDoc.content.callout.type === 'warning'
                    ? 'rgba(245, 158, 11, 0.08)'
                    : 'rgba(6, 182, 212, 0.08)',
                border: `1.5px solid ${
                  activeDoc.content.callout.type === 'tip'
                    ? 'rgba(16, 185, 129, 0.35)'
                    : activeDoc.content.callout.type === 'warning'
                    ? 'rgba(245, 158, 11, 0.35)'
                    : 'rgba(6, 182, 212, 0.35)'
                }`,
                boxShadow:
                  activeDoc.content.callout.type === 'tip'
                    ? '0 8px 30px -6px rgba(16, 185, 129, 0.18)'
                    : activeDoc.content.callout.type === 'warning'
                    ? '0 8px 30px -6px rgba(245, 158, 11, 0.18)'
                    : '0 8px 30px -6px rgba(6, 182, 212, 0.18)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
              }}
            >
              {activeDoc.content.callout.type === 'tip' && (
                <Lightbulb size={20} style={{ color: 'var(--status-ok)', marginTop: '2px', flexShrink: 0 }} />
              )}
              {activeDoc.content.callout.type === 'warning' && (
                <AlertTriangle size={20} style={{ color: 'var(--status-warn)', marginTop: '2px', flexShrink: 0 }} />
              )}
              {activeDoc.content.callout.type === 'note' && (
                <Info size={20} style={{ color: 'var(--accent-secondary)', marginTop: '2px', flexShrink: 0 }} />
              )}
              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                {activeDoc.content.callout.text}
              </div>
            </div>
          )}

          {/* Sequential Step Sequence (if present) */}
          {activeDoc.content.steps && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {activeDoc.content.steps.map((step, idx) => (
                <div
                  key={step.title}
                  className="glass-card"
                  style={{
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.85rem',
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-primary)',
                      color: 'var(--text-inverse)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {step.title}
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Syntax Highlighted Code Snippet */}
          {activeDoc.content.codeSnippet && (
            <div style={{ marginTop: '0.5rem' }}>
              <CodeSnippet
                code={activeDoc.content.codeSnippet.code}
                language={activeDoc.content.codeSnippet.language}
                filename={activeDoc.content.codeSnippet.filename}
              />
            </div>
          )}

          {/* Terminal Command Output Snippet */}
          {activeDoc.content.terminalSnippet && (
            <div style={{ marginTop: '0.5rem' }}>
              <CodeSnippet
                code={activeDoc.content.terminalSnippet}
                language="bash"
                filename="Interactive Terminal"
              />
            </div>
          )}

          {/* Bulleted Technical Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <h2 style={{ fontSize: '1.12rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Key Operational Details
            </h2>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {activeDoc.content.details.map((detail, idx) => (
                <li key={idx} style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {detail}
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Links Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-subtle)',
              marginTop: '1.5rem',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            {prevDoc ? (
              <KnovraButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  setActiveDocId(prevDoc.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                icon={<ArrowLeft size={14} />}
              >
                Previous: {prevDoc.title}
              </KnovraButton>
            ) : (
              <div />
            )}

            {nextDoc && (
              <KnovraButton
                variant="primary"
                size="sm"
                onClick={() => {
                  setActiveDocId(nextDoc.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                icon={<ArrowRight size={14} />}
              >
                Next: {nextDoc.title}
              </KnovraButton>
            )}
          </div>
        </article>

        {/* =======================================================================
            PANE 3: RIGHT TABLE OF CONTENTS (TOC)
            ======================================================================= */}
        <aside
          className="docs-toc-pane"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            position: 'sticky',
            top: '80px',
            height: 'fit-content',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontFamily: 'var(--font-mono)',
            }}
          >
            On This Page
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {activeDoc.headings.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                  lineHeight: 1.3,
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--accent-primary)')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text-secondary)')}
              >
                {h.title}
              </a>
            ))}
          </div>

          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <Link
              href="/graph"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--accent-primary)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              <span>Explore Context Graph</span>
              <ExternalLink size={12} />
            </Link>
            <Link
              href="/context"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--accent-secondary)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              <span>Context Compiler Studio</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </aside>
      </div>

      {/* Mobile Drawer for Docs Topics (< 860px) */}
      {mobileDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: 'var(--bg-overlay)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            justifyContent: 'flex-start',
          }}
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            style={{
              width: '85%',
              maxWidth: '320px',
              height: '100%',
              backgroundColor: 'var(--bg-primary)',
              borderRight: '1px solid var(--border-strong)',
              padding: '1.25rem',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Documentation Topics</span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {DOC_PAGES.map((d) => (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => {
                    setActiveDocId(d.id);
                    setMobileDrawerOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: activeDocId === d.id ? 'var(--bg-secondary)' : 'transparent',
                    border: `1px solid ${activeDocId === d.id ? 'var(--accent-primary)' : 'transparent'}`,
                    color: activeDocId === d.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    fontWeight: activeDocId === d.id ? 700 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {d.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
