import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import PremiumGate from '../components/PremiumGate';

gsap.registerPlugin(ScrollTrigger);

interface CompanyData {
  name: string;
  epsHistory: { quarter: string; estimate: number; actual: number }[];
  whisperNumber: number;
  consensusEPS: number;
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  beatRate: number;
}

const companyData: Record<string, CompanyData> = {
  AAPL: {
    name: 'Apple Inc.',
    epsHistory: [
      { quarter: 'Q1 2025', estimate: 1.90, actual: 2.10 },
      { quarter: 'Q2 2025', estimate: 1.55, actual: 1.65 },
      { quarter: 'Q3 2025', estimate: 1.45, actual: 1.52 },
      { quarter: 'Q4 2025', estimate: 2.40, actual: 2.50 },
    ],
    whisperNumber: 2.58,
    consensusEPS: 2.45,
    sentiment: 'Bullish',
    beatRate: 82,
  },
  MSFT: {
    name: 'Microsoft Corp.',
    epsHistory: [
      { quarter: 'Q1 2025', estimate: 2.78, actual: 2.95 },
      { quarter: 'Q2 2025', estimate: 2.95, actual: 3.10 },
      { quarter: 'Q3 2025', estimate: 3.05, actual: 3.22 },
      { quarter: 'Q4 2025', estimate: 3.18, actual: 3.30 },
    ],
    whisperNumber: 3.35,
    consensusEPS: 3.22,
    sentiment: 'Bullish',
    beatRate: 88,
  },
  GOOGL: {
    name: 'Alphabet Inc.',
    epsHistory: [
      { quarter: 'Q1 2025', estimate: 1.52, actual: 1.59 },
      { quarter: 'Q2 2025', estimate: 1.65, actual: 1.72 },
      { quarter: 'Q3 2025', estimate: 1.78, actual: 1.84 },
      { quarter: 'Q4 2025', estimate: 1.95, actual: 2.02 },
    ],
    whisperNumber: 2.05,
    consensusEPS: 1.98,
    sentiment: 'Neutral',
    beatRate: 75,
  },
  AMZN: {
    name: 'Amazon.com Inc.',
    epsHistory: [
      { quarter: 'Q1 2025', estimate: 0.82, actual: 0.98 },
      { quarter: 'Q2 2025', estimate: 1.05, actual: 1.18 },
      { quarter: 'Q3 2025', estimate: 1.22, actual: 1.35 },
      { quarter: 'Q4 2025', estimate: 1.48, actual: 1.62 },
    ],
    whisperNumber: 1.68,
    consensusEPS: 1.52,
    sentiment: 'Bullish',
    beatRate: 78,
  },
  META: {
    name: 'Meta Platforms',
    epsHistory: [
      { quarter: 'Q1 2025', estimate: 4.35, actual: 4.72 },
      { quarter: 'Q2 2025', estimate: 4.80, actual: 5.16 },
      { quarter: 'Q3 2025', estimate: 5.10, actual: 5.42 },
      { quarter: 'Q4 2025', estimate: 5.50, actual: 5.88 },
    ],
    whisperNumber: 5.95,
    consensusEPS: 5.62,
    sentiment: 'Bullish',
    beatRate: 85,
  },
  TSLA: {
    name: 'Tesla Inc.',
    epsHistory: [
      { quarter: 'Q1 2025', estimate: 0.75, actual: 0.62 },
      { quarter: 'Q2 2025', estimate: 0.82, actual: 0.78 },
      { quarter: 'Q3 2025', estimate: 0.90, actual: 0.85 },
      { quarter: 'Q4 2025', estimate: 1.05, actual: 0.95 },
    ],
    whisperNumber: 0.92,
    consensusEPS: 1.02,
    sentiment: 'Bearish',
    beatRate: 42,
  },
  NVDA: {
    name: 'NVIDIA Corp.',
    epsHistory: [
      { quarter: 'Q1 2025', estimate: 0.64, actual: 0.82 },
      { quarter: 'Q2 2025', estimate: 0.90, actual: 1.12 },
      { quarter: 'Q3 2025', estimate: 1.20, actual: 1.45 },
      { quarter: 'Q4 2025', estimate: 1.55, actual: 1.82 },
    ],
    whisperNumber: 1.90,
    consensusEPS: 1.65,
    sentiment: 'Bullish',
    beatRate: 92,
  },
  NFLX: {
    name: 'Netflix Inc.',
    epsHistory: [
      { quarter: 'Q1 2025', estimate: 4.50, actual: 5.28 },
      { quarter: 'Q2 2025', estimate: 5.80, actual: 6.10 },
      { quarter: 'Q3 2025', estimate: 6.40, actual: 7.02 },
      { quarter: 'Q4 2025', estimate: 7.20, actual: 7.85 },
    ],
    whisperNumber: 8.10,
    consensusEPS: 7.50,
    sentiment: 'Bullish',
    beatRate: 80,
  },
};

const tickers = Object.keys(companyData);

const sentimentBadge = (s: string) => {
  if (s === 'Bullish') return 'bg-emerald/20 text-emerald';
  if (s === 'Bearish') return 'bg-crimson/20 text-crimson';
  return 'bg-amber-500/20 text-amber-400';
};

export default function EarningsPreview() {
  const [selected, setSelected] = useState<string>('AAPL');
  const sectionRef = useRef<HTMLDivElement>(null);

  const data = companyData[selected];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.ep-section', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="ep-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite">Earnings Preview Engine</h1>
          <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-emerald/20 text-emerald rounded">PRO</span>
        </div>
        <p className="text-slategray text-lg">Prepare for upcoming earnings with data-driven analysis</p>
      </section>

      {/* Company Selector */}
      <section className="ep-section max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-lg font-display font-medium text-offwhite mb-4">Select Company</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {tickers.map((ticker) => (
            <button
              key={ticker}
              onClick={() => setSelected(ticker)}
              className={`p-4 rounded-xl border text-center transition-all ${
                selected === ticker
                  ? 'bg-emerald/10 border-emerald/40 text-emerald'
                  : 'bg-charcoal border-subtleborder text-offwhite hover:border-emerald/20'
              }`}
            >
              <p className="text-sm font-mono font-medium">{ticker}</p>
              <p className="text-[10px] text-slategray mt-1 truncate">{companyData[ticker].name}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Selected Company Detail */}
      {data && (
        <>
          {/* EPS History Chart */}
          <section className="ep-section max-w-7xl mx-auto px-6 py-8">
            <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
              <h2 className="text-xl font-display font-medium text-offwhite mb-2">EPS History — {selected}</h2>
              <p className="text-sm text-slategray mb-6">{data.name}</p>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.epsHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                    <XAxis dataKey="quarter" tick={{ fill: '#6B7280', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '8px', color: '#E8E8E6' }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="estimate" name="Estimate" fill="#6B7280" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actual" name="Actual" radius={[4, 4, 0, 0]}>
                      {data.epsHistory.map((entry, idx) => (
                        <Cell key={idx} fill={entry.actual >= entry.estimate ? '#10B981' : '#EF4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Earnings Details */}
          <section className="ep-section max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
                <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Whisper Number</p>
                <p className="text-2xl font-display font-bold text-offwhite">${data.whisperNumber.toFixed(2)}</p>
                <p className="text-xs text-slategray mt-1">Street whisper vs consensus</p>
              </div>
              <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
                <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Consensus EPS</p>
                <p className="text-2xl font-display font-bold text-offwhite">${data.consensusEPS.toFixed(2)}</p>
                <p className="text-xs text-slategray mt-1">Analyst consensus estimate</p>
              </div>
              <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
                <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Pre-Earnings Sentiment</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2.5 py-1 text-sm font-mono font-medium rounded ${sentimentBadge(data.sentiment)}`}>
                    {data.sentiment}
                  </span>
                </div>
                <p className="text-xs text-slategray mt-2">Based on options flow & analyst revisions</p>
              </div>
              <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
                <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Historical Beat Rate</p>
                <p className="text-2xl font-display font-bold text-offwhite">{data.beatRate}%</p>
                <div className="w-full h-2 bg-deepblack rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${data.beatRate >= 70 ? 'bg-emerald' : data.beatRate >= 50 ? 'bg-amber-400' : 'bg-crimson'}`}
                    style={{ width: `${data.beatRate}%` }}
                  />
                </div>
                <p className="text-xs text-slategray mt-1">Last 8 quarters</p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Premium Gate */}
      <section className="ep-section max-w-7xl mx-auto px-6 py-12">
        <PremiumGate featureName="Earnings Preview Engine" description="Access AI-powered earnings predictions, whisper numbers, and real-time sentiment analysis." />
      </section>
    </div>
  );
}
