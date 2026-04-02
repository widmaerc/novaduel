import 'dotenv/config';

const BASE  = 'https://v3.football.api-sports.io';
const TOKEN = process.env.API_FOOTBALL_KEY!;

async function main() {
  const url = new URL(`${BASE}/players`);
  url.searchParams.set('league', '39');
  url.searchParams.set('season', '2024');
  url.searchParams.set('page',   '1');

  const res  = await fetch(url.toString(), { headers: { 'x-apisports-key': TOKEN } });
  const json = await res.json();

  // Afficher un seul joueur pour voir la structure complète
  console.log(JSON.stringify(json.response?.[0], null, 2));
}

main();
