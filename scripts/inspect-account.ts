import 'dotenv/config';

const BASE  = 'https://v3.football.api-sports.io';
const TOKEN = process.env.API_FOOTBALL_KEY!;

async function main() {
  const res  = await fetch(`${BASE}/status`, { headers: { 'x-apisports-key': TOKEN } });
  const json = await res.json();
  console.log(JSON.stringify(json.response, null, 2));
}

main();
