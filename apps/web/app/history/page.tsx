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
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { RECENT_COMMITS } from '../../lib/data';
import { SpotlightCard } from '../../components/SpotlightCard';
import { AuroraGlow } from '../../components/AuroraGlow';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { fireMicroSparkle } from '../../lib/confetti';

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
    toast.success(`Commit hash ${sha} copied to clipboard`);
    fireMicroSparkle(0.75, 0.25);
    setTimeout(() => setCopiedSha(null), 1800);
  };

  return (
    <div style={{ display: 'grid', gap: '2rem', position: 'relative' }}>
      <AuroraGlow />
      {/* Header */}
      <div>
        <span className="eyebrow-serif" style={{ display: 'block', marginBottom: '8px' }}>CRYPTOGRAPHIC GIT PROVENANCE</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              backgroundColor: 'var(--accent-glow)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              border: '1px solid var(--accent-primary)',
            }}
          >
            <History size={18} />
          </span>
          <h1 style={{ fontSize: 'clamp(28px, 3.2vw, 42px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
            Commit <span className="font-calligraphy text-gradient-aurora">Provenance</span>
          </h1>
          <span className="knovra-badge knovra-badge-blue">
            <span className="pulsing-dot" style={{ width: 5, height: 5 }} />
            Cryptographically Verified
          </span>
        </div>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '620px', lineHeight: 1.6 }}>
          Trace every architectural modification, autonomous agent intervention, and governance enforcement to its immutable commit hash and author.
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
          <SpotlightCard
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
                  type="button"
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
                <StatusBadge tone="success">
                  <ShieldCheck size={11} style={{ marginRight: '3px' }} />
                  Verified GPG
                </StatusBadge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Calendar size={12} />
                <span>{cmt.date}</span>
              </div>
            </div>

            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
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
                    fontSize: '0.75rem',
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
          </SpotlightCard>
        ))}
      </div>
    </div>
  );
}
