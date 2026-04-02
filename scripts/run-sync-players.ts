import 'dotenv/config';
import { syncPlayers } from '../src/lib/sync-players';

const start = Date.now();
syncPlayers()
  .then(result => {
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`\n✓ sync-players terminé en ${duration}s`, result);
    process.exit(0);
  })
  .catch(err => {
    console.error('✗ sync-players erreur:', err);
    process.exit(1);
  });
