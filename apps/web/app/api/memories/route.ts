import { withProject, readMemories } from '@/lib/server/engine';
import { ok, fail, readJson } from '@/lib/server/http';
import type { MemoryKind } from '@/lib/types';

export const dynamic = 'force-dynamic';

const KINDS: MemoryKind[] = ['decision', 'rule', 'note'];

export async function GET() {
  try {
    return ok({ memories: await withProject((k) => readMemories(k, true)) });
  } catch (error) {
    return fail(error, 'Could not read project memory');
  }
}

/** Only these four fields are accepted; the engine generates the id and timestamp. */
export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    const kind = KINDS.find((k) => k === body.kind);
    if (!kind) throw new Error('kind must be decision, rule, or note');
    const title = typeof body.title === 'string' ? body.title : '';
    const text = typeof body.body === 'string' ? body.body : '';
    const supersedes = typeof body.supersedes === 'string' && body.supersedes ? body.supersedes : null;
    const result = await withProject((k) => {
      const saved = k.remember({ kind, title, body: text, supersedes });
      return { id: String(saved.id), memories: readMemories(k, true) };
    });
    return ok(result, { status: 201 });
  } catch (error) {
    return fail(error, 'Could not save the record');
  }
}
