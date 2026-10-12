import { NextResponse } from 'next/server';
import { withProject } from '@/lib/server/engine';
import { ok, fail } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get('path') ?? '';
  try {
    const file = await withProject((k) => k.file(path));
    if (!file) return NextResponse.json({ error: `${path} is not in the index. Refresh the index if the file is new.` }, { status: 404 });
    return ok({ file });
  } catch (error) {
    return fail(error, 'Could not open the file');
  }
}
