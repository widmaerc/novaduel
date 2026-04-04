import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import { Manrope, Inter } from 'next/font/google';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import '../globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'NovaDuel — Football Player Comparison & AI Analysis', template: '%s | NovaDuel' },
  description: 'Compare football players with advanced stats, goals, assists, ratings and AI insights. Premier League, Liga, Bundesliga, Ligue 1, Serie A and more.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://novaduel.com'),
  openGraph: {
    type: 'website',
    siteName: 'NovaDuel',
    title: 'NovaDuel — Football Player Comparison & AI Analysis',
    description: 'Compare football players with advanced stats, goals, assists, ratings and AI insights. Premier League, Liga, Bundesliga, Ligue 1, Serie A and more.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'NovaDuel Football Analytics' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@novaduel',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${manrope.variable} ${inter.variable}`} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" />
      </head>
      <body className="bg-[#f8f9fa] text-[#191c1d] antialiased overflow-x-hidden min-h-screen" style={{ margin: 0 }}>
        <NextIntlClientProvider messages={messages}>
          <Nav locale={locale} />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
