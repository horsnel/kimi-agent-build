import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CompoundInterest from '../components/CompoundInterest';
import { CalculatorIcon, ChartBarIcon, FilterIcon, ClockIcon, ArrowRightIcon } from '../components/CustomIcons';

gsap.registerPlugin(ScrollTrigger);

const toolsList = [
  {
    title: 'Compound Interest',
    description: 'Project wealth growth with adjustable capital and yield parameters.',
    icon: <CalculatorIcon size={24} />,
    active: true,
  },
  {
    title: 'Portfolio Backtester',
    description: 'Test allocation strategies against 50+ years of historical market data.',
    icon: <ChartBarIcon size={24} />,
    active: false,
  },
  {
    title: 'Asset Screener',
    description: 'Filter 150+ assets by P/E ratio, volume, sector, and momentum signals.',
    icon: <FilterIcon size={24} />,
    active: false,
  },
  {
    title: 'Retirement Score',
    description: 'Personalized gap analysis with Monte Carlo simulation engine.',
    icon: <ClockIcon size={24} />,
    active: false,
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {toolsList.map((tool, idx) => (
            <div
              key={idx}
              className={`bg-charcoal border rounded-xl p-6 transition-colors ${
                tool.active ? 'border-emerald/50' : 'border-subtleborder hover:border-slategray'
              }`}
            >
              <div className={`mb-4 ${tool.active ? 'text-emerald' : 'text-slategray'}`}>
                {tool.icon}
              </div>
              <h3 className="text-sm font-medium text-offwhite mb-2">{tool.title}</h3>
              <p className="text-xs text-slategray leading-relaxed mb-4">{tool.description}</p>
              <button
                className={`text-xs font-mono flex items-center gap-1 transition-colors ${
                  tool.active ? 'text-emerald' : 'text-slategray'
                }`}
              >
                {tool.active ? 'Active' : 'Coming Soon'}
                {tool.active && <ArrowRightIcon size={12} />}
              </button>
            </div>
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

      {/* More tools coming */}
      <section className="tools-section max-w-7xl mx-auto px-6 py-16 mb-16">
        <div className="bg-charcoal border border-subtleborder border-dashed rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-deepblack border border-subtleborder rounded-full flex items-center justify-center mx-auto mb-4">
            <ChartBarIcon size={20} className="text-slategray" />
          </div>
          <h3 className="text-lg font-medium text-offwhite mb-2">More Tools in Development</h3>
          <p className="text-sm text-slategray max-w-md mx-auto">
            Portfolio Backtester, Tax Loss Harvesting, and Options P/L Calculator are currently under development. Check back soon.
          </p>
        </div>
      </section>
    </div>
  );
}
