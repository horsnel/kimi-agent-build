import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendUpIcon, TrendDownIcon, ArrowRightIcon, ClockIcon } from '../components/CustomIcons';

gsap.registerPlugin(ScrollTrigger);

type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y';

interface StockData {
  ticker: string;
  company: string;
  price: number;
  change: number;
  marketCap: string;
  pe: number;
  eps: number;
  beta: number;
  open: number;
  high: number;
  low: number;
  volume: string;
  avgVolume: string;
  dividend: number;
  week52Low: number;
  week52High: number;
  earnings: { quarter: string; actual: number; estimate: number }[];
  analystBuy: number;
  analystHold: number;
  analystSell: number;
  news: { headline: string; date: string; source: string }[];
}

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

const stockDatabase: Record<string, StockData> = {
  AAPL: {
    ticker: 'AAPL',
    company: 'Apple Inc.',
    price: 227.63,
    change: 1.24,
    marketCap: '$3.52T',
    pe: 37.2,
    eps: 6.12,
    beta: 1.28,
    open: 224.50,
    high: 229.18,
    low: 223.87,
    volume: '52.3M',
    avgVolume: '54.1M',
    dividend: 0.96,
    week52Low: 164.08,
    week52High: 237.49,
    earnings: [
      { quarter: 'Q1 2025', actual: 2.18, estimate: 2.10 },
      { quarter: 'Q2 2025', actual: 1.53, estimate: 1.50 },
      { quarter: 'Q3 2025', actual: 1.47, estimate: 1.45 },
      { quarter: 'Q4 2025', actual: 2.35, estimate: 2.28 },
    ],
    analystBuy: 22,
    analystHold: 6,
    analystSell: 2,
    news: [
      { headline: 'Apple Vision Pro Sales Exceed Expectations in Q4', date: 'Mar 3, 2026', source: 'Bloomberg' },
      { headline: 'Apple Services Revenue Hits Record $24B', date: 'Feb 28, 2026', source: 'Reuters' },
      { headline: 'Apple Announces $110B Share Buyback Program', date: 'Feb 25, 2026', source: 'CNBC' },
      { headline: 'iPhone 17 Pro Demand Stronger Than Expected', date: 'Feb 20, 2026', source: 'WSJ' },
    ],
  },
  MSFT: {
    ticker: 'MSFT',
    company: 'Microsoft Corp.',
    price: 415.56,
    change: 0.87,
    marketCap: '$3.09T',
    pe: 35.8,
    eps: 11.61,
    beta: 0.89,
    open: 411.20,
    high: 418.42,
    low: 409.15,
    volume: '22.1M',
    avgVolume: '23.5M',
    dividend: 3.00,
    week52Low: 309.45,
    week52High: 430.82,
    earnings: [
      { quarter: 'Q1 2025', actual: 2.93, estimate: 2.78 },
      { quarter: 'Q2 2025', actual: 2.14, estimate: 2.10 },
      { quarter: 'Q3 2025', actual: 3.30, estimate: 3.10 },
      { quarter: 'Q4 2025', actual: 3.52, estimate: 3.45 },
    ],
    analystBuy: 28,
    analystHold: 4,
    analystSell: 1,
    news: [
      { headline: 'Microsoft Azure Revenue Grows 31% YoY', date: 'Mar 2, 2026', source: 'TechCrunch' },
      { headline: 'Copilot Enterprise Adoption Reaches 60% of Fortune 500', date: 'Feb 27, 2026', source: 'Forbes' },
      { headline: 'Microsoft Cloud Revenue Tops Expectations', date: 'Feb 22, 2026', source: 'Bloomberg' },
      { headline: 'Xbox Gaming Division Posts Strong Quarter', date: 'Feb 18, 2026', source: 'IGN' },
    ],
  },
  NVDA: {
    ticker: 'NVDA',
    company: 'NVIDIA Corp.',
    price: 875.28,
    change: 3.42,
    marketCap: '$2.16T',
    pe: 68.3,
    eps: 12.81,
    beta: 1.72,
    open: 848.90,
    high: 882.15,
    low: 842.30,
    volume: '41.5M',
    avgVolume: '39.2M',
    dividend: 0.16,
    week52Low: 419.38,
    week52High: 902.50,
    earnings: [
      { quarter: 'Q1 2025', actual: 6.12, estimate: 5.59 },
      { quarter: 'Q2 2025', actual: 6.78, estimate: 6.40 },
      { quarter: 'Q3 2025', actual: 8.24, estimate: 7.65 },
      { quarter: 'Q4 2025', actual: 10.32, estimate: 9.85 },
    ],
    analystBuy: 32,
    analystHold: 5,
    analystSell: 2,
    news: [
      { headline: 'NVIDIA Beats Q4 Estimates, Stock Rises 8%', date: 'Mar 4, 2026', source: 'CNBC' },
      { headline: 'NVIDIA Announces Next-Gen Blackwell Ultra GPU', date: 'Feb 28, 2026', source: 'Wired' },
      { headline: 'Data Center Revenue Surges 265% Year-Over-Year', date: 'Feb 25, 2026', source: 'Bloomberg' },
      { headline: 'NVIDIA Expands Automotive AI Partnerships', date: 'Feb 20, 2026', source: 'Reuters' },
    ],
  },
  TSLA: {
    ticker: 'TSLA',
    company: 'Tesla Inc.',
    price: 188.13,
    change: -2.18,
    marketCap: '$599B',
    pe: 44.6,
    eps: 4.22,
    beta: 2.31,
    open: 192.40,
    high: 193.87,
    low: 186.52,
    volume: '112.7M',
    avgVolume: '98.4M',
    dividend: 0,
    week52Low: 138.80,
    week52High: 278.98,
    earnings: [
      { quarter: 'Q1 2025', actual: 0.45, estimate: 0.52 },
      { quarter: 'Q2 2025', actual: 0.72, estimate: 0.65 },
      { quarter: 'Q3 2025', actual: 1.05, estimate: 0.98 },
      { quarter: 'Q4 2025', actual: 0.73, estimate: 0.80 },
    ],
    analystBuy: 12,
    analystHold: 14,
    analystSell: 8,
    news: [
      { headline: 'Tesla Cybertruck Deliveries Hit 100K Milestone', date: 'Mar 3, 2026', source: 'Electrek' },
      { headline: 'Tesla FSD v13 Receives Regulatory Approval in EU', date: 'Feb 28, 2026', source: 'Reuters' },
      { headline: 'Tesla Energy Storage Revenue Doubles in Q4', date: 'Feb 24, 2026', source: 'Bloomberg' },
      { headline: 'Model Y Refresh Launches to Strong Pre-Orders', date: 'Feb 19, 2026', source: 'CNBC' },
    ],
  },
};

export default function StockAnalysis() {
  const { ticker } = useParams<{ ticker: string }>();
  const stock = stockDatabase[ticker?.toUpperCase() ?? ''] ?? stockDatabase['AAPL'];
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const sectionRef = useRef<HTMLDivElement>(null);

  const priceData = useMemo(() => {
    const points: Record<Timeframe, number> = { '1D': 24, '1W': 7, '1M': 30, '3M': 90, '1Y': 52 };
    const vol: Record<Timeframe, number> = { '1D': 0.005, '1W': 0.015, '1M': 0.02, '3M': 0.025, '1Y': 0.03 };
    return generatePriceData(stock.price, points[timeframe], vol[timeframe]);
  }, [stock.price, timeframe]);

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
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const week52Position = ((stock.price - stock.week52Low) / (stock.week52High - stock.week52Low)) * 100;
  const totalAnalysts = stock.analystBuy + stock.analystHold + stock.analystSell;

  const timeframes: Timeframe[] = ['1D', '1W', '1M', '3M', '1Y'];

  const keyStats = [
    { label: 'Open', value: `$${stock.open.toFixed(2)}` },
    { label: 'High', value: `$${stock.high.toFixed(2)}` },
    { label: 'Low', value: `$${stock.low.toFixed(2)}` },
    { label: 'Volume', value: stock.volume },
    { label: 'Avg Volume', value: stock.avgVolume },
    { label: 'Market Cap', value: stock.marketCap },
    { label: 'P/E Ratio', value: stock.pe.toFixed(1) },
    { label: 'EPS', value: `$${stock.eps.toFixed(2)}` },
    { label: 'Dividend', value: `$${stock.dividend.toFixed(2)}` },
    { label: 'Beta', value: stock.beta.toFixed(2) },
  ];

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
                {stock.ticker}
              </h1>
              <span className={`flex items-center gap-1 text-sm font-mono px-2 py-0.5 rounded ${
                stock.change >= 0 ? 'text-emerald bg-emerald/10' : 'text-crimson bg-crimson/10'
              }`}>
                {stock.change >= 0 ? <TrendUpIcon size={14} /> : <TrendDownIcon size={14} />}
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
              </span>
            </div>
            <p className="text-slategray">{stock.company}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl md:text-4xl font-display font-light text-offwhite">
              ${stock.price.toFixed(2)}
            </p>
            <div className="flex gap-4 text-xs font-mono text-slategray mt-1 justify-end">
              <span>Mkt Cap: {stock.marketCap}</span>
              <span>P/E: {stock.pe.toFixed(1)}</span>
              <span>EPS: ${stock.eps.toFixed(2)}</span>
              <span>Beta: {stock.beta.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 52-Week Range */}
      <section className="analysis-section max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slategray">52-Week Range</span>
            <span className="text-xs font-mono text-offwhite">${stock.price.toFixed(2)}</span>
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
            <span className="text-xs font-mono text-crimson">${stock.week52Low.toFixed(2)}</span>
            <span className="text-xs font-mono text-emerald">${stock.week52High.toFixed(2)}</span>
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
                <BarChart data={stock.earnings} barGap={4}>
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
                    {stock.earnings.map((entry, index) => (
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
                  <span className="text-sm font-mono text-offwhite">{stock.analystBuy}</span>
                </div>
                <div className="h-2 bg-deepblack rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald rounded-full transition-all duration-500"
                    style={{ width: `${(stock.analystBuy / totalAnalysts) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-amber-400 font-mono">Hold</span>
                  <span className="text-sm font-mono text-offwhite">{stock.analystHold}</span>
                </div>
                <div className="h-2 bg-deepblack rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${(stock.analystHold / totalAnalysts) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-crimson font-mono">Sell</span>
                  <span className="text-sm font-mono text-offwhite">{stock.analystSell}</span>
                </div>
                <div className="h-2 bg-deepblack rounded-full overflow-hidden">
                  <div
                    className="h-full bg-crimson rounded-full transition-all duration-500"
                    style={{ width: `${(stock.analystSell / totalAnalysts) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-subtleborder">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slategray">Consensus</span>
                <span className={`text-sm font-mono font-medium ${
                  stock.analystBuy > stock.analystHold + stock.analystSell
                    ? 'text-emerald'
                    : stock.analystSell > stock.analystBuy
                    ? 'text-crimson'
                    : 'text-amber-400'
                }`}>
                  {stock.analystBuy > stock.analystHold + stock.analystSell
                    ? 'Strong Buy'
                    : stock.analystBuy > stock.analystSell
                    ? 'Buy'
                    : stock.analystSell > stock.analystBuy
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
            {stock.news.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 p-3 rounded-lg hover:bg-deepblack/50 transition-colors cursor-pointer group">
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
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
