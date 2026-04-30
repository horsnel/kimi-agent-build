import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import PremiumGate from '../components/PremiumGate';

gsap.registerPlugin(ScrollTrigger);

const filings = [
  { date: 'Jan 22, 2026', insider: 'Tim Cook', title: 'CEO', company: 'AAPL', transaction: 'Sale', shares: 100000, price: 210, totalValue: 21000000 },
  { date: 'Jan 21, 2026', insider: 'Jensen Huang', title: 'CEO', company: 'NVDA', transaction: 'Sale', shares: 50000, price: 620, totalValue: 31000000 },
  { date: 'Jan 20, 2026', insider: 'Satya Nadella', title: 'CEO', company: 'MSFT', transaction: 'Purchase', shares: 10000, price: 420, totalValue: 4200000 },
  { date: 'Jan 19, 2026', insider: 'Mark Zuckerberg', title: 'CEO', company: 'META', transaction: 'Sale', shares: 28000, price: 520, totalValue: 14560000 },
  { date: 'Jan 18, 2026', insider: 'Andy Jassy', title: 'CEO', company: 'AMZN', transaction: 'Sale', shares: 20000, price: 185, totalValue: 3700000 },
  { date: 'Jan 17, 2026', insider: 'Jamie Dimon', title: 'CEO', company: 'JPM', transaction: 'Sale', shares: 75000, price: 168, totalValue: 12600000 },
  { date: 'Jan 16, 2026', insider: 'Lisa Su', title: 'CEO', company: 'AMD', transaction: 'Purchase', shares: 15000, price: 145, totalValue: 2175000 },
  { date: 'Jan 15, 2026', insider: 'Safra Catz', title: 'CEO', company: 'ORCL', transaction: 'Sale', shares: 40000, price: 132, totalValue: 5280000 },
  { date: 'Jan 14, 2026', insider: 'Arvind Krishna', title: 'CEO', company: 'IBM', transaction: 'Purchase', shares: 8000, price: 198, totalValue: 1584000 },
  { date: 'Jan 13, 2026', insider: 'David Solomon', title: 'CEO', company: 'GS', transaction: 'Sale', shares: 18000, price: 425, totalValue: 7650000 },
  { date: 'Jan 12, 2026', insider: 'Jane Fraser', title: 'CEO', company: 'C', transaction: 'Purchase', shares: 25000, price: 62, totalValue: 1550000 },
  { date: 'Jan 11, 2026', insider: 'Brian Moynihan', title: 'CEO', company: 'BAC', transaction: 'Sale', shares: 35000, price: 38, totalValue: 1330000 },
  { date: 'Jan 10, 2026', insider: 'Pat Gelsinger', title: 'Former CEO', company: 'INTC', transaction: 'Sale', shares: 50000, price: 24, totalValue: 1200000 },
  { date: 'Jan 9, 2026', insider: 'Reed Hastings', title: 'Chairman', company: 'NFLX', transaction: 'Sale', shares: 12000, price: 680, totalValue: 8160000 },
];

const topSellers = [
  { name: 'J. Huang (NVDA)', value: 31.0 },
  { name: 'T. Cook (AAPL)', value: 21.0 },
  { name: 'M. Zuckerberg (META)', value: 14.56 },
  { name: 'J. Dimon (JPM)', value: 12.6 },
  { name: 'D. Solomon (GS)', value: 7.65 },
];

const clusters = [
  { title: 'Multiple AAPL Execs Sold', description: '3 insiders sold in past week', totalValue: '$42M', badge: 'crimson' },
  { title: 'NVDA Directors Buying', description: '3 directors purchased', totalValue: '$8.5M', badge: 'emerald' },
  { title: 'JPM CFO Sells $12M', description: 'Largest single insider sale this week', totalValue: '$12M', badge: 'crimson' },
];

const fmtCurrency = (v: number) => {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v}`;
};

export default function InsiderTrading() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.ins-section', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="ins-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite">Insider Trading Dashboard</h1>
          <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-emerald/20 text-emerald rounded">PRO</span>
        </div>
        <p className="text-slategray text-lg">Track Form 4 filings and insider activity</p>
      </section>

      {/* Summary Cards */}
      <section className="ins-section max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-charcoal border border-emerald/30 rounded-xl p-6">
            <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Total Buys</p>
            <p className="text-3xl font-display font-bold text-emerald">$142.5M</p>
            <p className="text-xs text-emerald/60 mt-1 font-mono">23 transactions</p>
          </div>
          <div className="bg-charcoal border border-crimson/30 rounded-xl p-6">
            <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Total Sells</p>
            <p className="text-3xl font-display font-bold text-crimson">$893.2M</p>
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
            <h2 className="text-xl font-display font-medium text-offwhite">Recent Form 4 Filings</h2>
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
                    <td className="p-4 text-sm font-mono text-offwhite text-right">${f.price}</td>
                    <td className="p-4 text-sm font-mono text-offwhite text-right">{fmtCurrency(f.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Notable Clusters */}
      <section className="ins-section max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-xl font-display font-medium text-offwhite mb-6">Notable Clusters</h2>
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
              <p className={`text-lg font-display font-bold ${c.badge === 'emerald' ? 'text-emerald' : 'text-crimson'}`}>{c.totalValue} total</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Sellers Chart */}
      <section className="ins-section max-w-7xl mx-auto px-6 py-8">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
          <h2 className="text-xl font-display font-medium text-offwhite mb-6">Top Insider Sellers</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSellers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(v: number) => `$${v}M`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#E8E8E6', fontSize: 11 }} width={160} />
                <Tooltip contentStyle={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '8px', color: '#E8E8E6' }} formatter={(v: number) => [`$${v}M`, 'Total Value']} />
                <Bar dataKey="value" fill="#EF4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Premium Gate */}
      <section className="ins-section max-w-7xl mx-auto px-6 py-12">
        <PremiumGate featureName="Insider Trading Dashboard" description="Track Form 4 filings, insider clusters, and institutional activity in real-time." />
      </section>
    </div>
  );
}
