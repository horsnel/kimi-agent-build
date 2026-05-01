import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendUpIcon, TrendDownIcon, ArrowRightIcon, ClockIcon } from '../components/CustomIcons';
import { fetchStockDetail, type StockDetail } from '../services/api';

gsap.registerPlugin(ScrollTrigger);

type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y';

// StockDetail type is imported from api.ts
type StockData = StockDetail;

function generatePriceData(basePrice: number, points: number, volatility: number) {
  const data: { date: string; price: number }[] = [];
  let price = basePrice * (1 - volatility * 2 + Math.random() * volatility);
  for (let i = 0; i < points; i++) {
    price = price * (1 + (Math.random() - 0.48) * volatility);
    data.push({
      date: `Day ${i + 1}`,
      price: Math.round(price * 100) / 100,
    });
  }
  return data;
}

export default function StockAnalysis() {
  const { ticker } = useParams<{ ticker: string }>();
  const [stock, setStock] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchStockDetail(ticker ?? 'AAPL')
      .then(setStock)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [ticker]);

  // Fallback defaults while loading
  const s = stock ?? {
    ticker: ticker?.toUpperCase() ?? 'AAPL', company: '', price: 0, change: 0, marketCap: '',
    pe: 0, eps: 0, beta: 0, open: 0, high: 0, low: 0, volume: '', avgVolume: '', dividend: 0,
    week52Low: 0, week52High: 0, earnings: [], analystBuy: 0, analystHold: 0, analystSell: 0,
    news: [], priceHistory: [], recommendation: '',
  };

  const priceData = useMemo(() => {
    const points: Record<Timeframe, number> = { '1D': 24, '1W': 7, '1M': 30, '3M': 90, '1Y': 52 };
    const vol: Record<Timeframe, number> = { '1D': 0.005, '1W': 0.015, '1M': 0.02, '3M': 0.025, '1Y': 0.03 };
    // Use priceHistory from API if available, otherwise generate
    if (s.priceHistory && s.priceHistory.length > 0 && timeframe === '1M') {
      return s.priceHistory;
    }
    return generatePriceData(s.price || 100, points[timeframe], vol[timeframe]);
  }, [s.price, s.priceHistory, timeframe]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.analysis-section',
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
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const week52Position = s.week52High > s.week52Low ? ((s.price - s.week52Low) / (s.week52High - s.week52Low)) * 100 : 50;
  const totalAnalysts = s.analystBuy + s.analystHold + s.analystSell;

  const timeframes: Timeframe[] = ['1D', '1W', '1M', '3M', '1Y'];

  const keyStats = [
    { label: 'Open', value: `$${s.open.toFixed(2)}` },
    { label: 'High', value: `$${s.high.toFixed(2)}` },
    { label: 'Low', value: `$${s.low.toFixed(2)}` },
    { label: 'Volume', value: s.volume },
    { label: 'Avg Volume', value: s.avgVolume },
    { label: 'Market Cap', value: s.marketCap },
    { label: 'P/E Ratio', value: s.pe.toFixed(1) },
    { label: 'EPS', value: `$${s.eps.toFixed(2)}` },
    { label: 'Dividend', value: `$${s.dividend.toFixed(2)}` },
    { label: 'Beta', value: s.beta.toFixed(2) },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
        <div className="animate-pulse">
          <div className="h-10 bg-charcoal rounded w-1/3 mx-auto mb-4" />
          <div className="h-6 bg-charcoal rounded w-1/2 mx-auto" />
        </div>
        <p className="text-slategray text-sm mt-4">Loading stock data...</p>
      </div>
    );
  }

  if (error && !stock) {
    return (
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
        <p className="text-crimson">Failed to load stock data: {error}</p>
      </div>
    );
  }

  return (
    <div ref={sectionRef}>
      {/* Stock Header */}
      <section className="analysis-section max-w-7xl mx-auto px-6 pt-24 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link to="/screener" className="text-xs font-mono text-slategray hover:text-emerald transition-colors">
                {'\u2190'} Screener
              </Link>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite">
                {s.ticker}
              </h1>
              <span className={`flex items-center gap-1 text-sm font-mono px-2 py-0.5 rounded ${
                s.change >= 0 ? 'text-emerald bg-emerald/10' : 'text-crimson bg-crimson/10'
              }`}>
                {s.change >= 0 ? <TrendUpIcon size={14} /> : <TrendDownIcon size={14} />}
                {s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%
              </span>
            </div>
            <p className="text-slategray">{s.company}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl md:text-4xl font-display font-light text-offwhite">
              ${s.price.toFixed(2)}
            </p>
            <div className="flex gap-4 text-xs font-mono text-slategray mt-1 justify-end">
              <span>Mkt Cap: {s.marketCap}</span>
              <span>P/E: {s.pe.toFixed(1)}</span>
              <span>EPS: ${s.eps.toFixed(2)}</span>
              <span>Beta: {s.beta.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 52-Week Range */}
      <section className="analysis-section max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slategray">52-Week Range</span>
            <span className="text-xs font-mono text-offwhite">${s.price.toFixed(2)}</span>
          </div>
          <div className="relative h-2 bg-deepblack rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-crimson via-amber-500 to-emerald"
              style={{ width: '100%' }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-offwhite rounded-full border-2 border-obsidian shadow-lg"
              style={{ left: `calc(${week52Position}% - 6px)` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs font-mono text-crimson">${s.week52Low.toFixed(2)}</span>
            <span className="text-xs font-mono text-emerald">${s.week52High.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {/* Price Chart */}
      <section className="analysis-section max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-offwhite">Price Chart</h2>
            <div className="flex bg-deepblack border border-subtleborder rounded-lg p-1">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                    timeframe === tf
                      ? 'bg-emerald text-obsidian'
                      : 'text-slategray hover:text-offwhite'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} interval="preserveStartEnd" />
                <YAxis stroke="#6B7280" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111111',
                    border: '1px solid #222222',
                    borderRadius: '8px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '12px',
                    color: '#E8E8E6',
                  }}
                />
                <Area type="monotone" dataKey="price" stroke="#10B981" strokeWidth={2} fill="url(#priceGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Key Statistics */}
      <section className="analysis-section max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
          <h2 className="text-lg font-medium text-offwhite mb-4">Key Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {keyStats.map((stat) => (
              <div key={stat.label} className="bg-deepblack border border-subtleborder rounded-lg p-3">
                <p className="text-xs font-mono text-slategray mb-1">{stat.label}</p>
                <p className="text-sm font-mono text-offwhite">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings & Analyst */}
      <section className="analysis-section max-w-7xl mx-auto px-6 pb-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Earnings */}
          <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
            <h2 className="text-lg font-medium text-offwhite mb-4">Earnings Per Share</h2>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={s.earnings} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis dataKey="quarter" stroke="#6B7280" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                  <YAxis stroke="#6B7280" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111111',
                      border: '1px solid #222222',
                      borderRadius: '8px',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '12px',
                      color: '#E8E8E6',
                    }}
                  />
                  <Bar dataKey="estimate" fill="#6B7280" radius={[4, 4, 0, 0]} name="Estimate" />
                  <Bar dataKey="actual" radius={[4, 4, 0, 0]} name="Actual">
                    {s.earnings.map((entry, index) => (
                      <Cell key={index} fill={entry.actual >= entry.estimate ? '#10B981' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Analyst Ratings */}
          <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
            <h2 className="text-lg font-medium text-offwhite mb-4">Analyst Ratings</h2>
            <p className="text-xs font-mono text-slategray mb-6">{totalAnalysts} analysts covering</p>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-emerald font-mono">Buy</span>
                  <span className="text-sm font-mono text-offwhite">{s.analystBuy}</span>
                </div>
                <div className="h-2 bg-deepblack rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald rounded-full transition-all duration-500"
                    style={{ width: `${(s.analystBuy / totalAnalysts) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-amber-400 font-mono">Hold</span>
                  <span className="text-sm font-mono text-offwhite">{s.analystHold}</span>
                </div>
                <div className="h-2 bg-deepblack rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${(s.analystHold / totalAnalysts) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-crimson font-mono">Sell</span>
                  <span className="text-sm font-mono text-offwhite">{s.analystSell}</span>
                </div>
                <div className="h-2 bg-deepblack rounded-full overflow-hidden">
                  <div
                    className="h-full bg-crimson rounded-full transition-all duration-500"
                    style={{ width: `${(s.analystSell / totalAnalysts) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-subtleborder">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slategray">Consensus</span>
                <span className={`text-sm font-mono font-medium ${
                  s.analystBuy > s.analystHold + s.analystSell
                    ? 'text-emerald'
                    : s.analystSell > s.analystBuy
                    ? 'text-crimson'
                    : 'text-amber-400'
                }`}>
                  {s.analystBuy > s.analystHold + s.analystSell
                    ? 'Strong Buy'
                    : s.analystBuy > s.analystSell
                    ? 'Buy'
                    : s.analystSell > s.analystBuy
                    ? 'Sell'
                    : 'Hold'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent News */}
      <section className="analysis-section max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
          <h2 className="text-lg font-medium text-offwhite mb-4">Recent News</h2>
          <div className="space-y-4">
            {s.news.map((item, idx) => (
              <Link key={idx} to="/news" className="flex items-start gap-4 p-3 rounded-lg hover:bg-deepblack/50 transition-colors cursor-pointer group">
                <div className="flex-1">
                  <h3 className="text-sm text-offwhite group-hover:text-emerald transition-colors mb-1">
                    {item.headline}
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-mono text-slategray">
                    <span className="flex items-center gap-1"><ClockIcon size={10} /> {item.date}</span>
                    <span>{item.source}</span>
                  </div>
                </div>
                <ArrowRightIcon size={16} className="text-slategray group-hover:text-emerald transition-colors mt-1 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
