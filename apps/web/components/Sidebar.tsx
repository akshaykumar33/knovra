'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
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
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderGit2 },
  { href: '/repository', label: 'Repository', icon: FileCode2 },
  { href: '/graph', label: 'Code Graph', icon: Network },
  { href: '/architecture', label: 'Architecture', icon: Layers },
  { href: '/context', label: 'Context Explorer', icon: Cpu },
  { href: '/decisions', label: 'Decisions (ADRs)', icon: GitPullRequest },
  { href: '/agents', label: 'Agents', icon: Bot },
  { href: '/sessions', label: 'Sessions', icon: MessageSquareCode },
  { href: '/rules', label: 'Rules & Governance', icon: ShieldCheck },
  { href: '/history', label: 'Git History', icon: History },
  { href: '/impact', label: 'Impact Analysis', icon: Activity },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: '260px',
        minWidth: '260px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem 0.875rem',
        zIndex: 50,
      }}
    >
      <div>
        {/* Brand Header */}
        <div style={{ padding: '0.5rem 0.75rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(59, 130, 246, 0.4)',
              }}
            >
              <Sparkles size={18} color="#ffffff" />
            </div>
            <div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff' }}>
                KNOVRA
              </span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Project Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => {
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
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.16)' : 'transparent',
                  border: isActive ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={16} color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} color="var(--accent-cyan)" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Metadata */}
      <div
        style={{
          padding: '0.875rem',
          borderRadius: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>RUNTIME MODE</span>
          <span className="badge badge-ok" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>Local-First</span>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Milestone V0.4 (Active)
        </p>
      </div>
    </aside>
  );
}
