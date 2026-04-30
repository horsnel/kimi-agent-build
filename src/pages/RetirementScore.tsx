import { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

gsap.registerPlugin(ScrollTrigger);

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

export default function RetirementScore() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [annualIncome, setAnnualIncome] = useState(85000);
  const [currentSavings, setCurrentSavings] = useState(120000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const sectionRef = useRef<HTMLDivElement>(null);

  const years = retirementAge - currentAge;
  const monthlyRate = expectedReturn / 100 / 12;
  const rate = expectedReturn / 100;

  const calculations = useMemo(() => {
    if (years <= 0 || rate <= 0) {
      return { fv: currentSavings, monthlyRetirementIncome: 0, targetMonthlyIncome: annualIncome * 0.8 / 12, score: 0 };
    }
    const fv = currentSavings * Math.pow(1 + rate, years) + monthlyContribution * 12 * (Math.pow(1 + rate, years) - 1) / rate;
    const monthlyRetirementIncome = fv * 0.04 / 12;
    const targetMonthlyIncome = annualIncome * 0.8 / 12;
    const score = Math.min(100, Math.round((monthlyRetirementIncome / targetMonthlyIncome) * 100));
    return { fv, monthlyRetirementIncome, targetMonthlyIncome, score };
  }, [currentAge, retirementAge, annualIncome, currentSavings, monthlyContribution, expectedReturn, years, rate]);

  const chartData = useMemo(() => {
    const data: { age: number; savings: number }[] = [];
    const totalYears = years + 20;
    for (let i = 0; i <= totalYears; i++) {
      const age = currentAge + i;
      let value: number;
      if (i <= years) {
        value = currentSavings * Math.pow(1 + rate, i) + monthlyContribution * 12 * (Math.pow(1 + rate, i) - 1) / (rate || 0.001);
      } else {
        const peakValue = currentSavings * Math.pow(1 + rate, years) + monthlyContribution * 12 * (Math.pow(1 + rate, years) - 1) / (rate || 0.001);
        const postYears = i - years;
        value = peakValue * Math.pow(1 - 0.04, postYears);
      }
      data.push({ age, savings: Math.max(0, Math.round(value)) });
    }
    return data;
  }, [currentAge, retirementAge, currentSavings, monthlyContribution, expectedReturn, years, rate]);

  const scoreColor = calculations.score < 40 ? '#EF4444' : calculations.score < 70 ? '#F59E0B' : '#10B981';
  const scoreLabel = calculations.score < 40 ? 'At Risk' : calculations.score < 70 ? 'Needs Attention' : 'On Track';
  const gap = calculations.monthlyRetirementIncome - calculations.targetMonthlyIncome;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.ret-section', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const sliders = [
    { label: 'Current Age', value: currentAge, setter: setCurrentAge, min: 18, max: 65, step: 1, display: `${currentAge}` },
    { label: 'Retirement Age', value: retirementAge, setter: setRetirementAge, min: 55, max: 75, step: 1, display: `${retirementAge}` },
    { label: 'Annual Income', value: annualIncome, setter: setAnnualIncome, min: 30000, max: 500000, step: 5000, display: fmt(annualIncome) },
    { label: 'Current Savings', value: currentSavings, setter: setCurrentSavings, min: 0, max: 2000000, step: 10000, display: fmt(currentSavings) },
    { label: 'Monthly Contribution', value: monthlyContribution, setter: setMonthlyContribution, min: 0, max: 5000, step: 50, display: fmt(monthlyContribution) },
    { label: 'Expected Return', value: expectedReturn, setter: setExpectedReturn, min: 4, max: 12, step: 0.5, display: `${expectedReturn}%` },
  ];

  return (
    <div ref={sectionRef}>
      <section className="ret-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite mb-2">Retirement Readiness Score</h1>
        <p className="text-slategray text-lg">Assess your retirement readiness with personalized projections</p>
      </section>

      <section className="ret-section max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sliders */}
          <div className="bg-charcoal border border-subtleborder rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-mono text-slategray uppercase tracking-wider mb-2">Your Parameters</h2>
            {sliders.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-mono text-slategray uppercase tracking-wider">{s.label}</label>
                  <span className="text-sm font-mono text-offwhite">{s.display}</span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={s.value}
                  onChange={(e) => s.setter(Number(e.target.value))}
                  className="w-full h-1.5 bg-deepblack rounded-full appearance-none cursor-pointer accent-emerald"
                  style={{
                    background: `linear-gradient(to right, #10B981 0%, #10B981 ${((s.value - s.min) / (s.max - s.min)) * 100}%, #0A0A0A ${((s.value - s.min) / (s.max - s.min)) * 100}%, #0A0A0A 100%)`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Score Circle + Summary */}
          <div className="space-y-6">
            <div className="bg-charcoal border border-subtleborder rounded-xl p-6 flex flex-col items-center justify-center">
              <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-4">Your Retirement Readiness Score</p>
              <svg width="200" height="200" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="88" fill="none" stroke="#222222" strokeWidth="8" />
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - calculations.score / 100)}`}
                  transform="rotate(-90 100 100)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
                />
                <text x="100" y="90" textAnchor="middle" fill={scoreColor} fontSize="52" fontWeight="700" fontFamily="Geist, Inter, sans-serif">
                  {calculations.score}
                </text>
                <text x="100" y="118" textAnchor="middle" fill="#6B7280" fontSize="14" fontFamily="JetBrains Mono, monospace">
                  out of 100
                </text>
              </svg>
              <p className="text-sm font-mono mt-3" style={{ color: scoreColor }}>{scoreLabel}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-charcoal border border-subtleborder rounded-xl p-4">
                <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-1">Projected Savings</p>
                <p className="text-xl font-mono text-offwhite">{fmt(calculations.fv)}</p>
              </div>
              <div className="bg-charcoal border border-subtleborder rounded-xl p-4">
                <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-1">Monthly Retirement Income</p>
                <p className="text-xl font-mono text-emerald">{fmt(calculations.monthlyRetirementIncome)}</p>
              </div>
            </div>

            {/* Gap Analysis */}
            <div className={`bg-charcoal border rounded-xl p-5 ${gap >= 0 ? 'border-emerald/30' : 'border-crimson/30'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-1">
                    {gap >= 0 ? 'Monthly Surplus' : 'Monthly Shortfall'}
                  </p>
                  <p className={`text-2xl font-display font-bold ${gap >= 0 ? 'text-emerald' : 'text-crimson'}`}>
                    {gap >= 0 ? '+' : '-'}{fmt(Math.abs(gap))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-slategray mb-1">Target: {fmt(calculations.targetMonthlyIncome)}/mo</p>
                  <p className="text-xs font-mono text-slategray">Projected: {fmt(calculations.monthlyRetirementIncome)}/mo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Savings Growth Chart */}
      <section className="ret-section max-w-7xl mx-auto px-6 py-8">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
          <h2 className="text-lg font-display font-light text-offwhite mb-1">Savings Growth Projection</h2>
          <p className="text-xs font-mono text-slategray mb-4">From age {currentAge} to {retirementAge + 20} (post-retirement drawdown at 4%/yr)</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="age" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={{ stroke: '#222222' }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={{ stroke: '#222222' }} tickFormatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`} />
                <Tooltip contentStyle={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '8px', color: '#E8E8E6' }} formatter={(v: number) => fmt(v)} labelFormatter={(l: number) => `Age ${l}`} />
                <ReferenceLine x={retirementAge} stroke="#F59E0B" strokeDasharray="5 5" label={{ value: 'Retire', fill: '#F59E0B', fontSize: 11 }} />
                <Area type="monotone" dataKey="savings" stroke="#10B981" strokeWidth={2} fill="url(#savingsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ret-section max-w-7xl mx-auto px-6 py-8 pb-20 text-center">
        <button className="bg-emerald text-obsidian font-mono font-medium px-8 py-3.5 rounded-lg hover:bg-emerald/90 transition-colors">
          Get Personalized Advice
        </button>
      </section>
    </div>
  );
}
