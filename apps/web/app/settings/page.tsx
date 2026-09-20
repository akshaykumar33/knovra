'use client';

import React, { useEffect, useState } from 'react';
import { Card, TextField, Switch, Select } from '@radix-ui/themes';
import {
  Check,
  Palette,
  Server,
  ShieldCheck,
  RefreshCw,
  Save,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Terminal,
  Layers,
  Sliders,
  Zap,
  Lock,
  Compass,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../components/ThemeProvider';
import { AuroraGlow } from '../../components/AuroraGlow';
import { KnovraButton } from '../../components/ui/KnovraButton';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { fireCelebrationConfetti } from '../../lib/confetti';

const defaults = {
  engineUrl: 'http://localhost:8000',
  gatewayUrl: 'http://localhost:8080',
  indexerHost: 'localhost:50051',
  offlineMode: false,
  sanitization: 'strict',
};

const storageKey = 'knovra-workspace-preferences-v1';

export default function SettingsPage() {
  const { theme, setTheme, themes } = useTheme();
  const [config, setConfig] = useState(defaults);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [testing, setTesting] = useState(false);
  const [health, setHealth] = useState<{ status: 'ok' | 'error' | 'idle'; text: string; latency?: number }>({
    status: 'idle',
    text: '',
  });

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (
        data &&
        typeof data.engineUrl === 'string' &&
        typeof data.gatewayUrl === 'string' &&
        typeof data.indexerHost === 'string' &&
        typeof data.offlineMode === 'boolean' &&
        ['strict', 'balanced', 'permissive'].includes(data.sanitization)
      ) {
        setConfig(data);
      }
    } catch {
      setError(true);
      setMessage('Saved preferences could not be read. Default values are shown.');
    }
  }, []);

  function update(key: keyof typeof defaults, value: string | boolean) {
    setConfig((c) => ({ ...c, [key]: value }));
    setMessage('');
  }

  function save() {
    try {
      for (const value of [config.engineUrl, config.gatewayUrl]) {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Enter HTTP or HTTPS addresses.');
        }
      }
      if (!config.indexerHost.trim()) {
        throw new Error('Enter an indexer host.');
      }
    } catch (e) {
      setError(true);
      setMessage(e instanceof Error ? e.message : 'Check the endpoint addresses.');
      return;
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(config));
      setError(false);
      setMessage('Preferences saved in this browser. Runtime services have not been reconfigured.');
      toast.success('Workspace preferences successfully saved');
      fireCelebrationConfetti();
    } catch {
      setError(true);
      setMessage('Browser storage is unavailable. Your preferences were not saved.');
      toast.error('Failed to save preferences');
    }
  }

  async function checkHealth() {
    setTesting(true);
    setHealth({ status: 'idle', text: '' });
    const startTime = performance.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch('/api/health', {
        cache: 'no-store',
        signal: controller.signal,
      });
      const latency = Math.round(performance.now() - startTime);
      const data = await response.json();
      if (response.ok && data.service === 'knovra-web' && data.status === 'ok') {
        setHealth({
          status: 'ok',
          text: `Web service online · response in ${latency}ms. Other runtime daemons are local.`,
          latency,
        });
        toast.success(`Daemon online · ${latency}ms latency`);
      } else {
        setHealth({
          status: 'error',
          text: 'Web service returned an unexpected response code.',
        });
        toast.error('Web service returned unexpected response code');
      }
    } catch {
      setHealth({
        status: 'error',
        text: 'Could not reach web service endpoint. Ensure local daemon is running.',
      });
      toast.error('Could not reach web service endpoint');
    } finally {
      clearTimeout(timer);
      setTesting(false);
    }
  }

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem', position: 'relative' }}>
      <AuroraGlow />
      {/* Editorial Header */}
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          paddingBottom: '2rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <StatusBadge tone="purple">
            <Sparkles size={11} style={{ display: 'inline', marginRight: 3 }} />
            STUDIO PREFERENCES
          </StatusBadge>
          <StatusBadge tone="info">
            <Lock size={11} style={{ display: 'inline', marginRight: 3 }} />
            LOCAL-FIRST ISOLATION
          </StatusBadge>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2rem, 3.8vw, 2.85rem)',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            color: 'var(--text-primary)',
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          Your Workspace. <span className="font-calligraphy italic text-gradient-gold">Your Signature.</span>
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', maxWidth: 720, lineHeight: 1.6, margin: 0 }}>
          Tune appearance themes, configure local daemon endpoints, and calibrate token sanitization invariant boundaries.
        </p>
      </header>

      {/* SECTION 1: APPEARANCE & PALETTES */}
      <section
        className="glass-panel-luxury"
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-primary)' }}>
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              <Palette size={18} />
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Appearance
            </h2>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Curated color schemes with calibrated contrast ratios and high-specular glassmorphic surfaces. Changes take effect instantly.
          </p>

          <div
            style={{
              marginTop: '1rem',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <Zap size={14} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
            <span>Active palette: <strong style={{ color: 'var(--text-primary)' }}>{themes.find((t) => t.id === theme)?.name || theme}</strong></span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
          {themes.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                type="button"
                key={t.id}
                aria-pressed={isSelected}
                onClick={() => {
                  setTheme(t.id);
                  toast.success(`Active theme switched to ${t.name}`);
                }}
                style={{
                  background: isSelected ? 'var(--bg-card)' : 'transparent',
                  border: `1.5px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                  borderRadius: '14px',
                  padding: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isSelected ? '0 8px 24px -6px var(--accent-glow)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {/* Theme Swatch Preview */}
                <div
                  style={{
                    height: 84,
                    borderRadius: '9px',
                    background: t.bgPreview,
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: 7,
                      width: '55%',
                      borderRadius: 4,
                      background: t.accentPreview,
                      boxShadow: `0 0 10px ${t.accentPreview}`,
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ height: 4, width: '85%', borderRadius: 2, background: 'rgba(128, 128, 128, 0.35)' }} />
                    <div style={{ height: 4, width: '60%', borderRadius: 2, background: 'rgba(128, 128, 128, 0.22)' }} />
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 6px',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}
                >
                  <span>{t.name}</span>
                  {isSelected && (
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-primary)',
                        color: 'var(--text-inverse)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: RUNTIME CONNECTIONS */}
      <section
        className="glass-panel-luxury"
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-secondary)' }}>
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              <Server size={18} />
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Local Endpoints
            </h2>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Specify IPC and HTTP daemon bindings for Knovra’s local-first intelligence runtime.
          </p>

          <div style={{ marginTop: '0.5rem' }}>
            <StatusBadge tone="info">Browser Client Config</StatusBadge>
          </div>

          {/* Service Health Widget */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Web Service Probe
              </span>
              <KnovraButton
                variant="secondary"
                size="sm"
                loading={testing}
                onClick={checkHealth}
                icon={<RefreshCw size={13} />}
              >
                Ping Service
              </KnovraButton>
            </div>

            <p
              role="status"
              style={{
                fontSize: '0.78rem',
                color: health.status === 'error' ? 'var(--accent-danger)' : health.status === 'ok' ? 'var(--accent-primary)' : 'var(--text-muted)',
                lineHeight: 1.5,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              {health.status === 'ok' && <CheckCircle2 size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />}
              {health.status === 'error' && <AlertCircle size={14} style={{ color: 'var(--accent-danger)', flexShrink: 0 }} />}
              {health.text || 'Checks web app routing. Runtime engine connectivity verified independently.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[
            {
              key: 'engineUrl',
              label: 'Context Engine HTTP Host',
              hint: 'REST & SSE endpoint for ContextBundle compilation',
              example: 'http://localhost:8000',
              icon: Cpu,
            },
            {
              key: 'gatewayUrl',
              label: 'Agent Gateway Endpoint',
              hint: 'Standard Model Context Protocol (MCP) stream transport',
              example: 'http://localhost:8080',
              icon: Layers,
            },
            {
              key: 'indexerHost',
              label: 'Code Indexer gRPC Address',
              hint: 'Tree-sitter daemon AST incremental parser',
              example: 'localhost:50051',
              icon: Terminal,
            },
          ].map((field) => {
            const Icon = field.icon;
            return (
              <div
                key={field.key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  padding: '1rem 1.2rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label
                    htmlFor={`input-${field.key}`}
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                    }}
                  >
                    <Icon size={14} style={{ color: 'var(--accent-secondary)' }} />
                    {field.label}
                  </label>
                  <small style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{field.hint}</small>
                </div>
                <TextField.Root
                  id={`input-${field.key}`}
                  size="2"
                  value={config[field.key as 'engineUrl']}
                  onChange={(e) => update(field.key as keyof typeof defaults, e.target.value)}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                  }}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: RUNTIME INVARIANTS & POLICIES */}
      <section
        className="glass-panel-luxury"
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-warning)' }}>
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(245, 158, 11, 0.25)',
              }}
            >
              <ShieldCheck size={18} />
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Invariants & Safety
            </h2>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Configure local token governance. Invariant enforcement guarantees agent context cannot leak proprietary code.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Offline Preference Switch */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
            }}
          >
            <label htmlFor="offline-preference" style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', cursor: 'pointer' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Prefer Offline Execution</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Block outbound agent telemetry and enforce local Ollama/LM Studio model fallback.
              </span>
            </label>
            <Switch
              id="offline-preference"
              checked={config.offlineMode}
              onCheckedChange={(value) => update('offlineMode', value)}
            />
          </div>

          {/* Sanitization Policy */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Context Sanitization Boundary</strong>
              <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AST Token Filter</small>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
              Controls automatic stripping of secrets, keys, and PII prior to compiling agent prompt context.
            </p>
            <Select.Root
              value={config.sanitization}
              onValueChange={(value) => update('sanitization', value)}
            >
              <Select.Trigger aria-label="Sanitization preference" style={{ width: '100%' }} />
              <Select.Content>
                <Select.Item value="strict">Strict (Zero Credentials, AST Hashes Only)</Select.Item>
                <Select.Item value="balanced">Balanced (Redact Secrets, Preserve Signatures)</Select.Item>
                <Select.Item value="permissive">Permissive (Local Dev Testing Only)</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
        </div>
      </section>

      {/* SAVE DOCK */}
      <footer
        className="glass-panel"
        style={{
          position: 'sticky',
          bottom: 24,
          padding: '1.25rem 1.75rem',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-strong)',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {error ? (
            <AlertCircle size={17} style={{ color: 'var(--accent-danger)' }} />
          ) : (
            <CheckCircle2 size={17} style={{ color: 'var(--accent-primary)' }} />
          )}
          <p
            role={error ? 'alert' : 'status'}
            style={{
              fontSize: '0.85rem',
              color: error ? 'var(--accent-danger)' : 'var(--text-secondary)',
              margin: 0,
              fontWeight: 500,
            }}
          >
            {message || 'Preferences will be persisted to your local browser storage.'}
          </p>
        </div>

        <KnovraButton
          variant="primary"
          size="md"
          onClick={save}
          icon={<Save size={16} />}
        >
          Save Preferences
        </KnovraButton>
      </footer>
    </div>
  );
}
