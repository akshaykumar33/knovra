'use client';

import React from 'react';
import Link from 'next/link';
import { Github, Sparkles, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-default)',
        backgroundColor: 'rgba(5, 8, 14, 0.95)',
        marginTop: '5rem',
        padding: '3.5rem 2rem 2.5rem 2rem',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: '3rem',
          marginBottom: '3rem',
        }}
      >
        {/* Brand Col */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000000',
              }}
            >
              <Sparkles size={15} />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Knovra
            </span>
            <span className="stripe-badge stripe-badge-green" style={{ fontSize: '0.6rem' }}>
              v0.4.0
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '340px' }}>
            Universal Project Intelligence Layer for AI development agents. Decoupling context persistence from ephemeral model harnesses.
          </p>
        </div>

        {/* Intelligence Engine */}
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem' }}>
            Core Intelligence
          </div>
          <div style={{ display: 'grid', gap: '0.6rem', fontSize: '0.84rem' }}>
            <Link href="/architecture" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              7 Golden Invariants
            </Link>
            <Link href="/graph" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Neo4j Call Graph
            </Link>
            <Link href="/impact" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Blast-Radius Engine
            </Link>
            <Link href="/context" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Context Planner Studio
            </Link>
          </div>
        </div>

        {/* Protocols & Specs */}
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem' }}>
            Protocols & Spec
          </div>
          <div style={{ display: 'grid', gap: '0.6rem', fontSize: '0.84rem' }}>
            <Link href="/decisions" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Architecture Decisions (ADRs)
            </Link>
            <Link href="/rules" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Governance Rule Engine
            </Link>
            <Link href="/agents" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              MCP Gateway (JSON-RPC)
            </Link>
            <Link href="/history" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Git SHA Provenance
            </Link>
          </div>
        </div>

        {/* Monorepo */}
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem' }}>
            Ecosystem
          </div>
          <div style={{ display: 'grid', gap: '0.6rem', fontSize: '0.84rem' }}>
            <Link href="/projects" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Monorepo Workspaces
            </Link>
            <Link href="/repository" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Tree-sitter AST
            </Link>
            <Link href="/settings" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Subsystem Settings
            </Link>
            <a
              href="https://github.com/akshaykumar33/knovra"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-cyan)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              GitHub Monorepo <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          © {new Date().getFullYear()} Knovra Universal Project Intelligence Layer. All rights reserved.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)' }}>
          <span>Milestone V0.4</span>
          <span>•</span>
          <span>Local-First Air-Gapped Ready</span>
        </div>
      </div>
    </footer>
  );
}
