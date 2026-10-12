import { withProject, readStatus } from '@/lib/server/engine';
import { ok, fail, readJson } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await readJson(request);
    return ok(await withProject((k) => ({ run: k.index(), status: readStatus(k) })));
  } catch (error) {
    return fail(error, 'Indexing failed');
  }
}
