import { NextResponse } from 'next/server';
import { getLiveScores } from '@/lib/apifootball';
import { normalize } from './normalize';
// import { readFileSync } from 'fs';
// import { join } from 'path';

// function loadFakeData(): unknown[] {
//   try {
//     const filePath = join(process.cwd(), 'src/data/fake_livescore_data.json');
//     const content = readFileSync(filePath, 'utf-8').trim();
//     if (!content) return [];
//     return JSON.parse(content);
//   } catch {
//     return [];
//   }
// }

// GET /api/livescores — full inplay snapshot via API-Football
export async function GET() {
  const data = await getLiveScores();

  if (!Array.isArray(data) || data.length === 0) return NextResponse.json([]);

  // const raw = Array.isArray(data) && data.length > 0 ? data : loadFakeData();
  return NextResponse.json(normalize(data));
}
