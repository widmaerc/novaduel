import { NextResponse } from 'next/server';
import { getLiveScores } from '@/lib/sportmonks';
import { normalize } from './normalize';
import { readFileSync } from 'fs';
import { join } from 'path';

function loadFakeData(): unknown[] {
  try {
    const filePath = join(process.cwd(), 'src/data/fake_livescore_data.json');
    const content = readFileSync(filePath, 'utf-8').trim();
    if (!content) return [];
    return JSON.parse(content);
  } catch {
    return [];
  }
}

// GET /api/livescores — full inplay snapshot (cached 60s in Redis)
// Falls back to fake_livescore_data.json when Sportmonks returns no data (if file exists and is valid)
export async function GET() {
  const data = await getLiveScores();

  // TODO: remove after verifying JSON structure in production
  if (Array.isArray(data) && data.length > 0) {
    console.log('[livescores] raw[0]:', JSON.stringify(data[0], null, 2));
  }

  const raw = Array.isArray(data) && data.length > 0 ? data : loadFakeData();
  return NextResponse.json(normalize(raw));
}
