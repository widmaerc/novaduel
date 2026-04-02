import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentSeason } from '@/lib/season';
import { buildSlug, makeInitials, displayName as mkDisplay } from '@/lib/data';

export async function GET(req: NextRequest) {
  const limit    = parseInt(req.nextUrl.searchParams.get('limit') ?? '10', 10);
  const leagueId = req.nextUrl.searchParams.get('league_id')
    ? parseInt(req.nextUrl.searchParams.get('league_id')!, 10)
    : null;

  const season = await getCurrentSeason();

  const { data } = await supabaseAdmin
    .from('dn_players')
    .select('id, name, firstname, lastname, photo, statistics')
    .eq('season', season)
    .limit(500);

  if (!data?.length) return NextResponse.json([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const players = (data as any[])
    .flatMap((p: any) => {
      const stats: any[] = p.statistics ?? [];
      return stats
        .filter((s: any) => {
          if (!s.games?.rating) return false;
          if (leagueId && s.league?.id !== leagueId) return false;
          return (s.games?.appearences ?? 0) >= 5; // min 5 matchs pour être significatif
        })
        .map((s: any) => ({
          id:           p.id,
          slug:         buildSlug(p.name, p.id, p.firstname, p.lastname),
          name:         mkDisplay(p.name, p.firstname, p.lastname),
          initials:     makeInitials(p.name, p.firstname, p.lastname),
          photo:        p.photo ?? null,
          team:         s.team?.name        ?? '—',
          team_id:      s.team?.id          ?? null,
          team_logo:    s.team?.logo        ?? null,
          league:       s.league?.name      ?? '—',
          matches:      s.games?.appearences ?? 0,
          goals:        s.goals?.total       ?? 0,
          assists:      s.goals?.assists     ?? 0,
          rating:       parseFloat(s.games.rating) || 0,
        }));
    })
    .sort((a: any, b: any) => b.rating - a.rating)
    .filter((p: any, i: number, arr: any[]) => arr.findIndex(x => x.id === p.id) === i) // dédoublonner
    .slice(0, limit);

  return NextResponse.json(players);
}
