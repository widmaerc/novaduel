import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildAlternates } from '@/lib/hreflang';
import PlayersPageClient from './PlayersPageClient';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'PlayersPage' });

  const descriptions: Record<string, string> = {
    fr: 'Parcourez et comparez les joueurs de football des meilleures ligues mondiales. Statistiques avancées, notes, buts, passes décisives et analyse IA.',
    en: 'Browse and compare football players from the top leagues worldwide. Advanced stats, ratings, goals, assists and AI analysis.',
    es: 'Explora y compara jugadores de fútbol de las mejores ligas del mundo. Estadísticas avanzadas, valoraciones, goles, asistencias y análisis de IA.',
  };

  return {
    title: t('title'),
    description: descriptions[locale] ?? descriptions.en,
    alternates: buildAlternates('/players', locale),
  };
}

export default function PlayersPage() {
  return <PlayersPageClient />;
}
