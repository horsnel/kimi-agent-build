import { Link } from 'react-router';
import { SigmaIcon, GlobeIcon, BookOpenIcon, CalculatorIcon, ShieldIcon } from './CustomIcons';

interface FooterLink {
  label: string;
  path: string;
  pro?: boolean;
}

const footerSections: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Markets',
    links: [
      { label: 'Overview', path: '/markets' },
      { label: 'Stock Screener', path: '/screener' },
      { label: 'Economic Calendar', path: '/calendar' },
      { label: 'Stock Analysis', path: '/stocks/AAPL' },
    ],
  },
  {
    title: 'Tools',
    links: [
      { label: 'Compound Interest', path: '/tools' },
      { label: 'Retirement Score', path: '/tools/retirement' },
      { label: 'Mortgage Calculator', path: '/tools/mortgage' },
      { label: 'Backtester', path: '/tools/backtester' },
    ],
  },
  {
    title: 'Research',
    links: [
      { label: 'Research Hub', path: '/research' },
      { label: 'News', path: '/news' },
      { label: 'Education', path: '/education' },
      { label: 'Glossary', path: '/glossary' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Newsletter', path: '/newsletter' },
      { label: 'Podcast', path: '/podcast' },
      { label: 'Contribute', path: '/contribute' },
    ],
  },
  {
    title: 'Premium',
    links: [
      { label: 'Sector Rotation', path: '/premium/sector-rotation', pro: true },
      { label: 'Insider Trading', path: '/premium/insider-trading', pro: true },
      { label: 'Earnings Preview', path: '/premium/earnings-preview', pro: true },
      { label: 'DCF Valuation', path: '/premium/valuation', pro: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-deepblack border-t border-subtleborder">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 text-offwhite mb-4">
              <SigmaIcon size={24} />
              <span className="font-display font-medium text-lg">Sigma Capital</span>
            </Link>
            <p className="text-sm text-slategray max-w-xs leading-relaxed">
              Proprietary algorithms scanning global markets in real-time. Institutional-grade intelligence for every investor.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-mono font-medium text-slategray uppercase tracking-wider mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.path + link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-slategray hover:text-offwhite transition-colors flex items-center gap-1"
                    >
                      {link.label}
                      {link.pro && (
                        <span className="ml-0.5 px-1 py-0.5 text-[8px] font-mono bg-emerald/20 text-emerald rounded">
                          PRO
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-subtleborder pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <span className="text-xs font-mono text-slategray">
              © 2026 Sigma Capital
            </span>
            <span className="text-xs font-mono text-slategray">
              Data delayed by 15 min
            </span>
          </div>
          <div className="flex items-center gap-4">
            <GlobeIcon size={16} className="text-slategray" />
            <BookOpenIcon size={16} className="text-slategray" />
            <CalculatorIcon size={16} className="text-slategray" />
            <ShieldIcon size={16} className="text-slategray" />
          </div>
        </div>
      </div>
    </footer>
  );
}
