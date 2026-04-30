import { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import PremiumGate from '../components/PremiumGate';

gsap.registerPlugin(ScrollTrigger);

interface StockInfo {
  name: string;
  price: number;
  revenue: number;
  ebitdaMargin: number;
  growthRate: number;
  sharesOutstanding: number;
}

const stocks: Record<string, StockInfo> = {
  AAPL: { name: 'Apple Inc.', price: 210, revenue: 394000000000, ebitdaMargin: 32, growthRate: 8, sharesOutstanding: 15400000000 },
  MSFT: { name: 'Microsoft Corp.', price: 420, revenue: 245000000000, ebitdaMargin: 48, growthRate: 14, sharesOutstanding: 7430000000 },
  GOOGL: { name: 'Alphabet Inc.', price: 175, revenue: 340000000000, ebitdaMargin: 36, growthRate: 12, sharesOutstanding: 12200000000 },
  AMZN: { name: 'Amazon.com Inc.', price: 185, revenue: 620000000000, ebitdaMargin: 22, growthRate: 11, sharesOutstanding: 10500000000 },
  NVDA: { name: 'NVIDIA Corp.', price: 620, revenue: 130000000000, ebitdaMargin: 55, growthRate: 25, sharesOutstanding: 24500000000 },
  META: { name: 'Meta Platforms', price: 520, revenue: 165000000000, ebitdaMargin: 45, growthRate: 18, sharesOutstanding: 2530000000 },
  TSLA: { name: 'Tesla Inc.', price: 239, revenue: 98000000000, ebitdaMargin: 18, growthRate: 20, sharesOutstanding: 3200000000 },
  NFLX: { name: 'Netflix Inc.', price: 680, revenue: 42000000000, ebitdaMargin: 30, growthRate: 12, sharesOutstanding: 430000000 },
};

const tickers = Object.keys(stocks);

export default function DCFValuation() {
  const [input, setInput] = useState('');
  const [selectedStock, setSelectedStock] = useState<string>('AAPL');
  const [showDropdown, setShowDropdown] = useState(false);
  const [growthRate, setGrowthRate] = useState(stocks.AAPL.growthRate);
  const [ebitdaMargin, setEbitdaMargin] = useState(stocks.AAPL.ebitdaMargin);
  const [discountRate, setDiscountRate] = useState(10);
  const [terminalGrowth, setTerminalGrowth] = useState(2.5);
  const [projectionYears, setProjectionYears] = useState<5 | 10>(10);
  const sectionRef = useRef<HTMLDivElement>(null);

  const filtered = tickers.filter((t) => t.toLowerCase().includes(input.toLowerCase()));
  const stock = stocks[selectedStock];

  useEffect(() => {
    const s = stocks[selectedStock];
    if (s) {
      setGrowthRate(s.growthRate);
      setEbitdaMargin(s.ebitdaMargin);
    }
  }, [selectedStock]);

  const dcfResult = useMemo(() => {
    const years = projectionYears;
    const gRate = growthRate / 100;
    const eMargin = ebitdaMargin / 100;
    const dRate = discountRate / 100;
    const tGrowth = terminalGrowth / 100;

    let totalPV = 0;
    const rows: { year: number; revenue: number; ebitda: number; fcf: number; discountFactor: number; pvFcf: number }[] = [];

    for (let i = 1; i <= years; i++) {
      const rev = stock.revenue * Math.pow(1 + gRate, i);
      const ebitda = rev * eMargin;
      const fcf = ebitda * 0.7;
      const df = 1 / Math.pow(1 + dRate, i);
      const pv = fcf * df;
      totalPV += pv;
      rows.push({ year: i, revenue: rev, ebitda, fcf, discountFactor: df, pvFcf: pv });
    }

    const terminalFcf = rows[rows.length - 1].fcf * (1 + tGrowth);
    const terminalValue = terminalFcf / (dRate - tGrowth);
    const pvTerminal = terminalValue / Math.pow(1 + dRate, years);
    const totalValue = totalPV + pvTerminal;
    const intrinsicPerShare = totalValue / stock.sharesOutstanding;

    return { intrinsicPerShare, totalPV, pvTerminal, rows };
  }, [stock, growthRate, ebitdaMargin, discountRate, terminalGrowth, projectionYears]);

  const upside = ((dcfResult.intrinsicPerShare - stock.price) / stock.price) * 100;

  const sensitivityData = useMemo(() => {
    return [8, 9, 10, 11, 12, 13, 14, 15].map((dr) => {
      const dR = dr / 100;
      const tGrowth = terminalGrowth / 100;
      let totalPV = 0;
      for (let i = 1; i <= projectionYears; i++) {
        const rev = stock.revenue * Math.pow(1 + growthRate / 100, i);
        const ebitda = rev * (ebitdaMargin / 100);
        const fcf = ebitda * 0.7;
        const df = 1 / Math.pow(1 + dR, i);
        totalPV += fcf * df;
      }
      const terminalFcf = stock.revenue * Math.pow(1 + growthRate / 100, projectionYears) * (ebitdaMargin / 100) * 0.7 * (1 + tGrowth);
      const terminalValue = terminalFcf / (dR - tGrowth);
      const pvTerminal = terminalValue / Math.pow(1 + dR, projectionYears);
      const iv = (totalPV + pvTerminal) / stock.sharesOutstanding;
      return { rate: `${dr}%`, value: Math.round(iv) };
    });
  }, [stock, growthRate, ebitdaMargin, terminalGrowth, projectionYears]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.dcf-section', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const fmtB = (v: number) => `$${(v / 1e9).toFixed(1)}B`;
  const fmtM = (v: number) => `$${(v / 1e6).toFixed(0)}M`;

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="dcf-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite">DCF Valuation Models</h1>
          <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-emerald/20 text-emerald rounded">PRO</span>
        </div>
        <p className="text-slategray text-lg">Intrinsic value analysis using discounted cash flow methodology</p>
      </section>

      {/* Stock Selector + Inputs */}
      <section className="dcf-section max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Inputs */}
          <div className="space-y-6">
            {/* Stock Selector */}
            <div className="bg-charcoal border border-subtleborder rounded-xl p-6 relative">
              <label className="block text-xs font-mono text-slategray uppercase tracking-wider mb-2">Select Stock</label>
              <input
                type="text"
                value={input}
                onChange={(e) => { setInput(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                placeholder={selectedStock}
                className="w-full bg-deepblack border border-subtleborder rounded-lg px-4 py-2.5 text-sm text-offwhite focus:outline-none focus:border-emerald/50"
              />
              {showDropdown && input && (
                <div className="absolute left-6 right-6 top-[72px] bg-deepblack border border-subtleborder rounded-lg z-20 max-h-48 overflow-y-auto">
                  {filtered.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setSelectedStock(t); setInput(''); setShowDropdown(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-offwhite hover:bg-charcoal transition-colors"
                    >
                      <span className="font-mono font-medium text-emerald">{t}</span>
                      <span className="text-slategray ml-2">{stocks[t].name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sliders */}
            <div className="bg-charcoal border border-subtleborder rounded-xl p-6 space-y-5">
              <div>
                <label className="block text-xs font-mono text-slategray uppercase tracking-wider mb-2">Revenue Growth Rate: {growthRate}%</label>
                <input
                  type="range" min={0} max={30} value={growthRate}
                  onChange={(e) => setGrowthRate(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #10B981 ${growthRate / 30 * 100}%, #222222 ${growthRate / 30 * 100}%)` }}
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slategray uppercase tracking-wider mb-2">EBITDA Margin: {ebitdaMargin}%</label>
                <input
                  type="range" min={10} max={50} value={ebitdaMargin}
                  onChange={(e) => setEbitdaMargin(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #10B981 ${(ebitdaMargin - 10) / 40 * 100}%, #222222 ${(ebitdaMargin - 10) / 40 * 100}%)` }}
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slategray uppercase tracking-wider mb-2">Discount Rate (WACC): {discountRate}%</label>
                <input
                  type="range" min={8} max={15} step={0.5} value={discountRate}
                  onChange={(e) => setDiscountRate(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #10B981 ${(discountRate - 8) / 7 * 100}%, #222222 ${(discountRate - 8) / 7 * 100}%)` }}
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slategray uppercase tracking-wider mb-2">Terminal Growth: {terminalGrowth}%</label>
                <input
                  type="range" min={1} max={4} step={0.5} value={terminalGrowth}
                  onChange={(e) => setTerminalGrowth(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #10B981 ${(terminalGrowth - 1) / 3 * 100}%, #222222 ${(terminalGrowth - 1) / 3 * 100}%)` }}
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slategray uppercase tracking-wider mb-2">Projection Years</label>
                <div className="flex gap-2">
                  {[5, 10].map((y) => (
                    <button
                      key={y}
                      onClick={() => setProjectionYears(y as 5 | 10)}
                      className={`px-4 py-2 text-sm font-mono rounded-lg transition-colors ${
                        projectionYears === y ? 'bg-emerald text-obsidian' : 'bg-deepblack text-slategray border border-subtleborder'
                      }`}
                    >
                      {y}Y
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="space-y-4">
            <div className="bg-charcoal border border-emerald/30 rounded-xl p-6 text-center">
              <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Intrinsic Value per Share</p>
              <p className="text-5xl font-display font-bold text-emerald">${dcfResult.intrinsicPerShare.toFixed(2)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-charcoal border border-subtleborder rounded-xl p-5">
                <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-1">Current Price</p>
                <p className="text-xl font-mono text-offwhite">${stock.price}</p>
              </div>
              <div className="bg-charcoal border border-subtleborder rounded-xl p-5">
                <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-1">Upside / Downside</p>
                <p className={`text-xl font-mono font-medium ${upside >= 0 ? 'text-emerald' : 'text-crimson'}`}>
                  {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-charcoal border border-subtleborder rounded-xl p-4">
                <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-1">PV of FCFs</p>
                <p className="text-sm font-mono text-offwhite">{fmtB(dcfResult.totalPV)}</p>
              </div>
              <div className="bg-charcoal border border-subtleborder rounded-xl p-4">
                <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-1">PV of Terminal</p>
                <p className="text-sm font-mono text-offwhite">{fmtB(dcfResult.pvTerminal)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sensitivity Analysis */}
      <section className="dcf-section max-w-7xl mx-auto px-6 py-8">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
          <h2 className="text-xl font-display font-medium text-offwhite mb-6">Sensitivity Analysis — Intrinsic Value vs Discount Rate</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sensitivityData}>
                <defs>
                  <linearGradient id="sensGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="rate" tick={{ fill: '#6B7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} tickFormatter={(v: number) => `$${v}`} />
                <Tooltip contentStyle={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '8px', color: '#E8E8E6' }} formatter={(v: number) => [`$${v}`, 'Intrinsic Value']} />
                <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fill="url(#sensGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Assumptions Breakdown Table */}
      <section className="dcf-section max-w-7xl mx-auto px-6 py-8">
        <div className="bg-charcoal border border-subtleborder rounded-xl overflow-hidden">
          <div className="p-6 border-b border-subtleborder">
            <h2 className="text-xl font-display font-medium text-offwhite">Assumptions Breakdown — {selectedStock}</h2>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead className="sticky top-0 bg-deepblack/90 backdrop-blur-sm z-10">
                <tr className="border-b border-subtleborder">
                  <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider p-4">Year</th>
                  <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider p-4">Revenue</th>
                  <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider p-4">EBITDA</th>
                  <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider p-4">FCF</th>
                  <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider p-4">Discount Factor</th>
                  <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider p-4">PV of FCF</th>
                </tr>
              </thead>
              <tbody>
                {dcfResult.rows.map((row) => (
                  <tr key={row.year} className="border-b border-subtleborder/50 hover:bg-deepblack/50 transition-colors">
                    <td className="p-4 text-sm text-offwhite font-mono">{row.year}</td>
                    <td className="p-4 text-sm font-mono text-offwhite text-right">{fmtB(row.revenue)}</td>
                    <td className="p-4 text-sm font-mono text-offwhite text-right">{fmtB(row.ebitda)}</td>
                    <td className="p-4 text-sm font-mono text-offwhite text-right">{fmtB(row.fcf)}</td>
                    <td className="p-4 text-sm font-mono text-slategray text-right">{row.discountFactor.toFixed(4)}</td>
                    <td className="p-4 text-sm font-mono text-emerald text-right">{fmtM(row.pvFcf)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Premium Gate */}
      <section className="dcf-section max-w-7xl mx-auto px-6 py-12">
        <PremiumGate featureName="DCF Valuation Models" description="Access advanced DCF models with Monte Carlo simulations and scenario analysis." />
      </section>
    </div>
  );
}
