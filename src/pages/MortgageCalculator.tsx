import { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

gsap.registerPlugin(ScrollTrigger);

const fmt = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

export default function MortgageCalculator() {
  // Mortgage inputs
  const [homePrice, setHomePrice] = useState(450000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState<15 | 30>(30);
  const [propertyTax, setPropertyTax] = useState(5000);
  const [insurance, setInsurance] = useState(1500);
  // Rent inputs
  const [monthlyRent, setMonthlyRent] = useState(2200);
  const [annualRentIncrease, setAnnualRentIncrease] = useState(3);

  const sectionRef = useRef<HTMLDivElement>(null);

  const calculations = useMemo(() => {
    const downPayment = homePrice * (downPaymentPct / 100);
    const loanAmount = homePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;

    let monthlyMortgage: number;
    if (monthlyRate > 0) {
      monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    } else {
      monthlyMortgage = loanAmount / numPayments;
    }
    const monthlyTaxInsurance = propertyTax / 12 + insurance / 12;
    const totalMonthlyPayment = monthlyMortgage + monthlyTaxInsurance;

    // Cumulative cost data for chart
    const chartData: { year: number; mortgage: number; rent: number }[] = [];
    let mortgageCumulative = downPayment;
    let rentCumulative = 0;

    for (let y = 1; y <= 30; y++) {
      mortgageCumulative += totalMonthlyPayment * 12;
      rentCumulative += monthlyRent * Math.pow(1 + annualRentIncrease / 100, y - 1) * 12;
      chartData.push({
        year: y,
        mortgage: Math.round(mortgageCumulative),
        rent: Math.round(rentCumulative),
      });
    }

    // 30-year totals
    const totalMortgageCost = downPayment + totalMonthlyPayment * 12 * Math.min(loanTerm, 30);
    let totalRentCost = 0;
    for (let y = 0; y < 30; y++) {
      totalRentCost += monthlyRent * Math.pow(1 + annualRentIncrease / 100, y) * 12;
    }

    // Break-even year
    let breakEvenYear = 0;
    for (let y = 0; y < chartData.length; y++) {
      if (chartData[y].mortgage <= chartData[y].rent) {
        breakEvenYear = y + 1;
        break;
      }
    }
    if (breakEvenYear === 0) breakEvenYear = 30;

    // Equity built (home appreciation 3%/yr + principal paid)
    const homeValue30 = homePrice * Math.pow(1.03, 30);
    let principalPaid = loanAmount;
    if (loanTerm <= 30) {
      principalPaid = loanAmount; // loan fully paid
    } else {
      // partial
      principalPaid = loanAmount * (30 / loanTerm);
    }
    const totalEquity = homeValue30 - (loanAmount - principalPaid);
    const totalInterestPaid = totalMonthlyPayment * 12 * Math.min(loanTerm, 30) - loanAmount - (monthlyTaxInsurance * 12 * Math.min(loanTerm, 30));

    return {
      monthlyMortgage,
      totalMonthlyPayment,
      loanAmount,
      downPayment,
      totalMortgageCost,
      totalRentCost,
      breakEvenYear,
      chartData,
      totalEquity,
      totalInterestPaid,
      homeValue30,
      principalPaid,
    };
  }, [homePrice, downPaymentPct, interestRate, loanTerm, propertyTax, insurance, monthlyRent, annualRentIncrease]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.mort-section', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const sliderBg = (val: number, min: number, max: number) => ({
    background: `linear-gradient(to right, #10B981 0%, #10B981 ${((val - min) / (max - min)) * 100}%, #0A0A0A ${((val - min) / (max - min)) * 100}%, #0A0A0A 100%)`,
  });

  return (
    <div ref={sectionRef}>
      <section className="mort-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite mb-2">Mortgage vs Rent Calculator</h1>
        <p className="text-slategray text-lg">Compare the true cost of homeownership versus renting</p>
      </section>

      {/* Two-column inputs */}
      <section className="mort-section max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT - Mortgage */}
          <div className="bg-charcoal border border-subtleborder rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-mono text-emerald uppercase tracking-wider mb-2">Mortgage</h2>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-mono text-slategray uppercase tracking-wider">Home Price</label>
                <span className="text-sm font-mono text-offwhite">{fmt(homePrice)}</span>
              </div>
              <input type="range" min={100000} max={2000000} step={10000} value={homePrice} onChange={(e) => setHomePrice(Number(e.target.value))} className="w-full h-1.5 bg-deepblack rounded-full appearance-none cursor-pointer accent-emerald" style={sliderBg(homePrice, 100000, 2000000)} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-mono text-slategray uppercase tracking-wider">Down Payment</label>
                <span className="text-sm font-mono text-offwhite">{downPaymentPct}% ({fmt(homePrice * downPaymentPct / 100)})</span>
              </div>
              <input type="range" min={5} max={50} step={1} value={downPaymentPct} onChange={(e) => setDownPaymentPct(Number(e.target.value))} className="w-full h-1.5 bg-deepblack rounded-full appearance-none cursor-pointer accent-emerald" style={sliderBg(downPaymentPct, 5, 50)} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-mono text-slategray uppercase tracking-wider">Interest Rate</label>
                <span className="text-sm font-mono text-offwhite">{interestRate}%</span>
              </div>
              <input type="range" min={2} max={8} step={0.1} value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="w-full h-1.5 bg-deepblack rounded-full appearance-none cursor-pointer accent-emerald" style={sliderBg(interestRate, 2, 8)} />
            </div>
            <div>
              <label className="text-xs font-mono text-slategray uppercase tracking-wider mb-2 block">Loan Term</label>
              <div className="flex gap-2">
                {[15, 30].map((y) => (
                  <button key={y} onClick={() => setLoanTerm(y as 15 | 30)} className={`flex-1 py-2.5 text-sm font-mono rounded-lg transition-colors ${loanTerm === y ? 'bg-emerald text-obsidian' : 'bg-deepblack border border-subtleborder text-slategray hover:text-offwhite'}`}>
                    {y}yr
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-mono text-slategray uppercase tracking-wider">Property Tax (yr)</label>
                <span className="text-sm font-mono text-offwhite">{fmt(propertyTax)}</span>
              </div>
              <input type="range" min={0} max={15000} step={500} value={propertyTax} onChange={(e) => setPropertyTax(Number(e.target.value))} className="w-full h-1.5 bg-deepblack rounded-full appearance-none cursor-pointer accent-emerald" style={sliderBg(propertyTax, 0, 15000)} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-mono text-slategray uppercase tracking-wider">Insurance (yr)</label>
                <span className="text-sm font-mono text-offwhite">{fmt(insurance)}</span>
              </div>
              <input type="range" min={0} max={5000} step={100} value={insurance} onChange={(e) => setInsurance(Number(e.target.value))} className="w-full h-1.5 bg-deepblack rounded-full appearance-none cursor-pointer accent-emerald" style={sliderBg(insurance, 0, 5000)} />
            </div>
          </div>

          {/* RIGHT - Rent */}
          <div className="bg-charcoal border border-subtleborder rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-mono text-crimson uppercase tracking-wider mb-2">Rent</h2>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-mono text-slategray uppercase tracking-wider">Monthly Rent</label>
                <span className="text-sm font-mono text-offwhite">{fmt(monthlyRent)}</span>
              </div>
              <input type="range" min={500} max={5000} step={100} value={monthlyRent} onChange={(e) => setMonthlyRent(Number(e.target.value))} className="w-full h-1.5 bg-deepblack rounded-full appearance-none cursor-pointer accent-emerald" style={sliderBg(monthlyRent, 500, 5000)} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-mono text-slategray uppercase tracking-wider">Annual Rent Increase</label>
                <span className="text-sm font-mono text-offwhite">{annualRentIncrease}%</span>
              </div>
              <input type="range" min={1} max={8} step={0.5} value={annualRentIncrease} onChange={(e) => setAnnualRentIncrease(Number(e.target.value))} className="w-full h-1.5 bg-deepblack rounded-full appearance-none cursor-pointer accent-emerald" style={sliderBg(annualRentIncrease, 1, 8)} />
            </div>

            {/* Summary cards on rent side */}
            <div className="mt-8 space-y-4">
              <div className="bg-deepblack border border-subtleborder rounded-xl p-5 text-center">
                <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Monthly Mortgage Payment</p>
                <p className="text-4xl font-display font-bold text-emerald">{fmt(calculations.totalMonthlyPayment)}</p>
                <p className="text-xs font-mono text-slategray mt-2">incl. tax & insurance</p>
              </div>
              <div className="bg-deepblack border border-subtleborder rounded-xl p-5 text-center">
                <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Current Monthly Rent</p>
                <p className="text-4xl font-display font-bold text-crimson">{fmt(monthlyRent)}</p>
                <p className="text-xs font-mono text-slategray mt-2">{calculations.totalMonthlyPayment > monthlyRent ? `${fmt(calculations.totalMonthlyPayment - monthlyRent)} more than rent` : `${fmt(monthlyRent - calculations.totalMonthlyPayment)} less than rent`}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Cards */}
      <section className="mort-section max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-charcoal border border-emerald/30 rounded-xl p-6 text-center">
            <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Monthly Payment</p>
            <p className="text-3xl font-display font-bold text-emerald">{fmt(calculations.totalMonthlyPayment)}</p>
            <p className="text-xs font-mono text-slategray mt-1">PI: {fmt(calculations.monthlyMortgage)} + TI: {fmt(calculations.totalMonthlyPayment - calculations.monthlyMortgage)}</p>
          </div>
          <div className="bg-charcoal border border-subtleborder rounded-xl p-6 text-center">
            <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">30-Year Total Cost</p>
            <div className="space-y-2 mt-2">
              <div>
                <p className="text-xs font-mono text-slategray">Mortgage</p>
                <p className="text-lg font-mono text-emerald">{fmt(calculations.totalMortgageCost)}</p>
              </div>
              <div>
                <p className="text-xs font-mono text-slategray">Rent</p>
                <p className="text-lg font-mono text-crimson">{fmt(calculations.totalRentCost)}</p>
              </div>
            </div>
          </div>
          <div className="bg-charcoal border border-subtleborder rounded-xl p-6 text-center">
            <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Break-Even Year</p>
            <p className="text-3xl font-display font-bold text-offwhite">Year {calculations.breakEvenYear}</p>
            <p className="text-xs font-mono text-slategray mt-1">when mortgage cost &le; rent cost</p>
          </div>
        </div>
      </section>

      {/* Line Chart */}
      <section className="mort-section max-w-7xl mx-auto px-6 py-6">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
          <h2 className="text-lg font-display font-light text-offwhite mb-1">Cumulative Cost Over 30 Years</h2>
          <p className="text-xs font-mono text-slategray mb-4">Mortgage (with down payment) vs Rent (with annual increases)</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calculations.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="year" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={{ stroke: '#222222' }} label={{ value: 'Year', position: 'insideBottom', offset: -5, fill: '#6B7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={{ stroke: '#222222' }} tickFormatter={(v: number) => `$${(v / 1000000).toFixed(1)}M`} />
                <Tooltip contentStyle={{ backgroundColor: '#111111', border: '1px solid #222222', borderRadius: '8px', color: '#E8E8E6' }} formatter={(v: number) => fmt(v)} labelFormatter={(l: number) => `Year ${l}`} />
                <Line type="monotone" dataKey="mortgage" stroke="#10B981" strokeWidth={2} dot={false} name="Mortgage" />
                <Line type="monotone" dataKey="rent" stroke="#EF4444" strokeWidth={2} dot={false} name="Rent" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Equity Summary */}
      <section className="mort-section max-w-7xl mx-auto px-6 py-6 pb-20">
        <div className="bg-charcoal border border-emerald/30 rounded-xl p-6">
          <h2 className="text-lg font-display font-light text-offwhite mb-4">Equity Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-1">Home Value (30yr @3%/yr)</p>
              <p className="text-xl font-mono text-emerald">{fmt(calculations.homeValue30)}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-1">Total Equity Built</p>
              <p className="text-xl font-mono text-emerald">{fmt(calculations.totalEquity)}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-1">Total Rent Paid (30yr)</p>
              <p className="text-xl font-mono text-crimson">{fmt(calculations.totalRentCost)}</p>
              <p className="text-xs font-mono text-slategray mt-1">$0 equity built from rent</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-subtleborder flex flex-wrap gap-6">
            <div>
              <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-1">Down Payment</p>
              <p className="text-sm font-mono text-offwhite">{fmt(calculations.downPayment)}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-1">Loan Amount</p>
              <p className="text-sm font-mono text-offwhite">{fmt(calculations.loanAmount)}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-1">Total Interest Paid</p>
              <p className="text-sm font-mono text-crimson">{fmt(Math.max(0, calculations.totalInterestPaid))}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
