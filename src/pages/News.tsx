import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ClockIcon, ArrowRightIcon } from '../components/CustomIcons';
import { fetchNews, fetchMarketIndices, fetchCryptoOverview, type NewsArticle as ApiNewsArticle, type MarketIndex, type CryptoAsset } from '../services/api';
import { useGeoCurrency } from '../hooks/useGeoCurrency';

gsap.registerPlugin(ScrollTrigger);

type NewsCategory = 'All' | 'Market Analysis' | 'Economic Data' | 'Earnings' | 'Fed Policy' | 'Crypto';

interface NewsArticle {
  id: number;
  headline: string;
  excerpt: string;
  date: string;
  author: string;
  category: Exclude<NewsCategory, 'All'>;
  featured?: boolean;
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

const fallbackNewsArticles: NewsArticle[] = [
  {
    id: 0,
    headline: 'Fed Signals Potential Rate Cuts Amid Cooling Inflation Data',
    excerpt: 'Federal Reserve Chair Jerome Powell indicated the central bank is increasingly confident that inflation is on a sustainable path toward 2%, opening the door to potential rate cuts in the coming months. Markets reacted with a sharp rally across equities and bonds.',
    date: 'Mar 4, 2026',
    author: 'Sarah Chen',
    category: 'Fed Policy',
    featured: true,
  },
  {
    id: 1,
    headline: 'S&P 500 Closes at Record High on Strong Earnings',
    excerpt: 'The benchmark index surpassed 5,400 for the first time as better-than-expected corporate earnings fueled investor optimism about the economic outlook.',
    date: 'Mar 4, 2026',
    author: 'Michael Torres',
    category: 'Market Analysis',
  },
  {
    id: 2,
    headline: 'Treasury Yields Drop After Weak Jobs Data',
    excerpt: 'The 10-year yield fell below 4.1% after non-farm payrolls came in well below expectations, reinforcing bets on Fed rate cuts later this year.',
    date: 'Mar 3, 2026',
    author: 'Emily Watson',
    category: 'Economic Data',
  },
  {
    id: 3,
    headline: 'NVIDIA Beats Q4 Estimates, Stock Rises 8%',
    excerpt: 'The chipmaker reported revenue of $22.1 billion, crushing Wall Street expectations as data center demand continues to surge amid the AI spending boom.',
    date: 'Mar 3, 2026',
    author: 'David Kim',
    category: 'Earnings',
  },
  {
    id: 4,
    headline: 'Bitcoin Surges Past $100K Milestone',
    excerpt: 'The worlds largest cryptocurrency crossed the six-figure mark for the first time, driven by institutional inflows and growing ETF adoption.',
    date: 'Mar 2, 2026',
    author: 'Alex Rivera',
    category: 'Crypto',
  },
  {
    id: 5,
    headline: 'ECB Holds Rates Steady, Signals June Cut',
    excerpt: 'The European Central Bank kept rates unchanged at 4% but President Lagarde hinted at a potential cut in June as eurozone inflation continues to decelerate.',
    date: 'Mar 2, 2026',
    author: 'Hans Mueller',
    category: 'Fed Policy',
  },
  {
    id: 6,
    headline: 'Microsoft Cloud Revenue Tops Expectations',
    excerpt: 'Azure revenue grew 31% year-over-year, beating estimates and signaling that enterprise AI adoption is accelerating faster than anticipated.',
    date: 'Mar 1, 2026',
    author: 'Jennifer Park',
    category: 'Earnings',
  },
  {
    id: 7,
    headline: 'Housing Starts Decline for Third Straight Month',
    excerpt: 'New residential construction fell 3.2% in February, as elevated mortgage rates and material costs continued to weigh on the housing market.',
    date: 'Mar 1, 2026',
    author: 'Robert Chen',
    category: 'Economic Data',
  },
  {
    id: 8,
    headline: 'Oil Prices Rally on OPEC Supply Cuts',
    excerpt: 'Crude oil surged above $82 per barrel after OPEC+ announced extended production cuts through Q2, tightening global supply expectations.',
    date: 'Feb 28, 2026',
    author: 'Layla Hassan',
    category: 'Market Analysis',
  },
  {
    id: 9,
    headline: 'Consumer Confidence Index Falls to 6-Month Low',
    excerpt: 'The Conference Board index dropped to 68.2 as Americans grew more concerned about the labor market outlook and persistent inflation in services.',
    date: 'Feb 28, 2026',
    author: 'Maria Santos',
    category: 'Economic Data',
  },
];

const fallbackMarketCharts = [
  { title: 'S&P 500', value: '5,412.8', change: '+1.24%', up: true, data: generateSparkline(5400, 20, 0.008) },
  { title: '10Y Yield', value: '4.08%', change: '-0.12%', up: false, data: generateSparkline(4.1, 20, 0.005) },
  { title: 'VIX', value: '14.32', change: '-5.2%', up: true, data: generateSparkline(15, 20, 0.02) },
  { title: 'DXY', value: '103.45', change: '-0.38%', up: false, data: generateSparkline(104, 20, 0.006) },
  { title: 'BTC/USD', value: '101243', change: '+4.7%', up: true, data: generateSparkline(100000, 20, 0.015) },
];

const newsCategories: NewsCategory[] = ['All', 'Market Analysis', 'Economic Data', 'Earnings', 'Fed Policy', 'Crypto'];

function CategoryBadge({ category }: { category: string }) {
  const styles: Record<string, string> = {
    'Market Analysis': 'bg-emerald/20 text-emerald border-emerald/30',
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
  author: string;
  category: string;
  tags: string[];
  metaDescription: string;
  excerpt: string;
  image: { src: string; alt: string };
  readingTime: number;
}

type InsightsTab = 'All' | 'Market Analysis' | 'Education';
const insightsTabs: InsightsTab[] = ['All', 'Market Analysis', 'Education'];

export default function News() {
  const { formatLocalShort } = useGeoCurrency();
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>(fallbackNewsArticles);
  const [marketCharts, setMarketCharts] = useState(fallbackMarketCharts);
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
          author: a.author,
          category: a.category as Exclude<NewsCategory, 'All'>,
          featured: a.featured,
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

        if (charts.length > 0) {
          setMarketCharts(charts);
        }
      } catch (e) {
        console.warn('News: using fallback data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.news-section',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
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
          <Link to={`/news/${featured.id}`} className="block">
            <div className="relative rounded-xl overflow-hidden min-h-[320px] md:min-h-[400px] bg-gradient-to-br from-charcoal via-deepblack to-charcoal border border-subtleborder group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-obsidian/90 via-obsidian/70 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent z-10" />
              <div className="absolute top-10 right-10 w-64 h-64 bg-emerald/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-20 w-48 h-48 bg-chartblue/5 rounded-full blur-3xl" />
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
                  <span className="text-xs font-mono text-slategray">By {featured.author}</span>
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
              to={`/news/${article.id}`}
              className="group bg-charcoal border border-subtleborder rounded-xl p-6 hover:border-emerald/50 transition-colors cursor-pointer block"
            >
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
                <span className="text-xs font-mono text-slategray">By {article.author}</span>
                <span className="text-emerald opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRightIcon size={14} />
                </span>
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
                        <span>By {article.author}</span>
                        <span className="text-slategray/40">·</span>
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
