'use client';

import React from 'react';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'cyan' | 'neutral';

export interface StatusBadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  pulse?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export function StatusBadge({
  children,
  tone = 'neutral',
  pulse = false,
  icon,
  size = 'md',
  className = '',
  style,
}: StatusBadgeProps) {
  const getColors = () => {
    switch (tone) {
      case 'success':
        return {
          bg: 'color-mix(in srgb, var(--status-ok) 14%, var(--bg-card))',
          text: 'var(--status-ok)',
          border: 'color-mix(in srgb, var(--status-ok) 32%, transparent)',
          dot: 'var(--status-ok)',
        };
      case 'warning':
        return {
          bg: 'color-mix(in srgb, var(--status-warn) 14%, var(--bg-card))',
          text: 'var(--status-warn)',
          border: 'color-mix(in srgb, var(--status-warn) 32%, transparent)',
          dot: 'var(--status-warn)',
        };
      case 'danger':
        return {
          bg: 'color-mix(in srgb, var(--status-danger) 14%, var(--bg-card))',
          text: 'var(--status-danger)',
          border: 'color-mix(in srgb, var(--status-danger) 32%, transparent)',
          dot: 'var(--status-danger)',
        };
      case 'info':
      case 'cyan':
        return {
          bg: 'color-mix(in srgb, var(--accent-secondary) 14%, var(--bg-card))',
          text: 'var(--accent-secondary)',
          border: 'color-mix(in srgb, var(--accent-secondary) 32%, transparent)',
          dot: 'var(--accent-secondary)',
        };
      case 'purple':
        return {
          bg: 'color-mix(in srgb, var(--accent-tertiary, #8B5CF6) 14%, var(--bg-card))',
          text: 'var(--accent-tertiary, #8B5CF6)',
          border: 'color-mix(in srgb, var(--accent-tertiary, #8B5CF6) 32%, transparent)',
          dot: 'var(--accent-tertiary, #8B5CF6)',
        };
      case 'neutral':
      default:
        return {
          bg: 'var(--bg-secondary)',
          text: 'var(--text-secondary)',
          border: 'var(--border-default)',
          dot: 'var(--text-muted)',
        };
    }
  };

  const colors = getColors();

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '2px 8px', fontSize: '10px' };
      case 'lg':
        return { padding: '5px 14px', fontSize: '12px' };
      case 'md':
      default:
        return { padding: '3px 10px', fontSize: '11px' };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <span
      className={`status-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '9999px',
        fontWeight: 600,
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        lineHeight: 1.4,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        ...sizeStyles,
        ...style,
      }}
    >
      {pulse && (
        <span
          style={{
            position: 'relative',
            display: 'inline-flex',
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: colors.dot,
          }}
        >
          <span
            style={{
              position: 'absolute',
              inset: '-2px',
              borderRadius: '50%',
              backgroundColor: colors.dot,
              opacity: 0.4,
              animation: 'pulsing-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
        </span>
      )}
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

export default StatusBadge;
