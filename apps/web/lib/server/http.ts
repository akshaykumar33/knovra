import { NextResponse } from 'next/server';

/** Engine validation messages are written for people; pass them through as 400s. */
const INPUT_ERROR = /must be|Invalid|Unknown|cannot|Cannot|must exist|too long|exceeded/;

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { ...init, headers: { 'Cache-Control': 'no-store' } });
}

export function fail(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : String(error);
  if (INPUT_ERROR.test(message)) return NextResponse.json({ error: message }, { status: 400 });
  console.error(`[knovra-web] ${fallback}:`, error);
  return NextResponse.json({ error: `${fallback}. Check the terminal running the web app for details.` }, { status: 500 });
}

/** Mutations need a JSON body; a cross-site form cannot send one without a CORS preflight. */
export async function readJson(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    throw new Error('Request body must be JSON (Content-Type: application/json)');
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Request body must be a JSON object');
  return body as Record<string, unknown>;
}
