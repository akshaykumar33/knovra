'use client';

import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { Button as RadixButton, Badge as RadixBadge } from '@radix-ui/themes';

type Tone = 'primary' | 'secondary' | 'quiet' | 'danger';

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; size?: 'sm' | 'md' }>(function Button({ tone = 'secondary', size = 'md', children, className = '', ...props }, ref) {
  const { color, ...rest } = props;
  return <RadixButton ref={ref} type="button" variant={tone === 'primary' ? 'solid' : tone === 'quiet' ? 'ghost' : 'soft'} color={tone === 'danger' ? 'red' : undefined} size={size === 'sm' ? '2' : '3'} className={className} {...rest}>{children}</RadixButton>;
});

export function Card({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <section className={`ui-card ${className}`} {...props}>{children}</section>;
}

export function Badge({ tone = 'neutral', children, className = '' }: { tone?: 'accent' | 'cyan' | 'green' | 'neutral' | 'warning'; children: ReactNode; className?: string }) {
  return <RadixBadge color={tone === 'neutral' ? 'gray' : tone === 'accent' ? 'iris' : tone === 'warning' ? 'amber' : tone} radius="full" className={className}>{children}</RadixBadge>;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="ui-field"><span>{label}</span>{hint && <small>{hint}</small>}{children}</label>;
}
