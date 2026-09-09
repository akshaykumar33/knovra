'use client';

import React, { useState } from 'react';
import {
  FolderGit2,
  Search,
  RefreshCw,
  GitBranch,
  Layers,
  Code2,
  Calendar,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { WORKSPACES, Workspace } from '../../lib/data';

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'indexed'>('all');
  const [indexingId, setIndexingId] = useState<string | null>(null);

  const filteredWorkspaces = WORKSPACES.filter((ws) => {
    if (statusFilter !== 'all' && ws.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        ws.name.toLowerCase().includes(q) ||
        ws.path.toLowerCase().includes(q) ||
        (ws.primaryLanguage || ws.language || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleReindex = (id: string) => {
    setIndexingId(id);
    setTimeout(() => {
      setIndexingId(null);
    }, 1200);
  };

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
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
              <FolderGit2 size={16} />
            </span>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#ffffff' }}>
              Managed Workspaces
            </h1>
            <span className="stripe-badge stripe-badge-blue">{WORKSPACES.length} Modules</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Active monorepo workspaces, AST symbol indices, and autonomous agent workspace bindings.
          </p>
        </div>

        <button className="btn-stripe-primary">
          <Plus size={15} />
          <span>Register Workspace</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="stripe-panel"
        style={{
          padding: '0.85rem 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '8px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search workspaces by name, path, or language..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 12px 6px 30px',
              fontSize: '0.82rem',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>

        {/* Status Pills */}
        <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-canvas)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
          {(['all', 'active', 'indexed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: statusFilter === status ? 'var(--bg-secondary)' : 'transparent',
                color: statusFilter === status ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Workspace Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filteredWorkspaces.map((ws) => {
          const isIndexing = indexingId === ws.id;
          return (
            <div
              key={ws.id}
              className="stripe-card"
              style={{
                padding: '1.35rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={16} color="var(--accent-cyan)" />
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                      {ws.name}
                    </h3>
                  </div>
                  <span className={`stripe-badge ${ws.status === 'active' ? 'stripe-badge-green' : 'stripe-badge-purple'}`}>
                    {ws.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '1rem', wordBreak: 'break-all' }}>
                  {ws.path}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1rem', fontSize: '0.8rem' }}>
                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: '7px 9px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Symbols</div>
                    <div style={{ fontWeight: 700, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
                      {ws.symbolsCount.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: '7px 9px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Language</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {ws.primaryLanguage}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  <GitBranch size={12} />
                  <span>Branch: <strong style={{ color: 'var(--text-secondary)' }}>{ws.activeBranch}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <Calendar size={12} />
                  <span>Last Indexed: {ws.lastIndexed}</span>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '1.15rem', paddingTop: '0.85rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleReindex(ws.id)}
                  disabled={isIndexing}
                  className="btn-stripe-secondary"
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  <RefreshCw size={11} className={isIndexing ? 'animate-spin' : ''} />
                  <span>{isIndexing ? 'Indexing AST...' : 'Incremental Reindex'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
