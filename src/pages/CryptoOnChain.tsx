import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import ComingSoonWrapper from '../components/ComingSoonWrapper';

gsap.registerPlugin(ScrollTrigger);

const overviewCards = [
  { label: 'BTC Price', value: '$97,250', icon: '₿' },
  { label: 'Market Cap', value: '$1.92T', icon: '◉' },
  { label: '24h Volume', value: '$38.5B', icon: '↔' },
  { label: 'Active Addresses', value: '1.02M', icon: '◎' },
];

const exchangeFlows = [
  { day: 'Mon', flow: 2400 },
  { day: 'Tue', flow: -1800 },
  { day: 'Wed', flow: -3200 },
  { day: 'Thu', flow: 800 },
  { day: 'Fri', flow: -2100 },
  { day: 'Sat', flow: 500 },
  { day: 'Sun', flow: -1500 },
];

const whaleTransactions = [
  { time: '1h ago', from: '3FZbgi...', to: 'Binance', amount: 452, value: 43900000, type: 'Transfer' },
  { time: '2h ago', from: 'Coinbase', to: '1A1zP1...', amount: 1100, value: 107000000, type: 'Withdrawal' },
  { time: '3h ago', from: 'bc1qxy...', to: 'Kraken', amount: 890, value: 86500000, type: 'Deposit' },
  { time: '5h ago', from: '3J98t1...', to: '1FeexV...', amount: 2100, value: 204000000, type: 'Transfer' },
  { time: '8h ago', from: 'Binance', to: 'bc1q42...', amount: 650, value: 63200000, type: 'Withdrawal' },
];

const typeBadge = (t: string) => {
  if (t === 'Withdrawal') return 'bg-emerald/20 text-emerald';
  if (t === 'Deposit') return 'bg-crimson/20 text-crimson';
  return 'bg-slategray/20 text-slategray';
};

const fmtUSD = (v: number) => {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  return `$${v.toLocaleString()}`;
};

// Generate 30-day active address data oscillating between 800K-1.1M
const activeAddressesData = Array.from({ length: 30 }, (_, i) => ({
  day: `${i + 1}`,
  addresses: Math.round(950000 + Math.sin(i * 0.5) * 120000 + Math.cos(i * 0.3) * 40000 + (Math.sin(i * 1.2) * 30000)),
}));

const onChainIndicators = [
  {
    name: 'NVT Ratio',
    value: 62.4,
    badge: 'Normal',
    badgeColor: 'bg-amber-500/20 text-amber-400',
    explanation: 'Network Value to Transaction ratio. Elevated (>70) suggests overvaluation; Normal (45-70); Low (<45) suggests undervaluation.',
  },
  {
    name: 'MVRV Z-Score',
    value: 1.8,
    badge: 'Neutral',
    badgeColor: 'bg-amber-500/20 text-amber-400',
    explanation: 'Market Value to Realized Value Z-Score. Overvalued (>7), Neutral (-1 to 7), Undervalued (<-1).',
  },
  {
    name: 'SOPR',
    value: 1.04,
    badge: 'Profit Taking',
    badgeColor: 'bg-emerald/20 text-emerald',
    explanation: 'Spent Output Profit Ratio. >1 indicates holders are selling at a profit (profit taking); <1 indicates capitulation.',
  },
];

export default function CryptoOnChain() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.crypto-section', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <ComingSoonWrapper featureName="Crypto On-Chain Analytics" description="Track whale movements, exchange flows, and on-chain indicators in real-time.">
      <div ref={sectionRef}>
      {/* Hero */}
      <section className="crypto-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite">Crypto On-Chain Analytics</h1>
          <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-emerald/20 text-emerald rounded">PRO</span>
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
          <h2 className="text-xl font-display font-medium text-offwhite mb-2">Exchange Net Flows — 7 Days</h2>
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
            <h2 className="text-xl font-display font-medium text-offwhite">Whale Transactions</h2>
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
                    <td className="p-4 text-sm font-mono text-emerald text-right">{fmtUSD(tx.value)}</td>
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
          <h2 className="text-xl font-display font-medium text-offwhite mb-6">Daily Active Addresses — 30 Days</h2>
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
        <h2 className="text-xl font-display font-medium text-offwhite mb-6">On-Chain Indicators</h2>
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
    </ComingSoonWrapper>
  );
}
