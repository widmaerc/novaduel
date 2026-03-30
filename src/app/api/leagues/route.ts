import { NextResponse } from 'next/server';
import { getLeagues } from '@/lib/sportmonks';

export interface League {
  id:            number;
  name:          string;
  short_code:    string;
  image_path:    string;
  type:          string;
  sub_type:      string;
  active:        boolean;
  category:      number;
  last_played_at: string;
}

export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await getLeagues() as any[] | null;
  if (!Array.isArray(data)) return NextResponse.json([]);

  const leagues: League[] = data.map(l => ({
    id:             l.id,
    name:           l.name,
    short_code:     l.short_code ?? '',
    image_path:     l.image_path ?? '',
    type:           l.type ?? '',
    sub_type:       l.sub_type ?? '',
    active:         l.active ?? false,
    category:       l.category ?? 0,
    last_played_at: l.last_played_at ?? '',
  }));

  return NextResponse.json(leagues);
}
