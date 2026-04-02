import { NextRequest, NextResponse } from 'next/server';
import { getTopScorers, getTopAssists } from '@/lib/apifootball';
import { supabaseAdmin } from '@/lib/supabase';
import { buildSlug, slugify, makeInitials, displayName as mkDisplay } from '@/lib/data';
import { getCurrentSeason } from '@/lib/season';

// Maps API-Football league name to id — doit correspondre aux ligues dans sync.ts
const LEAGUE_IDS: Record<string, number> = {
  '61':  61,  // Ligue 1
  '39':  39,  // Premier League
  '140': 140, // La Liga
  '135': 135, // Serie A
  '78':  78,  // Bundesliga
  '253': 253, // MLS
  '307': 307, // Saudi Pro League
  '2':   2,   // Champions League
  '3':   3,   // Europa League
};

export async function GET(req: NextRequest) {
  const leagueParam = req.nextUrl.searchParams.get('league_id');
  const type = req.nextUrl.searchParams.get('type') === 'assists' ? 'assists' : 'goals';

  const leagueId = leagueParam ? (LEAGUE_IDS[leagueParam] ?? parseInt(leagueParam, 10)) : 61;
  const season = await getCurrentSeason();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await (type === 'assists'
    ? getTopAssists(leagueId, season)
    : getTopScorers(leagueId, season)
  ) as any[] | null;

  if (!Array.isArray(data) || data.length === 0) return NextResponse.json([]);

  // Lookup slugs en BD
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const afIds = data.map((e: any) => e.player?.id).filter(Boolean);
  const slugMap:       Record<number, string> = {};
  const initialsMap:   Record<number, string> = {};
  const displayNameMap: Record<number, string> = {};

  if (afIds.length > 0) {
    const { data: players } = await supabaseAdmin
      .from('dn_players')
      .select('id, name, firstname, lastname')
      .in('id', afIds);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (players ?? []).forEach((p: any) => {
      slugMap[p.id]        = buildSlug(p.name, p.id, p.firstname, p.lastname);
      initialsMap[p.id]    = makeInitials(p.name, p.firstname, p.lastname);
      displayNameMap[p.id] = mkDisplay(p.name, p.firstname, p.lastname);
    });
  }

  const scorers = data.map((e: any, i: number) => {
    const afName = e.player?.name ?? '—';
    const name   = displayNameMap[e.player?.id] ?? afName;
    const val  = type === 'assists'
      ? (e.statistics?.[0]?.goals?.assists ?? 0)
      : (e.statistics?.[0]?.goals?.total   ?? 0);
    return {
      rank:     i + 1,
      name,
      team:     e.statistics?.[0]?.team?.name ?? '—',
      goals:    val,
      initials: initialsMap[e.player?.id] ?? makeInitials(afName),
      slug:     slugMap[e.player?.id] ?? (slugify(afName) || `player-${e.player?.id ?? '0'}`),
    };
  });

  // Format identique à l'ancien pour compatibilité avec le front
  return NextResponse.json([{
    season: { id: season, name: `${season}/${season + 1}`, league_id: leagueId },
    scorers,
  }]);
}
