import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { CalculatorIcon } from './CustomIcons';

type Period = 5 | 10 | 15 | 20 | 30;

export default function CompoundInterest() {
  const [principal, setPrincipal] = useState(50000);
  const [rate, setRate] = useState(12);
  const [period, setPeriod] = useState<Period>(10);
  const [displayValue, setDisplayValue] = useState(155280);
  const displayRef = useRef<HTMLSpanElement>(null);

  const calculate = (p: number, r: number, years: number) => {
    return Math.round(p * Math.pow(1 + r / 100, years));
  };

  useEffect(() => {
    const newValue = calculate(principal, rate, period);
    const current = displayValue;
    const proxy = { val: current };

    gsap.to(proxy, {
      val: newValue,
      duration: 1.2,
      ease: 'power3.out',
      onUpdate: () => {
        setDisplayValue(Math.round(proxy.val));
      },
    });
  }, [principal, rate, period]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const isHighValue = displayValue > 1000000;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-charcoal border border-subtleborder rounded-xl p-8 md:p-12">
        <div className="flex items-center gap-3 mb-10">
          <CalculatorIcon size={24} className="text-emerald" />
          <h3 className="text-xl font-display font-medium text-offwhite">Compound Interest Calculator</h3>
        </div>

        <div className="space-y-10">
          {/* Principal Slider */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-slategray">Initial Capital</label>
              <span className="text-sm font-mono text-offwhite">{formatCurrency(principal)}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="500000"
              step="1000"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full h-1.5 bg-deepblack rounded-full appearance-none cursor-pointer accent-emerald"
              style={{
                background: `linear-gradient(to right, #10B981 0%, #10B981 ${(principal - 1000) / 499000 * 100}%, #0A0A0A ${(principal - 1000) / 499000 * 100}%, #0A0A0A 100%)`,
              }}
            />
            <div className="flex justify-between mt-1 text-xs font-mono text-slategray">
              <span>$1K</span>
              <span>$500K</span>
            </div>
          </div>

          {/* Rate Slider */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-slategray">Annual Yield</label>
              <span className={`text-sm font-mono ${rate > 10 ? 'text-emerald' : 'text-offwhite'}`}>{rate}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              step="0.5"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full h-1.5 bg-deepblack rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${rate > 10 ? '#10B981' : '#E8E8E6'} 0%, ${rate > 10 ? '#10B981' : '#E8E8E6'} ${(rate - 1) / 24 * 100}%, #0A0A0A ${(rate - 1) / 24 * 100}%, #0A0A0A 100%)`,
              }}
            />
            <div className="flex justify-between mt-1 text-xs font-mono text-slategray">
              <span>1%</span>
              <span>25%</span>
            </div>
          </div>

          {/* Time Period Selector */}
          <div>
            <label className="text-sm font-medium text-slategray mb-3 block">Investment Horizon</label>
            <div className="flex gap-2">
              {([5, 10, 15, 20, 30] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`flex-1 py-2 text-sm font-mono rounded-lg transition-colors ${
                    period === p
                      ? 'bg-emerald text-obsidian'
                      : 'bg-deepblack border border-subtleborder text-slategray hover:text-offwhite hover:border-slategray'
                  }`}
                >
                  {p}Y
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          <div className="pt-8 border-t border-subtleborder">
            <div className="text-sm font-medium text-slategray mb-2">{period}-Year Projected Value</div>
            <span
              ref={displayRef}
              className={`text-4xl md:text-5xl font-display font-light tracking-tight transition-colors duration-500 ${
                isHighValue ? 'text-emerald' : 'text-offwhite'
              }`}
            >
              {formatCurrency(displayValue)}
            </span>
            <div className="mt-2 text-xs font-mono text-slategray">
              Total Return: {formatCurrency(displayValue - principal)} ({((displayValue - principal) / principal * 100).toFixed(0)}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
