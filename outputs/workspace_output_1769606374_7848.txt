import { NextResponse } from 'next/server';
import { checkHealth } from '@/lib/storage';
import { HealthResponse } from '@/lib/types';

export async function GET() {
  const isHealthy = await checkHealth();
  
  if (!isHealthy) {
    return NextResponse.json(
      { ok: false, error: 'Persistence layer unavailable' } as HealthResponse & { error: string },
      { status: 503 }
    );
  }
  
  return NextResponse.json({ ok: true } as HealthResponse, { status: 200 });
}