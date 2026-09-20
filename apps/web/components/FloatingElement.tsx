'use client';

import React from 'react';
import {
  ShieldCheck,
  FileCode2,
  Cpu,
  Database,
  Terminal,
  Activity,
  Sparkles,
  Zap,
} from 'lucide-react';

export type FloatingType = 'rule' | 'code' | 'skill' | 'memory' | 'runtime' | 'metric';

interface FloatingElementProps {
  type: FloatingType;
  label: string;
  sublabel?: string;
  animationClass?: 'floating-chip-1' | 'floating-chip-2' | 'floating-chip-3';
  style?: React.CSSProperties;
  className?: string;
}

const TYPE_CONFIG = {
  rule: {
    icon: ShieldCheck,
    badgeClass: 'knovra-badge-purple',
    accentColor: 'var(--accent-tertiary)',
    prefix: 'RULE',
  },
  code: {
    icon: FileCode2,
    badgeClass: 'knovra-badge-blue',
    accentColor: 'var(--accent-secondary)',
    prefix: 'AST',
  },
  skill: {
    icon: Cpu,
    badgeClass: 'knovra-badge-amber',
    accentColor: 'var(--status-warn)',
    prefix: 'SKILL',
  },
  memory: {
    icon: Database,
    badgeClass: 'knovra-badge-green',
    accentColor: 'var(--status-ok)',
    prefix: 'MEM',
  },
  runtime: {
    icon: Activity,
    badgeClass: 'knovra-badge-green',
    accentColor: 'var(--status-ok)',
    prefix: 'LIVE',
  },
  metric: {
    icon: Sparkles,
    badgeClass: 'knovra-badge-blue',
    accentColor: 'var(--accent-primary)',
    prefix: 'TELEMETRY',
  },
};

export default function FloatingElement({
  type,
  label,
  sublabel,
  animationClass = 'floating-chip-1',
  style,
  className = '',
}: FloatingElementProps) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.code;
  const Icon = config.icon;

  return (
    <div
      className={`knovra-card ${animationClass} floating-ambient-hide ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.45rem 0.85rem',
        borderRadius: '999px',
        border: '1px solid var(--border-strong)',
        backgroundColor: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: 'var(--shadow-md), 0 0 16px var(--accent-glow)',
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: 5,
        ...style,
      }}
      aria-hidden="true"
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: config.accentColor,
          flexShrink: 0,
        }}
      >
        <Icon size={12} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', lineHeight: 1 }}>
        <span
          className={`knovra-badge ${config.badgeClass}`}
          style={{ fontSize: '0.58rem', padding: '1px 5px' }}
        >
          {config.prefix}
        </span>
        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
        {sublabel && (
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            ({sublabel})
          </span>
        )}
      </div>
    </div>
  );
}
