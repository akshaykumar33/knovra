import { withProject, readStatus } from '@/lib/server/engine';
import { ok, fail } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return ok(await withProject((k) => ({ status: readStatus(k), doctor: k.doctor() })));
  } catch (error) {
    return fail(error, 'Could not read project status');
  }
}
