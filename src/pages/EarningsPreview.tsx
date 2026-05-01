import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { fetchEarningsCalendar, type EarningsCompany } from '../services/api';
import { useGeoCurrency } from '../hooks/useGeoCurrency';


gsap.registerPlugin(ScrollTrigger);

type CompanyData = EarningsCompany;

const sentimentBadge = (s: string) => {
  if (s === 'Bullish') return 'bg-emerald/20 text-emerald';
  if (s === 'Bearish') return 'bg-crimson/20 text-crimson';
  return 'bg-amber-500/20 text-amber-400';
};

export default function EarningsPreview() {
  const [selected, setSelected] = useState<string>('AAPL');
  const [companyData, setCompanyData] = useState<Record<string, CompanyData>>({});
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { formatLocal } = useGeoCurrency();

  useEffect(() => {
    fetchEarningsCalendar()
      .then((data) => {
        const map: Record<string, CompanyData> = {};
        data.forEach((c) => { map[c.ticker] = c; });
        setCompanyData(map);
        if (!map[selected] && data.length > 0) setSelected(data[0].ticker);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const tickers = Object.keys(companyData);
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
        <div className="animate-pulse">
          <div className="h-10 bg-charcoal rounded w-1/3 mx-auto mb-4" />
          <div className="h-6 bg-charcoal rounded w-1/2 mx-auto" />
        </div>
        <p className="text-slategray text-sm mt-4">Loading earnings data...</p>
      </div>
    );
  }

  return (
      <div ref={sectionRef}>
      {/* Hero */}
      <section className="ep-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite">Earnings Preview Engine</h1>
          <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-emerald/20 text-emerald rounded">LIVE</span>
        </div>
        <p className="text-slategray text-lg">Prepare for upcoming earnings with data-driven analysis</p>
      </section>

      {/* Company Selector */}
      <section className="ep-section max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-lg font-display font-light text-offwhite mb-4">Select Company</h2>
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
              <p className="text-[10px] text-slategray mt-1 truncate">{companyData[ticker]?.name}</p>
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
              <h2 className="text-xl font-display font-light text-offwhite mb-2">EPS History — {selected}</h2>
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
                <p className="text-2xl font-display font-bold text-offwhite">{formatLocal(data.whisperNumber)}</p>
                <p className="text-xs text-slategray mt-1">Street whisper vs consensus</p>
              </div>
              <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
                <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Consensus EPS</p>
                <p className="text-2xl font-display font-bold text-offwhite">{formatLocal(data.consensusEPS)}</p>
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

      </div>
  );
}
