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
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';
import { RECENT_COMMITS } from '../../lib/data';

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  const filteredCommits = RECENT_COMMITS.filter((cmt) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (cmt.message || cmt.subject || '').toLowerCase().includes(q) ||
      cmt.hash.toLowerCase().includes(q) ||
      cmt.author.toLowerCase().includes(q)
    );
  });

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 1800);
  };

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Header */}
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
            <History size={16} />
          </span>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#ffffff' }}>
            Git History & Provenance Log
          </h1>
          <span className="stripe-badge stripe-badge-blue">
            <span className="pulsing-dot" style={{ backgroundColor: 'var(--accent-blue)' }} />
            Verified Commits
          </span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Trace every architectural modification, agent intervention, and rule enforcement to its cryptographic commit hash and author.
        </p>
      </div>

      {/* Search Bar & Branch Status */}
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
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '8px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Filter commits by SHA, message, or author..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Branch:</span>
          <span className="stripe-badge stripe-badge-purple" style={{ fontFamily: 'var(--font-mono)' }}>
            <GitBranch size={11} style={{ marginRight: '3px' }} />
            origin/develop
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ({filteredCommits.length} commits)
          </span>
        </div>
      </div>

      {/* Commit History Timeline */}
      <div style={{ display: 'grid', gap: '0.85rem' }}>
        {filteredCommits.map((cmt) => (
          <div
            key={cmt.hash}
            className="stripe-card"
            style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <GitCommit size={16} color="var(--accent-blue)" />
                <button
                  onClick={() => handleCopySha(cmt.hash)}
                  title="Click to copy full SHA"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {cmt.hash}
                  {copiedSha === cmt.hash ? <Check size={11} color="var(--status-ok)" /> : <Copy size={11} />}
                </button>
                <span className="stripe-badge stripe-badge-green" style={{ fontSize: '0.65rem' }}>
                  <ShieldCheck size={10} style={{ marginRight: '3px' }} />
                  Verified GPG
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Calendar size={12} />
                <span>{cmt.date}</span>
              </div>
            </div>

            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.4 }}>
              {cmt.message || cmt.subject}
            </h3>

            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.65rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-blue)',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                  }}
                >
                  {cmt.author.charAt(0).toUpperCase()}
                </div>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{cmt.author}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-mono)' }}>
                <FileText size={12} />
                <span>{cmt.filesChanged} files modified</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
