import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ClockIcon, ArrowRightIcon } from '../components/CustomIcons';
import { fetchNews, fetchMarketIndices, fetchCryptoOverview, type NewsArticle as ApiNewsArticle, type MarketIndex, type CryptoAsset } from '../services/api';
import { useGeoCurrency } from '../hooks/useGeoCurrency';

gsap.registerPlugin(ScrollTrigger);

type NewsCategory = 'All' | 'Market Analysis' | 'Company News' | 'Economic Indicators' | 'Sector Performance' | 'Global Markets' | 'Investment Strategies' | 'Fed Policy' | 'Earnings' | 'Economic Data' | 'Crypto';

interface NewsArticle {
  id: number;
  headline: string;
  excerpt: string;
  date: string;
  category: string;
  featured?: boolean;
  articleSlug?: string;
  thumbnail?: string;
}

function generateSparkline(base: number, points: number, vol: number) {
  const data: { v: number }[] = [];
  let val = base;
  for (let i = 0; i < points; i++) {
    val = val * (1 + (Math.random() - 0.48) * vol);
    data.push({ v: Math.round(val * 100) / 100 });
  }
  return data;
}

const newsCategories: NewsCategory[] = ['All', 'Market Analysis', 'Company News', 'Economic Indicators', 'Sector Performance', 'Global Markets', 'Investment Strategies', 'Fed Policy', 'Earnings', 'Economic Data', 'Crypto'];

function CategoryBadge({ category }: { category: string }) {
  const styles: Record<string, string> = {
    'Market Analysis': 'bg-emerald/20 text-emerald border-emerald/30',
    'Company News': 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    'Economic Indicators': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Sector Performance': 'bg-lime-500/20 text-lime-400 border-lime-500/30',
    'Global Markets': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    'Investment Strategies': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
    'Economic Data': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Earnings': 'bg-chartblue/20 text-chartblue border-chartblue/30',
    'Fed Policy': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Crypto': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Education': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-mono rounded border ${styles[category] || 'bg-slategray/20 text-slategray border-slategray/30'}`}>
      {category}
    </span>
  );
}

/* ── Generated article types ── */
interface GeneratedArticleSummary {
  id: string;
  type: string;
  title: string;
  slug: string;
  date: string;
  displayDate: string;
  category: string;
  tags: string[];
  metaDescription: string;
  excerpt: string;
  image: { src: string; alt: string };
  readingTime: number;
}

type InsightsTab = 'All' | 'Market Analysis' | 'Company News' | 'Economic Indicators' | 'Sector Performance' | 'Global Markets' | 'Investment Strategies' | 'Fed Policy' | 'Earnings' | 'Economic Data' | 'Crypto' | 'Education';
const insightsTabs: InsightsTab[] = ['All', 'Market Analysis', 'Company News', 'Fed Policy', 'Earnings', 'Economic Data', 'Crypto', 'Education'];

export default function News() {
  const { formatLocalShort } = useGeoCurrency();
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [marketCharts, setMarketCharts] = useState<{ title: string; value: string; change: string; up: boolean; data: { v: number }[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('All');
  const [generatedArticles, setGeneratedArticles] = useState<GeneratedArticleSummary[]>([]);
  const [activeInsightsTab, setActiveInsightsTab] = useState<InsightsTab>('All');
  const sectionRef = useRef<HTMLDivElement>(null);

  // Fetch generated articles from JSON
  useEffect(() => {
    fetch('/data/articles/index.json')
      .then((res) => res.json())
      .then((data: GeneratedArticleSummary[]) => setGeneratedArticles(data))
      .catch(() => {/* silently fail — section simply won't render */});
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [newsData, indicesData, cryptoData] = await Promise.all([
          fetchNews(),
          fetchMarketIndices(),
          fetchCryptoOverview(),
        ]);

        // Map API news articles to component format
        setNewsArticles(newsData.map((a: ApiNewsArticle) => ({
          id: a.id,
          headline: a.headline,
          excerpt: a.excerpt,
          date: a.date,
          category: a.category,
          featured: a.featured,
          articleSlug: a.articleSlug,
          thumbnail: a.thumbnail,
        })));

        // Build market charts from indices + crypto data
        const charts: { title: string; value: string; change: string; up: boolean; data: { v: number }[] }[] = [];

        // Map market indices
        indicesData.slice(0, 4).forEach((idx: MarketIndex) => {
          charts.push({
            title: idx.name,
            value: idx.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            change: `${idx.changePercent >= 0 ? '+' : ''}${idx.changePercent.toFixed(2)}%`,
            up: idx.changePercent >= 0,
            data: idx.sparkline.length > 0 ? idx.sparkline.map((v: number) => ({ v })) : generateSparkline(idx.value, 20, 0.008),
          });
        });

        // Add BTC from crypto overview
        const btc = cryptoData.find((c: CryptoAsset) => c.ticker === 'BTC');
        if (btc) {
          charts.push({
            title: 'BTC/USD',
            value: formatLocalShort(btc.price),
            change: `${btc.change24h >= 0 ? '+' : ''}${btc.change24h.toFixed(1)}%`,
            up: btc.change24h >= 0,
            data: btc.sparkline.length > 0 ? btc.sparkline.map((v: number) => ({ v })) : generateSparkline(btc.price, 20, 0.015),
          });
        }

        setMarketCharts(charts);
      } catch (e) {
        console.warn('News: failed to load data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    // Small delay to let DOM settle after SPA navigation, then refresh ScrollTrigger
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.news-section',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 90%',
          },
        }
      );
    }, sectionRef);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, []);

  const featured = newsArticles.find((a) => a.featured);
  const filtered = useMemo(() => {
    const nonFeatured = newsArticles.filter((a) => !a.featured);
    if (activeCategory === 'All') return nonFeatured;
    return nonFeatured.filter((a) => a.category === activeCategory);
  }, [newsArticles, activeCategory]);

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="news-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite mb-2">
          Market News
          {loading && <span className="ml-2 w-2 h-2 bg-emerald rounded-full animate-pulse inline-block align-middle" />}
        </h1>
        <p className="text-slategray max-w-xl">
          Stay informed with the latest market developments and analysis
        </p>
      </section>

      {/* Featured Article */}
      {featured && (
        <section className="news-section max-w-7xl mx-auto px-6 pb-8">
          <Link to={featured.articleSlug ? `/news/article/${featured.articleSlug}` : `/news/${featured.id}`} className="block">
            <div className="relative rounded-xl overflow-hidden min-h-[320px] md:min-h-[400px] bg-gradient-to-br from-charcoal via-deepblack to-charcoal border border-subtleborder group cursor-pointer">
              {featured.thumbnail && (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${featured.thumbnail})` }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-obsidian/90 via-obsidian/70 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent z-10" />
              {!featured.thumbnail && (
                <>
                  <div className="absolute top-10 right-10 w-64 h-64 bg-emerald/5 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 right-20 w-48 h-48 bg-chartblue/5 rounded-full blur-3xl" />
                </>
              )}
              <div className="relative z-20 p-8 md:p-12 flex flex-col justify-end h-full min-h-[320px] md:min-h-[400px]">
                <div className="flex items-center gap-3 mb-4">
                  <CategoryBadge category={featured.category} />
                  <span className="text-xs font-mono text-slategray flex items-center gap-1">
                    <ClockIcon size={12} /> {featured.date}
                  </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-display font-light text-offwhite max-w-3xl mb-3 leading-tight group-hover:text-emerald transition-colors">
                  {featured.headline}
                </h2>
                <p className="text-slategray max-w-2xl leading-relaxed mb-4 text-sm md:text-base">
                  {featured.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slategray">{featured.date}</span>
                  <span className="text-emerald flex items-center gap-1 text-sm font-mono group-hover:gap-2 transition-all">
                    Read More <ArrowRightIcon size={14} />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Category Filter */}
      <section className="news-section max-w-7xl mx-auto px-6 pb-6">
        <div className="flex flex-wrap gap-2">
          {newsCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-mono rounded-lg border transition-colors ${
                activeCategory === cat
                  ? 'bg-emerald text-obsidian border-emerald'
                  : 'bg-charcoal border-subtleborder text-slategray hover:text-offwhite hover:border-slategray'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* News Grid */}
      <section className="news-section max-w-7xl mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article) => (
            <Link
              key={article.id}
              to={article.articleSlug ? `/news/article/${article.articleSlug}` : `/news/${article.id}`}
              className="group relative rounded-xl overflow-hidden border border-subtleborder hover:border-emerald/50 transition-colors cursor-pointer block min-h-[320px]"
            >
              {/* Background image */}
              {article.thumbnail ? (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${article.thumbnail})` }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-deepblack to-charcoal" />
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/80 to-obsidian/30" />

              {/* Content */}
              <div className="relative z-10 p-6 flex flex-col justify-end h-full min-h-[320px]">
                <div className="flex items-center gap-3 mb-3">
                  <CategoryBadge category={article.category} />
                  <span className="text-xs font-mono text-slategray flex items-center gap-1">
                    <ClockIcon size={10} /> {article.date}
                  </span>
                </div>
                <h3 className="text-base font-display font-medium text-offwhite mb-2 group-hover:text-emerald transition-colors leading-snug">
                  {article.headline}
                </h3>
                <p className="text-sm text-slategray leading-relaxed mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slategray">{article.date}</span>
                  <span className="text-emerald opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRightIcon size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Market in 5 Charts */}
      <section className="news-section max-w-7xl mx-auto px-6 pb-12">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-display font-light text-offwhite">Market in 5 Charts</h2>
          {loading && <span className="w-2 h-2 bg-emerald rounded-full animate-pulse" />}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {marketCharts.map((chart) => (
            <div key={chart.title} className="bg-charcoal border border-subtleborder rounded-xl p-4">
              <p className="text-xs font-mono text-slategray mb-1">{chart.title}</p>
              <p className="text-sm font-mono text-offwhite mb-0.5">{chart.value}</p>
              <p className={`text-xs font-mono flex items-center gap-1 ${chart.up ? 'text-emerald' : 'text-crimson'}`}>
                {chart.up ? '\u2191' : '\u2193'} {chart.change}
              </p>
              <div className="h-12 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chart.data}>
                    <defs>
                      <linearGradient id={`spark-${chart.title}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chart.up ? '#10B981' : '#EF4444'} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={chart.up ? '#10B981' : '#EF4444'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={chart.up ? '#10B981' : '#EF4444'}
                      strokeWidth={1.5}
                      fill={`url(#spark-${chart.title})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Insights & Guides */}
      {generatedArticles.length > 0 && (
        <section className="news-section max-w-7xl mx-auto px-6 pb-24">
          <h2 className="text-2xl font-display font-light text-offwhite mb-6">Insights & Guides</h2>

          {/* Insights tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {insightsTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveInsightsTab(tab)}
                className={`px-4 py-2 text-xs font-mono rounded-lg border transition-colors ${
                  activeInsightsTab === tab
                    ? 'bg-emerald text-obsidian border-emerald'
                    : 'bg-charcoal border-subtleborder text-slategray hover:text-offwhite hover:border-slategray'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Articles grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedArticles
              .filter((a) => activeInsightsTab === 'All' || a.category === activeInsightsTab)
              .map((article) => (
                <Link
                  key={article.slug}
                  to={`/news/article/${article.slug}`}
                  className="group relative rounded-xl overflow-hidden border border-subtleborder hover:border-emerald/50 transition-colors cursor-pointer block min-h-[320px]"
                >
                  {/* Background image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${article.image.src})` }}
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/80 to-obsidian/30" />

                  {/* Content */}
                  <div className="relative z-10 p-4 sm:p-6 flex flex-col justify-end h-full min-h-[320px]">
                    <div className="flex items-center gap-2 mb-3">
                      <CategoryBadge category={article.category} />
                      <span className="text-xs font-mono text-slategray">{article.readingTime} min read</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-display font-light text-offwhite mb-2 group-hover:text-emerald transition-colors leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slategray leading-relaxed mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-mono text-slategray">
                        <span className="flex items-center gap-1">
                          <ClockIcon size={10} /> {article.displayDate}
                        </span>
                      </div>
                      <span className="text-emerald opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRightIcon size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
