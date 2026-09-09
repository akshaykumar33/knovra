'use client';

import React, { useState, useEffect } from 'react';

interface ServiceItem {
  name: string;
  subsystem: string;
  role: string;
  technology: string;
  port: number | string;
  status: 'healthy' | 'checking' | 'offline';
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [webHealth, setWebHealth] = useState<string>('checking');

  useEffect(() => {
    setMounted(true);
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') setWebHealth('healthy');
        else setWebHealth('offline');
      })
      .catch(() => setWebHealth('offline'));
  }, []);

  const services: ServiceItem[] = [
    {
      name: 'Web Dashboard',
      subsystem: 'apps/web',
      role: 'Product UI & Graph Explorer',
      technology: 'Next.js + TypeScript',
      port: 3000,
      status: webHealth === 'healthy' ? 'healthy' : 'checking',
    },
    {
      name: 'Application API',
      subsystem: 'apps/api',
      role: 'SaaS, Auth & Workspaces',
      technology: 'NestJS + TypeScript',
      port: 4000,
      status: 'healthy',
    },
    {
      name: 'Runtime Daemon & CLI',
      subsystem: 'services/runtime',
      role: 'Local Daemon, MCP Gateway & Watchers',
      technology: 'Go 1.22',
      port: 8080,
      status: 'healthy',
    },
    {
      name: 'Code Indexer Engine',
      subsystem: 'services/code-indexer',
      role: 'AST Parsing & Symbol Graphs',
      technology: 'Rust + Tree-sitter',
      port: 50051,
      status: 'healthy',
    },
    {
      name: 'AI Context Engine',
      subsystem: 'services/context-engine',
      role: 'Semantic Memory & Context Planning',
      technology: 'Python + FastAPI',
      port: 8000,
      status: 'healthy',
    },
  ];

  const infraItems = [
    { name: 'PostgreSQL + pgvector', port: '5432', purpose: 'Transactional truth & vector embeddings' },
    { name: 'Neo4j Community', port: '7474 / 7687', purpose: 'Provenance-aware code & decision graph' },
    { name: 'Redis 7', port: '6379', purpose: 'Hot context, distributed locks & working cache' },
    { name: 'NATS JetStream', port: '4222 / 8222', purpose: 'High-throughput agent event streaming' },
    { name: 'MinIO Object Storage', port: '9000 / 9001', purpose: 'Raw conversation transcripts & snapshots' },
  ];

  return (
    <main style={{ minHeight: '100vh', padding: '2.5rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
                KNOVRA
              </span>
              <span className="badge badge-ok">Phase 01: Foundation Active</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Universal persistent project-intelligence layer for AI development agents
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', fontSize: '0.85rem', fontWeight: 600 }}>
              Local-First Runtime
            </span>
            <span style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)', fontSize: '0.85rem', fontWeight: 600 }}>
              MCP Ready
            </span>
          </div>
        </div>
      </header>

      {/* Grid: Subsystem Services */}
      <section style={{ marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
          Core Subsystems
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {services.map((svc) => (
            <div key={svc.name} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>{svc.name}</h3>
                <span className="badge badge-ok">HEALTHY</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{svc.role}</p>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>{svc.technology}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>:{svc.port}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grid: Infrastructure Stack */}
      <section style={{ marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
          Containerized Infrastructure (Docker Compose)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {infraItems.map((inf) => (
            <div key={inf.name} className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>{inf.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>
                Port {inf.port}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{inf.purpose}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Golden Invariant Notice */}
      <section className="glass-card" style={{ padding: '1.5rem', borderColor: 'rgba(59, 130, 246, 0.25)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent-blue)' }}>
          Architectural Invariant #1
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong>AI agents do not own Knovra context. Knovra owns context and agents consume it.</strong> Models are replaceable. Context is durable. Every derived fact retains source provenance, decisions support supersession, and indexing operates incrementally.
        </p>
      </section>
    </main>
  );
}
