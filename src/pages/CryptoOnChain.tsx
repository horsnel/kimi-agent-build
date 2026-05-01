import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { fetchCryptoOnChain, type CryptoOnChainData } from '../services/api';
import { useGeoCurrency } from '../hooks/useGeoCurrency';


gsap.registerPlugin(ScrollTrigger);

const typeBadge = (t: string) => {
  if (t === 'Withdrawal') return 'bg-emerald/20 text-emerald';
  if (t === 'Deposit') return 'bg-crimson/20 text-crimson';
  return 'bg-slategray/20 text-slategray';
};

export default function CryptoOnChain() {
  const { formatLarge } = useGeoCurrency();
  const [data, setData] = useState<CryptoOnChainData | null>(null);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCryptoOnChain()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const overviewCards = data ? [
    { label: 'BTC Price', value: data.btcPrice, icon: '₿' },
    { label: 'Market Cap', value: data.marketCap, icon: '◉' },
    { label: '24h Volume', value: data.volume24h, icon: '↔' },
    { label: 'Active Addresses', value: data.activeAddresses, icon: '◎' },
  ] : [];
  const exchangeFlows = data?.exchangeFlows ?? [];
  const whaleTransactions = data?.whaleTransactions ?? [];
  const activeAddressesData = data?.activeAddressesData ?? [];
  const onChainIndicators = data?.onChainIndicators ?? [];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.crypto-section', { opacity: 0, y: 40 }, {
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
        <p className="text-slategray text-sm mt-4">Loading on-chain analytics...</p>
      </div>
    );
  }

  return (
      <div ref={sectionRef}>
      {/* Hero */}
      <section className="crypto-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite">Crypto On-Chain Analytics</h1>
          <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-emerald/20 text-emerald rounded">LIVE</span>
        </div>
        <p className="text-slategray text-lg">Deep dive into Bitcoin blockchain metrics and whale activity</p>
      </section>

      {/* BTC Overview Cards */}
      <section className="crypto-section max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewCards.map((c) => (
            <div key={c.label} className="bg-charcoal border border-subtleborder rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-emerald text-lg">{c.icon}</span>
                <p className="text-xs font-mono text-slategray uppercase tracking-wider">{c.label}</p>
              </div>
              <p className="text-2xl font-display font-bold text-offwhite">{c.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Exchange Net Flows */}
      <section className="crypto-section max-w-7xl mx-auto px-6 py-8">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
          <h2 className="text-xl font-display font-light text-offwhite mb-2">Exchange Net Flows — 7 Days</h2>
          <p className="text-xs text-slategray mb-6">Positive = inflow to exchanges (selling pressure) · Negative = outflow (accumulation)</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exchangeFlows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}K`} />
                <Tooltip contentStyle={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '8px', color: '#E8E8E6' }} formatter={(v: number) => [`${v.toLocaleString()} BTC`, 'Net Flow']} />
                <Bar dataKey="flow" radius={[4, 4, 0, 0]}>
                  {exchangeFlows.map((entry, idx) => (
                    <Cell key={idx} fill={entry.flow >= 0 ? '#EF4444' : '#10B981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Whale Transactions */}
      <section className="crypto-section max-w-7xl mx-auto px-6 py-8">
        <div className="bg-charcoal border border-subtleborder rounded-xl overflow-hidden">
          <div className="p-6 border-b border-subtleborder">
            <h2 className="text-xl font-display font-light text-offwhite">Whale Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-subtleborder bg-deepblack/50">
                  <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider p-4">Time</th>
                  <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider p-4">From</th>
                  <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider p-4">To</th>
                  <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider p-4">Amount (BTC)</th>
                  <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider p-4">Value (USD)</th>
                  <th className="text-center text-xs font-mono text-slategray uppercase tracking-wider p-4">Type</th>
                </tr>
              </thead>
              <tbody>
                {whaleTransactions.map((tx, idx) => (
                  <tr key={idx} className="border-b border-subtleborder/50 hover:bg-deepblack/50 transition-colors">
                    <td className="p-4 text-xs font-mono text-slategray">{tx.time}</td>
                    <td className="p-4 text-sm font-mono text-offwhite">{tx.from}</td>
                    <td className="p-4 text-sm font-mono text-offwhite">{tx.to}</td>
                    <td className="p-4 text-sm font-mono text-offwhite text-right">{tx.amount.toLocaleString()}</td>
                    <td className="p-4 text-sm font-mono text-emerald text-right">{formatLarge(tx.value)}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 text-xs font-mono font-medium rounded ${typeBadge(tx.type)}`}>{tx.type}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Daily Active Addresses */}
      <section className="crypto-section max-w-7xl mx-auto px-6 py-8">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
          <h2 className="text-xl font-display font-light text-offwhite mb-6">Daily Active Addresses — 30 Days</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeAddressesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 10 }} interval={4} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} domain={[700000, 1200000]} />
                <Tooltip contentStyle={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '8px', color: '#E8E8E6' }} formatter={(v: number) => [`${(v / 1000).toFixed(0)}K`, 'Active Addresses']} />
                <Line type="monotone" dataKey="addresses" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* On-Chain Indicators */}
      <section className="crypto-section max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-xl font-display font-light text-offwhite mb-6">On-Chain Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {onChainIndicators.map((ind) => (
            <div key={ind.name} className="bg-charcoal border border-subtleborder rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-mono text-slategray uppercase tracking-wider">{ind.name}</p>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded ${ind.badgeColor}`}>{ind.badge}</span>
              </div>
              <p className="text-3xl font-display font-bold text-offwhite mb-3">{ind.value}</p>
              <p className="text-xs text-slategray leading-relaxed">{ind.explanation}</p>
            </div>
          ))}
        </div>
      </section>

      </div>
  );
}
