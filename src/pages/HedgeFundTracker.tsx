import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { fetchHedgeFundTracker, type HedgeFundData } from '../services/api';


gsap.registerPlugin(ScrollTrigger);

const defaultFunds: Record<string, HedgeFundData> = {
  Citadel: {
    name: 'Citadel',
    aum: '$63B',
    holdings: 1247,
    topHolding: 'AAPL',
    positions: [
      { stock: 'AAPL', shares: '12.4M', value: 2604, pct: 4.1, change: 'Increased' },
      { stock: 'MSFT', shares: '5.8M', value: 2436, pct: 3.9, change: 'Unchanged' },
      { stock: 'NVDA', shares: '3.2M', value: 1984, pct: 3.1, change: 'Increased' },
      { stock: 'AMZN', shares: '9.1M', value: 1684, pct: 2.7, change: 'New' },
      { stock: 'META', shares: '2.8M', value: 1456, pct: 2.3, change: 'Unchanged' },
      { stock: 'GOOGL', shares: '7.5M', value: 1313, pct: 2.1, change: 'Decreased' },
      { stock: 'JPM', shares: '7.2M', value: 1210, pct: 1.9, change: 'Unchanged' },
      { stock: 'V', shares: '3.1M', value: 968, pct: 1.5, change: 'New' },
      { stock: 'UNH', shares: '2.0M', value: 940, pct: 1.5, change: 'Increased' },
      { stock: 'LLY', shares: '0.9M', value: 792, pct: 1.3, change: 'Unchanged' },
      { stock: 'TSLA', shares: '2.5M', value: 598, pct: 0.9, change: 'Decreased' },
      { stock: 'BRK.B', shares: '2.1M', value: 504, pct: 0.8, change: 'Unchanged' },
    ],
    sectors: [
      { name: 'Technology', value: 38 },
      { name: 'Healthcare', value: 18 },
      { name: 'Finance', value: 15 },
      { name: 'Consumer', value: 14 },
      { name: 'Energy', value: 8 },
      { name: 'Other', value: 7 },
    ],
    notableMoves: [
      { title: 'Biggest New Position', detail: 'AMZN — $1.68B', badge: 'emerald' },
      { title: 'Largest Exit', detail: 'BABA — $892M', badge: 'crimson' },
      { title: 'Biggest Increase', detail: 'AAPL +42%', badge: 'chartblue' },
    ],
  },
  Bridgewater: {
    name: 'Bridgewater Associates',
    aum: '$97B',
    holdings: 892,
    topHolding: 'GLD',
    positions: [
      { stock: 'GLD', shares: '18.5M', value: 3811, pct: 3.9, change: 'Increased' },
      { stock: 'SPY', shares: '7.2M', value: 3564, pct: 3.7, change: 'Unchanged' },
      { stock: 'TLT', shares: '9.8M', value: 980, pct: 1.0, change: 'New' },
      { stock: 'EEM', shares: '22.1M', value: 995, pct: 1.0, change: 'Increased' },
      { stock: 'IVV', shares: '1.8M', value: 896, pct: 0.9, change: 'Unchanged' },
      { stock: 'VTI', shares: '2.1M', value: 519, pct: 0.5, change: 'Decreased' },
      { stock: 'IWM', shares: '3.2M', value: 640, pct: 0.7, change: 'New' },
      { stock: 'AGG', shares: '4.5M', value: 450, pct: 0.5, change: 'Unchanged' },
      { stock: 'QQQ', shares: '0.9M', value: 450, pct: 0.5, change: 'Decreased' },
      { stock: 'VGK', shares: '5.1M', value: 306, pct: 0.3, change: 'Unchanged' },
      { stock: 'COIN', shares: '1.2M', value: 288, pct: 0.3, change: 'New' },
      { stock: 'BND', shares: '5.8M', value: 348, pct: 0.4, change: 'Unchanged' },
    ],
    sectors: [
      { name: 'Technology', value: 12 },
      { name: 'Healthcare', value: 8 },
      { name: 'Finance', value: 35 },
      { name: 'Consumer', value: 10 },
      { name: 'Energy', value: 15 },
      { name: 'Other', value: 20 },
    ],
    notableMoves: [
      { title: 'Biggest New Position', detail: 'TLT — $980M', badge: 'emerald' },
      { title: 'Largest Exit', detail: 'LQD — $542M', badge: 'crimson' },
      { title: 'Biggest Increase', detail: 'GLD +28%', badge: 'chartblue' },
    ],
  },
  'Pershing Square': {
    name: 'Pershing Square',
    aum: '$18B',
    holdings: 34,
    topHolding: 'AAPL',
    positions: [
      { stock: 'AAPL', shares: '25.2M', value: 5292, pct: 29.4, change: 'Unchanged' },
      { stock: 'GOOGL', shares: '8.1M', value: 1418, pct: 7.9, change: 'Increased' },
      { stock: 'BKNG', shares: '0.6M', value: 2520, pct: 14.0, change: 'Unchanged' },
      { stock: 'CMG', shares: '0.4M', value: 184, pct: 1.0, change: 'New' },
      { stock: 'HLT', shares: '3.2M', value: 672, pct: 3.7, change: 'Unchanged' },
      { stock: 'LMT', shares: '0.7M', value: 301, pct: 1.7, change: 'Decreased' },
      { stock: 'META', shares: '1.1M', value: 572, pct: 3.2, change: 'Increased' },
      { stock: 'MSFT', shares: '1.0M', value: 420, pct: 2.3, change: 'Unchanged' },
      { stock: 'NFLX', shares: '0.5M', value: 340, pct: 1.9, change: 'New' },
      { stock: 'NVDA', shares: '0.3M', value: 186, pct: 1.0, change: 'Increased' },
      { stock: 'TDG', shares: '0.2M', value: 168, pct: 0.9, change: 'Unchanged' },
      { stock: 'UNH', shares: '0.4M', value: 188, pct: 1.0, change: 'Unchanged' },
    ],
    sectors: [
      { name: 'Technology', value: 45 },
      { name: 'Healthcare', value: 12 },
      { name: 'Finance', value: 5 },
      { name: 'Consumer', value: 25 },
      { name: 'Energy', value: 3 },
      { name: 'Other', value: 10 },
    ],
    notableMoves: [
      { title: 'Biggest New Position', detail: 'CMG — $184M', badge: 'emerald' },
      { title: 'Largest Exit', detail: 'MCK — $312M', badge: 'crimson' },
      { title: 'Biggest Increase', detail: 'GOOGL +65%', badge: 'chartblue' },
    ],
  },
  'Tiger Global': {
    name: 'Tiger Global',
    aum: '$24B',
    holdings: 156,
    topHolding: 'MSFT',
    positions: [
      { stock: 'MSFT', shares: '4.2M', value: 1764, pct: 7.4, change: 'Increased' },
      { stock: 'AMZN', shares: '6.8M', value: 1258, pct: 5.2, change: 'Unchanged' },
      { stock: 'NVDA', shares: '1.5M', value: 930, pct: 3.9, change: 'New' },
      { stock: 'CRM', shares: '3.2M', value: 896, pct: 3.7, change: 'Unchanged' },
      { stock: 'SHOP', shares: '8.1M', value: 648, pct: 2.7, change: 'Decreased' },
      { stock: 'SNOW', shares: '4.5M', value: 405, pct: 1.7, change: 'New' },
      { stock: 'DDOG', shares: '2.8M', value: 252, pct: 1.0, change: 'Unchanged' },
      { stock: 'NET', shares: '3.1M', value: 186, pct: 0.8, change: 'Increased' },
      { stock: 'MDB', shares: '0.8M', value: 168, pct: 0.7, change: 'Unchanged' },
      { stock: 'ZS', shares: '0.9M', value: 144, pct: 0.6, change: 'Decreased' },
      { stock: 'CRWD', shares: '0.5M', value: 125, pct: 0.5, change: 'New' },
      { stock: 'COIN', shares: '0.6M', value: 108, pct: 0.5, change: 'Unchanged' },
    ],
    sectors: [
      { name: 'Technology', value: 62 },
      { name: 'Healthcare', value: 8 },
      { name: 'Finance', value: 10 },
      { name: 'Consumer', value: 12 },
      { name: 'Energy', value: 2 },
      { name: 'Other', value: 6 },
    ],
    notableMoves: [
      { title: 'Biggest New Position', detail: 'NVDA — $930M', badge: 'emerald' },
      { title: 'Largest Exit', detail: 'SE — $412M', badge: 'crimson' },
      { title: 'Biggest Increase', detail: 'MSFT +38%', badge: 'chartblue' },
    ],
  },
  Renaissance: {
    name: 'Renaissance Technologies',
    aum: '$106B',
    holdings: 3456,
    topHolding: 'NVDA',
    positions: [
      { stock: 'NVDA', shares: '8.2M', value: 5084, pct: 4.8, change: 'Increased' },
      { stock: 'AAPL', shares: '18.5M', value: 3885, pct: 3.7, change: 'Unchanged' },
      { stock: 'MSFT', shares: '7.1M', value: 2982, pct: 2.8, change: 'Increased' },
      { stock: 'META', shares: '4.2M', value: 2184, pct: 2.1, change: 'New' },
      { stock: 'AMZN', shares: '9.5M', value: 1758, pct: 1.7, change: 'Unchanged' },
      { stock: 'GOOGL', shares: '8.8M', value: 1540, pct: 1.5, change: 'Decreased' },
      { stock: 'AVGO', shares: '2.1M', value: 1239, pct: 1.2, change: 'New' },
      { stock: 'TSLA', shares: '4.8M', value: 1147, pct: 1.1, change: 'Unchanged' },
      { stock: 'LLY', shares: '1.2M', value: 1056, pct: 1.0, change: 'Increased' },
      { stock: 'V', shares: '2.8M', value: 874, pct: 0.8, change: 'Unchanged' },
      { stock: 'JPM', shares: '4.5M', value: 756, pct: 0.7, change: 'Decreased' },
      { stock: 'UNH', shares: '1.4M', value: 658, pct: 0.6, change: 'Unchanged' },
    ],
    sectors: [
      { name: 'Technology', value: 42 },
      { name: 'Healthcare', value: 15 },
      { name: 'Finance', value: 12 },
      { name: 'Consumer', value: 16 },
      { name: 'Energy', value: 8 },
      { name: 'Other', value: 7 },
    ],
    notableMoves: [
      { title: 'Biggest New Position', detail: 'META — $2.18B', badge: 'emerald' },
      { title: 'Largest Exit', detail: 'XOM — $1.42B', badge: 'crimson' },
      { title: 'Biggest Increase', detail: 'NVDA +55%', badge: 'chartblue' },
    ],
  },
  'Two Sigma': {
    name: 'Two Sigma',
    aum: '$58B',
    holdings: 2103,
    topHolding: 'AMZN',
    positions: [
      { stock: 'AMZN', shares: '11.2M', value: 2072, pct: 3.6, change: 'Increased' },
      { stock: 'AAPL', shares: '8.5M', value: 1785, pct: 3.1, change: 'Unchanged' },
      { stock: 'NVDA', shares: '2.4M', value: 1488, pct: 2.6, change: 'New' },
      { stock: 'MSFT', shares: '3.1M', value: 1302, pct: 2.3, change: 'Increased' },
      { stock: 'GOOGL', shares: '5.8M', value: 1015, pct: 1.8, change: 'Unchanged' },
      { stock: 'META', shares: '1.5M', value: 780, pct: 1.4, change: 'Decreased' },
      { stock: 'TSLA', shares: '2.8M', value: 669, pct: 1.2, change: 'New' },
      { stock: 'AVGO', shares: '1.0M', value: 590, pct: 1.0, change: 'Unchanged' },
      { stock: 'JPM', shares: '3.0M', value: 504, pct: 0.9, change: 'Unchanged' },
      { stock: 'V', shares: '1.2M', value: 375, pct: 0.7, change: 'Increased' },
      { stock: 'CRM', shares: '1.4M', value: 392, pct: 0.7, change: 'Unchanged' },
      { stock: 'NFLX', shares: '0.4M', value: 272, pct: 0.5, change: 'Decreased' },
    ],
    sectors: [
      { name: 'Technology', value: 48 },
      { name: 'Healthcare', value: 10 },
      { name: 'Finance', value: 14 },
      { name: 'Consumer', value: 15 },
      { name: 'Energy', value: 6 },
      { name: 'Other', value: 7 },
    ],
    notableMoves: [
      { title: 'Biggest New Position', detail: 'NVDA — $1.49B', badge: 'emerald' },
      { title: 'Largest Exit', detail: 'DIS — $612M', badge: 'crimson' },
      { title: 'Biggest Increase', detail: 'AMZN +32%', badge: 'chartblue' },
    ],
  },
};

const sectorColors: Record<string, string> = {
  Technology: '#10B981',
  Healthcare: '#3B82F6',
  Finance: '#6366F1',
  Consumer: '#F59E0B',
  Energy: '#EF4444',
  Other: '#6B7280',
};

const changeBadge = (c: string) => {
  if (c === 'New') return 'bg-emerald/20 text-emerald';
  if (c === 'Increased') return 'bg-chartblue/20 text-chartblue';
  if (c === 'Decreased') return 'bg-amber-500/20 text-amber-400';
  return 'bg-slategray/20 text-slategray';
};

export default function HedgeFundTracker() {
  const [funds, setFunds] = useState<Record<string, HedgeFundData>>(defaultFunds);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string>('Citadel');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHedgeFundTracker()
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setFunds(data);
          if (!data[selected] && Object.keys(data).length > 0) setSelected(Object.keys(data)[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hf-section', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
        <div className="animate-pulse">
          <div className="h-10 bg-charcoal rounded w-1/3 mx-auto mb-4" />
          <div className="h-6 bg-charcoal rounded w-1/2 mx-auto" />
        </div>
        <p className="text-slategray text-sm mt-4">Loading hedge fund data...</p>
      </div>
    );
  }

  const fundKeys = Object.keys(funds);
  const fund = funds[selected];

  return (
      <div ref={sectionRef}>
      {/* Hero */}
      <section className="hf-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite">Hedge Fund Tracker</h1>
          <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-emerald/20 text-emerald rounded">LIVE</span>
        </div>
        <p className="text-slategray text-lg">Monitor institutional positions from the latest 13F filings</p>
      </section>

      {/* Fund Selector */}
      <section className="hf-section max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-lg font-display font-medium text-offwhite mb-4">Select Fund</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {fundKeys.map((key) => {
            const f = funds[key];
            const isActive = selected === key;
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`bg-charcoal border rounded-xl p-5 text-left transition-all ${
                  isActive ? 'border-emerald/40 bg-emerald/5' : 'border-subtleborder hover:border-emerald/20'
                }`}
              >
                <p className="text-sm font-medium text-offwhite mb-2">{f.name}</p>
                <div className="flex items-center gap-3 text-xs font-mono text-slategray">
                  <span>{f.aum} AUM</span>
                  <span>·</span>
                  <span>{f.holdings} holdings</span>
                </div>
                <p className="text-xs font-mono text-emerald mt-2">Top: {f.topHolding}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Holdings Table */}
      {fund && (
        <>
          <section className="hf-section max-w-7xl mx-auto px-6 py-8">
            <div className="bg-charcoal border border-subtleborder rounded-xl overflow-hidden">
              <div className="p-6 border-b border-subtleborder">
                <h2 className="text-xl font-display font-medium text-offwhite">Top Holdings — {fund.name}</h2>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full">
                  <thead className="sticky top-0 bg-deepblack/90 backdrop-blur-sm z-10">
                    <tr className="border-b border-subtleborder">
                      <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider p-4">Stock</th>
                      <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider p-4">Shares</th>
                      <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider p-4">Value ($M)</th>
                      <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider p-4">% Portfolio</th>
                      <th className="text-center text-xs font-mono text-slategray uppercase tracking-wider p-4">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fund.positions.map((p) => (
                      <tr key={p.stock} className="border-b border-subtleborder/50 hover:bg-deepblack/50 transition-colors">
                        <td className="p-4 text-sm font-mono font-medium text-emerald">{p.stock}</td>
                        <td className="p-4 text-sm font-mono text-offwhite text-right">{p.shares}</td>
                        <td className="p-4 text-sm font-mono text-offwhite text-right">${p.value.toLocaleString()}M</td>
                        <td className="p-4 text-sm font-mono text-offwhite text-right">{p.pct}%</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 text-xs font-mono font-medium rounded ${changeBadge(p.change)}`}>{p.change}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Sector Allocation PieChart */}
          <section className="hf-section max-w-7xl mx-auto px-6 py-8">
            <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
              <h2 className="text-xl font-display font-medium text-offwhite mb-6">Sector Allocation — {fund.name}</h2>
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fund.sectors}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }: { name: string; value: number }) => `${name} ${value}%`}
                    >
                      {fund.sectors.map((entry) => (
                        <Cell key={entry.name} fill={sectorColors[entry.name] || '#6B7280'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '8px', color: '#E8E8E6' }} formatter={(v: number) => [`${v}%`, 'Allocation']} />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#E8E8E6' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Notable Moves */}
          <section className="hf-section max-w-7xl mx-auto px-6 py-8">
            <h2 className="text-xl font-display font-medium text-offwhite mb-6">Notable Moves</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {fund.notableMoves.map((move) => (
                <div key={move.title} className="bg-charcoal border border-subtleborder rounded-xl p-5">
                  <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">{move.title}</p>
                  <p className={`text-lg font-display font-bold ${move.badge === 'emerald' ? 'text-emerald' : move.badge === 'crimson' ? 'text-crimson' : 'text-chartblue'}`}>
                    {move.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      </div>
  );
}
