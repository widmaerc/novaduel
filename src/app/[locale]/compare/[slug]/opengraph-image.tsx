import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function toTitle(slug: string) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function Image({ params }: { params: { slug: string } }) {
  const parts = params.slug.split('-vs-');
  const nameA = toTitle(parts[0] ?? '');
  const nameB = toTitle(parts[1] ?? '');

  return new ImageResponse(
    <div
      style={{
        width: '1200px',
        height: '630px',
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 80px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Left gradient */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '45%',
        background: 'linear-gradient(135deg, #1e3a8a, #1e40af)',
        display: 'flex',
      }} />
      {/* Right gradient */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%',
        background: 'linear-gradient(225deg, #7c2d12, #b91c1c)',
        display: 'flex',
      }} />

      {/* Brand */}
      <div style={{ position: 'absolute', top: 36, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <span style={{ color: '#60a5fa', fontSize: 20, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>★ NOVADUEL</span>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        {/* Player A */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', paddingRight: 40 }}>
          <div style={{ color: '#ffffff', fontSize: 60, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.03em', textAlign: 'right', display: 'flex', lineHeight: 1 }}>
            {nameA}
          </div>
        </div>

        {/* VS badge */}
        <div style={{
          width: 80, height: 80, borderRadius: 40,
          background: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ color: '#0f172a', fontSize: 22, fontWeight: 900, letterSpacing: '0.05em', display: 'flex' }}>VS</span>
        </div>

        {/* Player B */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', paddingLeft: 40 }}>
          <div style={{ color: '#ffffff', fontSize: 60, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.03em', display: 'flex', lineHeight: 1 }}>
            {nameB}
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <div style={{ position: 'absolute', bottom: 40, display: 'flex', color: '#94a3b8', fontSize: 20, fontWeight: 600, letterSpacing: '0.05em' }}>
        Statistiques · Radar · Analyse IA
      </div>
    </div>,
    size,
  );
}
