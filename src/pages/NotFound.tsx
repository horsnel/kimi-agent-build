import { Link } from 'react-router';
import {
  CandlestickIcon,
  CalculatorIcon,
  BookOpenIcon,
  GlobeIcon,
  ArrowRightIcon,
} from '../components/CustomIcons';

const popularPages = [
  {
    title: 'Markets',
    description: 'Real-time data, charts, and live order flow across global exchanges.',
    to: '/markets',
    Icon: CandlestickIcon,
  },
  {
    title: 'Tools',
    description: 'Calculators, screeners, and analytics for smarter decisions.',
    to: '/tools',
    Icon: CalculatorIcon,
  },
  {
    title: 'Education',
    description: 'Deep-dive guides, glossaries, and curated learning paths.',
    to: '/education',
    Icon: BookOpenIcon,
  },
  {
    title: 'News',
    description: 'Breaking market coverage and macro-economic analysis.',
    to: '/news',
    Icon: GlobeIcon,
  },
];

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-20">
      {/* 404 hero */}
      <h1 className="text-8xl font-display font-light text-emerald select-none">
        404
      </h1>
      <h2 className="text-2xl text-offwhite mt-4 mb-2">Page not found</h2>
      <p className="text-slategray max-w-md leading-relaxed">
        The page you're looking for doesn't exist or has been moved.
      </p>

      {/* Back to Home */}
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 bg-emerald text-obsidian px-6 py-3 rounded text-sm font-medium hover:bg-emerald/90 transition-colors"
      >
        Back to Home
        <ArrowRightIcon size={16} />
      </Link>

      {/* Popular Pages */}
      <div className="mt-16 w-full max-w-3xl">
        <p className="text-xs font-mono uppercase tracking-widest text-slategray mb-6">
          Popular Pages
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularPages.map(({ title, description, to, Icon }) => (
            <Link
              key={to}
              to={to}
              className="group bg-charcoal border border-subtleborder rounded-xl p-4 text-left hover:border-emerald/40 transition-colors"
            >
              <Icon size={20} className="text-slategray group-hover:text-emerald transition-colors mb-3" />
              <h3 className="text-offwhite text-sm font-medium mb-1">{title}</h3>
              <p className="text-slategray text-xs leading-relaxed">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
