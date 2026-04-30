import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TrendUpIcon, TrendDownIcon, BellIcon, ArrowRightIcon, BookOpenIcon, ClockIcon } from '../components/CustomIcons';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { label: 'Portfolio Value', value: '$284,520', change: null },
  { label: 'Total Gain/Loss', value: '+$34,520', change: '+13.8%' },
  { label: 'Watchlist Count', value: '8', change: null },
  { label: 'Alert Count', value: '3', change: null },
];

const watchlist = [
  { ticker: 'AAPL', price: '$210.35', change: '+1.2%', note: 'Earnings next week', up: true },
  { ticker: 'MSFT', price: '$420.18', change: '-0.3%', note: 'Cloud growth play', up: false },
  { ticker: 'NVDA', price: '$620.45', change: '+3.5%', note: 'AI leader', up: true },
  { ticker: 'TSLA', price: '$238.90', change: '-1.8%', note: 'Watching dip', up: false },
  { ticker: 'GOOGL', price: '$175.20', change: '+0.8%', note: 'Ad revenue recovery', up: true },
  { ticker: 'AMZN', price: '$185.40', change: '+1.5%', note: 'AWS momentum', up: true },
  { ticker: 'META', price: '$520.30', change: '+2.1%', note: 'Reels growth', up: true },
  { ticker: 'JPM', price: '$198.75', change: '+0.4%', note: 'Rate beneficiary', up: true },
];

const recentAlerts = [
  { title: 'NVDA crossed above $620 resistance', time: '2 min ago', type: 'emerald' as const },
  { title: 'TSLA dropped below $240 support', time: '18 min ago', type: 'crimson' as const },
  { title: 'AAPL earnings report in 5 days', time: '1 hr ago', type: 'emerald' as const },
  { title: 'FOMC meeting minutes released', time: '3 hrs ago', type: 'emerald' as const },
];

const savedResearch = [
  { title: 'Q3 Macro Outlook: The Liquidity Crunch', date: 'Jan 18, 2026', category: 'Macro', readTime: '18 min' },
  { title: 'The Architecture of Trustless Settlement', date: 'Jan 16, 2026', category: 'Infrastructure', readTime: '10 min' },
  { title: 'Silicon Minds: AI Trading Systems', date: 'Jan 14, 2026', category: 'Technology', readTime: '14 min' },
];

export default function MemberDashboard() {
  const [emailAlerts, setEmailAlerts] = useState({
    priceAlerts: true,
    earningsAlerts: true,
    marketSummary: false,
    researchUpdates: true,
  });
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dash-section',
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
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const toggleAlert = (key: keyof typeof emailAlerts) => {
    setEmailAlerts((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="dash-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite mb-2">
          Dashboard
        </h1>
        <p className="text-slategray text-lg">Welcome back, Investor</p>
      </section>

      {/* Stats Row */}
      <section className="dash-section max-w-7xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-charcoal border border-subtleborder rounded-xl p-6">
              <p className="text-xs font-mono text-slategray uppercase tracking-wider mb-2">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-display font-light text-offwhite">{stat.value}</p>
              {stat.change && (
                <span className="text-sm font-mono text-emerald flex items-center gap-1 mt-1">
                  <TrendUpIcon size={14} />
                  {stat.change}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Watchlist + Alerts */}
      <section className="dash-section max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Watchlist Table */}
          <div className="lg:col-span-2 bg-charcoal border border-subtleborder rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-offwhite">Watchlist</h2>
              <Link to="/screener" className="text-xs font-mono text-emerald hover:text-emerald/80 transition-colors flex items-center gap-1">
                View All <ArrowRightIcon size={12} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-subtleborder">
                    <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider pb-3">Ticker</th>
                    <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider pb-3">Price</th>
                    <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider pb-3">Change</th>
                    <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider pb-3 pl-4">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlist.map((stock) => (
                    <tr key={stock.ticker} className="border-b border-subtleborder/50 hover:bg-deepblack/50 transition-colors">
                      <td className="py-3">
                        <Link to={`/stocks/${stock.ticker}`} className="text-sm font-mono font-medium text-offwhite hover:text-emerald transition-colors">
                          {stock.ticker}
                        </Link>
                      </td>
                      <td className="py-3 text-right text-sm font-mono text-offwhite">{stock.price}</td>
                      <td className="py-3 text-right">
                        <span className={`text-sm font-mono flex items-center justify-end gap-1 ${stock.up ? 'text-emerald' : 'text-crimson'}`}>
                          {stock.up ? <TrendUpIcon size={12} /> : <TrendDownIcon size={12} />}
                          {stock.change}
                        </span>
                      </td>
                      <td className="py-3 pl-4 text-sm text-slategray">{stock.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <BellIcon size={18} className="text-emerald" />
              <h2 className="text-lg font-medium text-offwhite">Recent Alerts</h2>
            </div>
            <div className="space-y-4">
              {recentAlerts.map((alert, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${alert.type === 'emerald' ? 'bg-emerald' : 'bg-crimson'}`} />
                  <div>
                    <p className="text-sm text-offwhite leading-snug">{alert.title}</p>
                    <p className="text-xs font-mono text-slategray mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Saved Research */}
      <section className="dash-section max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-6">
          <BookOpenIcon size={18} className="text-emerald" />
          <h2 className="text-lg font-medium text-offwhite">Saved Research</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {savedResearch.map((item, idx) => (
            <div key={idx} className="bg-charcoal border border-subtleborder rounded-xl p-6 hover:border-emerald/50 transition-colors group">
              <span className="px-2 py-0.5 bg-emerald/20 text-emerald text-xs font-mono rounded mb-3 inline-block">
                {item.category}
              </span>
              <h3 className="text-sm font-medium text-offwhite mb-2 group-hover:text-emerald transition-colors leading-snug">
                {item.title}
              </h3>
              <div className="flex items-center gap-3 text-xs font-mono text-slategray">
                <ClockIcon size={12} />
                <span>{item.readTime}</span>
                <span>{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Email Alert Settings */}
      <section className="dash-section max-w-7xl mx-auto px-6 py-8">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
          <h2 className="text-lg font-medium text-offwhite mb-6">Email Alert Settings</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {(Object.entries(emailAlerts) as [keyof typeof emailAlerts, boolean][]).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between py-3 border-b border-subtleborder/50 last:border-0">
                <div>
                  <p className="text-sm text-offwhite capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-xs text-slategray mt-0.5">
                    {key === 'priceAlerts' && 'Get notified when watchlist stocks hit price targets'}
                    {key === 'earningsAlerts' && 'Receive alerts before earnings reports'}
                    {key === 'marketSummary' && 'Daily market summary delivered to your inbox'}
                    {key === 'researchUpdates' && 'New research reports and analysis'}
                  </p>
                </div>
                <button
                  onClick={() => toggleAlert(key)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    enabled ? 'bg-emerald' : 'bg-subtleborder'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-offwhite rounded-full transition-transform ${
                      enabled ? 'translate-x-5.5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upgrade Banner */}
      <section className="dash-section max-w-7xl mx-auto px-6 py-8 pb-16">
        <div className="bg-emerald/10 border border-emerald/30 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-display font-medium text-offwhite mb-2">Upgrade to Premium</h3>
            <p className="text-sm text-slategray max-w-lg">
              Unlock advanced analytics, real-time alerts, exclusive research, and institutional-grade tools. Join thousands of serious investors.
            </p>
          </div>
          <Link
            to="#"
            className="flex-shrink-0 px-6 py-3 bg-emerald text-obsidian text-sm font-medium hover:bg-emerald/90 transition-colors rounded-lg flex items-center gap-2"
          >
            Upgrade Now <ArrowRightIcon size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
