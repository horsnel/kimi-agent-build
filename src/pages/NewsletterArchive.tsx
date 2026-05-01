import { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SearchIcon, ArrowRightIcon, BookOpenIcon, ClockIcon } from '../components/CustomIcons';

gsap.registerPlugin(ScrollTrigger);

type Category = 'All' | 'Market Analysis' | 'Economic Data' | 'Fed Policy' | 'Earnings' | 'Crypto';

interface NewsletterIssue {
  title: string;
  date: string;
  category: Category;
  excerpt: string;
}

const categories: Category[] = ['All', 'Market Analysis', 'Economic Data', 'Fed Policy', 'Earnings', 'Crypto'];

const newsletters: NewsletterIssue[] = [
  {
    title: 'Market Recap: S&P 500 Hits New All-Time High',
    date: 'Jan 20, 2026',
    category: 'Market Analysis',
    excerpt: 'The S&P 500 closed at a record high driven by strong earnings from mega-cap tech and optimism around AI infrastructure spending. Volume surged as institutional buyers returned.',
  },
  {
    title: 'Fed Minutes Analysis: What They Really Said',
    date: 'Jan 17, 2026',
    category: 'Fed Policy',
    excerpt: 'Behind the cautious tone lies a committee increasingly divided on the path forward. Our analysis reveals the key phrases that signal the next policy move.',
  },
  {
    title: 'Earnings Season Week 3: Big Tech Delivers',
    date: 'Jan 14, 2026',
    category: 'Earnings',
    excerpt: 'Apple, Microsoft, and Google all beat expectations. Cloud revenue growth accelerated and AI monetization is finally showing up in bottom-line numbers.',
  },
  {
    title: 'Crypto Winter or Spring? On-Chain Data Speaks',
    date: 'Jan 11, 2026',
    category: 'Crypto',
    excerpt: 'Whale accumulation patterns, exchange outflows, and hash rate trends suggest the crypto market may be entering a new accumulation phase ahead of the next cycle.',
  },
  {
    title: 'Yield Curve Un-Inverts: What History Tells Us',
    date: 'Jan 8, 2026',
    category: 'Economic Data',
    excerpt: 'The 2y-10y spread has normalized for the first time in 24 months. Historical analysis of past un-inversions reveals a consistent pattern for equity markets.',
  },
  {
    title: 'The Magnificent Seven: Are They Still Worth It?',
    date: 'Jan 5, 2026',
    category: 'Market Analysis',
    excerpt: 'Concentration risk in the top 7 S&P 500 names has reached historic levels. We examine whether the premium is justified by fundamentals or driven by momentum alone.',
  },
  {
    title: 'Job Market Resilience: A Double-Edged Sword',
    date: 'Jan 2, 2026',
    category: 'Economic Data',
    excerpt: 'Non-farm payrolls beat expectations again, but the composition of job gains is shifting. Full-time employment is declining while part-time work surges — a potential recession signal.',
  },
  {
    title: 'Housing Market 2026: Bubble or Bottom?',
    date: 'Dec 29, 2025',
    category: 'Economic Data',
    excerpt: 'Mortgage rates have stabilized but affordability remains near record lows. We analyze supply-demand dynamics, regional divergence, and the impact of institutional buyers.',
  },
  {
    title: 'Small Caps Awakening: Russell 2000 Analysis',
    date: 'Dec 26, 2025',
    category: 'Market Analysis',
    excerpt: 'The Russell 2000 has broken out of its 18-month range. Improved credit conditions and rate sensitivity are creating tailwinds for small-cap equities.',
  },
  {
    title: 'Global Central Bank Policy Divergence',
    date: 'Dec 23, 2025',
    category: 'Fed Policy',
    excerpt: 'While the Fed holds steady, the ECB and BoJ are moving in opposite directions. This policy divergence creates both risks and opportunities across currency and bond markets.',
  },
  {
    title: 'AI Infrastructure Spending Boom',
    date: 'Dec 20, 2025',
    category: 'Market Analysis',
    excerpt: 'Capital expenditure on AI infrastructure is projected to exceed $300B in 2026. We break down the beneficiaries across semiconductors, cloud, and data center REITs.',
  },
  {
    title: 'Consumer Spending Trends: What Retail Data Shows',
    date: 'Dec 17, 2025',
    category: 'Economic Data',
    excerpt: 'Holiday spending data reveals a bifurcated consumer. Luxury retail thrives while discount chains struggle. Credit card delinquency rates warrant close monitoring.',
  },
  {
    title: 'Year-End Portfolio Rebalancing Guide',
    date: 'Dec 14, 2025',
    category: 'Market Analysis',
    excerpt: 'Tax-loss harvesting opportunities, sector rotation strategies, and positioning for the January effect. A comprehensive guide to closing out the year strategically.',
  },
];

const categoryColors: Record<string, string> = {
  'Market Analysis': 'bg-emerald/20 text-emerald',
  'Economic Data': 'bg-chartblue/20 text-chartblue',
  'Fed Policy': 'bg-amber-500/20 text-amber-400',
  'Earnings': 'bg-purple-500/20 text-purple-400',
  'Crypto': 'bg-orange-500/20 text-orange-400',
};

export default function NewsletterArchive() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.nl-section',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const filtered = useMemo(() => {
    return newsletters.filter((n) => {
      const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || n.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="nl-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite mb-2">
          Newsletter Archive
        </h1>
        <p className="text-slategray text-lg">Weekly market intelligence delivered to your inbox</p>
      </section>

      {/* Subscribe CTA */}
      <section className="nl-section max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="bg-emerald/10 border border-emerald/30 rounded-xl p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-start sm:items-center gap-3">
            <BookOpenIcon size={24} className="text-emerald flex-shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <h3 className="text-base sm:text-lg font-display font-medium text-offwhite">Get the Weekly Market Brief</h3>
              <p className="text-xs sm:text-sm text-slategray">Actionable insights every Friday morning</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:w-64 bg-deepblack border border-subtleborder rounded-lg px-4 py-2.5 text-sm text-offwhite placeholder:text-slategray focus:outline-none focus:border-emerald/50 transition-colors"
            />
            <button className="px-5 py-2.5 bg-emerald text-obsidian text-sm font-medium rounded-lg hover:bg-emerald/90 transition-colors flex items-center justify-center gap-2 flex-shrink-0">
              Subscribe <ArrowRightIcon size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Search + Filter */}
      <section className="nl-section max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col gap-3">
          <div className="relative w-full md:max-w-sm">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slategray" />
            <input
              type="text"
              placeholder="Search newsletters..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full bg-charcoal border border-subtleborder rounded-lg pl-10 pr-4 py-2.5 text-sm text-offwhite placeholder:text-slategray focus:outline-none focus:border-emerald/50 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-mono rounded-lg transition-colors whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-emerald text-obsidian'
                    : 'bg-charcoal border border-subtleborder text-slategray hover:text-offwhite hover:border-slategray'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter List */}
      <section className="nl-section max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-3 sm:space-y-4">
          {paginated.map((issue, idx) => (
            <article
              key={idx}
              className="bg-charcoal border border-subtleborder rounded-xl p-4 sm:p-6 hover:border-emerald/50 transition-colors group cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-mono rounded ${categoryColors[issue.category] || 'bg-emerald/20 text-emerald'}`}>
                      {issue.category}
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono text-slategray flex items-center gap-1">
                      <ClockIcon size={10} className="sm:w-3 sm:h-3" /> {issue.date}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-display font-medium text-offwhite mb-1.5 sm:mb-2 group-hover:text-emerald transition-colors leading-snug">
                    {issue.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slategray leading-relaxed line-clamp-3 sm:line-clamp-none">{issue.excerpt}</p>
                </div>
                <div className="hidden md:flex flex-shrink-0 text-emerald opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRightIcon size={20} />
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bg-charcoal border border-subtleborder rounded-xl p-12 text-center">
            <p className="text-slategray">No newsletters found matching your criteria.</p>
          </div>
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="nl-section max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-mono transition-colors ${
                  currentPage === page
                    ? 'bg-emerald text-obsidian'
                    : 'bg-charcoal border border-subtleborder text-slategray hover:text-offwhite hover:border-slategray'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
