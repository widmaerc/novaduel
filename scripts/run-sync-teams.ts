import 'dotenv/config';
import { syncTeams } from '../src/lib/sync-teams';

const start = Date.now();
syncTeams()
  .then(result => {
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`\n✓ sync-teams terminé en ${duration}s`, result);
    process.exit(0);
  })
  .catch(err => {
    console.error('✗ sync-teams erreur:', err);
    process.exit(1);
  });
