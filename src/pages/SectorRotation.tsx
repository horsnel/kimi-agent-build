import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';


gsap.registerPlugin(ScrollTrigger);

const sectorNames = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer Disc', 'Consumer Staples', 'Industrials', 'Materials', 'Utilities', 'Real Estate'];

const radarData = sectorNames.map((name, i) => ({
  sector: name,
  current: [92, 74, 58, 81, 35, 65, 52, 44, 28, 22][i],
  previous: [78, 68, 72, 55, 48, 60, 58, 52, 38, 35][i],
}));

const moneyFlowData = [
  { sector: 'Tech', flow: 4200 },
  { sector: 'Health', flow: 1800 },
  { sector: 'Finance', flow: -500 },
  { sector: 'Energy', flow: 2100 },
  { sector: 'ConsDisc', flow: -1200 },
  { sector: 'ConsStap', flow: 300 },
  { sector: 'Indust', flow: 100 },
  { sector: 'Mater', flow: -800 },
  { sector: 'Util', flow: -300 },
  { sector: 'RE', flow: -600 },
];

const performanceData = [
  { sector: 'Technology', w1: 2.4, m1: 5.8, m3: 12.1, ytd: 18.5, signal: 'Accelerating' },
  { sector: 'Healthcare', w1: 1.1, m1: 3.2, m3: 7.4, ytd: 10.2, signal: 'Accelerating' },
  { sector: 'Finance', w1: -0.3, m1: 1.8, m3: 4.5, ytd: 8.1, signal: 'Stable' },
  { sector: 'Energy', w1: 1.8, m1: 4.6, m3: 9.2, ytd: 14.7, signal: 'Accelerating' },
  { sector: 'Consumer Disc', w1: -1.2, m1: -2.4, m3: -5.1, ytd: -3.8, signal: 'Decelerating' },
  { sector: 'Consumer Staples', w1: 0.5, m1: 1.2, m3: 3.1, ytd: 5.4, signal: 'Stable' },
  { sector: 'Industrials', w1: 0.2, m1: 0.9, m3: 2.8, ytd: 6.3, signal: 'Stable' },
  { sector: 'Materials', w1: -0.8, m1: -1.5, m3: -3.2, ytd: -2.1, signal: 'Decelerating' },
  { sector: 'Utilities', w1: -0.5, m1: -1.8, m3: -4.6, ytd: -5.9, signal: 'Decelerating' },
  { sector: 'Real Estate', w1: -0.4, m1: -2.1, m3: -5.8, ytd: -8.3, signal: 'Decelerating' },
];

const wowCards = [
  { sector: 'Technology', change: 5.2, positive: true },
  { sector: 'Energy', change: 3.1, positive: true },
  { sector: 'Consumer Disc', change: -4.8, positive: false },
  { sector: 'Utilities', change: -2.1, positive: false },
];

const signalBadge = (signal: string) => {
  if (signal === 'Accelerating') return 'bg-emerald/20 text-emerald';
  if (signal === 'Decelerating') return 'bg-crimson/20 text-crimson';
  return 'bg-slategray/20 text-slategray';
};

const fmt = (v: number) => (v >= 0 ? `+${v.toFixed(1)}%` : `${v.toFixed(1)}%`);

export default function SectorRotation() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.sr-section', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
      <div ref={sectionRef}>
        {/* Hero */}
        <section className="sr-section max-w-7xl mx-auto px-6 pt-24 pb-12">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite">Sector Rotation Tracker</h1>
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-emerald/20 text-emerald rounded">LIVE</span>
          </div>
          <p className="text-slategray text-lg">Dynamic sector allocation signals based on macro regime</p>
        </section>

        {/* Radar Chart */}
        <section className="sr-section max-w-7xl mx-auto px-6 py-8">
          <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
            <h2 className="text-xl font-display font-medium text-offwhite mb-6">Relative Strength Radar</h2>
            <div className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="#222222" />
                  <PolarAngleAxis dataKey="sector" tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6B7280', fontSize: 10 }} />
                  <Radar name="Current" dataKey="current" stroke="#10B981" fill="#10B981" fillOpacity={0.35} strokeWidth={2} />
                  <Radar name="Previous" dataKey="previous" stroke="#6B7280" fill="#6B7280" fillOpacity={0.2} strokeWidth={1.5} />
                  <Legend wrapperStyle={{ color: '#E8E8E6', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '8px', color: '#E8E8E6' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Money Flow BarChart */}
        <section className="sr-section max-w-7xl mx-auto px-6 py-8">
          <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
            <h2 className="text-xl font-display font-medium text-offwhite mb-6">Money Flow by Sector</h2>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moneyFlowData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}B`} />
                  <YAxis type="category" dataKey="sector" tick={{ fill: '#E8E8E6', fontSize: 12 }} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '8px', color: '#E8E8E6' }} formatter={(v: number) => [`$${(v / 1000).toFixed(1)}B`, 'Flow']} />
                  <Bar dataKey="flow" radius={[0, 4, 4, 0]}>
                    {moneyFlowData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.flow >= 0 ? '#10B981' : '#EF4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Week-over-Week Change Cards */}
        <section className="sr-section max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-xl font-display font-medium text-offwhite mb-6">Week-over-Week Change</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {wowCards.map((c) => (
              <div key={c.sector} className="bg-charcoal border border-subtleborder rounded-xl p-5">
                <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">{c.sector}</p>
                <p className={`text-2xl font-display font-semibold ${c.positive ? 'text-emerald' : 'text-crimson'}`}>
                  {c.positive ? '+' : ''}{c.change}%
                </p>
                <p className={`text-xs font-mono mt-1 ${c.positive ? 'text-emerald/70' : 'text-crimson/70'}`}>
                  {c.positive ? '▲ Accelerating' : '▼ Decelerating'}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Performance Table */}
        <section className="sr-section max-w-7xl mx-auto px-6 py-8">
          <div className="bg-charcoal border border-subtleborder rounded-xl overflow-hidden">
            <div className="p-6 border-b border-subtleborder">
              <h2 className="text-xl font-display font-medium text-offwhite">Sector Performance & Signals</h2>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-deepblack/90 backdrop-blur-sm z-10">
                  <tr className="border-b border-subtleborder">
                    <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider p-4">Sector</th>
                    <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider p-4">1W %</th>
                    <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider p-4">1M %</th>
                    <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider p-4">3M %</th>
                    <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider p-4">YTD %</th>
                    <th className="text-center text-xs font-mono text-slategray uppercase tracking-wider p-4">Rotation Signal</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData.map((row) => (
                    <tr key={row.sector} className="border-b border-subtleborder/50 hover:bg-deepblack/50 transition-colors">
                      <td className="p-4 text-sm text-offwhite font-medium">{row.sector}</td>
                      <td className={`p-4 text-sm font-mono text-right ${row.w1 >= 0 ? 'text-emerald' : 'text-crimson'}`}>{fmt(row.w1)}</td>
                      <td className={`p-4 text-sm font-mono text-right ${row.m1 >= 0 ? 'text-emerald' : 'text-crimson'}`}>{fmt(row.m1)}</td>
                      <td className={`p-4 text-sm font-mono text-right ${row.m3 >= 0 ? 'text-emerald' : 'text-crimson'}`}>{fmt(row.m3)}</td>
                      <td className={`p-4 text-sm font-mono text-right ${row.ytd >= 0 ? 'text-emerald' : 'text-crimson'}`}>{fmt(row.ytd)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 text-xs font-mono font-medium rounded ${signalBadge(row.signal)}`}>{row.signal}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
  );
}
