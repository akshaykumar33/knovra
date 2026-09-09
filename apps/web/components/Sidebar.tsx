'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LucideIcon,
  LayoutDashboard,
  FolderGit2,
  FileCode2,
  Network,
  Cpu,
  Layers,
  GitPullRequest,
  Bot,
  MessageSquareCode,
  ShieldCheck,
  History,
  Activity,
  Settings,
  Sparkles,
  Command,
  ExternalLink,
  ChevronRight,
  Github,
} from 'lucide-react';

interface NavSection {
  title: string;
  items: Array<{
    href: string;
    label: string;
    icon: LucideIcon;
    badge?: string;
  }>;
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'CORE PLATFORM',
    items: [
      { href: '/', label: 'Overview', icon: LayoutDashboard },
      { href: '/projects', label: 'Workspaces', icon: FolderGit2, badge: '8' },
      { href: '/architecture', label: 'Architecture & Invariants', icon: Layers },
    ],
  },
  {
    title: 'CODE INTELLIGENCE',
    items: [
      { href: '/graph', label: 'Code Graph (Neo4j)', icon: Network },
      { href: '/repository', label: 'Repository & AST', icon: FileCode2 },
      { href: '/impact', label: 'Impact Simulator', icon: Activity, badge: 'Phase 12' },
    ],
  },
  {
    title: 'CONTEXT & MEMORY',
    items: [
      { href: '/context', label: 'Context Planner', icon: Cpu },
      { href: '/decisions', label: 'Decisions (ADRs)', icon: GitPullRequest, badge: '12' },
      { href: '/sessions', label: 'Agent Sessions', icon: MessageSquareCode },
    ],
  },
  {
    title: 'GOVERNANCE & AGENTS',
    items: [
      { href: '/agents', label: 'Agent Registry', icon: Bot, badge: '4' },
      { href: '/rules', label: 'Rule Engine', icon: ShieldCheck },
      { href: '/history', label: 'Git Provenance', icon: History },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: '270px',
        minWidth: '270px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--bg-canvas)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 50,
      }}
    >
      {/* Top Brand Header */}
      <div>
        <div
          style={{
            padding: '1.25rem 1.25rem 0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.03em', color: '#ffffff' }}>
                KNOVRA
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Project Intelligence Hub
              </div>
            </div>
          </Link>

          <span
            className="stripe-badge stripe-badge-purple"
            style={{ fontSize: '0.65rem', padding: '1px 6px' }}
          >
            v0.4.0
          </span>
        </div>

        {/* Search Command Box Button */}
        <div style={{ padding: '0.85rem 1rem 0.4rem 1rem' }}>
          <button
            onClick={() => {
              const searchInput = document.getElementById('global-search-input');
              if (searchInput) searchInput.focus();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Command size={13} />
              <span>Search docs, symbols...</span>
            </span>
            <kbd
              style={{
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'var(--bg-secondary)',
                padding: '1px 5px',
                borderRadius: '3px',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Grouped Navigation Sections */}
        <nav
          style={{
            padding: '0.5rem 0.75rem',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 190px)',
          }}
        >
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} style={{ marginBottom: '1.1rem' }}>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                  padding: '4px 10px',
                  marginBottom: '2px',
                }}
              >
                {section.title}
              </div>

              <div style={{ display: 'grid', gap: '2px' }}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.82rem',
                        fontWeight: isActive ? 600 : 450,
                        color: isActive ? '#ffffff' : 'var(--text-secondary)',
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                        borderLeft: isActive ? '2px solid var(--accent-blue)' : '2px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                          e.currentTarget.style.color = '#ffffff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <Icon size={15} color={isActive ? 'var(--accent-blue)' : 'var(--text-muted)'} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontFamily: 'var(--font-mono)',
                            padding: '1px 5px',
                            borderRadius: '999px',
                            backgroundColor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-secondary)',
                            color: isActive ? '#60A5FA' : 'var(--text-muted)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Footer Telemetry */}
      <div
        style={{
          padding: '0.85rem 1rem',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(255, 255, 255, 0.01)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="pulsing-dot" />
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Daemon Online
          </span>
        </div>

        <a
          href="https://github.com/akshaykumar33/knovra"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--text-muted)',
            fontSize: '0.72rem',
            textDecoration: 'none',
            padding: '3px 6px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
          title="View GitHub Repository"
        >
          <Github size={12} />
          <span>v0.4</span>
        </a>
      </div>
    </aside>
  );
}
