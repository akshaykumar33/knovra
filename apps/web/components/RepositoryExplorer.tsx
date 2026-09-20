'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  FileCode2,
  Folder,
  Copy,
  Check,
  ArrowUpRight,
  Code2,
  GitBranch,
  Terminal,
  Layers,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Cpu,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { AuroraGlow } from './AuroraGlow';
import { fireMicroSparkle } from '../lib/confetti';
import { toast } from 'sonner';
import { SegmentedTabs } from './ui/SegmentedTabs';
import { KnovraButton } from './ui/KnovraButton';

export interface SourceFile {
  path: string;
  content: string;
  lines: number;
  language: string;
  declarations: { name: string; line: number }[];
}

export default function RepositoryExplorer({ files }: { files: SourceFile[] }) {
  const [selected, setSelected] = useState(files[0].path);
  const [query, setQuery] = useState('');
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [copyStatus, setCopyStatus] = useState(false);
  const [mobileTab, setMobileTab] = useState<'files' | 'editor' | 'details'>('editor');
  const codeRef = useRef<HTMLDivElement>(null);

  const current = files.find((f) => f.path === selected) || files[0];
  const visible = files.filter((f) =>
    (f.path + ' ' + f.declarations.map((d) => d.name).join(' ')).toLowerCase().includes(query.toLowerCase())
  );

  function select(file: SourceFile) {
    setSelected(file.path);
    setActiveLine(null);
    setCopyStatus(false);
    setMobileTab('editor');
  }

  function jump(line: number) {
    setActiveLine(line);
    setMobileTab('editor');
    const row = codeRef.current?.querySelector<HTMLElement>(`[data-line="${line}"]`);
    if (row && codeRef.current) {
      codeRef.current.scrollTo({ top: row.offsetTop - 80, behavior: 'smooth' });
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(current.content);
      setCopyStatus(true);
      fireMicroSparkle(0.75, 0.25);
      toast.success('Source code copied to clipboard');
      setTimeout(() => setCopyStatus(false), 2000);
    } catch {
      setCopyStatus(false);
      toast.error('Failed to copy source code');
    }
  }

  return (
    <div className="source-workspace" style={{ display: 'grid', gap: '2rem', position: 'relative' }}>
      <AuroraGlow />
      {/* Header */}
      <header className="studio-heading">
        <span className="eyebrow-serif" style={{ display: 'block', marginBottom: '8px' }}>CONCRETE SYNTAX TREE & SOURCE</span>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(32px, 3.2vw, 44px)' }}>
          Repository <span className="font-calligraphy text-gradient-aurora">Explorer</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '15px' }}>
          Inspect repository files, text declarations, and syntax hierarchy with live context linkages.
        </p>
        <span className="glass-pill" style={{ marginTop: '12px', fontSize: '11px', padding: '4px 12px' }}>
          <span className="pulsing-dot" style={{ width: 5, height: 5 }} />
          Live Source Snapshot • Incremental Tree-sitter Ingestion
        </span>
      </header>

      {/* Toolbar */}
      <div className="source-toolbar glass-panel" style={{ padding: '12px 20px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '260px' }}>
          <Search size={16} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
          <input
            aria-label="Search repository files"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter files by name or detected declaration…"
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span className="glass-pill" style={{ fontSize: '11px', padding: '4px 10px' }}>
            {visible.length} of {files.length} files
          </span>
          <KnovraButton
            href="/graph"
            variant="secondary"
            size="sm"
            iconTrailing={<ArrowUpRight size={13} />}
          >
            Graph Topology
          </KnovraButton>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="repo-mobile-tabs" style={{ display: 'none' }}>
        <SegmentedTabs
          tabs={[
            { id: 'editor', label: 'Source Editor' },
            { id: 'files', label: `Files (${visible.length})` },
            { id: 'details', label: `AST & Symbols (${current.declarations.length})` },
          ]}
          active={mobileTab}
          onChange={(tab) => setMobileTab(tab as 'files' | 'editor' | 'details')}
        />
      </div>

      {/* 3-Pane Source Layout */}
      <div className="source-layout glass-panel-luxury" style={{ borderRadius: '18px', overflow: 'hidden' }}>
        {/* Left Pane: Files Navigation */}
        <nav className={`source-files ${mobileTab !== 'files' ? 'mobile-hide-pane' : ''}`} aria-label="Repository files" style={{ background: 'color-mix(in srgb, var(--bg-canvas) 60%, transparent)', padding: '16px 12px' }}>
          <div className="source-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '12px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)' }} />
            <Folder size={16} style={{ color: 'var(--accent-primary)' }} />
            knovra
          </div>
          {['packages', 'apps'].map((group) => (
            <details key={group} open style={{ marginBottom: '10px' }}>
              <summary style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '6px 8px', cursor: 'pointer' }}>
                {group}
              </summary>
              <div style={{ display: 'grid', gap: '3px', marginTop: '4px' }}>
                {visible
                  .filter((f) => f.path.startsWith(group + '/'))
                  .map((f) => {
                    const isSelected = selected === f.path;
                    const fileName = f.path.split('/').at(-1);
                    const subDir = f.path.split('/').slice(1, -1).join('/');
                    return (
                      <button
                        key={f.path}
                        onClick={() => select(f)}
                        aria-current={isSelected ? 'page' : undefined}
                        title={f.path}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: isSelected ? '1px solid var(--accent-primary)' : '1px solid transparent',
                          background: isSelected ? 'color-mix(in srgb, var(--accent-primary) 12%, var(--bg-card))' : 'transparent',
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <FileCode2 size={14} style={{ color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)', flexShrink: 0 }} />
                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                          <div style={{ fontSize: '12px', fontWeight: isSelected ? 600 : 400, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {fileName}
                          </div>
                          <small style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>{subDir}</small>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </details>
          ))}
          {!visible.length && <p className="source-empty" style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '12px' }}>No matching files found.</p>}
        </nav>

        {/* Center Pane: Code Editor */}
        <section className={`source-editor ${mobileTab !== 'editor' ? 'mobile-hide-pane' : ''}`} aria-label="Source code" style={{ background: 'var(--bg-code)' }}>
          {/* Tab Bar */}
          <div className="source-editor-tab" style={{ background: 'var(--code-header)', borderBottom: '1px solid var(--code-border)', padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileCode2 size={15} style={{ color: 'var(--accent-primary)' }} />
              <strong style={{ fontSize: '13px', color: 'var(--text-code)' }}>{current.path.split('/').at(-1)}</strong>
              <span className="glass-pill" style={{ fontSize: '10px', padding: '2px 8px' }}>{current.language}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <KnovraButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={copy}
                aria-label="Copy source"
                icon={copyStatus ? <Check size={13} style={{ color: 'var(--status-ok)' }} /> : <Copy size={13} />}
              >
                {copyStatus ? 'Copied' : 'Copy'}
              </KnovraButton>
            </div>
          </div>

          <div className="source-breadcrumb" style={{ padding: '8px 18px', fontSize: '11px', color: 'var(--text-muted)', borderBottom: '1px solid var(--code-border)', background: 'color-mix(in srgb, var(--code-header) 50%, transparent)' }}>
            <code>{current.path}</code>
          </div>

          {/* Code Viewer */}
          <div className="source-code" ref={codeRef} tabIndex={0} aria-label={`${current.path} source lines`}>
            <pre style={{ padding: '14px 0' }}>
              {current.content.split(/\r?\n/).map((line, index) => {
                const lineNum = index + 1;
                const isTarget = activeLine === lineNum;
                const isComment = /^\s*(\/\/|\/\*|\*)/.test(line);
                const isDecl = /^\s*(import|export|const|function|class|type|interface|pub\s+fn|func)/.test(line);
                return (
                  <span
                    key={index}
                    data-line={lineNum}
                    className={`source-line ${isTarget ? 'is-target' : ''}`}
                    style={{
                      background: isTarget ? 'color-mix(in srgb, var(--accent-primary) 20%, transparent)' : 'transparent',
                      borderLeft: isTarget ? '3px solid var(--accent-primary)' : '3px solid transparent',
                    }}
                  >
                    <span className="source-line-number" aria-hidden="true">
                      {lineNum}
                    </span>
                    <code className={isComment ? 'source-comment' : isDecl ? 'source-declaration' : ''}>
                      {line || ' '}
                    </code>
                  </span>
                );
              })}
            </pre>
          </div>

          <div className="source-status" style={{ borderTop: '1px solid var(--code-border)', background: 'var(--code-header)', padding: '8px 18px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>{current.lines} lines · UTF-8 · Tree-sitter Ingested</span>
            <span>{copyStatus ? 'Copied to clipboard' : 'Read-only snapshot'}</span>
          </div>
        </section>

        {/* Right Pane: File Details & AST Declarations */}
        <aside className={`source-details ${mobileTab !== 'details' ? 'mobile-hide-pane' : ''}`} style={{ background: 'color-mix(in srgb, var(--bg-card) 95%, transparent)', padding: '20px 18px' }}>
          <section>
            <span className="eyebrow-serif" style={{ fontSize: '11px', display: 'block', marginBottom: '4px' }}>AST METADATA</span>
            <h2 style={{ fontSize: '17px', fontWeight: 700, margin: '4px 0' }}>{current.path.split('/').at(-1)}</h2>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{current.path}</p>
            
            <div style={{ display: 'grid', gap: '8px', marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Language</span>
                <strong style={{ color: 'var(--text-primary)' }}>{current.language}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Line Count</span>
                <strong style={{ color: 'var(--text-primary)' }}>{current.lines}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Parser</span>
                <span className="glass-pill" style={{ fontSize: '10px', padding: '2px 6px' }}>Tree-sitter</span>
              </div>
            </div>
          </section>

          <section style={{ marginTop: '24px', borderTop: '1px solid var(--border-default)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Code2 size={15} style={{ color: 'var(--accent-primary)' }} />
              Extracted Symbols ({current.declarations.length})
            </h3>
            <p className="source-hint" style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Click any declaration to jump directly to its concrete AST line:
            </p>

            <div style={{ display: 'grid', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
              {current.declarations.map((d) => (
                <button
                  key={d.line}
                  type="button"
                  onClick={() => jump(d.line)}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-default)',
                    background: activeLine === d.line ? 'color-mix(in srgb, var(--accent-primary) 15%, transparent)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.name}
                  </span>
                  <small style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>L{d.line}</small>
                </button>
              ))}
              {!current.declarations.length && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No declarations detected in this file.</p>
              )}
            </div>
          </section>

          <section style={{ marginTop: '24px', borderTop: '1px solid var(--border-default)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <GitBranch size={15} style={{ color: 'var(--accent-secondary)' }} />
              Connected Knowledge
            </h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              <Link href="/graph" className="glass-card" style={{ padding: '8px 12px', borderRadius: '8px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-primary)' }}>
                <span>Inspect in Code Graph</span>
                <ArrowUpRight size={13} style={{ color: 'var(--accent-primary)' }} />
              </Link>
              <Link href="/context" className="glass-card" style={{ padding: '8px 12px', borderRadius: '8px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-primary)' }}>
                <span>Assemble Context Pack</span>
                <ArrowUpRight size={13} style={{ color: 'var(--accent-primary)' }} />
              </Link>
              <Link href="/decisions" className="glass-card" style={{ padding: '8px 12px', borderRadius: '8px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-primary)' }}>
                <span>Related ADR Decisions</span>
                <ArrowUpRight size={13} style={{ color: 'var(--accent-primary)' }} />
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
