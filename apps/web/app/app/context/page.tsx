import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ContextView } from '@/components/workspace/ContextView';

export const metadata: Metadata = { title: 'Context' };

export default function ContextPage() {
  return (
    <Suspense>
      <ContextView />
    </Suspense>
  );
}
