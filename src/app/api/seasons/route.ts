import { NextRequest, NextResponse } from 'next/server';
import { getLeagueSeasons } from '@/lib/apifootball';

export async function GET(_req: NextRequest) {
  const data = await getLeagueSeasons();
  if (!Array.isArray(data)) return NextResponse.json({ total: 0, seasons: [] });
  return NextResponse.json({ total: data.length, seasons: data });
}
