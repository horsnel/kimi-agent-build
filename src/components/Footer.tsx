import { Link } from 'react-router';
import { SigmaIcon, GlobeIcon, BookOpenIcon, CalculatorIcon, ShieldIcon } from './CustomIcons';

const footerLinks = {
  Markets: ['Overview', 'Heatmap', 'Screener', 'Economic Calendar'],
  Research: ['Reports', 'Archive', 'Analysis', 'Podcasts'],
  Tools: ['Calculator', 'Backtester', 'Screener', 'API'],
  Company: ['About', 'Careers', 'Contact', 'Terms'],
};

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

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-mono font-medium text-slategray uppercase tracking-wider mb-4">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-slategray hover:text-offwhite transition-colors">
                      {link}
                    </a>
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
