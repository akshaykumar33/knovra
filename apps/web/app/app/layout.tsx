import type { Metadata } from 'next';
import { WorkspaceShell } from '@/components/shell/WorkspaceShell';
import { withProject, readStatus } from '@/lib/server/engine';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Workspace' };

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const status = await withProject(readStatus).catch(() => null);
  return <WorkspaceShell status={status}>{children}</WorkspaceShell>;
}
