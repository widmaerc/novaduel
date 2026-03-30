import { config } from 'dotenv';
import path from 'path';
config({ path: path.join(__dirname, '../.env.local') });
import { searchPlayers } from '../src/lib/sportmonks';

async function test() {
  console.log('Testing search API...');
  try {
    const r1 = await searchPlayers('kolo habib tour');
    console.log('Results for kolo habib tour:', JSON.stringify(r1, null, 2));

    const r2 = await searchPlayers('niko kranjar');
    console.log('Results for niko kranjar:', JSON.stringify(r2, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
