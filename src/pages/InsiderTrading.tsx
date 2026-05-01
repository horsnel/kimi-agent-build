import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { fetchInsiderTrading, type InsiderFiling } from '../services/api';
import { useGeoCurrency } from '../hooks/useGeoCurrency';


gsap.registerPlugin(ScrollTrigger);

const clusters = [
  { title: 'Multiple AAPL Execs Sold', description: '3 insiders sold in past week', totalValue: 42000000, badge: 'crimson' },
  { title: 'NVDA Directors Buying', description: '3 directors purchased', totalValue: 8500000, badge: 'emerald' },
  { title: 'JPM CFO Sells $12M', description: 'Largest single insider sale this week', totalValue: 12000000, badge: 'crimson' },
];



export default function InsiderTrading() {
  const [filings, setFilings] = useState<InsiderFiling[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { formatLocal, formatLarge, formatChartTick } = useGeoCurrency();

  useEffect(() => {
    fetchInsiderTrading()
      .then(setFilings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const topSellers = filings
    .filter((f) => f.transaction === 'Sale')
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5)
    .map((f) => ({ name: `${f.insider.split(' ')[0][0]}. ${f.insider.split(' ').slice(1).join(' ')} (${f.company})`, value: Math.round(f.totalValue / 1000000 * 100) / 100 }));

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.ins-section', { opacity: 0, y: 40 }, {
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
        <p className="text-slategray text-sm mt-4">Loading insider trading data...</p>
      </div>
    );
  }

  return (
      <div ref={sectionRef}>
        {/* Hero */}
        <section className="ins-section max-w-7xl mx-auto px-6 pt-24 pb-12">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite">Insider Trading Dashboard</h1>
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-emerald/20 text-emerald rounded">LIVE</span>
          </div>
          <p className="text-slategray text-lg">Track Form 4 filings and insider activity</p>
        </section>

        {/* Summary Cards */}
        <section className="ins-section max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-charcoal border border-emerald/30 rounded-xl p-6">
              <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Total Buys</p>
              <p className="text-3xl font-display font-bold text-emerald">{formatLarge(142500000)}</p>
              <p className="text-xs text-emerald/60 mt-1 font-mono">23 transactions</p>
            </div>
            <div className="bg-charcoal border border-crimson/30 rounded-xl p-6">
              <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Total Sells</p>
              <p className="text-3xl font-display font-bold text-crimson">{formatLarge(893200000)}</p>
              <p className="text-xs text-crimson/60 mt-1 font-mono">58 transactions</p>
            </div>
            <div className="bg-charcoal border border-amber-500/30 rounded-xl p-6">
              <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Buy/Sell Ratio</p>
              <p className="text-3xl font-display font-bold text-amber-400">0.16</p>
              <p className="text-xs text-amber-400/60 mt-1 font-mono">Heavily sell-biased</p>
            </div>
          </div>
        </section>

        {/* Form 4 Filings Table */}
        <section className="ins-section max-w-7xl mx-auto px-6 py-8">
          <div className="bg-charcoal border border-subtleborder rounded-xl overflow-hidden">
            <div className="p-6 border-b border-subtleborder">
              <h2 className="text-xl font-display font-light text-offwhite">Recent Form 4 Filings</h2>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-deepblack/90 backdrop-blur-sm z-10">
                  <tr className="border-b border-subtleborder">
                    <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider p-4">Date</th>
                    <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider p-4">Insider</th>
                    <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider p-4">Title</th>
                    <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider p-4">Company</th>
                    <th className="text-center text-xs font-mono text-slategray uppercase tracking-wider p-4">Transaction</th>
                    <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider p-4">Shares</th>
                    <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider p-4">Price</th>
                    <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider p-4">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {filings.map((f, idx) => (
                    <tr key={idx} className="border-b border-subtleborder/50 hover:bg-deepblack/50 transition-colors">
                      <td className="p-4 text-xs font-mono text-slategray">{f.date}</td>
                      <td className="p-4 text-sm text-offwhite">{f.insider}</td>
                      <td className="p-4 text-xs text-slategray">{f.title}</td>
                      <td className="p-4 text-sm font-mono text-emerald">{f.company}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 text-xs font-mono font-medium rounded ${f.transaction === 'Purchase' ? 'bg-emerald/20 text-emerald' : 'bg-crimson/20 text-crimson'}`}>
                          {f.transaction === 'Purchase' ? 'Buy' : 'Sell'}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-mono text-offwhite text-right">{f.shares.toLocaleString()}</td>
                      <td className="p-4 text-sm font-mono text-offwhite text-right">{formatLocal(f.price)}</td>
                      <td className="p-4 text-sm font-mono text-offwhite text-right">{formatLarge(f.totalValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Notable Clusters */}
        <section className="ins-section max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-xl font-display font-light text-offwhite mb-6">Notable Clusters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clusters.map((c) => (
              <div key={c.title} className={`bg-charcoal border ${c.badge === 'emerald' ? 'border-emerald/30' : 'border-crimson/30'} rounded-xl p-6`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-medium text-offwhite">{c.title}</h3>
                  <span className={`px-1.5 py-0.5 text-[10px] font-mono font-medium rounded ${c.badge === 'emerald' ? 'bg-emerald/20 text-emerald' : 'bg-crimson/20 text-crimson'}`}>
                    {c.badge === 'emerald' ? 'BUY' : 'SELL'}
                  </span>
                </div>
                <p className="text-xs text-slategray mb-2">{c.description}</p>
                <p className={`text-lg font-display font-bold ${c.badge === 'emerald' ? 'text-emerald' : 'text-crimson'}`}>{formatLarge(c.totalValue)} total</p>
              </div>
            ))}
          </div>
        </section>

        {/* Top Sellers Chart */}
        <section className="ins-section max-w-7xl mx-auto px-6 py-8">
          <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
            <h2 className="text-xl font-display font-light text-offwhite mb-6">Top Insider Sellers</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSellers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(v: number) => formatChartTick(v * 1e6)} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#E8E8E6', fontSize: 11 }} width={160} />
                  <Tooltip contentStyle={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '8px', color: '#E8E8E6' }} formatter={(v: number) => [formatLarge(v * 1e6), 'Total Value']} />
                  <Bar dataKey="value" fill="#EF4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>
  );
}
