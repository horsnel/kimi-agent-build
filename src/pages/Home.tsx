import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroOrbital from '../components/HeroOrbital';
import BentoGrid from '../components/BentoGrid';
import ScrambleTable from '../components/ScrambleTable';
import DashboardTable from '../components/DashboardTable';
import { ArrowRightIcon, LayerStackIcon, ClockIcon, ZapIcon } from '../components/CustomIcons';

gsap.registerPlugin(ScrollTrigger);

const editorialArticles = [
  {
    title: 'The Infrastructure of Tomorrow',
    subtitle: 'How decentralized networks are reshaping global capital flows',
    image: '/images/shift_image_1.jpg',
    date: 'Jan 15, 2026',
    readTime: '8 min',
  },
  {
    title: 'Liquid Metal Markets',
    subtitle: 'An analysis of volatility surfaces in post-quantum trading environments',
    image: '/images/shift_image_2.jpg',
    date: 'Jan 12, 2026',
    readTime: '12 min',
  },
  {
    title: 'Neural Networks of Capital',
    subtitle: 'Machine learning architectures predicting macro-economic shifts',
    image: '/images/shift_image_3.jpg',
    date: 'Jan 08, 2026',
    readTime: '6 min',
  },
];

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text animation
      if (heroTextRef.current) {
        gsap.fromTo(
          heroTextRef.current.children,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.3 }
        );
      }

      // Section reveals
      sectionsRef.current.forEach((section) => {
        if (!section) return;
        gsap.fromTo(
          section,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <HeroOrbital />
        <div ref={heroTextRef} className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-light tracking-tight text-offwhite mb-6">
            Market Intelligence.
            <br />
            <span className="text-gradient-green">Redefined.</span>
          </h1>
          <p className="text-lg md:text-xl text-slategray font-light max-w-2xl mx-auto mb-10">
            Proprietary algorithms scanning global markets in real-time.
          </p>
          <Link
            to="/markets"
            className="inline-flex items-center gap-3 px-8 py-3 border border-emerald text-offwhite text-sm font-medium tracking-wide hover:bg-emerald hover:text-obsidian transition-all duration-200"
          >
            Initialize Terminal
            <ArrowRightIcon size={18} />
          </Link>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-slategray to-transparent animate-pulse" />
        </div>
      </section>

      {/* Bento Grid */}
      <section
        ref={(el) => { sectionsRef.current[0] = el; }}
        className="max-w-7xl mx-auto px-6 py-24"
      >
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-light text-offwhite mb-2">Market Overview</h2>
            <p className="text-sm text-slategray">Real-time global market snapshot</p>
          </div>
          <Link to="/markets" className="hidden md:flex items-center gap-2 text-sm text-emerald hover:text-offwhite transition-colors">
            View All Markets <ArrowRightIcon size={16} />
          </Link>
        </div>
        <BentoGrid />
      </section>

      {/* Live Data Feed */}
      <section
        ref={(el) => { sectionsRef.current[1] = el; }}
        className="bg-deepblack py-24"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <ZapIcon size={20} className="text-emerald" />
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-light text-offwhite">Live Order Flow</h2>
              <p className="text-sm text-slategray mt-1">Institutional-grade execution data</p>
            </div>
          </div>
          <ScrambleTable />
        </div>
      </section>

      {/* Deep Dive / Editorial */}
      <section
        ref={(el) => { sectionsRef.current[2] = el; }}
        className="max-w-7xl mx-auto px-6 py-24"
      >
        <div className="flex items-center gap-3 mb-12">
          <LayerStackIcon size={20} className="text-emerald" />
          <h2 className="text-2xl md:text-3xl font-display font-light text-offwhite">Deep Dive</h2>
        </div>
        <div className="space-y-16">
          {editorialArticles.map((article, idx) => (
            <div
              key={idx}
              className={`grid md:grid-cols-2 gap-8 items-center ${idx % 2 === 1 ? 'md:grid-flow-dense' : ''}`}
            >
              <div className={idx % 2 === 1 ? 'md:col-start-2' : ''}>
                <div className="overflow-hidden rounded-xl border border-subtleborder">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-64 md:h-80 object-cover hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className={idx % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}>
                <div className="flex items-center gap-3 text-xs font-mono text-slategray mb-4">
                  <span className="flex items-center gap-1"><ClockIcon size={14} /> {article.date}</span>
                  <span>{article.readTime} read</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-display font-light text-offwhite mb-3 leading-tight">
                  {article.title}
                </h3>
                <p className="text-slategray leading-relaxed mb-6">{article.subtitle}</p>
                <Link
                  to="/research"
                  className="inline-flex items-center gap-2 text-sm text-emerald hover:text-offwhite transition-colors"
                >
                  Read Analysis <ArrowRightIcon size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Terminal Preview */}
      <section
        ref={(el) => { sectionsRef.current[3] = el; }}
        className="bg-deepblack py-24"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-light text-offwhite mb-2">The Terminal</h2>
              <p className="text-sm text-slategray">150+ assets analyzed in real-time</p>
            </div>
            <Link to="/markets" className="hidden md:flex items-center gap-2 text-sm text-emerald hover:text-offwhite transition-colors">
              Open Terminal <ArrowRightIcon size={16} />
            </Link>
          </div>
          <div className="bg-charcoal border border-subtleborder rounded-xl overflow-hidden">
            <DashboardTable maxRows={6} />
          </div>
        </div>
      </section>
    </div>
  );
}
