import 'dotenv/config';

const BASE  = 'https://v3.football.api-sports.io';
const TOKEN = process.env.API_FOOTBALL_KEY!;

async function check(season: number) {
  const url = new URL(`${BASE}/players`);
  url.searchParams.set('league', '39');
  url.searchParams.set('season', String(season));
  url.searchParams.set('page', '1');
  const res  = await fetch(url.toString(), { headers: { 'x-apisports-key': TOKEN } });
  const json = await res.json();
  const first = json.response?.[0];
  const apps  = first?.statistics?.[0]?.games?.appearences;
  console.log(`season ${season} → ${json.results} joueurs p1, errors:`, json.errors, '| 1er joueur:', first?.player?.name, '| appearences:', apps);
}

async function main() {
  await check(2023);
  await check(2024);
  await check(2025);
}

main();
