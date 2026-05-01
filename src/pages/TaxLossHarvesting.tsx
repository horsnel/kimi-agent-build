import { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useGeoCurrency } from '../hooks/useGeoCurrency';

gsap.registerPlugin(ScrollTrigger);

const fmtPct = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;

interface Holding {
  ticker: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
}

const HOLDINGS: Holding[] = [
  { ticker: 'NVDA', shares: 50, avgCost: 280, currentPrice: 620 },
  { ticker: 'AAPL', shares: 100, avgCost: 145, currentPrice: 210 },
  { ticker: 'MSFT', shares: 40, avgCost: 320, currentPrice: 420 },
  { ticker: 'TSLA', shares: 60, avgCost: 290, currentPrice: 238 },
  { ticker: 'INTC', shares: 200, avgCost: 42, currentPrice: 28.50 },
  { ticker: 'DIS', shares: 80, avgCost: 115, currentPrice: 97.75 },
  { ticker: 'PYPL', shares: 150, avgCost: 85, currentPrice: 66.20 },
  { ticker: 'AMZN', shares: 30, avgCost: 155, currentPrice: 185 },
];

const REPLACEMENT_ETFs: Record<string, string> = {
  TSLA: 'DRIV',
  INTC: 'SOXX',
  DIS: 'XLC',
  PYPL: 'FINX',
};

const TAX_BRACKETS = [10, 12, 22, 24, 32, 35, 37];

export default function TaxLossHarvesting() {
  const { formatLocal, formatChartTick } = useGeoCurrency();
  const [selectedLosses, setSelectedLosses] = useState<Set<string>>(new Set());
  const [taxBracket, setTaxBracket] = useState(24);
  const sectionRef = useRef<HTMLDivElement>(null);

  const toggleTicker = (ticker: string) => {
    setSelectedLosses((prev) => {
      const next = new Set(prev);
      if (next.has(ticker)) {
        next.delete(ticker);
      } else {
        next.add(ticker);
      }
      return next;
    });
  };

  const selectAllLosses = () => {
    const lossTickers = HOLDINGS.filter((h) => h.currentPrice < h.avgCost).map((h) => h.ticker);
    setSelectedLosses(new Set(lossTickers));
  };

  const clearSelection = () => {
    setSelectedLosses(new Set());
  };

  const holdingsWithCalculations = useMemo(() => {
    return HOLDINGS.map((h) => {
      const gainLoss = (h.currentPrice - h.avgCost) * h.shares;
      const gainLossPct = ((h.currentPrice - h.avgCost) / h.avgCost) * 100;
      const isLoss = gainLoss < 0;
      return { ...h, gainLoss, gainLossPct, isLoss };
    });
  }, []);

  const totalGains = holdingsWithCalculations.filter((h) => !h.isLoss).reduce((s, h) => s + h.gainLoss, 0);
  const totalLosses = holdingsWithCalculations.filter((h) => h.isLoss).reduce((s, h) => s + Math.abs(h.gainLoss), 0);

  const selectedTotalLoss = useMemo(() => {
    return holdingsWithCalculations
      .filter((h) => h.isLoss && selectedLosses.has(h.ticker))
      .reduce((s, h) => s + Math.abs(h.gainLoss), 0);
  }, [holdingsWithCalculations, selectedLosses]);

  const taxSavings = selectedTotalLoss * (taxBracket / 100);
  const taxOwedOnGains = totalGains * (taxBracket / 100);
  const netTaxAfterHarvesting = Math.max(0, taxOwedOnGains - selectedTotalLoss) * (taxBracket / 100);

  const chartData = [
    { name: 'Tax Owed on Gains', before: Math.round(taxOwedOnGains), after: Math.round(netTaxAfterHarvesting) },
    { name: 'Tax Savings', before: 0, after: Math.round(taxSavings) },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.tax-section', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef}>
      <section className="tax-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite mb-2">Tax Loss Harvesting</h1>
        <p className="text-slategray text-lg">Identify opportunities to offset gains and reduce your tax burden</p>
      </section>

      {/* Summary Cards */}
      <section className="tax-section max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-charcoal border border-emerald/30 rounded-xl p-5 text-center">
            <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Total Unrealized Gains</p>
            <p className="text-2xl font-mono text-emerald font-bold">{formatLocal(totalGains)}</p>
          </div>
          <div className="bg-charcoal border border-crimson/30 rounded-xl p-5 text-center">
            <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Total Unrealized Losses</p>
            <p className="text-2xl font-mono text-crimson font-bold">{formatLocal(totalLosses)}</p>
          </div>
          <div className="bg-charcoal border border-subtleborder rounded-xl p-5 text-center">
            <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Net Position</p>
            <p className={`text-2xl font-mono font-bold ${totalGains - totalLosses >= 0 ? 'text-emerald' : 'text-crimson'}`}>
              {formatLocal(totalGains - totalLosses)}
            </p>
          </div>
        </div>
      </section>

      {/* Holdings Table */}
      <section className="tax-section max-w-7xl mx-auto px-6 py-6">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-light text-offwhite">Portfolio Holdings</h2>
            <div className="flex gap-2">
              <button onClick={selectAllLosses} className="px-3 py-1.5 text-xs font-mono rounded-lg bg-deepblack border border-subtleborder text-slategray hover:text-emerald hover:border-emerald/50 transition-colors">
                Select All Losses
              </button>
              <button onClick={clearSelection} className="px-3 py-1.5 text-xs font-mono rounded-lg bg-deepblack border border-subtleborder text-slategray hover:text-crimson hover:border-crimson/50 transition-colors">
                Clear
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-subtleborder">
                  <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider pb-3 w-10"></th>
                  <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider pb-3">Ticker</th>
                  <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider pb-3">Shares</th>
                  <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider pb-3">Avg Cost</th>
                  <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider pb-3">Current Price</th>
                  <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider pb-3">Gain/Loss ($)</th>
                  <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider pb-3">Gain/Loss (%)</th>
                </tr>
              </thead>
              <tbody>
                {holdingsWithCalculations.map((h) => (
                  <tr key={h.ticker} className={`border-b border-subtleborder/50 transition-colors ${h.isLoss && selectedLosses.has(h.ticker) ? 'bg-crimson/5' : ''}`}>
                    <td className="py-3">
                      {h.isLoss && (
                        <input
                          type="checkbox"
                          checked={selectedLosses.has(h.ticker)}
                          onChange={() => toggleTicker(h.ticker)}
                          className="w-4 h-4 rounded accent-emerald cursor-pointer"
                        />
                      )}
                    </td>
                    <td className="py-3 text-sm font-mono font-medium text-emerald">{h.ticker}</td>
                    <td className="py-3 text-sm font-mono text-offwhite text-right">{h.shares}</td>
                    <td className="py-3 text-sm font-mono text-slategray text-right">{formatLocal(h.avgCost)}</td>
                    <td className="py-3 text-sm font-mono text-offwhite text-right">{formatLocal(h.currentPrice)}</td>
                    <td className={`py-3 text-sm font-mono text-right ${h.isLoss ? 'text-crimson' : 'text-emerald'}`}>
                      {h.isLoss ? '-' : '+'}{formatLocal(Math.abs(h.gainLoss))}
                    </td>
                    <td className={`py-3 text-sm font-mono text-right ${h.isLoss ? 'text-crimson' : 'text-emerald'}`}>
                      {fmtPct(h.gainLossPct)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Tax Bracket + Results */}
      <section className="tax-section max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tax Bracket Selector */}
          <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
            <h2 className="text-sm font-mono text-slategray uppercase tracking-wider mb-4">Your Tax Bracket</h2>
            <select
              value={taxBracket}
              onChange={(e) => setTaxBracket(Number(e.target.value))}
              className="w-full bg-deepblack border border-subtleborder rounded-lg px-4 py-2.5 text-sm text-offwhite font-mono focus:outline-none focus:border-emerald/50 appearance-none cursor-pointer"
            >
              {TAX_BRACKETS.map((b) => (
                <option key={b} value={b}>{b}%</option>
              ))}
            </select>
            <p className="text-xs text-slategray mt-2">Select your federal income tax bracket</p>

            {/* Results when losses selected */}
            {selectedLosses.size > 0 && (
              <div className="mt-6 space-y-4">
                <div className="bg-deepblack border border-crimson/30 rounded-xl p-5 text-center">
                  <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Total Harvestable Losses</p>
                  <p className="text-3xl font-display font-bold text-crimson">{formatLocal(selectedTotalLoss)}</p>
                  <p className="text-xs font-mono text-slategray mt-1">{selectedLosses.size} position{selectedLosses.size > 1 ? 's' : ''} selected</p>
                </div>
                <div className="bg-deepblack border border-emerald/30 rounded-xl p-5 text-center">
                  <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Estimated Tax Savings</p>
                  <p className="text-3xl font-display font-bold text-emerald">{formatLocal(taxSavings)}</p>
                  <p className="text-xs font-mono text-slategray mt-1">at {taxBracket}% tax rate</p>
                </div>
              </div>
            )}

            {/* Wash Sale Warning */}
            {selectedLosses.size > 0 && (
              <div className="mt-4 bg-deepblack border border-amber-500/40 rounded-xl p-5">
                <h3 className="text-sm font-mono text-amber-400 uppercase tracking-wider mb-2">Wash Sale Warning</h3>
                <p className="text-xs text-amber-400/80 leading-relaxed mb-3">
                  Under the wash sale rule, you cannot repurchase the same or substantially identical security within 30 days. Consider these replacement ETFs:
                </p>
                <div className="space-y-1.5">
                  {Array.from(selectedLosses).map((ticker) => (
                    REPLACEMENT_ETFs[ticker] && (
                      <div key={ticker} className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-crimson">{ticker}</span>
                        <span className="text-slategray">&rarr;</span>
                        <span className="text-emerald">{REPLACEMENT_ETFs[ticker]}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bar Chart */}
          <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
            <h2 className="text-sm font-mono text-slategray uppercase tracking-wider mb-4">Before / After Tax Harvesting</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={{ stroke: '#222222' }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={{ stroke: '#222222' }} tickFormatter={(v: number) => formatChartTick(v)} />
                  <Tooltip contentStyle={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '8px', color: '#E8E8E6' }} formatter={(v: number) => formatLocal(v)} />
                  <Bar dataKey="before" name="Before" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? '#EF4444' : '#6B7280'} />
                    ))}
                  </Bar>
                  <Bar dataKey="after" name="After Harvesting" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? '#10B981' : '#10B981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-crimson" />
                <span className="text-xs font-mono text-slategray">Before</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-emerald" />
                <span className="text-xs font-mono text-slategray">After Harvesting</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom spacer */}
      <div className="h-20" />
    </div>
  );
}
