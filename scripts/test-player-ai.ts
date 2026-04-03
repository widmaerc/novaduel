import './env';
import fs from 'fs';
import path from 'path';
import { getPlayerBySlug } from '../src/lib/data';
import { generatePlayerAnalysis } from '../src/lib/claude';

async function main() {
  const slug = process.argv[2] || 'denis-bouanga';
  const locale = process.argv[3] || 'fr';
  
  console.log(`[TEST] Locale: ${locale}`);
  console.log(`[TEST] Fetching player: ${slug}...`);
  
  try {
    const player = await getPlayerBySlug(slug, locale);
    
    if (!player) {
      console.error('Player not found in database.');
      process.exit(1);
    }

    console.log(`[TEST] Player found: ${player.name} (Rating: ${player.rating})`);
    console.log(`[TEST] Starting AI generation (Claude 4.5 Haiku)...`);
    
    const start = Date.now();
    const analysis = await generatePlayerAnalysis(player, locale);
    const duration = (Date.now() - start) / 1000;

    const result = {
      player: { name: player.name, id: player.id },
      duration,
      analysis
    };

    const outPath = path.join(process.cwd(), 'analysis.json');
    fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
    console.log(`[TEST] Result:`, JSON.stringify(analysis, null, 2));
    console.log(`[TEST] Result written to ${outPath}`);
    console.log(`[TEST] Duration: ${duration.toFixed(2)}s`);

  } catch (error) {
    console.error('[TEST] Error during test:', error);
  } finally {
    process.exit(0);
  }
}

main();
