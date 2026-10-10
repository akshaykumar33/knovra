import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HistoryView } from '@/components/workspace/HistoryView';
import { projectRoot, withProject } from '@/lib/server/engine';
import { readCommits } from '@/lib/server/git';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'History' };

export default async function HistoryPage() {
  const [commits, indexed] = await Promise.all([
    readCommits(projectRoot(), 80),
    withProject((k) => k.files().map((f) => f.path)).catch(() => [] as string[]),
  ]);
  return (
    <Suspense>
      <HistoryView commits={commits} indexed={indexed} />
    </Suspense>
  );
}
