'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface TabOption<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface SegmentedTabsProps<T extends string = string> {
  tabs: TabOption<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
  layoutId?: string;
  size?: 'sm' | 'md';
}

export function SegmentedTabs<T extends string = string>({
  tabs,
  active,
  onChange,
  className = '',
  layoutId = 'segmented-tab-pill',
  size = 'md',
}: SegmentedTabsProps<T>) {
  const isSm = size === 'sm';

  return (
    <div
      role="tablist"
      className={`segmented-tabs-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px',
        borderRadius: '12px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-default)',
        maxWidth: '100%',
        overflowX: 'auto',
        position: 'relative',
        scrollbarWidth: 'none',
      }}
    >
      {tabs.map((tab) => {
        const isSelected = active === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isSelected}
            onClick={() => onChange(tab.id)}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: isSm ? '5px 12px' : '7px 16px',
              fontSize: isSm ? '12px' : '13px',
              fontWeight: isSelected ? 600 : 500,
              color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'color 0.18s ease',
              zIndex: 1,
              outline: 'none',
            }}
          >
            {isSelected && (
              <motion.div
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '9px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-strong)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                  zIndex: -1,
                }}
              />
            )}
            {tab.icon && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  color: isSelected ? 'var(--accent-primary)' : 'inherit',
                  transition: 'color 0.18s ease',
                }}
              >
                {tab.icon}
              </span>
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  backgroundColor: isSelected
                    ? 'color-mix(in srgb, var(--accent-primary) 18%, var(--bg-card))'
                    : 'var(--bg-tertiary)',
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)',
                  border: isSelected
                    ? '1px solid color-mix(in srgb, var(--accent-primary) 30%, transparent)'
                    : '1px solid var(--border-subtle)',
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedTabs;
