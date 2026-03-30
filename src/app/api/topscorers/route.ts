import { NextRequest, NextResponse } from 'next/server';
import { getTopScorersCurrentSeason } from '@/lib/sportmonks';
import { supabaseAdmin } from '@/lib/supabase';

function slugify(name: string): string {
  return (name ?? '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function GET(req: NextRequest) {
  const leagueId = req.nextUrl.searchParams.get('league_id');
  const type = req.nextUrl.searchParams.get('type') === 'assists' ? 'assists' : 'goals';
  const data = await getTopScorersCurrentSeason(leagueId ? Number(leagueId) : undefined, type);
  if (!Array.isArray(data)) return NextResponse.json([]);

  // Collect all Sportmonks player IDs to batch-lookup slugs in Supabase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sportmonksIds = data.flatMap((entry: any) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entry.scorers.map((s: any) => s.player?.id).filter(Boolean)
  );

  const slugMap: Record<number, string> = {};
  if (sportmonksIds.length > 0) {
    const { data: players } = await supabaseAdmin
      .from('players')
      .select('sportmonks_id, slug')
      .in('sportmonks_id', sportmonksIds);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (players ?? []).forEach((p: any) => { slugMap[p.sportmonks_id] = p.slug; });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = data.map((entry: any) => ({
    season: {
      id:          entry.season.id,
      name:        entry.season.name,
      league_id:   entry.season.league_id,
      starting_at: entry.season.starting_at,
      ending_at:   entry.season.ending_at,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    scorers: entry.scorers.map((s: any) => {
      const name = s.player?.display_name ?? s.player?.name ?? '—'
      return {
        rank:  s.position ?? 0,
        name,
        team:  s.participant?.name ?? '—',
        goals: s.total ?? 0,
        slug:  slugMap[s.player?.id] ?? slugify(name),
      }
    }),
  }));

  return NextResponse.json(response);
}
