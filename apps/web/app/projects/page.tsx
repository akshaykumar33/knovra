'use client';

import React, { useState } from 'react';
import {
  FolderGit2,
  Search,
  Filter,
  RefreshCw,
  GitBranch,
  Layers,
  Code2,
  Calendar,
  CheckCircle2,
  Clock,
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
    <div style={{ display: 'grid', gap: '1.75rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-blue)',
              }}
            >
              <FolderGit2 size={18} />
            </span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Projects & Workspaces
            </h1>
            <span className="badge badge-blue">{WORKSPACES.length} Registered</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Managed repositories, multi-module monorepos, and autonomous agent workspace bindings.
          </p>
        </div>

        <button className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <Plus size={16} />
          Register Workspace
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search workspaces by name, path, or language..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 12px 6px 32px',
              fontSize: '0.85rem',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>

        {/* Status Pills */}
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {(['all', 'active', 'indexed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '5px 12px',
                fontSize: '0.78rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: statusFilter === status ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                color: statusFilter === status ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
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
              className="glass-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={18} color="var(--accent-cyan)" />
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {ws.name}
                    </h3>
                  </div>
                  <span className={`badge ${ws.status === 'active' ? 'badge-ok' : 'badge-purple'}`}>
                    {ws.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '1rem', wordBreak: 'break-all' }}>
                  {ws.path}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Symbols</div>
                    <div style={{ fontWeight: 700, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
                      {ws.symbolsCount.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Language</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {ws.primaryLanguage}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <GitBranch size={13} />
                  <span>Branch: <strong>{ws.activeBranch}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Calendar size={13} />
                  <span>Last Indexed: {ws.lastIndexed}</span>
                </div>
              </div>

              {/* Action */}
              <div style={{ borderTop: '1px solid var(--border-default)', marginTop: '1.25rem', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleReindex(ws.id)}
                  disabled={isIndexing}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '5px 12px',
                    fontSize: '0.78rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-default)',
                    color: isIndexing ? 'var(--accent-blue)' : 'var(--text-secondary)',
                    cursor: isIndexing ? 'wait' : 'pointer',
                    fontWeight: 600,
                  }}
                >
                  <RefreshCw size={12} className={isIndexing ? 'animate-spin' : ''} />
                  {isIndexing ? 'Indexing AST...' : 'Incremental Reindex'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
