import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CompoundInterest from '../components/CompoundInterest';
import { CalculatorIcon, ChartBarIcon, FilterIcon, ClockIcon, ArrowRightIcon, ShieldIcon } from '../components/CustomIcons';

gsap.registerPlugin(ScrollTrigger);

const toolsList = [
  {
    title: 'Compound Interest',
    description: 'Project wealth growth with adjustable capital and yield parameters.',
    icon: <CalculatorIcon size={24} />,
    path: '/tools',
  },
  {
    title: 'Retirement Score',
    description: 'Personalized gap analysis with Monte Carlo simulation engine.',
    icon: <ClockIcon size={24} />,
    path: '/tools/retirement',
  },
  {
    title: 'Mortgage Calculator',
    description: 'Calculate monthly payments, total cost, and amortization schedules.',
    icon: <ChartBarIcon size={24} />,
    path: '/tools/mortgage',
  },
  {
    title: 'Portfolio Backtester',
    description: 'Test allocation strategies against 20+ years of historical market data.',
    icon: <FilterIcon size={24} />,
    path: '/tools/backtester',
  },
  {
    title: 'Tax Loss Harvesting',
    description: 'Identify harvestable losses and estimate tax savings across your portfolio.',
    icon: <ShieldIcon size={24} />,
    path: '/tools/tax-loss',
  },
  {
    title: 'Options Calculator',
    description: 'Estimate option premiums using Black-Scholes pricing model.',
    icon: <CalculatorIcon size={24} />,
    path: '/tools/options',
  },
];

export default function Tools() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.tools-section',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef}>
      {/* Header */}
      <section className="tools-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite mb-2">
          Tools
        </h1>
        <p className="text-slategray max-w-xl">
          Institutional-grade calculators and analytical engines. Built for precision.
        </p>
      </section>

      {/* Tools Grid */}
      <section className="tools-section max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {toolsList.map((tool) => (
            <Link
              key={tool.path}
              to={tool.path}
              className="bg-charcoal border border-subtleborder rounded-xl p-6 hover:border-emerald/50 transition-colors group"
            >
              <div className="mb-4 text-emerald">
                {tool.icon}
              </div>
              <h3 className="text-sm font-medium text-offwhite mb-2">{tool.title}</h3>
              <p className="text-xs text-slategray leading-relaxed mb-4">{tool.description}</p>
              <span className="text-xs font-mono flex items-center gap-1 text-emerald group-hover:gap-2 transition-all">
                Active <ArrowRightIcon size={12} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Compound Interest Calculator */}
      <section className="tools-section max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <CalculatorIcon size={20} className="text-emerald" />
            <h2 className="text-2xl md:text-3xl font-display font-light text-offwhite">Compound Interest</h2>
          </div>
          <p className="text-sm text-slategray">Visualize long-term wealth accumulation</p>
        </div>
        <CompoundInterest />
      </section>
    </div>
  );
}
