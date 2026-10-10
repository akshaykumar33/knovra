import { NextResponse, type NextRequest } from 'next/server';

/**
 * The workspace API reads project source and writes project memory, so it only answers
 * requests addressed to this machine (blocks DNS rebinding) and same-origin mutations (blocks CSRF).
 * Set KNOVRA_ALLOW_REMOTE=1 to serve it on another interface deliberately.
 */
const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  if (process.env.KNOVRA_ALLOW_REMOTE !== '1' && !LOCAL_HOST.test(host)) {
    return NextResponse.json({ error: 'The Knovra workspace API only accepts requests to localhost.' }, { status: 403 });
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const origin = request.headers.get('origin');
    if (origin && new URL(origin).host !== host) {
      return NextResponse.json({ error: 'Cross-origin changes are not allowed.' }, { status: 403 });
    }
  }
  return NextResponse.next();
}

export const config = { matcher: '/api/:path*' };
