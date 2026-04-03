import { syncPlayers } from '../src/lib/sync-players';
import * as dotenv from 'dotenv';

// Load env
dotenv.config({ path: '.env.local' });

async function runTest() {
  console.log('🚀 Démarrage du test de synchronisation...');
  try {
    const result = await syncPlayers();
    console.log('✅ Synchronisation terminée avec succès !');
    console.dir(result, { depth: null });
  } catch (error) {
    console.error('❌ Erreur pendant la synchronisation :', error);
  }
}

runTest();
