import { NextResponse } from 'next/server';
import { getTopPlayersCurrentSeason } from '@/lib/sportmonks';

export interface TopPlayer {
  rank: number;
  name: string;
  team: string;
  val: number;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalize(entries: any[]): TopPlayer[] {
  return entries.map((e: any, i: number) => ({
    rank: e.position ?? i + 1,
    name: e.player?.display_name ?? e.player?.name ?? '—',
    team: e.participant?.name ?? e.player?.teams?.[0]?.name ?? '—',
    val:  e.total ?? 0,
  }));
}

export async function GET() {
  const data = await getTopPlayersCurrentSeason();
  if (!data) return NextResponse.json(null, { status: 200 });

  const response: TopPlayersResponse = {
    seasonId:         data.seasonId,
    seasonName:       data.seasonName,
    assistSeasonName: data.assistSeasonName,
    scorers:          normalize(data.scorers),
    assisters:        normalize(data.assisters),
    scorersLabel:     data.scorersLabel,
    scorersUnit:      data.scorersUnit,
    assistersLabel:   data.assistersLabel,
    assistersUnit:    data.assistersUnit,
  };

  return NextResponse.json(response);
}
