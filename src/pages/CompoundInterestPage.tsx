import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CompoundInterest from '../components/CompoundInterest';
import { CalculatorIcon, ArrowRightIcon } from '../components/CustomIcons';

gsap.registerPlugin(ScrollTrigger);

const otherTools = [
  { title: 'Retirement Score', path: '/tools/retirement' },
  { title: 'Mortgage Calculator', path: '/tools/mortgage' },
  { title: 'Portfolio Backtester', path: '/tools/backtester' },
  { title: 'Tax Loss Harvesting', path: '/tools/tax-loss' },
  { title: 'Options Calculator', path: '/tools/options' },
];

export default function CompoundInterestPage() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.ci-section',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef}>
      {/* Header */}
      <section className="ci-section max-w-7xl mx-auto px-6 pt-24 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <CalculatorIcon size={24} className="text-emerald" />
          <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite">
            Compound Interest
          </h1>
        </div>
        <p className="text-slategray max-w-xl">
          Project long-term wealth growth with adjustable capital and yield parameters.
          See how compounding transforms your investments over time.
        </p>
      </section>

      {/* Calculator */}
      <section className="ci-section max-w-7xl mx-auto px-6 py-12">
        <CompoundInterest />
      </section>

      {/* Other Tools */}
      <section className="ci-section max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-xl font-display font-light text-offwhite mb-6">More Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {otherTools.map((tool) => (
            <Link
              key={tool.path}
              to={tool.path}
              className="bg-charcoal border border-subtleborder rounded-xl p-4 hover:border-emerald/50 transition-colors group text-center"
            >
              <span className="text-sm text-offwhite group-hover:text-emerald transition-colors">{tool.title}</span>
              <ArrowRightIcon size={12} className="inline-block ml-1 text-emerald opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
