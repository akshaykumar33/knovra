import { withProject } from '@/lib/server/engine';
import { ok, fail } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get('q') ?? '';
  const limit = Number(params.get('limit') ?? 25);
  try {
    if (!query.trim()) return ok({ hits: [] });
    return ok({ hits: await withProject((k) => k.search(query, { limit })) });
  } catch (error) {
    return fail(error, 'Search failed');
  }
}
