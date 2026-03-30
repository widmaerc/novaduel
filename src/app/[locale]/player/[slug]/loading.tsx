import { useTranslations } from 'next-intl';

export default function PlayerLoading() {
  const t = useTranslations('player');

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        .skeleton {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          background-color: #e1e3e4;
          border-radius: 8px;
        }
      `}</style>
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 40px 80px' }}>
        <section style={{ position: 'relative', display: 'grid', gridTemplateColumns: '420px 1fr', gap: '40px', alignItems: 'flex-end', padding: '36px 0 40px', borderBottom: '1px solid rgba(194,198,210,.2)', marginBottom: '40px' }}>
          {/* Left image skeleton */}
          <div>
            <div className="skeleton" style={{ height: '20px', width: '200px', marginBottom: '20px' }}></div>
            <div className="skeleton" style={{ height: '480px', width: '100%', borderRadius: '16px' }}></div>
          </div>
          {/* Right info skeleton */}
          <div style={{ paddingBottom: '12px' }}>
            <div className="skeleton" style={{ height: '24px', width: '250px', marginBottom: '16px', borderRadius: '100px' }}></div>
            <div className="skeleton" style={{ height: '80px', width: '70%', marginBottom: '8px' }}></div>
            <div className="skeleton" style={{ height: '80px', width: '50%', marginBottom: '8px' }}></div>
            <div className="skeleton" style={{ height: '20px', width: '30%', marginBottom: '28px' }}></div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', background: '#f3f4f5', borderRadius: '14px', padding: '20px', marginBottom: '28px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i}>
                  <div className="skeleton" style={{ height: '12px', width: '60%', marginBottom: '8px' }}></div>
                  <div className="skeleton" style={{ height: '20px', width: '80%' }}></div>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="skeleton" style={{ height: '44px', width: '160px', borderRadius: '100px' }}></div>
              <div className="skeleton" style={{ height: '44px', width: '120px', borderRadius: '100px' }}></div>
              <div className="skeleton" style={{ height: '44px', width: '120px', borderRadius: '100px' }}></div>
            </div>
          </div>
        </section>
        
        {/* Bento skeleton grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 280px', gap: '20px' }}>
          <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }}></div>
          <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }}></div>
          <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }}></div>
        </div>
      </main>
    </>
  );
}
