import { NextRequest, NextResponse } from 'next/server';
import { getSeasons } from '@/lib/sportmonks';

export async function GET(req: NextRequest) {
  const current = req.nextUrl.searchParams.get('current') === '1';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await getSeasons(current) as any[] | null;
  if (!Array.isArray(data)) return NextResponse.json({ total: 0, seasons: [] });

  return NextResponse.json({ total: data.length, seasons: data });
}
