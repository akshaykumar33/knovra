'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Key,
  ShieldCheck,
  Cpu,
  Bot,
  Terminal,
  Lock,
  HardDrive,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { SpotlightCard } from '../../components/SpotlightCard';
import { AuroraGlow } from '../../components/AuroraGlow';
import { CodeSnippet } from '../../components/ui/CodeSnippet';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { KnovraButton } from '../../components/ui/KnovraButton';

interface ProviderCard {
  id: string;
  name: string;
  tagline: string;
  models: string[];
  protocol: string;
  status: 'supported' | 'native' | 'air-gapped';
  keyStorage: string;
  configSnippet: string;
}

const PROVIDERS: ProviderCard[] = [
  {
    id: 'anthropic',
    name: 'Anthropic / Claude Code',
    tagline: 'Deep architectural refactoring & complex multi-file pull requests',
    models: ['claude-3-7-sonnet-latest', 'claude-3-5-sonnet', 'claude-3-haiku'],
    protocol: 'Direct HTTPS / MCP Native JSON-RPC',
    status: 'native',
    keyStorage: 'Local OS Keychain (~/.config/knovra/keys.enc)',
    configSnippet: `# Configure Anthropic Provider
knovra provider set anthropic \\
  --api-key=$ANTHROPIC_API_KEY \\
  --model=claude-3-7-sonnet-latest \\
  --max-tokens=8000`,
  },
  {
    id: 'openai',
    name: 'OpenAI / Codex',
    tagline: 'High-speed symbol completion & reasoning model evaluation',
    models: ['o3-mini', 'o1', 'gpt-4o', 'gpt-4o-mini'],
    protocol: 'Direct HTTPS Client',
    status: 'supported',
    keyStorage: 'Local OS Keychain (Encrypted AES-256-GCM)',
    configSnippet: `# Configure OpenAI Provider
knovra provider set openai \\
  --api-key=$OPENAI_API_KEY \\
  --model=o3-mini \\
  --reasoning-effort=high`,
  },
  {
    id: 'gemini',
    name: 'Google / Gemini',
    tagline: 'Massive multi-modal AST understanding & long-context validation',
    models: ['gemini-2.0-flash', 'gemini-2.0-pro-exp'],
    protocol: 'Direct HTTPS Client',
    status: 'supported',
    keyStorage: 'Local OS Keychain',
    configSnippet: `# Configure Google Gemini Provider
knovra provider set gemini \\
  --api-key=$GEMINI_API_KEY \\
  --model=gemini-2.0-flash`,
  },
  {
    id: 'ollama',
    name: 'Ollama / Local LLMs',
    tagline: '100% air-gapped local execution without internet connectivity',
    models: ['deepseek-r1:14b', 'qwen2.5-coder:32b', 'llama3.3:70b'],
    protocol: 'Local HTTP daemon (http://127.0.0.1:11434)',
    status: 'air-gapped',
    keyStorage: 'No API Key Required (Zero Network Egress)',
    configSnippet: `# Run Air-Gapped with Ollama
knovra provider set ollama \\
  --endpoint=http://127.0.0.1:11434 \\
  --model=deepseek-r1:14b`,
  },
  {
    id: 'mcp',
    name: 'Model Context Protocol (MCP)',
    tagline: 'Universal bridge connecting Claude Desktop, Cursor, Windsurf, & Zed',
    models: ['Any MCP-compliant tool caller'],
    protocol: 'Local Stdio & Unix Domain Sockets',
    status: 'native',
    keyStorage: 'Local IPC Auth',
    configSnippet: `# Connect MCP Harness (e.g. Claude Code)
claude mcp add knovra -- knovra mcp run`,
  },
];

export default function ProvidersPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
      <AuroraGlow />
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <span className="eyebrow-serif" style={{ display: 'block', marginBottom: '8px' }}>AI MODEL & CLIENT PROTOCOLS</span>
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
              <Key size={18} />
            </span>
            <h1 style={{ fontSize: 'clamp(28px, 3.2vw, 42px)', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>
              Model <span className="font-calligraphy text-gradient-aurora">Providers</span>
            </h1>
            <StatusBadge tone="warning" pulse={true}>
              Zero Vendor Lock-in
            </StatusBadge>
          </div>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '620px', lineHeight: 1.6 }}>
            Bring Your Own Keys. Credentials and proprietary repository code remain strictly on your local machine.
          </p>
        </div>

        <Link href="/docs" style={{ textDecoration: 'none' }}>
          <KnovraButton variant="secondary" size="sm" icon={<ArrowRight size={14} />}>
            Provider Config Docs
          </KnovraButton>
        </Link>
      </div>

      {/* Security Guarantee Banner */}
      <div
        style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'color-mix(in srgb, var(--status-ok) 8%, var(--bg-card))',
          border: '1px solid color-mix(in srgb, var(--status-ok) 25%, transparent)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
        }}
      >
        <Lock size={22} style={{ color: 'var(--status-ok)', marginTop: '2px', flexShrink: 0 }} />
        <div>
          <h2 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Client-Side Key Isolation & Direct Model Egress
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Knovra operates without intermediate proxy servers. When an agent requests a ContextBundle, your machine connects
            directly to the selected provider using your local keys. Knovra never transmits telemetry, code snippets, or API tokens
            to remote servers.
          </p>
        </div>
      </div>

      {/* Provider Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '1.25rem' }}>
        {PROVIDERS.map((prov) => (
          <SpotlightCard
            key={prov.id}
            className="knovra-card"
            style={{
              padding: '1.35rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <StatusBadge tone={prov.status === 'air-gapped' ? 'success' : prov.status === 'native' ? 'purple' : 'info'}>
                  {prov.status}
                </StatusBadge>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {prov.protocol}
                </span>
              </div>

              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {prov.name}
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
                {prov.tagline}
              </p>

              {/* Supported Models List */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.85rem' }}>
                {prov.models.map((m) => (
                  <span
                    key={m}
                    style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>

              {/* Key Storage Location */}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.5rem' }}>
                Storage: <strong style={{ color: 'var(--accent-primary)' }}>{prov.keyStorage}</strong>
              </div>
            </div>

            {/* Config CLI Snippet */}
            <CodeSnippet
              code={prov.configSnippet}
              language="bash"
              filename={`${prov.id}-config.sh`}
            />
          </SpotlightCard>
        ))}
      </div>
    </div>
  );
}
