import { NextResponse } from 'next/server';
import { getLiveScores } from '@/lib/apifootball';
import { normalize } from '../normalize';

// GET /api/livescores/latest — live scores, fresh (no extra cache)
export async function GET() {
  const data = await getLiveScores();
  if (!data) return NextResponse.json([], { status: 200 });
  return NextResponse.json(normalize(data));
}
