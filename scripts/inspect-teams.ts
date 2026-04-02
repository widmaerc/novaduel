import 'dotenv/config';

const BASE  = 'https://v3.football.api-sports.io';
const TOKEN = process.env.API_FOOTBALL_KEY!;

async function main() {
  const url = new URL(`${BASE}/teams`);
  url.searchParams.set('league', '39');
  url.searchParams.set('season', '2024');

  const res  = await fetch(url.toString(), { headers: { 'x-apisports-key': TOKEN } });
  const json = await res.json();

  // Afficher les champs majeurs de 3 équipes
  for (const entry of (json.response ?? []).slice(0, 3)) {
    console.log({
      team_id:      entry.team.id,
      team_name:    entry.team.name,
      team_code:    entry.team.code,
      team_country: entry.team.country,
      team_founded: entry.team.founded,
      team_national:entry.team.national,
      team_logo:    entry.team.logo,
      venue_id:     entry.venue.id,
      venue_name:   entry.venue.name,
      venue_city:   entry.venue.city,
      venue_country:entry.venue.country,
      venue_capacity: entry.venue.capacity,
      venue_surface:entry.venue.surface,
    });
    console.log('---');
  }
}

main();
