import React from 'react';

export default function Loading() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 40px', minHeight: '80vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center', marginTop: '40px' }}>
        
        {/* Teams loading skeleton */}
        <div style={{ width: '100%', maxWidth: '800px', height: '180px', borderRadius: '24px', background: '#f3f4f5', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', animation: 'shimmer 1.5s infinite' }} />
        </div>

        {/* Details skeleton */}
        <div style={{ width: '100%', maxWidth: '600px', height: '120px', borderRadius: '16px', background: '#f3f4f5', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', animation: 'shimmer 1.5s infinite' }} />
        </div>

      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
