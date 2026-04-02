import { NextResponse } from 'next/server';
import { getTopScorers, getTopAssists } from '@/lib/apifootball';
import { getCurrentSeason } from '@/lib/season';

// Ligue 1 par défaut pour les top players
const DEFAULT_LEAGUE = 61;

export interface TopPlayer {
  rank: number;
  name: string;
  team: string;
  val:  number;
}

export interface TopPlayersResponse {
  seasonId:         number;
  seasonName:       string;
  assistSeasonName: string;
  scorers:          TopPlayer[];
  assisters:        TopPlayer[];
  scorersLabel:     string;
  scorersUnit:      string;
  assistersLabel:   string;
  assistersUnit:    string;
}

export async function GET() {
  const season = await getCurrentSeason();
  const [scorersRaw, assistsRaw] = await Promise.all([
    getTopScorers(DEFAULT_LEAGUE, season),
    getTopAssists(DEFAULT_LEAGUE, season),
  ]);

  if (!scorersRaw?.length && !assistsRaw?.length) return NextResponse.json(null, { status: 200 });

  const seasonName = `${season}/${season + 1}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapEntry = (e: any, i: number, isAssists: boolean): TopPlayer => ({
    rank: i + 1,
    name: e.player?.name ?? '—',
    team: e.statistics?.[0]?.team?.name ?? '—',
    val:  isAssists
      ? (e.statistics?.[0]?.goals?.assists ?? 0)
      : (e.statistics?.[0]?.goals?.total   ?? 0),
  });

  const response: TopPlayersResponse = {
    seasonId:         season,
    seasonName,
    assistSeasonName: seasonName,
    scorers:          (scorersRaw ?? []).slice(0, 5).map((e, i) => mapEntry(e, i, false)),
    assisters:        (assistsRaw ?? []).slice(0, 5).map((e, i) => mapEntry(e, i, true)),
    scorersLabel:     'Top Scorers',
    scorersUnit:      'buts',
    assistersLabel:   'Top Passeurs',
    assistersUnit:    'passes',
  };

  return NextResponse.json(response);
}
