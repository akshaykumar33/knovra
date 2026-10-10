import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ExploreView } from '@/components/workspace/ExploreView';

export const metadata: Metadata = { title: 'Explore' };

export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreView />
    </Suspense>
  );
}
