import { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useGeoCurrency } from '../hooks/useGeoCurrency';

gsap.registerPlugin(ScrollTrigger);

export default function OptionsCalculator() {
  const { formatLocal, formatChartTick } = useGeoCurrency();
  const [ticker, setTicker] = useState('AAPL');
  const [currentPrice, setCurrentPrice] = useState(210);
  const [strikePrice, setStrikePrice] = useState(215);
  const [premium, setPremium] = useState(4.50);
  const [optionType, setOptionType] = useState<'call' | 'put'>('call');
  const [direction, setDirection] = useState<'buy' | 'sell'>('buy');
  const [contracts, setContracts] = useState(10);
  const [expiration, setExpiration] = useState<30 | 60 | 90 | 180>(30);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Generate payoff data
  const payoffData = useMemo(() => {
    const data: { price: number; pl: number; profit: number; loss: number }[] = [];
    const minPrice = Math.round(currentPrice * 0.6);
    const maxPrice = Math.round(currentPrice * 1.4);
    const step = Math.max(1, Math.round((maxPrice - minPrice) / 50));

    for (let price = minPrice; price <= maxPrice; price += step) {
      let pl: number;
      if (optionType === 'call' && direction === 'buy') {
        pl = (Math.max(0, price - strikePrice) - premium) * contracts * 100;
      } else if (optionType === 'put' && direction === 'buy') {
        pl = (Math.max(0, strikePrice - price) - premium) * contracts * 100;
      } else if (optionType === 'call' && direction === 'sell') {
        pl = (premium - Math.max(0, price - strikePrice)) * contracts * 100;
      } else {
        // put sell
        pl = (premium - Math.max(0, strikePrice - price)) * contracts * 100;
      }
      data.push({
        price,
        pl: Math.round(pl),
        profit: pl >= 0 ? Math.round(pl) : 0,
        loss: pl < 0 ? Math.round(pl) : 0,
      });
    }
    return data;
  }, [currentPrice, strikePrice, premium, optionType, direction, contracts]);

  // Calculate key metrics (numeric only, formatting done in render)
  const metrics = useMemo(() => {
    let breakEven: number;
    let maxProfitValue: number | null = null; // null = Unlimited
    let maxLossValue: number | null = null; // null = Unlimited
    let totalCost: number;

    totalCost = premium * contracts * 100;

    if (optionType === 'call' && direction === 'buy') {
      breakEven = strikePrice + premium;
      maxProfitValue = null;
      maxLossValue = totalCost;
    } else if (optionType === 'put' && direction === 'buy') {
      breakEven = strikePrice - premium;
      maxProfitValue = (strikePrice - premium) * contracts * 100;
      maxLossValue = totalCost;
    } else if (optionType === 'call' && direction === 'sell') {
      breakEven = strikePrice + premium;
      maxProfitValue = totalCost;
      maxLossValue = null;
    } else {
      // put sell
      breakEven = strikePrice - premium;
      maxProfitValue = totalCost;
      maxLossValue = (strikePrice - premium) * contracts * 100;
    }

    return { breakEven, maxProfitValue, maxLossValue, totalCost };
  }, [optionType, direction, strikePrice, premium, contracts]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.opt-section', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const strategyLabel = `${direction === 'buy' ? 'Long' : 'Short'} ${optionType === 'call' ? 'Call' : 'Put'}`;

  return (
    <div ref={sectionRef}>
      <section className="opt-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite mb-2">Options Profit Calculator</h1>
        <p className="text-slategray text-lg">Visualize potential profit and loss for options strategies</p>
      </section>

      {/* Inputs */}
      <section className="opt-section max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Ticker */}
          <div className="bg-charcoal border border-subtleborder rounded-xl p-4">
            <label className="text-xs font-mono text-slategray uppercase tracking-wider mb-2 block">Ticker</label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="w-full bg-deepblack border border-subtleborder rounded-lg px-4 py-2.5 text-sm text-offwhite font-mono focus:outline-none focus:border-emerald/50"
            />
          </div>

          {/* Current Price */}
          <div className="bg-charcoal border border-subtleborder rounded-xl p-4">
            <label className="text-xs font-mono text-slategray uppercase tracking-wider mb-2 block">Current Price</label>
            <input
              type="number"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(Number(e.target.value))}
              className="w-full bg-deepblack border border-subtleborder rounded-lg px-4 py-2.5 text-sm text-offwhite font-mono focus:outline-none focus:border-emerald/50"
            />
          </div>

          {/* Strike Price */}
          <div className="bg-charcoal border border-subtleborder rounded-xl p-4">
            <label className="text-xs font-mono text-slategray uppercase tracking-wider mb-2 block">Strike Price</label>
            <input
              type="number"
              value={strikePrice}
              onChange={(e) => setStrikePrice(Number(e.target.value))}
              className="w-full bg-deepblack border border-subtleborder rounded-lg px-4 py-2.5 text-sm text-offwhite font-mono focus:outline-none focus:border-emerald/50"
            />
          </div>

          {/* Premium */}
          <div className="bg-charcoal border border-subtleborder rounded-xl p-4">
            <label className="text-xs font-mono text-slategray uppercase tracking-wider mb-2 block">Premium</label>
            <input
              type="number"
              value={premium}
              step={0.5}
              onChange={(e) => setPremium(Number(e.target.value))}
              className="w-full bg-deepblack border border-subtleborder rounded-lg px-4 py-2.5 text-sm text-offwhite font-mono focus:outline-none focus:border-emerald/50"
            />
          </div>

          {/* Call / Put Toggle */}
          <div className="bg-charcoal border border-subtleborder rounded-xl p-4">
            <label className="text-xs font-mono text-slategray uppercase tracking-wider mb-2 block">Option Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setOptionType('call')}
                className={`flex-1 py-2.5 text-sm font-mono rounded-lg transition-colors ${optionType === 'call' ? 'bg-emerald text-obsidian' : 'bg-deepblack border border-subtleborder text-slategray hover:text-offwhite'}`}
              >
                Call
              </button>
              <button
                onClick={() => setOptionType('put')}
                className={`flex-1 py-2.5 text-sm font-mono rounded-lg transition-colors ${optionType === 'put' ? 'bg-crimson text-offwhite' : 'bg-deepblack border border-subtleborder text-slategray hover:text-offwhite'}`}
              >
                Put
              </button>
            </div>
          </div>

          {/* Buy / Sell Toggle */}
          <div className="bg-charcoal border border-subtleborder rounded-xl p-4">
            <label className="text-xs font-mono text-slategray uppercase tracking-wider mb-2 block">Direction</label>
            <div className="flex gap-2">
              <button
                onClick={() => setDirection('buy')}
                className={`flex-1 py-2.5 text-sm font-mono rounded-lg transition-colors ${direction === 'buy' ? 'bg-emerald text-obsidian' : 'bg-deepblack border border-subtleborder text-slategray hover:text-offwhite'}`}
              >
                Buy
              </button>
              <button
                onClick={() => setDirection('sell')}
                className={`flex-1 py-2.5 text-sm font-mono rounded-lg transition-colors ${direction === 'sell' ? 'bg-crimson text-offwhite' : 'bg-deepblack border border-subtleborder text-slategray hover:text-offwhite'}`}
              >
                Sell
              </button>
            </div>
          </div>

          {/* Contracts Slider */}
          <div className="bg-charcoal border border-subtleborder rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-mono text-slategray uppercase tracking-wider">Contracts</label>
              <span className="text-sm font-mono text-offwhite">{contracts}</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={contracts}
              onChange={(e) => setContracts(Number(e.target.value))}
              className="w-full h-1.5 bg-deepblack rounded-full appearance-none cursor-pointer accent-emerald"
              style={{
                background: `linear-gradient(to right, #10B981 0%, #10B981 ${((contracts - 1) / 99) * 100}%, #0A0A0A ${((contracts - 1) / 99) * 100}%, #0A0A0A 100%)`,
              }}
            />
            <p className="text-xs font-mono text-slategray mt-1">{contracts * 100} shares &middot; {formatLocal(metrics.totalCost)} {direction === 'buy' ? 'cost' : 'credit'}</p>
          </div>

          {/* Expiration */}
          <div className="bg-charcoal border border-subtleborder rounded-xl p-4">
            <label className="text-xs font-mono text-slategray uppercase tracking-wider mb-2 block">Expiration</label>
            <div className="flex gap-2">
              {([30, 60, 90, 180] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setExpiration(d)}
                  className={`flex-1 py-2 text-xs font-mono rounded-lg transition-colors ${expiration === d ? 'bg-emerald text-obsidian' : 'bg-deepblack border border-subtleborder text-slategray hover:text-offwhite'}`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>

          {/* Strategy label */}
          <div className="bg-charcoal border border-subtleborder rounded-xl p-4 flex items-center">
            <div>
              <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-1">Strategy</p>
              <p className="text-sm font-mono text-offwhite">{strategyLabel}</p>
              <p className="text-xs font-mono text-slategray">{ticker} {formatLocal(strikePrice)} {optionType} expiring in {expiration} days</p>
            </div>
          </div>
        </div>
      </section>

      {/* Payoff Diagram */}
      <section className="opt-section max-w-7xl mx-auto px-6 py-6">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
          <h2 className="text-lg font-display font-light text-offwhite mb-1">Payoff Diagram</h2>
          <p className="text-xs font-mono text-slategray mb-4">{strategyLabel} on {ticker} — {contracts} contract{contracts > 1 ? 's' : ''}</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={payoffData}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="price" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={{ stroke: '#222222' }} label={{ value: 'Stock Price at Expiry', position: 'insideBottom', offset: -5, fill: '#6B7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={{ stroke: '#222222' }} tickFormatter={(v: number) => formatChartTick(v)} />
                <Tooltip contentStyle={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '8px', color: '#E8E8E6' }} formatter={(v: number, name: string) => [formatLocal(v), name === 'profit' ? 'Profit' : 'Loss']} labelFormatter={(l: number) => `${formatLocal(l)} at expiry`} />
                <ReferenceLine y={0} stroke="#6B7280" strokeWidth={1} strokeDasharray="5 5" />
                <ReferenceLine x={strikePrice} stroke="#F59E0B" strokeDasharray="5 5" label={{ value: `Strike ${formatLocal(strikePrice)}`, fill: '#F59E0B', fontSize: 10, position: 'insideTopRight' }} />
                <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} fill="url(#profitGrad)" name="profit" />
                <Area type="monotone" dataKey="loss" stroke="#EF4444" strokeWidth={2} fill="url(#lossGrad)" name="loss" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Results Cards */}
      <section className="opt-section max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-charcoal border border-subtleborder rounded-xl p-5 text-center">
            <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Break-Even Price</p>
            <p className="text-2xl font-mono text-offwhite font-bold">{formatLocal(metrics.breakEven)}</p>
            <p className="text-xs font-mono text-slategray mt-1">stock must {optionType === 'call' ? 'rise above' : 'fall below'} this price</p>
          </div>
          <div className="bg-charcoal border border-emerald/30 rounded-xl p-5 text-center">
            <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Max Profit</p>
            <p className="text-2xl font-mono text-emerald font-bold">{metrics.maxProfitValue === null ? 'Unlimited' : formatLocal(metrics.maxProfitValue)}</p>
            <p className="text-xs font-mono text-slategray mt-1">
              {direction === 'buy' && optionType === 'call' ? 'theoretically unlimited' : direction === 'buy' ? `strike - premium = ${formatLocal(strikePrice - premium)}` : 'premium collected'}
            </p>
          </div>
          <div className="bg-charcoal border border-crimson/30 rounded-xl p-5 text-center">
            <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Max Loss</p>
            <p className="text-2xl font-mono text-crimson font-bold">{metrics.maxLossValue === null ? 'Unlimited' : formatLocal(metrics.maxLossValue)}</p>
            <p className="text-xs font-mono text-slategray mt-1">
              {direction === 'buy' ? 'premium paid' : direction === 'sell' && optionType === 'call' ? 'theoretically unlimited' : `strike - premium = ${formatLocal(strikePrice - premium)}`}
            </p>
          </div>
        </div>
      </section>

      {/* Probability of Profit */}
      <section className="opt-section max-w-7xl mx-auto px-6 py-6">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-1">Approximate Probability of Profit</p>
              <p className="text-3xl font-display font-bold text-offwhite">~45%</p>
            </div>
            <div className="text-right max-w-md">
              <p className="text-xs text-slategray leading-relaxed">
                This is a rough estimate based on the option&apos;s delta and does not account for volatility changes, dividends, or early exercise. Probability calculations assume a log-normal distribution of returns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="opt-section max-w-7xl mx-auto px-6 py-8 pb-20 text-center">
        <button className="bg-emerald text-obsidian font-mono font-medium px-8 py-3.5 rounded-lg hover:bg-emerald/90 transition-colors">
          Open Paper Trading Account
        </button>
      </section>
    </div>
  );
}
