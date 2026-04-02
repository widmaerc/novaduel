import { NextRequest, NextResponse } from 'next/server';
import { getStandings } from '@/lib/apifootball';
import { getCurrentSeason } from '@/lib/season';

export async function GET(req: NextRequest) {
  const leagueId = parseInt(req.nextUrl.searchParams.get('league_id') ?? '39', 10);
  const season   = await getCurrentSeason();

  const data = await getStandings(season, leagueId);
  if (!data?.length) return NextResponse.json(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const standings = (data[0] as any)?.league?.standings?.[0] ?? [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = standings.map((e: any) => ({
    rank:       e.rank,
    team_id:    e.team?.id,
    team_name:  e.team?.name,
    team_logo:  e.team?.logo ?? null,
    played:     e.all?.played   ?? 0,
    win:        e.all?.win      ?? 0,
    draw:       e.all?.draw     ?? 0,
    lose:       e.all?.lose     ?? 0,
    goals_for:  e.all?.goals?.for     ?? 0,
    goals_against: e.all?.goals?.against ?? 0,
    points:     e.points        ?? 0,
    form:       e.form          ?? '',
    description: e.description  ?? null,
  }));

  return NextResponse.json({ season, league_id: leagueId, rows });
}
