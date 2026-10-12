import { withProject } from '@/lib/server/engine';
import { ok, fail } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return ok({ files: await withProject((k) => k.files()) });
  } catch (error) {
    return fail(error, 'Could not list indexed files');
  }
}
