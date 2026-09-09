import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'knovra-web',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    details: {
      framework: 'Next.js App Router',
      environment: process.env.NODE_ENV || 'development',
    },
  });
}
