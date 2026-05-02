import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ComingSoonWrapper from '../components/ComingSoonWrapper';

gsap.registerPlugin(ScrollTrigger);

export default function RealTimeAlerts() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.alert-section', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <ComingSoonWrapper featureName="Real-Time Market Alerts" description="Instant notifications for price movements, earnings surprises, and breaking market news. Never miss a market-moving event again.">
      <div ref={sectionRef}>
        {/* Hero */}
        <section className="alert-section max-w-7xl mx-auto px-6 pt-24 pb-12">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite">Real-Time Market Alerts</h1>
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-amber-500/20 text-amber-400 rounded">SOON</span>
          </div>
          <p className="text-slategray text-lg">Instant notifications for price movements, earnings surprises, and breaking news</p>
        </section>

        {/* Blurred Preview - Alert Cards */}
        <section className="alert-section max-w-7xl mx-auto px-6 py-8">
          <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
            <h2 className="text-xl font-display font-light text-offwhite mb-6">Alert Feed Preview</h2>
            <div className="space-y-3">
              <div className="bg-deepblack border border-crimson/30 rounded-xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-crimson/20 rounded-lg flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-crimson">
                    <path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6z" fill="currentColor" />
                    <path d="M11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-offwhite">NVDA -5.2% — Earnings Miss</p>
                  <p className="text-xs text-slategray mt-1">Q4 EPS $0.82 vs consensus $0.95. Revenue guidance below expectations. 2 min ago</p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-medium bg-crimson/20 text-crimson rounded shrink-0">HIGH</span>
              </div>
              <div className="bg-deepblack border border-emerald/30 rounded-xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald/20 rounded-lg flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-emerald">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-offwhite">AAPL +3.1% — New 52-Week High</p>
                  <p className="text-xs text-slategray mt-1">Apple shares reach new 52-week high on strong iPhone 17 pre-orders. 8 min ago</p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-medium bg-emerald/20 text-emerald rounded shrink-0">MEDIUM</span>
              </div>
              <div className="bg-deepblack border border-amber-500/30 rounded-xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-amber-400">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-offwhite">Fed Meeting — Rate Decision Today 2:00 PM ET</p>
                  <p className="text-xs text-slategray mt-1">FOMC meeting concludes. Market expects hold at 4.25-4.50%. Live coverage starting. 15 min ago</p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-medium bg-amber-500/20 text-amber-400 rounded shrink-0">SCHEDULED</span>
              </div>
            </div>
          </div>
        </section>

        {/* Alert Configuration Preview */}
        <section className="alert-section max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-xl font-display font-light text-offwhite mb-6">Customizable Alert Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-charcoal border border-subtleborder rounded-xl p-5">
              <p className="text-xs font-mono text-emerald uppercase tracking-wider mb-2">Price Alerts</p>
              <p className="text-sm text-slategray">Set thresholds for any stock, crypto, or index</p>
            </div>
            <div className="bg-charcoal border border-subtleborder rounded-xl p-5">
              <p className="text-xs font-mono text-emerald uppercase tracking-wider mb-2">Earnings Alerts</p>
              <p className="text-sm text-slategray">Pre and post-earnings notifications with surprise data</p>
            </div>
            <div className="bg-charcoal border border-subtleborder rounded-xl p-5">
              <p className="text-xs font-mono text-emerald uppercase tracking-wider mb-2">News Alerts</p>
              <p className="text-sm text-slategray">Breaking news filtered by your watchlist and interests</p>
            </div>
            <div className="bg-charcoal border border-subtleborder rounded-xl p-5">
              <p className="text-xs font-mono text-emerald uppercase tracking-wider mb-2">Macro Alerts</p>
              <p className="text-sm text-slategray">Economic data releases and central bank actions</p>
            </div>
          </div>
        </section>
      </div>
    </ComingSoonWrapper>
  );
}
