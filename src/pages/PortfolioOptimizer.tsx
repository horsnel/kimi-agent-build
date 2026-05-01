import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ComingSoonWrapper from '../components/ComingSoonWrapper';

gsap.registerPlugin(ScrollTrigger);

export default function PortfolioOptimizer() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('opt-section', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <ComingSoonWrapper featureName="Portfolio Optimizer Pro" description="AI-driven portfolio optimization with Monte Carlo simulations, risk parity models, and efficient frontier analysis. Build the optimal portfolio for your risk profile.">
      <div ref={sectionRef}>
        {/* Hero */}
        <section className="opt-section max-w-7xl mx-auto px-6 pt-24 pb-12">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite">Portfolio Optimizer Pro</h1>
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-amber-500/20 text-amber-400 rounded">SOON</span>
          </div>
          <p className="text-slategray text-lg">AI-driven portfolio optimization with Monte Carlo simulations and risk parity models</p>
        </section>

        {/* Blurred Preview - Optimization Dashboard */}
        <section className="opt-section max-w-7xl mx-auto px-6 py-8">
          <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
            <h2 className="text-xl font-display font-medium text-offwhite mb-6">Optimization Dashboard Preview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-deepblack border border-subtleborder rounded-xl p-5">
                <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Current Sharpe Ratio</p>
                <p className="text-2xl font-display font-bold text-amber-400">0.82</p>
                <p className="text-xs text-slategray mt-1">Below optimal threshold</p>
              </div>
              <div className="bg-deepblack border border-subtleborder rounded-xl p-5">
                <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Optimized Sharpe Ratio</p>
                <p className="text-2xl font-display font-bold text-emerald">1.34</p>
                <p className="text-xs text-emerald/60 mt-1">+63% improvement</p>
              </div>
              <div className="bg-deepblack border border-subtleborder rounded-xl p-5">
                <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">Expected Return</p>
                <p className="text-2xl font-display font-bold text-offwhite">11.2%</p>
                <p className="text-xs text-slategray mt-1">Annualized with 15% vol</p>
              </div>
            </div>

            {/* Efficient Frontier Preview */}
            <div className="bg-deepblack border border-subtleborder rounded-xl p-4">
              <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-4">Efficient Frontier — Risk vs Return</p>
              <div className="h-48 flex items-end gap-1">
                {Array.from({ length: 20 }, (_, i) => {
                  const h = 20 + Math.sin(i * 0.6) * 25 + i * 2;
                  return <div key={i} className="flex-1 bg-emerald/20 rounded-t" style={{ height: `${h}%` }} />;
                })}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] font-mono text-slategray">Low Risk</span>
                <span className="text-[10px] font-mono text-slategray">High Risk</span>
              </div>
            </div>
          </div>
        </section>

        {/* Optimization Methods */}
        <section className="opt-section max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-xl font-display font-medium text-offwhite mb-6">Optimization Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
              <p className="text-xs font-mono text-emerald uppercase tracking-wider mb-2">Monte Carlo Simulation</p>
              <p className="text-sm text-slategray">10,000+ portfolio simulations to find the optimal allocation under various market scenarios</p>
            </div>
            <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
              <p className="text-xs font-mono text-emerald uppercase tracking-wider mb-2">Risk Parity Model</p>
              <p className="text-sm text-slategray">Allocate based on equal risk contribution from each asset class for balanced exposure</p>
            </div>
            <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
              <p className="text-xs font-mono text-emerald uppercase tracking-wider mb-2">Black-Litterman</p>
              <p className="text-sm text-slategray">Combine market equilibrium with investor views for sophisticated portfolio construction</p>
            </div>
          </div>
        </section>
      </div>
    </ComingSoonWrapper>
  );
}
