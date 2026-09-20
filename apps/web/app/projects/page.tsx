'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  FolderGit2,
  Search,
  GitBranch,
  Terminal,
  Layers,
  Sparkles,
  Copy,
  Check,
  Zap,
  Code2,
  Network,
  Activity,
  Plus,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Dialog } from '@radix-ui/themes';
import { toast } from 'sonner';
import { WORKSPACES, WorkspaceItem } from '../../lib/data';
import { fireMicroSparkle } from '../../lib/confetti';
import SpotlightCard from '../../components/SpotlightCard';
import { KnovraButton } from '../../components/ui/KnovraButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const projects = WORKSPACES.filter(
    (p) =>
      (filter === 'all' || p.status === filter) &&
      [p.name, p.path, p.primaryLanguage, p.role].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const totalSymbols = WORKSPACES.reduce((acc, p) => acc + p.symbolsCount, 0);
  const totalFiles = WORKSPACES.reduce((acc, p) => acc + p.filesCount, 0);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    toast.success('CLI command copied to clipboard');
    fireMicroSparkle(0.5, 0.4);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="portfolio-page" style={{ display: 'grid', gap: '2.5rem' }}>
      {/* Header */}
      <header className="portfolio-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span className="eyebrow-serif" style={{ display: 'block', marginBottom: '8px' }}>PROJECT UNIVERSE & WORKSPACES</span>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(32px, 3.5vw, 46px)' }}>
            Your Codebases.<br/><span className="font-calligraphy text-gradient-aurora">Fully Connected.</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '600px', fontSize: '15px', lineHeight: 1.6 }}>
            Every monorepo module, microservice, and package indexed with semantic relationship topology and concrete syntax trees.
          </p>
        </div>

        <Dialog.Root>
          <Dialog.Trigger>
            <div>
              <KnovraButton variant="primary" icon={<Plus size={16} />}>
                Connect Repository
              </KnovraButton>
            </div>
          </Dialog.Trigger>
          <Dialog.Content className="glass-panel-luxury" maxWidth="560px" style={{ padding: '28px', borderRadius: '20px' }}>
            <Dialog.Title style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: 700 }}>
              <FolderGit2 size={22} style={{ color: 'var(--accent-primary)' }} />
              Bring your project into Knovra
            </Dialog.Title>
            <Dialog.Description size="2" mb="4" style={{ color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.6 }}>
              Run the local-first CLI inside your repository root to extract Tree-sitter ASTs and spawn the MCP context gateway.
            </Dialog.Description>

            <div style={{ margin: '20px 0', display: 'grid', gap: '12px' }}>
              <div style={{ background: 'var(--bg-code)', border: '1px solid var(--code-border)', borderRadius: '10px', padding: '14px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>01 • INITIALIZE LOCAL RUNTIME</span>
                  <button 
                    type="button" 
                    className="glass-pill" 
                    onClick={() => handleCopy('npx knovra init', 'init')}
                    style={{ padding: '2px 8px', fontSize: '10px', cursor: 'pointer' }}
                  >
                    {copiedCmd === 'init' ? <Check size={12} style={{ color: 'var(--status-ok)' }} /> : <Copy size={12} />}
                    {copiedCmd === 'init' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <code style={{ fontSize: '13px', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>npx knovra init</code>
              </div>

              <div style={{ background: 'var(--bg-code)', border: '1px solid var(--code-border)', borderRadius: '10px', padding: '14px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>02 • INDEX AST & REFS</span>
                  <button 
                    type="button" 
                    className="glass-pill" 
                    onClick={() => handleCopy('knovra index --incremental', 'index')}
                    style={{ padding: '2px 8px', fontSize: '10px', cursor: 'pointer' }}
                  >
                    {copiedCmd === 'index' ? <Check size={12} style={{ color: 'var(--status-ok)' }} /> : <Copy size={12} />}
                    {copiedCmd === 'index' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <code style={{ fontSize: '13px', color: 'var(--accent-secondary)', fontFamily: 'var(--font-mono)' }}>knovra index --incremental</code>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <Dialog.Close>
                <div>
                  <KnovraButton variant="secondary" size="sm">
                    Close
                  </KnovraButton>
                </div>
              </Dialog.Close>
              <KnovraButton asChild variant="primary" size="sm" icon={<ArrowUpRight size={14} />}>
                <Link href="/docs" style={{ textDecoration: 'none' }}>
                  Read Guide
                </Link>
              </KnovraButton>
            </div>
          </Dialog.Content>
        </Dialog.Root>
      </header>

      {/* Metric Stats Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Indexed Modules', value: WORKSPACES.length, sub: 'Polyglot Monorepo', icon: FolderGit2, color: 'var(--accent-primary)' },
          { label: 'Source Files', value: totalFiles, sub: 'Rust, Go, Python, TS', icon: Code2, color: 'var(--accent-secondary)' },
          { label: 'AST Symbols', value: totalSymbols.toLocaleString(), sub: 'Classes, Funcs, Rules', icon: Network, color: 'var(--accent-tertiary)' },
          { label: 'Active Pipeline', value: '100% OK', sub: 'Sub-ms Query SLA', icon: Zap, color: 'var(--status-ok)' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card" style={{ padding: '20px 24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</span>
              <span style={{ padding: '6px', borderRadius: '8px', background: 'var(--bg-secondary)', color: stat.color }}>
                <stat.icon size={16} />
              </span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{stat.value}</div>
            <small style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px', display: 'block' }}>{stat.sub}</small>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="portfolio-toolbar glass-panel" style={{ padding: '12px 18px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '260px' }}>
          <Search size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
          <input
            aria-label="Find a project"
            placeholder="Search by module name, path, language, or responsibility…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              width: '100%',
              fontSize: '13px',
            }}
          />
        </div>

        <div>
          <SegmentedTabs
            tabs={[
              { id: 'all', label: 'All Modules' },
              { id: 'active', label: 'Active' },
              { id: 'indexed', label: 'Indexed' },
            ]}
            active={filter}
            onChange={(tab) => setFilter(tab)}
          />
        </div>
      </div>

      {/* Project Grid */}
      <div className="portfolio-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {projects.map((p, i) => (
          <SpotlightCard
            key={p.id}
            spotlightColor="rgba(16, 185, 129, 0.22)"
            style={{ padding: '24px', borderRadius: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <span style={{ 
                  width: 38, 
                  height: 38, 
                  borderRadius: '10px', 
                  background: 'var(--accent-glow)', 
                  border: '1px solid var(--accent-primary)', 
                  display: 'grid', 
                  placeItems: 'center', 
                  color: 'var(--accent-primary)' 
                }}>
                  <FolderGit2 size={18} />
                </span>
                <StatusBadge tone={p.status === 'active' ? 'success' : 'info'} pulse={p.status === 'active'}>
                  {p.status}
                </StatusBadge>
              </div>

              <small style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                MODULE {String(i + 1).padStart(2, '0')}
              </small>

              <h3 style={{ fontSize: '19px', fontWeight: 700, margin: '6px 0 4px', letterSpacing: '-0.02em' }}>{p.name}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>{p.role}</p>

              <div style={{ background: 'var(--bg-code)', border: '1px solid var(--code-border)', borderRadius: '8px', padding: '6px 10px', marginBottom: '16px' }}>
                <code style={{ fontSize: '11px', color: 'var(--text-code-muted)', wordBreak: 'break-all' }}>{p.path}</code>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                <span className="glass-pill" style={{ fontSize: '11px', padding: '3px 10px' }}>
                  <Code2 size={12} style={{ color: 'var(--accent-primary)' }} />
                  {p.primaryLanguage}
                </span>
                <span className="glass-pill" style={{ fontSize: '11px', padding: '3px 10px' }}>
                  <GitBranch size={12} style={{ color: 'var(--accent-secondary)' }} />
                  {p.activeBranch}
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>KNOWLEDGE GRAPH</span>
                <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{p.symbolsCount}</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>symbols</span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <KnovraButton href="/repository" variant="secondary" size="sm" iconTrailing={<ArrowUpRight size={13} />}>
                  Code
                </KnovraButton>
                <KnovraButton href="/graph" variant="primary" size="sm" iconTrailing={<ArrowUpRight size={13} />}>
                  Graph
                </KnovraButton>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>

      {!projects.length && (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', borderRadius: '18px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>No matching workspace modules</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '14px' }}>Try searching another language, service name, or directory path.</p>
          <button
            type="button"
            className="knovra-btn-primary"
            onClick={() => { setSearch(''); setFilter('all'); }}
            style={{ marginTop: '16px', padding: '8px 20px', fontSize: '13px' }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Footnote */}
      <div className="portfolio-footnote glass-pill" style={{ padding: '8px 16px', alignSelf: 'flex-start' }}>
        <Terminal size={14} style={{ color: 'var(--accent-primary)' }} />
        <span>Connected to live monorepo repository tree. Changes reflect in real-time Tree-sitter AST diffing.</span>
      </div>
    </div>
  );
}
