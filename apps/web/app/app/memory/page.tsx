import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader } from '@/components/shell/PageHeader';
import { MemoryView } from '@/components/workspace/MemoryView';
import { EngineUnavailable, errorMessage } from '@/components/workspace/EngineUnavailable';
import { withProject, readMemories } from '@/lib/server/engine';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Memory' };

export default async function MemoryPage() {
  try {
    const memories = await withProject((k) => readMemories(k, true));
    return (
      <Suspense>
        <MemoryView initial={memories} />
      </Suspense>
    );
  } catch (error) {
    return (
      <>
        <PageHeader title="Memory" />
        <EngineUnavailable message={errorMessage(error)} />
      </>
    );
  }
}
