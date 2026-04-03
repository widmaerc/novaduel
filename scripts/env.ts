import { config } from 'dotenv';
import path from 'path';

// Charge .env.local (standard Next.js) puis .env
config({ path: path.resolve(process.cwd(), '.env.local') });
config();
