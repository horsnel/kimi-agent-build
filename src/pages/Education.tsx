import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ClockIcon, ArrowRightIcon } from '../components/CustomIcons';

gsap.registerPlugin(ScrollTrigger);

type Category = 'All' | 'Investing Basics' | 'Options' | 'Technical Analysis' | 'Taxes' | 'Retirement';
type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

interface Article {
  id: number;
  title: string;
  description: string;
  category: Exclude<Category, 'All'>;
  difficulty: Difficulty;
  readTime: number;
}

const articles: Article[] = [
  {
    id: 1,
    title: 'How to Start Investing 2026',
    description: 'A complete guide for beginners looking to enter the stock market. Learn the fundamentals of opening a brokerage account, choosing your first investments, and building a diversified portfolio from scratch.',
    category: 'Investing Basics',
    difficulty: 'Beginner',
    readTime: 8,
  },
  {
    id: 2,
    title: 'Fed Interest Rates Explained',
    description: 'Understanding how the Federal Reserve sets interest rates and why it matters for your investments. From FOMC meetings to rate hike cycles, learn the mechanics behind monetary policy.',
    category: 'Investing Basics',
    difficulty: 'Beginner',
    readTime: 6,
  },
  {
    id: 3,
    title: 'Stock Market Sectors Guide',
    description: 'Explore the 11 GICS sectors and how they perform across economic cycles. Learn which sectors thrive during expansions, recessions, and periods of rising interest rates.',
    category: 'Investing Basics',
    difficulty: 'Beginner',
    readTime: 7,
  },
  {
    id: 4,
    title: 'How to Read a 10-K',
    description: 'Master the art of reading annual reports. Learn how to navigate financial statements, footnotes, and management discussion to uncover what really drives a company performance.',
    category: 'Investing Basics',
    difficulty: 'Intermediate',
    readTime: 10,
  },
  {
    id: 5,
    title: 'Treasury Yield Curve',
    description: 'What the yield curve tells us about the economy and why inversions predict recessions. Deep dive into the mechanics of government bonds and their signaling power.',
    category: 'Investing Basics',
    difficulty: 'Intermediate',
    readTime: 8,
  },
  {
    id: 6,
    title: 'Options Trading for Beginners',
    description: 'Learn calls, puts, and basic strategies like covered calls and protective puts. Understand option pricing, Greeks, and how to manage risk in your first options trades.',
    category: 'Options',
    difficulty: 'Beginner',
    readTime: 9,
  },
  {
    id: 7,
    title: '401k vs IRA vs Roth',
    description: 'Compare retirement account types, contribution limits, and tax advantages. Learn which accounts to prioritize and how to maximize employer matching and tax-free growth.',
    category: 'Retirement',
    difficulty: 'Beginner',
    readTime: 6,
  },
  {
    id: 8,
    title: 'How to Value a Stock',
    description: 'From DCF analysis to relative valuation multiples. Learn the key methods professional analysts use to determine whether a stock is overvalued, undervalued, or fairly priced.',
    category: 'Investing Basics',
    difficulty: 'Intermediate',
    readTime: 12,
  },
  {
    id: 9,
    title: 'Technical Analysis 101',
    description: 'Chart patterns, support and resistance, moving averages, and RSI explained. Build a foundation in reading price charts and identifying potential entry and exit points.',
    category: 'Technical Analysis',
    difficulty: 'Beginner',
    readTime: 7,
  },
  {
    id: 10,
    title: 'Tax-Loss Harvesting Guide',
    description: 'How to strategically realize losses to offset gains and reduce your tax bill. Learn the wash sale rules, optimal timing, and how this strategy boosts after-tax returns.',
    category: 'Taxes',
    difficulty: 'Intermediate',
    readTime: 6,
  },
  {
    id: 11,
    title: 'Dividend Investing Strategy',
    description: 'Build a portfolio of quality dividend stocks for steady income. Learn about dividend yield, payout ratios, dividend growth, and the power of compounding through DRIPs.',
    category: 'Investing Basics',
    difficulty: 'Beginner',
    readTime: 5,
  },
  {
    id: 12,
    title: 'Understanding Market Cap',
    description: 'Mega, large, mid, small, and micro cap stocks explained. Learn how market capitalization affects risk, growth potential, and portfolio allocation strategies.',
    category: 'Investing Basics',
    difficulty: 'Beginner',
    readTime: 4,
  },
  {
    id: 13,
    title: 'Retirement Planning Roadmap',
    description: 'Step-by-step guide to planning your retirement from your 20s through your 60s. Calculate your number, optimize Social Security, and create a sustainable withdrawal strategy.',
    category: 'Retirement',
    difficulty: 'Intermediate',
    readTime: 9,
  },
  {
    id: 14,
    title: 'Risk Management Essentials',
    description: 'Position sizing, stop losses, portfolio diversification, and downside protection. Learn the critical frameworks that separate successful investors from those who blow up.',
    category: 'Investing Basics',
    difficulty: 'Advanced',
    readTime: 8,
  },
];

const categories: Category[] = ['All', 'Investing Basics', 'Options', 'Technical Analysis', 'Taxes', 'Retirement'];

function CategoryBadge({ category }: { category: string }) {
  const styles: Record<string, string> = {
    'Investing Basics': 'bg-emerald/20 text-emerald border-emerald/30',
    'Options': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Technical Analysis': 'bg-chartblue/20 text-chartblue border-chartblue/30',
    'Taxes': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Retirement': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-mono rounded border ${styles[category] || 'bg-slategray/20 text-slategray border-slategray/30'}`}>
      {category}
    </span>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const styles: Record<Difficulty, string> = {
    Beginner: 'text-emerald',
    Intermediate: 'text-amber-400',
    Advanced: 'text-crimson',
  };
  return (
    <span className={`text-xs font-mono ${styles[difficulty]}`}>
      {difficulty}
    </span>
  );
}

export default function Education() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [comingSoonAlert, setComingSoonAlert] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.education-section',
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
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return articles;
    return articles.filter((a) => a.category === activeCategory);
  }, [activeCategory]);

  const beginnerCount = articles.filter((a) => a.difficulty === 'Beginner').length;
  const avgReadTime = Math.round(articles.reduce((sum, a) => sum + a.readTime, 0) / articles.length);

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="education-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite mb-2">
          Education Center
        </h1>
        <p className="text-slategray max-w-xl">
          Master investing with comprehensive guides and tutorials
        </p>
      </section>

      {/* Stats Row */}
      <section className="education-section max-w-7xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-charcoal border border-subtleborder rounded-xl p-5">
            <p className="text-xs font-mono text-slategray mb-1">Total Articles</p>
            <p className="text-2xl font-display font-light text-offwhite">{articles.length}</p>
          </div>
          <div className="bg-charcoal border border-subtleborder rounded-xl p-5">
            <p className="text-xs font-mono text-slategray mb-1">Beginner Friendly</p>
            <p className="text-2xl font-display font-light text-emerald">{beginnerCount}</p>
          </div>
          <div className="bg-charcoal border border-subtleborder rounded-xl p-5">
            <p className="text-xs font-mono text-slategray mb-1">Avg Read Time</p>
            <p className="text-2xl font-display font-light text-offwhite">{avgReadTime} <span className="text-sm text-slategray">min</span></p>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="education-section max-w-7xl mx-auto px-6 pb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-mono rounded-lg border transition-colors ${
                activeCategory === cat
                  ? 'bg-emerald text-obsidian border-emerald'
                  : 'bg-charcoal border-subtleborder text-slategray hover:text-offwhite hover:border-slategray'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Articles Grid */}
      <section className="education-section max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article) => {
            const categoryRoutes: Record<string, string> = {
              'Options': '/tools/options',
              'Taxes': '/tools/tax-loss',
              'Retirement': '/tools/retirement',
            };
            const route = categoryRoutes[article.category];

            if (route) {
              return (
                <Link
                  key={article.id}
                  to={route}
                  className="group bg-charcoal border border-subtleborder rounded-xl p-6 hover:border-emerald/50 transition-colors cursor-pointer block"
                >
                  <div className="flex items-center justify-between mb-3">
                    <CategoryBadge category={article.category} />
                    <DifficultyBadge difficulty={article.difficulty} />
                  </div>
                  <h3 className="text-lg font-display font-medium text-offwhite mb-2 group-hover:text-emerald transition-colors leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-sm text-slategray leading-relaxed mb-4 line-clamp-3">
                    {article.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slategray flex items-center gap-1">
                      <ClockIcon size={12} /> {article.readTime} min read
                    </span>
                    <span className="text-emerald opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRightIcon size={16} />
                    </span>
                  </div>
                </Link>
              );
            }

            return (
              <article
                key={article.id}
                onClick={() => {
                  setComingSoonAlert(article.title);
                  setTimeout(() => setComingSoonAlert(null), 3000);
                }}
                className="group bg-charcoal border border-subtleborder rounded-xl p-6 hover:border-emerald/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <CategoryBadge category={article.category} />
                  <DifficultyBadge difficulty={article.difficulty} />
                </div>
                <h3 className="text-lg font-display font-medium text-offwhite mb-2 group-hover:text-emerald transition-colors leading-snug">
                  {article.title}
                </h3>
                <p className="text-sm text-slategray leading-relaxed mb-4 line-clamp-3">
                  {article.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slategray flex items-center gap-1">
                    <ClockIcon size={12} /> {article.readTime} min read
                  </span>
                  <span className="text-emerald opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRightIcon size={16} />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Coming soon toast */}
      {comingSoonAlert && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-charcoal border border-emerald/30 rounded-lg px-6 py-3 text-sm text-offwhite shadow-lg">
          Article detail coming soon: {comingSoonAlert}
        </div>
      )}
    </div>
  );
}
