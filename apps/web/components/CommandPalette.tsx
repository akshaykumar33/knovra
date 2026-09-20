'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDialogFocus } from './useDialogFocus';
import {
  Search,
  Command,
  LayoutDashboard,
  Layers,
  Network,
  Activity,
  Cpu,
  GitPullRequest,
  FolderGit2,
  FileCode2,
  Bot,
  MessageSquareCode,
  ShieldCheck,
  History,
  Settings,
  Terminal,
  ArrowRight,
  Copy,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface PaletteItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Navigation' | 'CLI' | 'Invariants' | 'Concepts';
  icon: React.ElementType;
  href?: string;
  command?: string;
  badge?: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  // Navigation
  { id: 'nav-home', title: 'Overview & Telemetry', subtitle: 'Global project intelligence dashboard', category: 'Navigation', icon: LayoutDashboard, href: '/' },
  { id: 'nav-arch', title: 'Architecture & Invariants', subtitle: '7 Golden Invariants & IPC topology', category: 'Navigation', icon: Layers, href: '/architecture', badge: 'Core' },
  { id: 'nav-graph', title: 'Context Graph Explorer', subtitle: 'Neo4j call graphs and symbol hierarchies', category: 'Navigation', icon: Network, href: '/graph' },
  { id: 'nav-impact', title: 'Impact Simulator', subtitle: 'Predictive AST blast-radius evaluation', category: 'Navigation', icon: Activity, href: '/impact' },
  { id: 'nav-context', title: 'Context Planner Studio', subtitle: 'Deterministic token budget packing & DAG traversal', category: 'Navigation', icon: Cpu, href: '/context' },
  { id: 'nav-decisions', title: 'Decisions & ADRs', subtitle: 'Immutable architectural decision lineage', category: 'Navigation', icon: GitPullRequest, href: '/decisions' },
  { id: 'nav-workspaces', title: 'Workspaces & Modules', subtitle: 'Monorepo packages and indexed modules', category: 'Navigation', icon: FolderGit2, href: '/projects' },
  { id: 'nav-ast', title: 'Repository & AST', subtitle: 'Tree-sitter concrete syntax tree inspector', category: 'Navigation', icon: FileCode2, href: '/repository' },
  { id: 'nav-agents', title: 'Agent Registry', subtitle: 'Registered AI agent harnesses and credentials', category: 'Navigation', icon: Bot, href: '/agents' },
  { id: 'nav-sessions', title: 'Agent Sessions', subtitle: 'Recorded execution transcripts and memory snapshots', category: 'Navigation', icon: MessageSquareCode, href: '/sessions' },
  { id: 'nav-rules', title: 'Rule Engine', subtitle: 'Static architectural enforcement rules', category: 'Navigation', icon: ShieldCheck, href: '/rules' },
  { id: 'nav-history', title: 'Git Provenance', subtitle: 'Cryptographic commit log and provenance verification', category: 'Navigation', icon: History, href: '/history' },
  { id: 'nav-settings', title: 'Subsystem Settings', subtitle: 'Runtime ports, local models and daemon endpoints', category: 'Navigation', icon: Settings, href: '/settings' },

  // CLI Commands
  { id: 'cli-init', title: 'knovra init', subtitle: 'Initialize local project intelligence runtime in current repo', category: 'CLI', icon: Terminal, command: 'npx knovra init' },
  { id: 'cli-index', title: 'knovra index', subtitle: 'Perform incremental Tree-sitter AST diff indexing', category: 'CLI', icon: Terminal, command: 'knovra index --incremental' },
  { id: 'cli-plan', title: 'knovra plan --task "<query>"', subtitle: 'Compile bounded ContextBundle for target task', category: 'CLI', icon: Terminal, command: 'knovra plan --task "Enforce tenant boundary"' },
  { id: 'cli-mcp', title: 'knovra mcp serve', subtitle: 'Start the Model Context Protocol (MCP) JSON-RPC daemon', category: 'CLI', icon: Terminal, command: 'knovra mcp serve --port 8080' },
  { id: 'cli-impact', title: 'knovra impact --symbol <name>', subtitle: 'Evaluate downstream blast-radius for a symbol change', category: 'CLI', icon: Terminal, command: 'knovra impact --symbol ImpactAnalyzer.AnalyzeBlastRadius' },

  // Invariants
  { id: 'inv-1', title: 'Invariant #1: Complete AST Ingestion', subtitle: 'All language symbols parsed without missing hierarchy nodes', category: 'Invariants', icon: Layers, href: '/architecture' },
  { id: 'inv-2', title: 'Invariant #2: Mediated Agent Access', subtitle: 'Agent interactions strictly mediated via MCP JSON-RPC', category: 'Invariants', icon: Bot, href: '/architecture' },
  { id: 'inv-3', title: 'Invariant #3: Non-Destructive ADR Lineage', subtitle: 'ADRs strictly immutable; superseded via DAG edges', category: 'Invariants', icon: GitPullRequest, href: '/decisions' },
  { id: 'inv-4', title: 'Invariant #4: Incremental Diff SLA', subtitle: 'Tree-sitter incremental parse maintains < 0.5ms queries', category: 'Invariants', icon: Activity, href: '/architecture' },
  { id: 'inv-5', title: 'Invariant #5: Deterministic Budget Packing', subtitle: 'Token budget strictly bounded with priority tiering', category: 'Invariants', icon: Cpu, href: '/context' },
  { id: 'inv-6', title: 'Invariant #6: Zero Secret Leakage', subtitle: 'Shannon entropy regex sanitizes credentials before storage', category: 'Invariants', icon: ShieldCheck, href: '/architecture' },
  { id: 'inv-7', title: 'Invariant #7: Local-First Air-Gapped', subtitle: 'Core runtime operates 100% offline with zero cloud egress', category: 'Invariants', icon: Sparkles, href: '/architecture' },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(isOpen, dialogRef);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredItems = PALETTE_ITEMS.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.command && item.command.toLowerCase().includes(q))
    );
  });

  const handleSelect = (item: PaletteItem) => {
    if (item.href) {
      router.push(item.href);
      onClose();
    } else if (item.command) {
      navigator.clipboard.writeText(item.command);
      setCopiedId(item.id);
      setTimeout(() => {
        setCopiedId(null);
        onClose();
      }, 700);
    }
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          handleSelect(filteredItems[selectedIndex]);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(2, 6, 12, 0.72)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        paddingLeft: '1rem',
        paddingRight: '1rem',
      }}
      onClick={onClose}
    >
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Search documentation and commands"
        className="glass-panel-luxury"
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)',
          border: '1px solid var(--border-strong)',
          borderTop: '1px solid var(--border-highlight)',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.75), 0 0 35px -5px var(--accent-glow)',
          overflow: 'hidden',
          animation: 'paletteIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1.1rem 1.35rem',
            borderBottom: '1px solid var(--border-default)',
            backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 60%, transparent)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Search size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
          <input
            aria-label="Search documentation and commands"
            ref={inputRef}
            type="text"
            placeholder="Type a command, route, invariant, or keyword... (Esc to exit)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              fontFamily: 'var(--font-sans)',
            }}
          />
          <button
            aria-label="Close search"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: '4px',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '0.5rem',
          }}
        >
          {filteredItems.length === 0 ? (
            <div
              style={{
                padding: '2.5rem 1rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
              }}
            >
              No matching command, route, or invariant found for "{query}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;
              const isCopied = copiedId === item.id;

              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => handleSelect(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                    border: isSelected ? '1px solid var(--border-strong)' : '1px solid transparent',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '6px',
                        backgroundColor: isSelected ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            fontFamily: item.category === 'CLI' ? 'var(--font-mono)' : 'inherit',
                          }}
                        >
                          {item.title}
                        </span>
                        <span
                          className="knovra-badge knovra-badge-blue"
                          style={{ fontSize: '0.6rem', padding: '1px 6px' }}
                        >
                          {item.category}
                        </span>
                        {item.badge && (
                          <span
                            className="knovra-badge knovra-badge-green"
                            style={{ fontSize: '0.6rem', padding: '1px 6px' }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '0.76rem',
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                        }}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    {item.command ? (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          color: isCopied ? 'var(--status-ok)' : 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                          padding: '3px 8px',
                          backgroundColor: 'var(--bg-card)',
                          borderRadius: '4px',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {isCopied ? <Check size={12} /> : <Copy size={12} />}
                        {isCopied ? 'Copied' : 'Copy'}
                      </span>
                    ) : (
                      <ArrowRight
                        size={14}
                        style={{
                          color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)',
                          opacity: isSelected ? 1 : 0.4,
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.6rem 1.25rem',
            backgroundColor: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span><kbd style={{ background: 'var(--bg-tertiary)', padding: '2px 5px', borderRadius: '3px' }}>↑</kbd> <kbd style={{ background: 'var(--bg-tertiary)', padding: '2px 5px', borderRadius: '3px' }}>↓</kbd> navigate</span>
            <span><kbd style={{ background: 'var(--bg-tertiary)', padding: '2px 5px', borderRadius: '3px' }}>↵</kbd> select</span>
            <span><kbd style={{ background: 'var(--bg-tertiary)', padding: '2px 5px', borderRadius: '3px' }}>esc</kbd> close</span>
          </div>
          <span>Knovra v0.4 • Local-First</span>
        </div>
      </div>
    </div>
  );
}
