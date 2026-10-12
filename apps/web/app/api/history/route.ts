import { projectRoot } from '@/lib/server/engine';
import { readCommits } from '@/lib/server/git';
import { ok } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  const commits = await readCommits(projectRoot());
  return ok({ commits: commits ?? [], available: commits !== null });
}
