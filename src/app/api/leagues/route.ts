import { NextResponse } from 'next/server';
import { getLeagues } from '@/lib/apifootball';

export interface League {
  id:         number;
  name:       string;
  image_path: string;
  type:       string;
  country:    string;
  active:     boolean;
}

// Uniquement les ligues synchronisées (sync-teams.ts / sync.ts)
const MAJOR_LEAGUE_IDS = [61, 39, 140, 135, 78, 253, 307, 2, 3];

export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await getLeagues() as any[] | null;
  if (!Array.isArray(data)) return NextResponse.json([]);

  const leagues: League[] = data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((l: any) => MAJOR_LEAGUE_IDS.includes(l.league?.id ?? l.id))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((l: any) => ({
      id:         l.league?.id ?? l.id,
      name:       l.league?.name ?? l.name ?? '',
      image_path: l.league?.logo ?? '',
      type:       l.league?.type ?? '',
      country:    l.country?.name ?? l.league?.country ?? '',
      active:     l.seasons?.some((s: any) => s.current) ?? false,
    }))
    // Trier dans l'ordre de MAJOR_LEAGUE_IDS
    .sort((a: League, b: League) =>
      MAJOR_LEAGUE_IDS.indexOf(a.id) - MAJOR_LEAGUE_IDS.indexOf(b.id)
    );

  return NextResponse.json(leagues);
}
