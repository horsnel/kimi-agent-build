import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookOpenIcon, ClockIcon, ArrowRightIcon, CpuIcon, DatabaseIcon, ShieldIcon } from '../components/CustomIcons';

gsap.registerPlugin(ScrollTrigger);

const articles = [
  {
    id: 0,
    title: 'Q3 Macro Outlook: The Liquidity Crunch',
    abstract: 'Central bank balance sheets are contracting at an unprecedented pace. We analyze the downstream effects on credit markets, emerging economies, and sovereign debt yields.',
    image: '/images/article_thumb_1.jpg',
    date: 'Jan 18, 2026',
    readTime: '18 min',
    category: 'Macro',
    featured: true,
  },
  {
    id: 1,
    title: 'The Architecture of Trustless Settlement',
    abstract: 'How zero-knowledge proofs are reshaping clearing and custody infrastructure across institutional finance.',
    image: '/images/article_thumb_2.jpg',
    date: 'Jan 16, 2026',
    readTime: '10 min',
    category: 'Infrastructure',
    featured: false,
  },
  {
    id: 2,
    title: 'Silicon Minds: AI Trading Systems',
    abstract: 'A deep-dive into the neural architectures powering modern algorithmic trading desks and their alpha generation capabilities.',
    image: '/images/article_thumb_3.jpg',
    date: 'Jan 14, 2026',
    readTime: '14 min',
    category: 'Technology',
    featured: false,
  },
  {
    id: 3,
    title: 'Network Effects in Digital Economies',
    abstract: 'Analyzing the topological properties of value flows in decentralized financial networks.',
    image: '/images/article_thumb_4.jpg',
    date: 'Jan 11, 2026',
    readTime: '9 min',
    category: 'Research',
    featured: false,
  },
  {
    id: 4,
    title: 'Refraction: Risk Through Many Lenses',
    abstract: 'Multi-factor risk decomposition for modern portfolios spanning traditional and digital assets.',
    image: '/images/article_thumb_5.jpg',
    date: 'Jan 09, 2026',
    readTime: '11 min',
    category: 'Risk',
    featured: false,
  },
  {
    id: 5,
    title: 'Data Centers of Capital',
    abstract: 'The physical infrastructure behind financial computation and its implications for latency arbitrage.',
    image: '/images/article_thumb_6.jpg',
    date: 'Jan 07, 2026',
    readTime: '7 min',
    category: 'Infrastructure',
    featured: false,
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  Macro: <DatabaseIcon size={14} />,
  Infrastructure: <CpuIcon size={14} />,
  Technology: <CpuIcon size={14} />,
  Research: <BookOpenIcon size={14} />,
  Risk: <ShieldIcon size={14} />,
};

export default function Research() {
  const featuredRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.research-card',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 85%',
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  const featured = articles.find((a) => a.featured);
  const archive = articles.filter((a) => !a.featured);

  return (
    <div>
      {/* Featured Report Hero */}
      {featured && (
        <section ref={featuredRef} className="relative min-h-[70vh] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={featured.image}
              alt={featured.title}
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/80 to-transparent" />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 w-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2 py-1 bg-emerald/20 text-emerald text-xs font-mono rounded">
                Featured Report
              </span>
              <span className="text-xs font-mono text-slategray flex items-center gap-1">
                <ClockIcon size={14} /> {featured.date}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-light text-offwhite max-w-3xl mb-4 leading-tight">
              {featured.title}
            </h1>
            <p className="text-lg text-slategray max-w-2xl mb-8 leading-relaxed">
              {featured.abstract}
            </p>
            <Link
              to={`/research/${featured.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald text-obsidian text-sm font-medium hover:bg-emerald/90 transition-colors"
            >
              Read Full Report <ArrowRightIcon size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* Archive Grid */}
      <section ref={gridRef} className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-center gap-3 mb-12">
          <BookOpenIcon size={20} className="text-emerald" />
          <h2 className="text-2xl md:text-3xl font-display font-light text-offwhite">Research Archive</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {archive.map((article, idx) => (
            <Link
              key={idx}
              to={`/research/${article.id}`}
              className="research-card group bg-charcoal border border-subtleborder rounded-xl overflow-hidden hover:border-emerald/50 transition-colors block"
            >
              <div className="overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center gap-1 text-xs font-mono text-emerald">
                    {categoryIcons[article.category]} {article.category}
                  </span>
                  <span className="text-xs font-mono text-slategray">{article.readTime}</span>
                </div>
                <h3 className="text-lg font-display font-medium text-offwhite mb-2 group-hover:text-emerald transition-colors leading-snug">
                  {article.title}
                </h3>
                <p className="text-sm text-slategray leading-relaxed mb-4 line-clamp-2">
                  {article.abstract}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slategray">{article.date}</span>
                  <span className="text-emerald opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRightIcon size={16} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
