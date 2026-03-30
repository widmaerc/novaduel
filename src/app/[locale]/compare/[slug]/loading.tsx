import { useTranslations } from 'next-intl';

export default function CompareLoading() {
  const t = useTranslations('result');

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
        <section style={{ padding: '60px 0', borderBottom: '1px solid rgba(194,198,210,.2)', marginBottom: '40px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div className="skeleton" style={{ height: '32px', width: '200px', borderRadius: '100px' }}></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '40px', alignItems: 'center', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Player A Skeleton */}
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div className="skeleton" style={{ height: '20px', width: '120px', marginBottom: '10px' }}></div>
              <div className="skeleton" style={{ height: '60px', width: '250px', marginBottom: '8px' }}></div>
              <div className="skeleton" style={{ height: '40px', width: '80px', borderRadius: '14px' }}></div>
            </div>

            {/* VS Symbol Skeleton */}
            <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%' }}></div>
            </div>

            {/* Player B Skeleton */}
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
               <div className="skeleton" style={{ height: '20px', width: '120px', marginBottom: '10px' }}></div>
              <div className="skeleton" style={{ height: '60px', width: '250px', marginBottom: '8px' }}></div>
              <div className="skeleton" style={{ height: '40px', width: '80px', borderRadius: '14px' }}></div>
            </div>
          </div>

        </section>

        {/* Verdict Cards Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '40px' }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '16px' }}></div>
          ))}
        </div>

        {/* Main Compare Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: '30px' }}>
          <div className="skeleton" style={{ height: '600px', borderRadius: '24px' }}></div>
          <div className="skeleton" style={{ height: '400px', borderRadius: '24px' }}></div>
        </div>

      </main>
    </>
  );
}
