'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { api } from '@/lib/client';
import { plural } from '@/lib/format';
import type { IndexRun, ProjectStatus } from '@/lib/types';

export function summarizeRun(run: IndexRun): string {
  const parts = [`${plural(run.indexed, 'file')} updated`, `${run.unchanged.toLocaleString('en')} unchanged`];
  if (run.deleted) parts.push(`${run.deleted} removed`);
  if (run.skipped.length) parts.push(`${run.skipped.length} skipped`);
  return `${parts.join(', ')} in ${(run.durationMs / 1000).toFixed(1)} s.`;
}

/** Runs an incremental index; unchanged files are hashed and skipped, so reruns are cheap. */
export function IndexButton({ indexed, size = 'md' }: { indexed: boolean; size?: 'md' | 'lg' }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const { run } = await api<{ run: IndexRun; status: ProjectStatus }>('/api/index', { method: 'POST', body: {} });
      toast.success(indexed ? 'Index refreshed' : 'Project indexed', { description: summarizeRun(run) });
      router.refresh();
    } catch (error) {
      toast.error('Indexing did not finish', { description: (error as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" className={`btn btn-primary${size === 'lg' ? ' btn-lg' : ''}`} onClick={run} disabled={busy} aria-busy={busy}>
      {busy ? <span className="spinner" aria-hidden /> : <RefreshCw aria-hidden />}
      {busy ? 'Indexing…' : indexed ? 'Refresh index' : 'Index this project'}
    </button>
  );
}
