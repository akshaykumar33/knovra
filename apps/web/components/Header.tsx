'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Server,
  Layers,
  Shield,
  Terminal,
  ChevronRight,
  ExternalLink,
  Github,
  Command,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getSystemStatus } from '../lib/api';

export default function Header() {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [engineStatus, setEngineStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState('knovra/monorepo');

  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      try {
        const status = await getSystemStatus();
        if (isMounted) {
          setEngineStatus(status.contextEngine ? 'online' : 'offline');
        }
      } catch {
        if (isMounted) {
          setEngineStatus('offline');
        }
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Format breadcrumb from pathname
  const formatBreadcrumb = () => {
    if (pathname === '/') return 'Overview';
    const segment = pathname.split('/')[1] || '';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <header
      style={{
        height: '56px',
        minHeight: '56px',
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(9, 10, 15, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        zIndex: 40,
      }}
    >
      {/* Left: Breadcrumbs & Workspace Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Workspace Pill */}
        <div
          onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-default)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
          title="Switch Workspace"
        >
          <Layers size={13} color="var(--accent-blue)" />
          <span>{activeWorkspace}</span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>(main)</span>
        </div>

        {/* Breadcrumb Separator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <ChevronRight size={13} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatBreadcrumb()}</span>
        </div>
      </div>

      {/* Center: Quick Search Trigger Bar */}
      <div style={{ position: 'relative', width: '360px', maxWidth: '40%' }}>
        <Search
          size={14}
          style={{
            position: 'absolute',
            left: '10px',
            top: '8px',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }}
        />
        <input
          id="global-search-input"
          type="text"
          placeholder="Search symbols, ADRs, rules... (Ctrl+K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '5px 10px 5px 30px',
            fontSize: '0.8rem',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'border-color 0.15s ease',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent-blue)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
        />
      </div>

      {/* Right: Live Telemetry & GitHub Link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Context Engine Status Pill */}
        <div
          className="stripe-badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: engineStatus === 'online' ? 'var(--status-ok-bg)' : 'rgba(245, 158, 11, 0.08)',
            borderColor: engineStatus === 'online' ? 'var(--status-ok-border)' : 'var(--status-warn-border)',
            color: engineStatus === 'online' ? 'var(--status-ok)' : 'var(--accent-amber)',
            fontSize: '0.72rem',
            padding: '3px 8px',
          }}
          title={engineStatus === 'online' ? 'Context Engine connected (:8000)' : 'Offline mode active (cached telemetry)'}
        >
          <span
            className={engineStatus === 'online' ? 'pulsing-dot' : ''}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: engineStatus === 'online' ? 'var(--status-ok)' : 'var(--accent-amber)',
            }}
          />
          <span>{engineStatus === 'online' ? 'Engine :8000' : 'Offline Mode'}</span>
        </div>

        {/* MCP Gateway Status */}
        <div
          className="stripe-badge stripe-badge-blue"
          style={{ fontSize: '0.72rem', padding: '3px 8px' }}
        >
          <Terminal size={11} />
          <span>MCP :8080</span>
        </div>

        {/* GitHub Repo Link */}
        <a
          href="https://github.com/akshaykumar33/knovra"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
          title="GitHub Repository"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-strong)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <Github size={14} />
        </a>
      </div>
    </header>
  );
}
