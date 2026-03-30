import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sportmonks.com' },
      { protocol: 'https', hostname: 'media.sportmonks.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  experimental: {
    staleTimes: { dynamic: 21600 }, // 6h ISR
  },
};

export default withNextIntl(nextConfig);
