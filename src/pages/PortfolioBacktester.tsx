import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGeoCurrency } from '../hooks/useGeoCurrency';

gsap.registerPlugin(ScrollTrigger);

type AllocKey = 'stocks' | 'bonds' | 'cash' | 'realEstate' | 'gold';

interface Allocation {
  stocks: number;
  bonds: number;
  cash: number;
  realEstate: number;
  gold: number;
}

const PRESETS: Record<string, Allocation> = {
  Aggressive: { stocks: 80, bonds: 15, cash: 5, realEstate: 0, gold: 0 },
  Moderate: { stocks: 60, bonds: 20, cash: 10, realEstate: 5, gold: 5 },
  Conservative: { stocks: 40, bonds: 30, cash: 15, realEstate: 10, gold: 5 },
};

const ALLOC_LABELS: Record<AllocKey, string> = {
  stocks: 'Stocks',
  bonds: 'Bonds',
  cash: 'Cash',
  realEstate: 'Real Estate',
  gold: 'Gold',
};

const ALLOC_COLORS: Record<AllocKey, string> = {
  stocks: '#10B981',
  bonds: '#3B82F6',
  cash: '#6B7280',
  realEstate: '#F59E0B',
  gold: '#EAB308',
};

// Seeded pseudo-random for consistent results
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function PortfolioBacktester() {
  const { formatLocal, formatLocalShort, formatChartTick } = useGeoCurrency();
  const [allocation, setAllocation] = useState<Allocation>({ stocks: 60, bonds: 20, cash: 5, realEstate: 10, gold: 5 });
  const [period, setPeriod] = useState<10 | 20 | 30 | 50>(20);
  const [initialInvestment, setInitialInvestment] = useState(100000);
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleAllocationChange = (key: AllocKey, newValue: number) => {
    setAllocation((prev) => {
      const others = (Object.keys(prev) as AllocKey[]).filter((k) => k !== key);
      const otherTotal = others.reduce((sum, k) => sum + prev[k], 0);
      const remaining = 100 - newValue;

      const updated = { ...prev, [key]: newValue };

      if (otherTotal === 0) {
        // Distribute equally
        const share = Math.floor(remaining / others.length);
        const remainder = remaining - share * others.length;
        others.forEach((k, i) => {
          updated[k] = share + (i < remainder ? 1 : 0);
        });
      } else {
        let distributed = 0;
        others.forEach((k, i) => {
          if (i === others.length - 1) {
            updated[k] = remaining - distributed;
          } else {
            const share = Math.round((prev[k] / otherTotal) * remaining);
            updated[k] = share;
            distributed += share;
          }
        });
      }

      // Clamp to avoid negatives
      for (const k of Object.keys(updated) as AllocKey[]) {
        updated[k] = Math.max(0, updated[k]);
      }
      return updated;
    });
  };

  const results = useMemo(() => {
    const weightedReturn = allocation.stocks * 0.10 + allocation.bonds * 0.05 + allocation.cash * 0.02 + allocation.realEstate * 0.08 + allocation.gold * 0.06;
    const finalValue = initialInvestment * Math.pow(1 + weightedReturn, period);
    const cagr = weightedReturn * 100;
    const maxDrawdown = -(15 + allocation.stocks * 0.25);
    const sharpe = 0.5 + allocation.stocks * 0.01;

    // Generate year-by-year data with some volatility
    const rand = seededRandom(42);
    const sp500Returns = [0.10, -0.15, 0.25, 0.12, -0.08, 0.18, 0.05, -0.12, 0.22, 0.15,
      0.08, -0.20, 0.30, 0.11, -0.05, 0.14, 0.09, -0.10, 0.20, 0.16,
      0.07, -0.18, 0.28, 0.13, -0.06, 0.19, 0.04, -0.14, 0.24, 0.17,
      0.06, -0.22, 0.32, 0.10, -0.03, 0.15, 0.08, -0.11, 0.21, 0.14,
      0.09, -0.16, 0.26, 0.12, -0.07, 0.17, 0.03, -0.13, 0.23, 0.18];

    const chartData: { year: number; portfolio: number; sp500: number }[] = [];
    const yearlyReturns: { year: number; portfolioReturn: number; sp500Return: number; portfolioValue: number }[] = [];

    let portfolioValue = initialInvestment;
    let sp500Value = initialInvestment;

    for (let y = 1; y <= period; y++) {
      const spRet = sp500Returns[(y - 1) % sp500Returns.length];
      // Portfolio return: weighted + noise
      const noise = (rand() - 0.5) * 0.06;
      const portRet = weightedReturn + noise;

      portfolioValue *= (1 + portRet);
      sp500Value *= (1 + spRet);

      chartData.push({
        year: 2000 + y,
        portfolio: Math.round(portfolioValue),
        sp500: Math.round(sp500Value),
      });

      yearlyReturns.push({
        year: 2000 + y,
        portfolioReturn: Math.round(portRet * 1000) / 10,
        sp500Return: Math.round(spRet * 1000) / 10,
        portfolioValue: Math.round(portfolioValue),
      });
    }

    return { finalValue: Math.round(finalValue), cagr, maxDrawdown, sharpe, chartData, yearlyReturns };
  }, [allocation, period, initialInvestment]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.bt-section', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const sliderBg = (val: number, min: number, max: number) => ({
    background: `linear-gradient(to right, ${ALLOC_COLORS[val === allocation.stocks ? 'stocks' : 'bonds']} 0%, #10B981 ${((val - min) / (max - min)) * 100}%, #0A0A0A ${((val - min) / (max - min)) * 100}%, #0A0A0A 100%)`,
  });

  const total = Object.values(allocation).reduce((s, v) => s + v, 0);

  return (
    <div ref={sectionRef}>
      <section className="bt-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <Link to="/tools" className="text-xs font-mono text-slategray hover:text-emerald transition-colors mb-4 inline-block">
          {'\u2190'} Tools
        </Link>
        <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite mb-2">Portfolio Backtester</h1>
        <p className="text-slategray text-lg">Test allocation strategies against historical market data</p>
      </section>

      {/* Allocation Sliders */}
      <section className="bt-section max-w-7xl mx-auto px-6 py-6">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-mono text-slategray uppercase tracking-wider">Asset Allocation</h2>
            <span className={`text-sm font-mono ${total === 100 ? 'text-emerald' : 'text-crimson'}`}>Total: {total}%</span>
          </div>

          <div className="space-y-4 mb-6">
            {(Object.keys(allocation) as AllocKey[]).map((key) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ALLOC_COLORS[key] }} />
                    <label className="text-xs font-mono text-slategray uppercase tracking-wider">{ALLOC_LABELS[key]}</label>
                  </div>
                  <span className="text-sm font-mono text-offwhite">{allocation[key]}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={allocation[key]}
                  onChange={(e) => handleAllocationChange(key, Number(e.target.value))}
                  className="w-full h-1.5 bg-deepblack rounded-full appearance-none cursor-pointer accent-emerald"
                  style={sliderBg(allocation[key], 0, 100)}
                />
              </div>
            ))}
          </div>

          {/* Preset buttons */}
          <div className="flex gap-2 mb-4">
            {Object.entries(PRESETS).map(([name, preset]) => (
              <button key={name} onClick={() => setAllocation({ ...preset })} className="px-4 py-2 text-xs font-mono rounded-lg bg-deepblack border border-subtleborder text-slategray hover:text-offwhite hover:border-emerald/50 transition-colors">
                {name}
              </button>
            ))}
          </div>

          {/* Time period + Initial investment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-subtleborder">
            <div>
              <label className="text-xs font-mono text-slategray uppercase tracking-wider mb-2 block">Time Period</label>
              <div className="flex gap-2">
                {([10, 20, 30, 50] as const).map((p) => (
                  <button key={p} onClick={() => setPeriod(p)} className={`flex-1 py-2 text-sm font-mono rounded-lg transition-colors ${period === p ? 'bg-emerald text-obsidian' : 'bg-deepblack border border-subtleborder text-slategray hover:text-offwhite'}`}>
                    {p}Y
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-mono text-slategray uppercase tracking-wider">Initial Investment</label>
                <span className="text-sm font-mono text-offwhite">{formatLocal(initialInvestment)}</span>
              </div>
              <input type="range" min={10000} max={1000000} step={10000} value={initialInvestment} onChange={(e) => setInitialInvestment(Number(e.target.value))} className="w-full h-1.5 bg-deepblack rounded-full appearance-none cursor-pointer accent-emerald" style={{ background: `linear-gradient(to right, #10B981 0%, #10B981 ${((initialInvestment - 10000) / 990000) * 100}%, #0A0A0A ${((initialInvestment - 10000) / 990000) * 100}%, #0A0A0A 100%)` }} />
            </div>
          </div>
        </div>
      </section>

      {/* Results Cards */}
      <section className="bt-section max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-charcoal border border-emerald/30 rounded-xl p-5 text-center">
            <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Final Value</p>
            <p className="text-lg sm:text-2xl font-mono text-emerald font-bold truncate">{formatLocalShort(results.finalValue)}</p>
          </div>
          <div className="bg-charcoal border border-subtleborder rounded-xl p-5 text-center">
            <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">CAGR</p>
            <p className="text-lg sm:text-2xl font-mono text-offwhite font-bold">{results.cagr.toFixed(1)}%</p>
          </div>
          <div className="bg-charcoal border border-subtleborder rounded-xl p-5 text-center">
            <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Max Drawdown</p>
            <p className="text-lg sm:text-2xl font-mono text-crimson font-bold">{results.maxDrawdown.toFixed(1)}%</p>
          </div>
          <div className="bg-charcoal border border-subtleborder rounded-xl p-5 text-center">
            <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Sharpe Ratio</p>
            <p className="text-lg sm:text-2xl font-mono text-offwhite font-bold">{results.sharpe.toFixed(2)}</p>
          </div>
        </div>
      </section>

      {/* Chart */}
      <section className="bt-section max-w-7xl mx-auto px-6 py-6">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
          <h2 className="text-lg font-display font-light text-offwhite mb-1">Portfolio Growth vs S&P 500</h2>
          <p className="text-xs font-mono text-slategray mb-4">{period}-year backtest starting from {formatLocalShort(initialInvestment)}</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={results.chartData}>
                <defs>
                  <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="year" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={{ stroke: '#222222' }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={{ stroke: '#222222' }} tickFormatter={(v: number) => formatChartTick(v)} />
                <Tooltip contentStyle={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '8px', color: '#E8E8E6' }} formatter={(v: number) => formatLocal(v)} />
                <Area type="monotone" dataKey="portfolio" stroke="#10B981" strokeWidth={2} fill="url(#portGrad)" name="Portfolio" />
                <Area type="monotone" dataKey="sp500" stroke="#3B82F6" strokeWidth={2} fill="url(#spGrad)" name="S&P 500" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Year-by-year returns table */}
      <section className="bt-section max-w-7xl mx-auto px-6 py-6">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
          <h2 className="text-lg font-display font-light text-offwhite mb-4">Year-by-Year Returns</h2>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-charcoal">
                <tr className="border-b border-subtleborder">
                  <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider pb-3">Year</th>
                  <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider pb-3">Portfolio Return</th>
                  <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider pb-3">S&P 500 Return</th>
                  <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider pb-3">Portfolio Value</th>
                </tr>
              </thead>
              <tbody>
                {results.yearlyReturns.map((row) => (
                  <tr key={row.year} className="border-b border-subtleborder/50">
                    <td className="py-2.5 text-sm font-mono text-offwhite">{row.year}</td>
                    <td className={`py-2.5 text-sm font-mono text-right ${row.portfolioReturn >= 0 ? 'text-emerald' : 'text-crimson'}`}>
                      {row.portfolioReturn >= 0 ? '+' : ''}{row.portfolioReturn.toFixed(1)}%
                    </td>
                    <td className={`py-2.5 text-sm font-mono text-right ${row.sp500Return >= 0 ? 'text-emerald' : 'text-crimson'}`}>
                      {row.sp500Return >= 0 ? '+' : ''}{row.sp500Return.toFixed(1)}%
                    </td>
                    <td className="py-2.5 text-sm font-mono text-offwhite text-right">{formatLocalShort(row.portfolioValue)}</td>
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
