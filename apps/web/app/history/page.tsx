'use client';

import React, { useState } from 'react';
import {
  History,
  GitCommit,
  GitBranch,
  Search,
  User,
  Calendar,
  FileText,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { RECENT_COMMITS, GitCommitItem } from '../../lib/data';

export default function HistoryPage() {
  const [search, setSearch] = useState('');

  const filteredCommits = RECENT_COMMITS.filter((cmt) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (cmt.message || cmt.subject || '').toLowerCase().includes(q) ||
      cmt.hash.toLowerCase().includes(q) ||
      cmt.author.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'grid', gap: '1.75rem' }}>
      {/* Header */}
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
            <History size={18} />
          </span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Git History & Provenance Log
          </h1>
          <span className="badge badge-ok">Verified Commits</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Trace every architectural change, agent contribution, and code modification to its exact commit SHA and author.
        </p>
      </div>

      {/* Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Filter commits by SHA, message, or author..."
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
      </div>

      {/* Commit History Timeline */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {filteredCommits.map((cmt) => (
          <div
            key={cmt.hash}
            className="glass-card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <GitCommit size={18} color="var(--accent-blue)" />
                <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  {cmt.hash}
                </span>
                <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                  origin/develop
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <Calendar size={13} />
                <span>{cmt.date}</span>
              </div>
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {cmt.message}
            </h3>

            <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={14} />
                <span>{cmt.author}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                <FileText size={14} />
                <span>{cmt.filesChanged} files modified</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
