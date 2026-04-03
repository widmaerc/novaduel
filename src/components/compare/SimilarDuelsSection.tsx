import { getTranslations } from 'next-intl/server';
import { getSimilarDuels } from '@/lib/compareHelpers';
import { SimilarDuels } from './AIRadarSimilar';

interface Props {
  playerAId: number;
  playerBId: number;
  locale: string;
}

export default async function SimilarDuelsSection({ playerAId, playerBId, locale }: Props) {
  const [t, tc] = await Promise.all([
    getTranslations({ locale, namespace: 'Comparison' }),
    getTranslations({ locale, namespace: 'Common' }),
  ]);

  const duels = await getSimilarDuels(playerAId, playerBId, 4);
  if (!duels?.length) return null;

  return (
    <SimilarDuels
      duels={duels}
      labels={{
        title: t('similar.title'),
        views: tc('units.views'),
      }}
    />
  );
}
