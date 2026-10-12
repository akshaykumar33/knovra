'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Check, Copy } from 'lucide-react';
import { copyText } from '@/lib/client';

export function CopyBlock({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="codeblock">
      <div className="codeblock-head">
        <span>{label}</span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          aria-label={`Copy ${label}`}
          onClick={async () => {
            if (await copyText(code)) {
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            } else toast.error('Clipboard is blocked in this browser. Select the text and copy it instead.');
          }}
        >
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre tabIndex={0}>{code}</pre>
    </div>
  );
}
