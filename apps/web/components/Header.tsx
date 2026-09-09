'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Server,
  Cpu,
  Database,
  ExternalLink,
  Shield,
  Layers,
  Terminal,
} from 'lucide-react';
import { getSystemStatus } from '../lib/api';

export default function Header() {
  const [query, setQuery] = useState('');
  const [engineStatus, setEngineStatus] = useState<'online' | 'offline' | 'checking'>('checking');
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

  return (
    <header
      style={{
        height: '64px',
        minHeight: '64px',
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        zIndex: 40,
      }}
    >
      {/* Left: Workspace Selector & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '600px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '6px 10px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-default)',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
          title="Active Workspace"
        >
          <Layers size={14} color="var(--accent-cyan)" />
          <span>{activeWorkspace}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(main)</span>
        </div>

        {/* Global Search Bar */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '10px',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search symbols, ADRs, rules, or sessions... (Ctrl+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 12px 6px 34px',
              fontSize: '0.85rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent-blue)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
          />
        </div>
      </div>

      {/* Right: Service Status Pills & Mode Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Context Engine Pill */}
        <div
          className="badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: engineStatus === 'online' ? 'var(--status-ok-bg)' : 'rgba(239, 68, 68, 0.1)',
            borderColor: engineStatus === 'online' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
            color: engineStatus === 'online' ? 'var(--status-ok)' : 'var(--status-danger)',
            fontSize: '0.75rem',
            padding: '4px 10px',
          }}
          title={engineStatus === 'online' ? 'Context Engine connected (:8000)' : 'Offline mode active (cached telemetry)'}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: engineStatus === 'online' ? 'var(--status-ok)' : 'var(--status-danger)',
              boxShadow: engineStatus === 'online' ? '0 0 6px var(--status-ok)' : 'none',
            }}
          />
          <span>Context Engine {engineStatus === 'online' ? ':8000' : 'Offline Mode'}</span>
        </div>

        {/* MCP Gateway */}
        <div
          className="badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 0.25)',
            color: 'var(--accent-blue)',
            fontSize: '0.75rem',
            padding: '4px 10px',
          }}
        >
          <Terminal size={12} />
          <span>MCP Gateway :8080</span>
        </div>

        {/* Invariant #7 Pill */}
        <div
          className="badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderColor: 'rgba(139, 92, 246, 0.25)',
            color: 'var(--accent-purple)',
            fontSize: '0.75rem',
            padding: '4px 10px',
          }}
          title="Invariant #7: Local-first offline execution with zero secret leakage"
        >
          <Shield size={12} />
          <span>Local-First</span>
        </div>
      </div>
    </header>
  );
}
