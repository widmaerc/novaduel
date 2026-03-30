import fs from 'fs';
import { config } from 'dotenv';
config({ path: '.env.local' });

async function run() {
  const smToken = process.env.SPORTMONKS_API_KEY;
  if (!smToken) throw new Error("No token");

  const url = `https://api.sportmonks.com/v3/football/fixtures/216268?api_token=${smToken}&include=participants;statistics;state;scores;league`;
  const res = await fetch(url);
  const json = await res.json();
  fs.writeFileSync('output.json', JSON.stringify(json, null, 2));
}

run().catch(console.error);
