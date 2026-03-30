'use client';
import { useTranslations } from 'next-intl';
import { useBreakpoint } from '@/lib/useBreakpoint';

interface StatsBarProps {
  playersCount?: number;
  leaguesCount?: number;
}

export default function StatsBar({ playersCount = 0, leaguesCount = 0 }: StatsBarProps) {
  const { isMobile } = useBreakpoint();
  const t = useTranslations('HomePage.stats');

  const fmt = (n: number) => n > 0 ? `${n.toLocaleString('fr-FR')}+` : '2 500+';
  const fmtLeagues = (n: number) => n > 0 ? `${n}+` : '48 000+';

  const stats = [
    { value: fmt(playersCount),      label: t('players') },
    { value: fmtLeagues(leaguesCount), label: t('leagues') },
    { value: '3',                    label: t('updates') },
    { value: '100%',                 label: t('accuracy') },
  ];

  return (
    <div style={{ background: '#fff', color: '#191c1d', position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(0,0,0,0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 100%, rgba(0,71,130,.03), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '20px 24px' : '40px 64px', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: isMobile ? 12 : 0, textAlign: 'center', position: 'relative' }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{ padding: isMobile ? 0 : '0 24px', borderRight: (!isMobile && i < stats.length - 1) ? '1px solid rgba(0,0,0,.06)' : 'none' }}>
            <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 900, fontSize: isMobile ? 20 : 36, letterSpacing: -0.5 }}>{s.value}</div>
            <div style={{ fontSize: isMobile ? 9 : 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', opacity: .55, marginTop: isMobile ? 2 : 4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
