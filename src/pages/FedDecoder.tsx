import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import PremiumGate from '../components/PremiumGate';

gsap.registerPlugin(ScrollTrigger);

const whatChanged = [
  { text: 'Inflation language upgraded from "elevated" to "sticky"', positive: true },
  { text: 'Added reference to "patience" on future cuts', positive: true },
  { text: 'Removed "additional tightening" reference', positive: false },
  { text: 'New language on balance sheet normalization pace', positive: true },
];

const dotPlotData = [
  { year: '2025', rate: 4.0 }, { year: '2025', rate: 4.25 }, { year: '2025', rate: 4.5 }, { year: '2025', rate: 4.5 }, { year: '2025', rate: 4.75 },
  { year: '2026', rate: 3.25 }, { year: '2026', rate: 3.5 }, { year: '2026', rate: 3.5 }, { year: '2026', rate: 3.75 }, { year: '2026', rate: 4.0 },
  { year: '2027', rate: 2.75 }, { year: '2027', rate: 3.0 }, { year: '2027', rate: 3.0 }, { year: '2027', rate: 3.25 }, { year: '2027', rate: 3.5 },
  { year: 'Long Run', rate: 2.25 }, { year: 'Long Run', rate: 2.5 }, { year: 'Long Run', rate: 2.5 }, { year: 'Long Run', rate: 2.5 }, { year: 'Long Run', rate: 2.75 },
];

const yearColors: Record<string, string> = {
  '2025': '#10B981',
  '2026': '#3B82F6',
  '2027': '#F59E0B',
  'Long Run': '#6B7280',
};

const meetings = [
  { date: 'Jan 2025', decision: 'Hold', rate: '4.25-4.50%' },
  { date: 'Dec 2024', decision: 'Cut', rate: '4.25-4.50%' },
  { date: 'Nov 2024', decision: 'Hold', rate: '4.50-4.75%' },
  { date: 'Sep 2024', decision: 'Cut', rate: '4.75-5.00%' },
  { date: 'Jul 2024', decision: 'Hold', rate: '5.25-5.50%' },
  { date: 'Jun 2024', decision: 'Hold', rate: '5.25-5.50%' },
];

const decisionBadge = (d: string) => {
  if (d === 'Cut') return 'bg-emerald/20 text-emerald';
  if (d === 'Hike') return 'bg-crimson/20 text-crimson';
  return 'bg-slategray/20 text-slategray';
};

const expectations = [
  { label: '< 4.00%', prob: 5, color: '#10B981' },
  { label: '4.00-4.25%', prob: 15, color: '#3B82F6' },
  { label: '4.25-4.50%', prob: 65, color: '#6366F1' },
  { label: '4.50-4.75%', prob: 12, color: '#F59E0B' },
  { label: '> 4.75%', prob: 3, color: '#EF4444' },
];

export default function FedDecoder() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.fed-section', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="relative">
      {/* Blurred content behind overlay */}
      <div className="filter blur-md select-none pointer-events-none" aria-hidden="true">
      {/* Hero */}
      <section className="fed-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite">Fed Policy Decoder</h1>
          <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-emerald/20 text-emerald rounded">PRO</span>
        </div>
        <p className="text-slategray text-lg">Decode FOMC statements and understand monetary policy implications</p>
      </section>

      {/* FOMC Statement Summary */}
      <section className="fed-section max-w-7xl mx-auto px-6 py-8">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
          <h2 className="text-xl font-display font-medium text-offwhite mb-4">FOMC Statement Summary</h2>
          <p className="text-sm text-offwhite/80 leading-relaxed mb-4">
            The Federal Open Market Committee decided to maintain the target range for the federal funds rate at 4.25-4.50 percent. The Committee judges that the risks to achieving its employment and inflation goals are roughly in balance. Economic activity has continued to expand at a solid pace, while inflation remains somewhat elevated but has shown signs of moderating toward the 2 percent target.
          </p>
          <p className="text-sm text-offwhite/80 leading-relaxed">
            In assessing the appropriate stance of monetary policy, the Committee will continue to monitor the implications of incoming information for the economic outlook. The Committee would be prepared to adjust the stance of monetary policy as appropriate if risks emerge that could impede the attainment of the Committee&apos;s goals. The Committee&apos;s assessments will take into account a wide range of information, including readings on labor market conditions, inflation pressures and inflation expectations, and financial and international developments.
          </p>
        </div>
      </section>

      {/* What Changed */}
      <section className="fed-section max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-xl font-display font-medium text-offwhite mb-6">What Changed</h2>
        <div className="space-y-3">
          {whatChanged.map((item, idx) => (
            <div key={idx} className="bg-charcoal border border-subtleborder rounded-xl p-4 flex items-start gap-3">
              <span className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded shrink-0 ${item.positive ? 'bg-emerald/20 text-emerald' : 'bg-crimson/20 text-crimson'}`}>
                {item.positive ? '+' : '−'}
              </span>
              <p className="text-sm text-offwhite">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dot Plot ScatterChart */}
      <section className="fed-section max-w-7xl mx-auto px-6 py-8">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
          <h2 className="text-xl font-display font-medium text-offwhite mb-6">FOMC Dot Plot — Rate Projections</h2>
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis
                  type="category" dataKey="year" name="Year"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  allowDuplicatedCategory={false}
                />
                <YAxis
                  type="number" dataKey="rate" name="Rate"
                  domain={[2, 5.5]} tick={{ fill: '#6B7280', fontSize: 11 }}
                  tickFormatter={(v: number) => `${v.toFixed(2)}%`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '8px', color: '#E8E8E6' }}
                  formatter={(value: number) => [`${value.toFixed(2)}%`, 'Fed Funds Rate']}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {Object.entries(yearColors).map(([year, color]) => (
                  <Scatter key={year} name={year} data={dotPlotData.filter((d) => d.year === year)} fill={color}>
                    {dotPlotData.filter((d) => d.year === year).map((_, idx) => (
                      <Cell key={idx} fill={color} />
                    ))}
                  </Scatter>
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Rate Decision Timeline */}
      <section className="fed-section max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-xl font-display font-medium text-offwhite mb-6">Rate Decision Timeline</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetings.map((m) => (
            <div key={m.date} className="bg-charcoal border border-subtleborder rounded-xl p-5">
              <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">{m.date}</p>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 text-xs font-mono font-medium rounded ${decisionBadge(m.decision)}`}>
                  {m.decision}
                </span>
                <p className="text-sm font-mono text-offwhite">{m.rate}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Market Expectations */}
      <section className="fed-section max-w-7xl mx-auto px-6 py-8">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
          <h2 className="text-xl font-display font-medium text-offwhite mb-6">Market Expectations — Next Meeting</h2>
          <div className="space-y-4">
            {expectations.map((e) => (
              <div key={e.label} className="flex items-center gap-4">
                <p className="text-xs font-mono text-slategray w-28 shrink-0">{e.label}</p>
                <div className="flex-1 h-8 bg-deepblack rounded-lg overflow-hidden relative">
                  <div
                    className="h-full rounded-lg transition-all"
                    style={{ width: `${e.prob}%`, backgroundColor: e.color, opacity: 0.8 }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-mono text-offwhite">
                    {e.prob}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slategray mt-4 font-mono">Source: CME FedWatch Tool — Implied probability</p>
        </div>
      </section>

      {/* Premium Gate */}
      <section className="fed-section max-w-7xl mx-auto px-6 py-12">
        <PremiumGate featureName="Fed Policy Decoder" description="Get real-time FOMC analysis, dot plot tracking, and rate forecast models." />
      </section>
      </div>

      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-obsidian/60 backdrop-blur-sm pt-24">
        <div className="w-full max-w-lg px-6">
          <PremiumGate featureName="Fed Policy Decoder" description="Get real-time FOMC analysis, dot plot tracking, and rate forecast models." />
        </div>
      </div>
    </div>
  );
}
