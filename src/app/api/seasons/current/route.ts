import { NextResponse } from 'next/server';
import { getLeagueSeasons } from '@/lib/apifootball';
import { getCurrentSeason } from '@/lib/season';

export async function GET() {
  const [seasons, current] = await Promise.all([getLeagueSeasons(), getCurrentSeason()]);
  return NextResponse.json({ total: (seasons ?? []).length, seasons: seasons ?? [], current });
}
