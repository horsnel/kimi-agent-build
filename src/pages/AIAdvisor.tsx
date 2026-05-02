import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ComingSoonWrapper from '../components/ComingSoonWrapper';

gsap.registerPlugin(ScrollTrigger);

export default function AIAdvisor() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.ai-section', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <ComingSoonWrapper featureName="AI Investment Advisor" description="Get personalized investment recommendations powered by advanced AI models. Our advisor analyzes your portfolio, risk tolerance, and market conditions to provide tailored guidance.">
      <div ref={sectionRef}>
        {/* Hero */}
        <section className="ai-section max-w-7xl mx-auto px-6 pt-24 pb-12">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite">AI Investment Advisor</h1>
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-amber-500/20 text-amber-400 rounded">SOON</span>
          </div>
          <p className="text-slategray text-lg">AI-powered personalized investment recommendations</p>
        </section>

        {/* Blurred Preview - Chat Interface */}
        <section className="ai-section max-w-7xl mx-auto px-6 py-8">
          <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
            <h2 className="text-xl font-display font-light text-offwhite mb-6">AI Advisor Chat Preview</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-mono text-emerald">U</span>
                </div>
                <div className="bg-deepblack border border-subtleborder rounded-xl p-4 max-w-lg">
                  <p className="text-sm text-offwhite">What sectors should I consider for Q2 2026 given the current Fed policy outlook?</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-mono text-emerald">AI</span>
                </div>
                <div className="bg-emerald/5 border border-emerald/20 rounded-xl p-4 max-w-2xl">
                  <p className="text-sm text-offwhite leading-relaxed">Based on the current monetary policy trajectory, I recommend focusing on three key areas: (1) Technology — AI infrastructure spending continues to accelerate; (2) Healthcare — defensive positioning with growth potential from GLP-1 adoption; (3) Energy — supply constraints support pricing power. Your risk profile suggests a 60/30/10 allocation across these sectors.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-mono text-emerald">AI</span>
                </div>
                <div className="bg-emerald/5 border border-emerald/20 rounded-xl p-4 max-w-lg">
                  <p className="text-sm text-offwhite">📈 Confidence Score: 78% | Based on 12 macro indicators, 8 sector signals, and your portfolio composition.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="ai-section max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-xl font-display font-light text-offwhite mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
              <p className="text-xs font-mono text-emerald uppercase tracking-wider mb-2">Portfolio Analysis</p>
              <p className="text-sm text-slategray">AI analyzes your holdings for concentration risk, sector exposure, and correlation patterns</p>
            </div>
            <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
              <p className="text-xs font-mono text-emerald uppercase tracking-wider mb-2">Market Regime Detection</p>
              <p className="text-sm text-slategray">Real-time classification of market conditions to adjust strategy recommendations</p>
            </div>
            <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
              <p className="text-xs font-mono text-emerald uppercase tracking-wider mb-2">Risk-Aware Suggestions</p>
              <p className="text-sm text-slategray">Recommendations calibrated to your risk tolerance, time horizon, and financial goals</p>
            </div>
          </div>
        </section>
      </div>
    </ComingSoonWrapper>
  );
}
