'use client';

import React, { forwardRef } from 'react';
import Link from 'next/link';
import { motion, HTMLMotionProps } from 'framer-motion';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface KnovraButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconTrailing?: React.ReactNode;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
  href?: string;
  target?: string;
  asChild?: boolean;
}

export const KnovraButton = forwardRef<HTMLButtonElement, KnovraButtonProps>(function KnovraButton(
  {
    children,
    variant = 'secondary',
    size = 'md',
    icon,
    iconTrailing,
    loading = false,
    className = '',
    disabled = false,
    href,
    target,
    asChild,
    style,
    ...props
  },
  ref
) {
  const getPaddingAndHeight = () => {
    switch (size) {
      case 'sm':
        return { padding: '6px 14px', minHeight: '34px', fontSize: '13px' };
      case 'lg':
        return { padding: '12px 28px', minHeight: '48px', fontSize: '15px' };
      case 'md':
      default:
        return { padding: '9px 20px', minHeight: '42px', fontSize: '14px' };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
          color: 'var(--text-inverse)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 4px 18px var(--accent-glow), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          fontWeight: 650,
        };
      case 'outline':
        return {
          background: 'transparent',
          color: 'var(--text-primary)',
          border: '1.5px solid var(--border-strong)',
          boxShadow: 'none',
          fontWeight: 600,
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--text-secondary)',
          border: '1px solid transparent',
          boxShadow: 'none',
          fontWeight: 500,
        };
      case 'danger':
        return {
          background: 'color-mix(in srgb, var(--status-danger) 16%, var(--bg-card))',
          color: 'var(--status-danger)',
          border: '1px solid color-mix(in srgb, var(--status-danger) 35%, transparent)',
          boxShadow: '0 2px 10px rgba(239, 68, 68, 0.15)',
          fontWeight: 600,
        };
      case 'secondary':
      default:
        return {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-sm)',
          fontWeight: 600,
        };
    }
  };

  const sizeStyles = getPaddingAndHeight();
  const variantStyles = getVariantStyles();

  if (href) {
    return (
      <Link
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        style={{ textDecoration: 'none', display: 'inline-flex' }}
      >
        <motion.div
          whileHover={{ y: -1, scale: 1.015 }}
          whileTap={{ scale: 0.975 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderRadius: '10px',
            cursor: 'pointer',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            outline: 'none',
            ...sizeStyles,
            ...variantStyles,
            ...style,
          }}
          className={`knovra-ui-btn ${className}`}
        >
          {icon && <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>}
          {children && <span>{children}</span>}
          {iconTrailing && (
            <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>{iconTrailing}</span>
          )}
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.button
      ref={ref}
      disabled={disabled || loading}
      whileHover={disabled || loading ? undefined : { y: -1, scale: 1.015 }}
      whileTap={disabled || loading ? undefined : { scale: 0.975 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: '10px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        outline: 'none',
        ...sizeStyles,
        ...variantStyles,
        ...style,
      }}
      className={`knovra-ui-btn ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            style={{ opacity: 0.75 }}
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon && <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && iconTrailing && (
        <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>{iconTrailing}</span>
      )}
    </motion.button>
  );
});

export default KnovraButton;
