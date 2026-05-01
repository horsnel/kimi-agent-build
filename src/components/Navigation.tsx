import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { SigmaIcon, MenuIcon, XIcon, ChevronDownIcon } from './CustomIcons';
import { useAuth } from '../hooks/useAuth';

interface NavLink {
  label: string;
  path: string;
  pro?: boolean;
}

interface NavGroup {
  label: string;
  path?: string;
  children: NavLink[];
}

const navGroups: NavGroup[] = [
  { label: 'Home', path: '/', children: [] },
  {
    label: 'Markets',
    children: [
      { label: 'Overview', path: '/markets' },
      { label: 'Stock Screener', path: '/screener' },
      { label: 'Economic Calendar', path: '/calendar' },
      { label: 'Stock Analysis', path: '/stocks/AAPL' },
    ],
  },
  {
    label: 'Tools',
    children: [
      { label: 'All Tools', path: '/tools' },
      { label: 'Compound Interest', path: '/tools/compound' },
      { label: 'Retirement Score', path: '/tools/retirement' },
      { label: 'Mortgage Calculator', path: '/tools/mortgage' },
      { label: 'Portfolio Backtester', path: '/tools/backtester' },
      { label: 'Tax Loss Harvesting', path: '/tools/tax-loss' },
      { label: 'Options Calculator', path: '/tools/options' },
    ],
  },
  {
    label: 'Research',
    children: [
      { label: 'Research Hub', path: '/research' },
      { label: 'News', path: '/news' },
      { label: 'Education', path: '/education' },
      { label: 'Glossary', path: '/glossary' },
    ],
  },
  {
    label: 'Community',
    children: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Newsletter', path: '/newsletter' },
      { label: 'Podcast', path: '/podcast' },
      { label: 'Contribute', path: '/contribute' },
    ],
  },
  {
    label: 'Analysis',
    children: [
      { label: 'Sector Rotation', path: '/premium/sector-rotation' },
      { label: 'Insider Trading', path: '/premium/insider-trading' },
      { label: 'Earnings Preview', path: '/premium/earnings-preview' },
      { label: 'DCF Valuation', path: '/premium/valuation' },
      { label: 'Fed Decoder', path: '/premium/fed-decoder' },
      { label: 'Crypto On-Chain', path: '/premium/crypto-onchain' },
      { label: 'Hedge Fund Tracker', path: '/premium/hedge-fund' },
      { label: 'IPO Pipeline', path: '/premium/ipo-pipeline' },
      { label: 'AI Investment Advisor', path: '/premium/ai-advisor', pro: true },
      { label: 'Real-Time Alerts', path: '/premium/real-time-alerts', pro: true },
      { label: 'Portfolio Optimizer', path: '/premium/portfolio-optimizer', pro: true },
    ],
  },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { getUser, signOut } = useAuth();
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const user = getUser();
    setLoggedIn(!!user);
    if (user) setUserName(user.firstName);
  }, [location.pathname, getUser]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile nav is open (sidebar still scrolls internally)
  useEffect(() => {
    if (mobileOpen) {
      // Save scroll position, lock body overflow (not position:fixed which breaks scroll pos)
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isActiveGroup = (group: NavGroup) => {
    if (group.path && location.pathname === group.path) return true;
    return group.children.some((child) => {
      if (child.path === '/tools' && location.pathname === '/tools') return true;
      return child.path !== '/tools' && location.pathname.startsWith(child.path);
    });
  };

  const isAnalysisActive = () => {
    return location.pathname.startsWith('/premium');
  };

  const handleSignOut = () => {
    signOut();
    setLoggedIn(false);
    setUserMenuOpen(false);
    navigate('/');
  };

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

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navGroups.map((group) => {
            if (group.children.length === 0) {
              return (
                <Link
                  key={group.label}
                  to={group.path!}
                  className={`px-3 py-2 text-sm font-medium tracking-wide transition-colors rounded-lg ${
                    location.pathname === group.path
                      ? 'text-emerald'
                      : 'text-slategray hover:text-offwhite'
                  }`}
                >
                  {group.label}
                </Link>
              );
            }

            const active = group.label === 'Analysis' ? isAnalysisActive() : isActiveGroup(group);

            return (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(group.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  className={`px-3 py-2 text-sm font-medium tracking-wide transition-colors rounded-lg flex items-center gap-1 ${
                    active ? 'text-emerald' : 'text-slategray hover:text-offwhite'
                  }`}
                >
                  {group.label}
                  <ChevronDownIcon
                    size={14}
                    className={`transition-transform ${openDropdown === group.label ? 'rotate-180' : ''}`}
                  />
                </button>

                {openDropdown === group.label && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-charcoal border border-subtleborder rounded-xl py-2 shadow-xl">
                    {group.children.map((child) => (
                      <Link
                        key={child.path + child.label}
                        to={child.path}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          location.pathname === child.path
                            ? 'text-emerald bg-emerald/5'
                            : 'text-slategray hover:text-offwhite hover:bg-deepblack/50'
                        }`}
                      >
                        <span className="flex items-center justify-between">
                          {child.label}
                          {child.pro && (
                            <span className="ml-1 px-1 py-0.5 text-[9px] font-mono bg-amber-500/20 text-amber-400 rounded">
                              SOON
                            </span>
                          )}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop Auth Area */}
        <div className="hidden lg:flex items-center gap-3">
          {loggedIn ? (
            <div className="relative" onMouseEnter={() => setUserMenuOpen(true)} onMouseLeave={() => setUserMenuOpen(false)}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-offwhite border border-subtleborder rounded-lg hover:bg-charcoal transition-colors"
              >
                <div className="w-6 h-6 bg-emerald/20 border border-emerald/30 rounded-full flex items-center justify-center">
                  <span className="text-xs font-mono text-emerald">{userName.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-offwhite">{userName}</span>
                <ChevronDownIcon size={12} className="text-slategray" />
              </button>
              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-charcoal border border-subtleborder rounded-xl py-2 shadow-xl">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-slategray hover:text-offwhite hover:bg-deepblack/50 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-slategray hover:text-offwhite hover:bg-deepblack/50 transition-colors"
                  >
                    Settings
                  </Link>
                  <div className="border-t border-subtleborder my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-crimson hover:bg-deepblack/50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/signin" className="px-4 py-1.5 text-sm font-medium text-offwhite border border-subtleborder rounded hover:bg-charcoal transition-colors">
                Sign In
              </Link>
              <Link to="/signup" className="px-4 py-1.5 text-sm font-medium text-obsidian bg-emerald rounded hover:bg-emerald/90 transition-colors">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Auth Buttons - visible alongside hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          {!loggedIn ? (
            <>
              <Link to="/signin" className="px-3 py-1.5 text-xs font-medium text-offwhite border border-subtleborder rounded hover:bg-charcoal transition-colors">
                Sign In
              </Link>
              <Link to="/signup" className="px-3 py-1.5 text-xs font-medium text-obsidian bg-emerald rounded hover:bg-emerald/90 transition-colors">
                Get Started
              </Link>
            </>
          ) : (
            <Link to="/dashboard" className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-offwhite border border-subtleborder rounded hover:bg-charcoal transition-colors">
              <div className="w-5 h-5 bg-emerald/20 border border-emerald/30 rounded-full flex items-center justify-center">
                <span className="text-[9px] font-mono text-emerald">{userName.charAt(0).toUpperCase()}</span>
              </div>
              <span className="hidden sm:inline">{userName}</span>
            </Link>
          )}
          <button
            className="text-offwhite"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden bg-obsidian/95 backdrop-blur-md border-t border-subtleborder fixed inset-0 top-16 z-40 overflow-y-auto">
          <div className="px-6 py-4 flex flex-col gap-1">
            {navGroups.map((group) => {
              if (group.children.length === 0) {
                return (
                  <Link
                    key={group.label}
                    to={group.path!}
                    className={`py-2 text-sm font-medium ${
                      location.pathname === group.path ? 'text-emerald' : 'text-slategray'
                    }`}
                  >
                    {group.label}
                  </Link>
                );
              }

              const active = group.label === 'Analysis' ? isAnalysisActive() : isActiveGroup(group);
              const isOpen = mobileAccordion === group.label;

              return (
                <div key={group.label}>
                  <button
                    onClick={() => setMobileAccordion(isOpen ? null : group.label)}
                    className={`w-full py-2 text-sm font-medium flex items-center justify-between ${
                      active ? 'text-emerald' : 'text-slategray'
                    }`}
                  >
                    {group.label}
                    <ChevronDownIcon
                      size={14}
                      className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="pl-4 py-1 space-y-1">
                      {group.children.map((child) => (
                        <Link
                          key={child.path + child.label}
                          to={child.path}
                          className={`block py-1.5 text-sm ${
                            location.pathname === child.path ? 'text-emerald' : 'text-slategray'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {child.label}
                            {child.pro && (
                              <span className="px-1 py-0.5 text-[9px] font-mono bg-amber-500/20 text-amber-400 rounded">
                                SOON
                              </span>
                            )}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="flex gap-3 pt-4 mt-2 border-t border-subtleborder">
              {loggedIn ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex-1 px-4 py-2 text-sm text-offwhite border border-subtleborder rounded text-center">
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="flex-1 px-4 py-2 text-sm text-crimson border border-subtleborder rounded">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signin" onClick={() => setMobileOpen(false)} className="flex-1 px-4 py-2 text-sm text-offwhite border border-subtleborder rounded text-center">
                    Sign In
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="flex-1 px-4 py-2 text-sm text-obsidian bg-emerald rounded text-center">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
