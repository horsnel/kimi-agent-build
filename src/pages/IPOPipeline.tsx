import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import PremiumGate from '../components/PremiumGate';

gsap.registerPlugin(ScrollTrigger);

const ipoCalendar = [
  { month: 'May 2026', count: 8 },
  { month: 'Jun 2026', count: 12 },
  { month: 'Jul 2026', count: 6 },
  { month: 'Aug 2026', count: 9 },
  { month: 'Sep 2026', count: 5 },
  { month: 'Oct 2026', count: 7 },
];

const upcomingIPOs = [
  { company: 'Stripe', date: 'May 2026', valuation: 65, underwriters: 'GS / MS', sector: 'Fintech', risk: 'Medium' },
  { company: 'Databricks', date: 'Jun 2026', valuation: 43, underwriters: 'JPM / GS', sector: 'Enterprise Software', risk: 'Low' },
  { company: 'Canva', date: 'Jun 2026', valuation: 26, underwriters: 'MS / UBS', sector: 'Design SaaS', risk: 'Low' },
  { company: 'SpaceX Spinoff', date: 'Jul 2026', valuation: 15, underwriters: 'Unspecified', sector: 'Aerospace', risk: 'High' },
  { company: 'Discord', date: 'Jul 2026', valuation: 15, underwriters: 'GS / MS', sector: 'Communication', risk: 'Medium' },
  { company: 'Plaid', date: 'Aug 2026', valuation: 12, underwriters: 'JPM / Citi', sector: 'Fintech', risk: 'Low' },
  { company: 'Anduril', date: 'Sep 2026', valuation: 8, underwriters: 'Unspecified', sector: 'Defense Tech', risk: 'High' },
  { company: 'Wiz', date: 'Sep 2026', valuation: 7, underwriters: 'GS / MS', sector: 'Cybersecurity', risk: 'Low' },
  { company: 'Rippling', date: 'Oct 2026', valuation: 5, underwriters: 'Unspecified', sector: 'HR SaaS', risk: 'Medium' },
];

const riskBadge = (r: string) => {
  if (r === 'Low') return 'bg-emerald/20 text-emerald';
  if (r === 'Medium') return 'bg-amber-500/20 text-amber-400';
  return 'bg-crimson/20 text-crimson';
};

const recentIPOs = [
  { company: 'Arm Holdings', ipoPrice: 51, currentPrice: 68, returnPct: 33.3 },
  { company: 'Instacart', ipoPrice: 30, currentPrice: 28, returnPct: -6.7 },
  { company: 'Klaviyo', ipoPrice: 30, currentPrice: 36, returnPct: 20.0 },
  { company: 'Birkenstock', ipoPrice: 46, currentPrice: 52, returnPct: 13.0 },
  { company: 'Cava', ipoPrice: 22, currentPrice: 48, returnPct: 118.2 },
  { company: 'Oddity Tech', ipoPrice: 35, currentPrice: 42, returnPct: 20.0 },
];

const spacs = [
  { name: 'Aurora Acquisition Corp.', ticker: 'AURC', status: 'Searching', target: 'Fintech', trust: '$240M' },
  { name: 'Horizon Capital II', ticker: 'HZNC', status: 'Filed', target: 'Healthcare', trust: '$180M' },
  { name: 'Graphite Holdings', ticker: 'GRPH', status: 'Merger Vote', target: 'AI/ML', trust: '$320M' },
  { name: 'Vantage Point Inc.', ticker: 'VPTI', status: 'Closing', target: 'Clean Energy', trust: '$150M' },
];

const spacBadge = (s: string) => {
  if (s === 'Searching') return 'bg-amber-500/20 text-amber-400';
  if (s === 'Filed') return 'bg-chartblue/20 text-chartblue';
  if (s === 'Merger Vote') return 'bg-emerald/20 text-emerald';
  return 'bg-emerald/20 text-emerald';
};

export default function IPOPipeline() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.ipo-section', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="ipo-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite">IPO Pipeline</h1>
          <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-emerald/20 text-emerald rounded">PRO</span>
        </div>
        <p className="text-slategray text-lg">Track upcoming public offerings and recently listed companies</p>
      </section>

      {/* IPO Calendar BarChart */}
      <section className="ipo-section max-w-7xl mx-auto px-6 py-8">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
          <h2 className="text-xl font-display font-medium text-offwhite mb-6">IPO Calendar — Expected Offerings</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ipoCalendar}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '8px', color: '#E8E8E6' }} formatter={(v: number) => [`${v} IPOs`, 'Expected']} />
                <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Upcoming IPOs Table */}
      <section className="ipo-section max-w-7xl mx-auto px-6 py-8">
        <div className="bg-charcoal border border-subtleborder rounded-xl overflow-hidden">
          <div className="p-6 border-b border-subtleborder">
            <h2 className="text-xl font-display font-medium text-offwhite">Upcoming IPOs</h2>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead className="sticky top-0 bg-deepblack/90 backdrop-blur-sm z-10">
                <tr className="border-b border-subtleborder">
                  <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider p-4">Company</th>
                  <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider p-4">Expected Date</th>
                  <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider p-4">Valuation ($B)</th>
                  <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider p-4">Underwriters</th>
                  <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider p-4">Sector</th>
                  <th className="text-center text-xs font-mono text-slategray uppercase tracking-wider p-4">Risk Rating</th>
                </tr>
              </thead>
              <tbody>
                {upcomingIPOs.map((ipo) => (
                  <tr key={ipo.company} className="border-b border-subtleborder/50 hover:bg-deepblack/50 transition-colors">
                    <td className="p-4 text-sm text-offwhite font-medium">{ipo.company}</td>
                    <td className="p-4 text-sm text-slategray">{ipo.date}</td>
                    <td className="p-4 text-sm font-mono text-offwhite text-right">${ipo.valuation}B</td>
                    <td className="p-4 text-sm text-slategray">{ipo.underwriters}</td>
                    <td className="p-4 text-sm text-slategray">{ipo.sector}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 text-xs font-mono font-medium rounded ${riskBadge(ipo.risk)}`}>{ipo.risk}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Recently Priced IPOs */}
      <section className="ipo-section max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-xl font-display font-medium text-offwhite mb-6">Recently Priced IPOs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentIPOs.map((ipo) => (
            <div key={ipo.company} className="bg-charcoal border border-subtleborder rounded-xl p-5">
              <p className="text-sm font-medium text-offwhite mb-3">{ipo.company}</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-[10px] font-mono text-slategray uppercase tracking-wider">IPO Price</p>
                  <p className="text-sm font-mono text-offwhite">${ipo.ipoPrice}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slategray uppercase tracking-wider">Current</p>
                  <p className="text-sm font-mono text-offwhite">${ipo.currentPrice}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-subtleborder">
                <p className="text-[10px] font-mono text-slategray uppercase tracking-wider">First-Day Return</p>
                <p className={`text-sm font-mono font-medium ${ipo.returnPct >= 0 ? 'text-emerald' : 'text-crimson'}`}>
                  {ipo.returnPct >= 0 ? '+' : ''}{ipo.returnPct.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SPAC Tracker */}
      <section className="ipo-section max-w-7xl mx-auto px-6 py-8">
        <div className="bg-charcoal border border-subtleborder rounded-xl overflow-hidden">
          <div className="p-6 border-b border-subtleborder">
            <h2 className="text-xl font-display font-medium text-offwhite">SPAC Tracker</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-subtleborder bg-deepblack/50">
                  <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider p-4">SPAC Name</th>
                  <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider p-4">Ticker</th>
                  <th className="text-center text-xs font-mono text-slategray uppercase tracking-wider p-4">Status</th>
                  <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider p-4">Target</th>
                  <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider p-4">Trust Value</th>
                </tr>
              </thead>
              <tbody>
                {spacs.map((spac) => (
                  <tr key={spac.ticker} className="border-b border-subtleborder/50 hover:bg-deepblack/50 transition-colors">
                    <td className="p-4 text-sm text-offwhite">{spac.name}</td>
                    <td className="p-4 text-sm font-mono text-emerald">{spac.ticker}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 text-xs font-mono font-medium rounded ${spacBadge(spac.status)}`}>{spac.status}</span>
                    </td>
                    <td className="p-4 text-sm text-slategray">{spac.target}</td>
                    <td className="p-4 text-sm font-mono text-offwhite text-right">{spac.trust}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Premium Gate */}
      <section className="ipo-section max-w-7xl mx-auto px-6 py-12">
        <PremiumGate featureName="IPO Pipeline" description="Get early access to IPO research, valuation analysis, and allocation opportunities." />
      </section>
    </div>
  );
}
