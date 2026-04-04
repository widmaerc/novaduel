import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function toTitle(slug: string) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function Image({ params }: { params: { slug: string } }) {
  const name = toTitle(params.slug);
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return new ImageResponse(
    <div
      style={{
        width: '1200px',
        height: '630px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 65%, #1e40af 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Initials watermark */}
      <div style={{
        position: 'absolute', right: 60, top: '50%',
        transform: 'translateY(-50%)',
        fontSize: 280, fontWeight: 900, opacity: 0.06,
        color: '#ffffff', lineHeight: 1, letterSpacing: '-0.05em',
        display: 'flex',
      }}>
        {initials}
      </div>

      {/* Brand */}
      <div style={{ color: '#60a5fa', fontSize: 22, fontWeight: 700, letterSpacing: '0.15em', marginBottom: 48, textTransform: 'uppercase', display: 'flex' }}>
        ★ NOVADUEL
      </div>

      {/* Player name */}
      <div style={{ color: '#ffffff', fontSize: 88, fontWeight: 900, lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-0.03em', display: 'flex', flexWrap: 'wrap' }}>
        {name}
      </div>

      {/* Subtitle */}
      <div style={{ color: '#93c5fd', fontSize: 26, marginTop: 28, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ display: 'flex' }}>Stats</span>
        <span style={{ color: '#1e40af', display: 'flex' }}>·</span>
        <span style={{ display: 'flex' }}>Analyse IA</span>
        <span style={{ color: '#1e40af', display: 'flex' }}>·</span>
        <span style={{ display: 'flex' }}>Comparaisons</span>
      </div>
    </div>,
    size,
  );
}
