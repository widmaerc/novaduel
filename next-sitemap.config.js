/** @type {import('next-sitemap').IConfig} */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase credentials for fetching slugs at build-time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://novaduel.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: ['/icon.svg', '/apple-icon.png', '/*/player/not-found'],
  // Avoid indexing generic /compare/[slug] if they aren't in the database
  // But we might want to index them if they are popular.
  // For now, let's focus on players and existing comparisons.
  
  transform: async (config, path) => {
    // Custom priority logic
    let priority = config.priority;
    let changefreq = config.changefreq;

    if (path.includes('/player/')) {
      priority = 0.8;
      changefreq = 'weekly';
    } else if (path.includes('/compare/')) {
      priority = 0.7;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },

  additionalPaths: async (config) => {
    const result = [];
    const locales = ['fr', 'en', 'es'];

    try {
      // 1. Fetch Players
      const { data: players } = await supabase
        .from('players')
        .select('slug, updated_at')
        .limit(1000);

      if (players) {
        players.forEach((p) => {
          locales.forEach((locale) => {
            result.push({
              loc: `/${locale}/player/${p.slug}`,
              changefreq: 'weekly',
              priority: 0.8,
              lastmod: p.updated_at,
            });
          });
        });
      }

      // 2. Fetch Comparisons (Existing/Popular ones)
      const { data: comparisons } = await supabase
        .from('comparisons')
        .select('slug, updated_at')
        .limit(500);

      if (comparisons) {
        comparisons.forEach((c) => {
          locales.forEach((locale) => {
            result.push({
              loc: `/${locale}/compare/${c.slug}`,
              changefreq: 'monthly',
              priority: 0.7,
              lastmod: c.updated_at,
            });
          });
        });
      }
    } catch (e) {
      console.error('Error fetching sitemap paths:', e);
    }

    return result;
  },

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/*?*', // No query parameters (avoid duplicate content)
          '/api/',
          '/*/search',
          '/*/compare/*' // By default, don't crawl random comparisons, only those in sitemap
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/', // Selective blocking of AI crawlers if desired
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://novaduel.com'}/sitemap-0.xml`,
    ],
  },
};
