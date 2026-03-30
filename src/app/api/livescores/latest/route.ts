import { NextResponse } from 'next/server';
import { getLiveScoresLatest } from '@/lib/sportmonks';
import { normalize } from '../normalize';

// GET /api/livescores/latest — only fixtures changed in last 10s (no cache)
// Returns [] when nothing changed — client must handle empty gracefully
export async function GET() {
  const data = await getLiveScoresLatest();
  if (!data) return NextResponse.json([], { status: 200 });

  const matches = Array.isArray(data) ? normalize(data) : [];
  return NextResponse.json(matches);
}
