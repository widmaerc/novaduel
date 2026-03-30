import { NextResponse } from 'next/server';
import { getCurrentSeasons } from '@/lib/sportmonks';

export async function GET() {
  const seasons = await getCurrentSeasons();
  return NextResponse.json({ total: seasons.length, seasons });
}
