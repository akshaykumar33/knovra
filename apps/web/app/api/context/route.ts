import { withProject } from '@/lib/server/engine';
import { ok, fail, readJson } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const task = typeof body.task === 'string' ? body.task : '';
    const maxChars = typeof body.maxChars === 'number' ? body.maxChars : 12000;
    const limit = typeof body.limit === 'number' ? body.limit : 12;
    return ok({ pack: await withProject((k) => k.context(task, { maxChars, limit })) });
  } catch (error) {
    return fail(error, 'Could not build the context pack');
  }
}
