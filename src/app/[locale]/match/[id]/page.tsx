import { getMatchData } from '@/lib/data';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ locale: string, id: string }> }) {
  const { id } = await params;
  const match = await getMatchData(parseInt(id));
  if (!match) {
    return { title: 'Détails du Match | NovaDuel' };
  }
  return {
    title: `${match.name} | NovaDuel`,
    description: `Statistiques du match ${match.name} en ${match.league}`,
  };
}

export default async function MatchPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id, locale } = await params;
  const matchId = parseInt(id);

  if (isNaN(matchId)) {
    return <NotFoundMessage msg="Match ID invalide" />;
  }

  const match = await getMatchData(matchId);

  if (!match) {
    return <NotFoundMessage msg="Match introuvable ou non disponible." />;
  }

  const t1 = match.team1;
  const t2 = match.team2;

  // We should safely format date
  const matchDate = match.date ? new Date(match.date).toLocaleString(locale, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : 'Date inconnue';

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .m-header { animation: fadeUp 0.6s ease both; }
        .m-info { animation: fadeUp 0.6s 0.1s ease both; }
        .team-box { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
        .team-logo { width: 120px; height: 120px; object-fit: contain; margin-bottom: 24px; filter: drop-shadow(0 12px 24px rgba(0,0,0,0.15)); }
        .team-name { font-family: var(--font-manrope), sans-serif; font-weight: 900; font-size: 28px; color: #191c1d; letter-spacing: -0.5px; }
        .score-box { background: #004782; color: #fff; padding: 12px 24px; border-radius: 100px; font-family: var(--font-manrope), sans-serif; font-weight: 900; font-size: 32px; display: inline-block; box-shadow: 0 8px 32px rgba(0,71,130,0.3); }
        .status-badge { display: inline-block; background: rgba(146,0,15,0.1); color: #92000f; font-family: var(--font-manrope), sans-serif; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; padding: 6px 14px; border-radius: 100px; margin-bottom: 16px; }
        
        @media(max-width: 768px) {
          .team-logo { width: 80px; height: 80px; }
          .team-name { font-size: 20px; }
          .score-box { font-size: 24px; padding: 8px 16px; }
        }
      `}</style>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 40px', minHeight: '80vh' }}>
        <Link 
          href={`/${locale}`} 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#727782', fontSize: '14px', textDecoration: 'none', marginBottom: '40px', fontWeight: 600 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Retour à l'accueil
        </Link>

        {/* Header Match */}
        <section className="m-header" style={{ position: 'relative', background: 'linear-gradient(135deg, #f3f4f5, #e7e8e9)', borderRadius: '32px', padding: '60px 40px', border: '1px solid rgba(194,198,210,0.4)', overflow: 'hidden' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
             <div className="status-badge">{match.status}</div>
             <div style={{ fontSize: '15px', color: '#727782', fontWeight: 500 }}>{matchDate} • {match.league}</div>
             {match.result_info && <div style={{ fontSize: '14px', color: '#191c1d', marginTop: '8px', fontWeight: 600 }}>{match.result_info}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)', gap: '40px', alignItems: 'center' }}>
            {/* Team A */}
            <div className="team-box">
              {t1.image ? <img src={t1.image} alt={t1.name} className="team-logo" /> : <div className="team-logo" style={{ background: '#ddd', borderRadius: '50%' }} />}
              <div className="team-name">{t1.name}</div>
            </div>

            {/* Middle Score / VS */}
            <div style={{ textAlign: 'center' }}>
              {(t1.score !== null && t2.score !== null) ? (
                <div className="score-box">
                  {t1.score} - {t2.score}
                </div>
              ) : (
                <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 900, fontSize: '28px', color: '#c2c6d2', fontStyle: 'italic' }}>
                  VS
                </div>
              )}
            </div>

            {/* Team B */}
            <div className="team-box">
              {t2.image ? <img src={t2.image} alt={t2.name} className="team-logo" /> : <div className="team-logo" style={{ background: '#ddd', borderRadius: '50%' }} />}
              <div className="team-name">{t2.name}</div>
            </div>
          </div>
        </section>

        {/* Insights Section */}
        <section className="m-info" style={{ marginTop: '40px' }}>
           <div style={{ background: '#fff', borderRadius: '24px', padding: '40px', border: '1px solid rgba(194,198,210,0.3)', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(0,71,130,0.06)', borderRadius: '100px', padding: '6px 16px', marginBottom: '24px' }}>
                <span className="material-symbols-outlined" style={{ color: '#004782', fontSize: '18px' }}>info</span>
                <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#004782', letterSpacing: '0.08em' }}>Infos Supplémentaires</span>
              </div>
              <p style={{ color: '#424751', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto' }}>
                Le plan d'abonnement API restreint l'accès aux statistiques détaillées en temps réel (possession, tirs) pour cette rencontre. 
              </p>
           </div>
        </section>

      </div>
    </>
  );
}

function NotFoundMessage({ msg }: { msg: string }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px' }}>
      <div style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: '48px', fontWeight: 900, color: '#191c1d', marginBottom: '16px' }}>404</div>
      <div style={{ color: '#727782', fontSize: '18px', marginBottom: '32px' }}>{msg}</div>
      <Link href="/" style={{ background: '#004782', color: '#fff', padding: '12px 28px', borderRadius: '100px', fontWeight: 800, textDecoration: 'none' }}>
        Retour
      </Link>
    </div>
  );
}
