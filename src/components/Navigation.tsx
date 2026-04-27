import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { SigmaIcon, MenuIcon, XIcon } from './CustomIcons';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/markets', label: 'Markets' },
  { path: '/research', label: 'Research' },
  { path: '/tools', label: 'Tools' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-obsidian/80 backdrop-blur-md border-b border-subtleborder'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-offwhite hover:text-emerald transition-colors">
          <SigmaIcon size={24} />
          <span className="font-display font-medium text-lg tracking-tight">Sigma</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium tracking-wide transition-colors ${
                location.pathname === link.path
                  ? 'text-emerald'
                  : 'text-slategray hover:text-offwhite'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button className="px-4 py-1.5 text-sm font-medium text-offwhite border border-subtleborder rounded hover:bg-charcoal transition-colors">
            Sign In
          </button>
          <button className="px-4 py-1.5 text-sm font-medium text-obsidian bg-emerald rounded hover:bg-emerald/90 transition-colors">
            Get Started
          </button>
        </div>

        <button
          className="md:hidden text-offwhite"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-obsidian/95 backdrop-blur-md border-t border-subtleborder">
          <div className="px-6 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium ${
                  location.pathname === link.path ? 'text-emerald' : 'text-slategray'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-2">
              <button className="flex-1 px-4 py-2 text-sm text-offwhite border border-subtleborder rounded">
                Sign In
              </button>
              <button className="flex-1 px-4 py-2 text-sm text-obsidian bg-emerald rounded">
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
