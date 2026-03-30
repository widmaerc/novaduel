import data from '@/data/fake_editorial_data.json';
import { useTranslations } from 'next-intl';

const { articles: ARTICLES } = data;

const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1508344928928-7165b67de128?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518605368461-1e12d53787b4?q=80&w=2670&auto=format&fit=crop"
];

export default function Editorial() {
  const t = useTranslations('HomePage.editorial');
  const featuredArticle = ARTICLES[0];
  const sideArticles = ARTICLES.slice(1);

  return (
    <section id="editorial" className="max-w-7xl mx-auto w-full px-6 md:px-12 py-12 md:py-16 border-t border-gray-100">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">{t('label')}</div>
          <h2 className="font-hl font-bold text-3xl md:text-5xl text-dark uppercase tracking-tighter">
            {t('title')}
          </h2>
        </div>
        <a href="#" className="inline-flex max-w-max items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest hover:text-dark transition-colors">
          {t('cta')}
          <span className="w-8 h-8 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">→</span>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Featured Article */}
        {featuredArticle && (
          <a href="#" className="group relative rounded-3xl overflow-hidden block aspect-[4/3] md:aspect-auto md:h-full min-h-[400px] editorial-img">
            <img src={MOCK_IMAGES[0]} alt="Article feature" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-primary text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg shadow-blue-600/20">{featuredArticle.tag}</span>
                <span className="text-white/80 text-xs font-bold font-hl">{t('time.two_hours_ago')}</span>
              </div>
              <h3 className="text-white font-hl font-bold text-2xl md:text-4xl mb-3 md:mb-4 leading-tight transition-all duration-300 group-hover:brightness-110">
                <span className="bg-gradient-to-r from-primary to-primary bg-[length:0px_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_2px] pb-1">
                  {featuredArticle.title}
                </span>
              </h3>
              <p className="text-white/80 text-sm md:text-base max-w-xl line-clamp-2 md:line-clamp-none">
                {featuredArticle.excerpt}
              </p>
            </div>
          </a>
        )}

        {/* Sidebar Articles */}
        <div className="flex flex-col gap-6">
          {sideArticles.map((article, idx) => (
            <a key={article.id} href="#" className="group flex flex-col sm:flex-row gap-4 sm:gap-6 p-3 sm:p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
              <div className="w-full sm:w-32 sm:h-32 md:w-40 md:h-40 aspect-video sm:aspect-square shrink-0 rounded-xl overflow-hidden editorial-img border border-gray-100">
                <img src={MOCK_IMAGES[idx + 1] || MOCK_IMAGES[0]} alt="Article thumbnail" className="w-full h-full object-cover transition-transform duration-700" />
              </div>
              <div className="flex flex-col justify-center py-2">
                <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2">{article.tag}</span>
                <h3 className="font-hl font-bold text-lg md:text-xl text-dark mb-2 leading-tight transition-all duration-300 group-hover:text-primary">
                  <span className="bg-gradient-to-r from-primary/60 to-primary/60 bg-[length:0px_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_2px] pb-1">
                    {article.title}
                  </span>
                </h3>
                <span className="text-gray-400 text-xs font-bold font-hl mt-auto">{t('time.yesterday')}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
