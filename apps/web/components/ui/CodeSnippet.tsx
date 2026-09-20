'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { fireMicroSparkle } from '../../lib/confetti';

export interface CodeSnippetProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function CodeSnippet({
  code,
  language = 'bash',
  filename,
  className = '',
  style,
}: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      fireMicroSparkle(0.85, 0.25);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div
      className={`code-snippet-box ${className}`}
      style={{
        position: 'relative',
        borderRadius: '12px',
        backgroundColor: 'var(--bg-canvas)',
        border: '1px solid var(--border-default)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {(filename || language) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 14px',
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-subtle)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span>{filename || language.toUpperCase()}</span>
          <span style={{ fontSize: '10px', textTransform: 'uppercase' }}>{language}</span>
        </div>
      )}

      <pre
        style={{
          padding: '14px 16px',
          margin: 0,
          overflowX: 'auto',
          fontSize: '12.5px',
          lineHeight: 1.6,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-primary)',
        }}
      >
        <code>{code}</code>
      </pre>

      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy code"
        style={{
          position: 'absolute',
          top: filename ? '36px' : '10px',
          right: '10px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 8px',
          borderRadius: '6px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-default)',
          color: copied ? 'var(--status-ok)' : 'var(--text-secondary)',
          fontSize: '11px',
          cursor: 'pointer',
          transition: 'all 0.18s ease',
          outline: 'none',
        }}
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  );
}

export default CodeSnippet;
