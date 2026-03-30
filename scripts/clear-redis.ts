import { config } from 'dotenv';
config({ path: '.env.local' });
import { redis } from '../src/lib/redis';

async function clear() {
  console.log('Flushing Redis DB...');
  try {
    await redis.flushdb();
    console.log('Redis cleared successfully! All cached players and comparisons have been deleted.');
  } catch (error) {
    console.error('Failed to clear Redis:', error);
  } finally {
    process.exit(0);
  }
}

clear();
