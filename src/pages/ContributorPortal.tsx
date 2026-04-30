import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRightIcon, BookOpenIcon, ShieldIcon, CpuIcon } from '../components/CustomIcons';

gsap.registerPlugin(ScrollTrigger);

const guidelines = [
  {
    title: 'Content Guidelines',
    description: 'Submit original research with data-driven analysis. All claims must be supported by verifiable sources, charts, or quantitative evidence.',
    icon: <BookOpenIcon size={20} />,
  },
  {
    title: 'Formatting Standards',
    description: 'Use clear structure with headers, subheaders, and bullet points. Cite all sources with inline references. Include charts where applicable.',
    icon: <CpuIcon size={20} />,
  },
  {
    title: 'Quality Requirements',
    description: 'Minimum 500 words per submission. No plagiarism — all content must be original. Ensure factual accuracy and disclose any conflicts of interest.',
    icon: <ShieldIcon size={20} />,
  },
];

interface Contributor {
  name: string;
  articles: number;
  views: string;
  badge: 'Gold' | 'Silver' | 'Bronze';
}

const topContributors: Contributor[] = [
  { name: 'Sarah Chen', articles: 47, views: '124K', badge: 'Gold' },
  { name: 'Marcus Rivera', articles: 38, views: '98K', badge: 'Gold' },
  { name: 'Aisha Patel', articles: 31, views: '87K', badge: 'Silver' },
  { name: 'James Okonkwo', articles: 26, views: '72K', badge: 'Silver' },
  { name: 'Elena Volkov', articles: 22, views: '61K', badge: 'Silver' },
  { name: 'David Kim', articles: 19, views: '53K', badge: 'Bronze' },
  { name: 'Priya Sharma', articles: 15, views: '42K', badge: 'Bronze' },
];

interface Submission {
  title: string;
  author: string;
  date: string;
  status: 'Published' | 'Pending' | 'Rejected';
}

const recentSubmissions: Submission[] = [
  { title: 'Deconstructing the 2026 Semiconductor Cycle', author: 'Sarah Chen', date: 'Jan 19, 2026', status: 'Published' },
  { title: 'Municipal Bond Arbitrage in a Rate-Cut Cycle', author: 'Marcus Rivera', date: 'Jan 18, 2026', status: 'Pending' },
  { title: 'Comparative Analysis: REITs vs Direct Real Estate', author: 'Aisha Patel', date: 'Jan 17, 2026', status: 'Published' },
  { title: 'The Hidden Risk in Leveraged ETFs', author: 'James Okonkwo', date: 'Jan 16, 2026', status: 'Rejected' },
  { title: 'AI Chip Supply Chain: Bottlenecks and Opportunities', author: 'David Kim', date: 'Jan 15, 2026', status: 'Pending' },
];

const faqs = [
  { q: 'How long does the review process take?', a: 'Typically 3-5 business days. Our editorial team reviews each submission for accuracy, originality, and adherence to our content guidelines. You\'ll receive an email notification once a decision is made.' },
  { q: 'Can I edit my submission after it\'s published?', a: 'Yes, you can request edits through your contributor dashboard. Minor corrections (typos, data updates) are processed within 24 hours. Major revisions require re-review and may take up to 3 business days.' },
  { q: 'Do I retain ownership of my content?', a: 'Contributors retain copyright of their original work. By publishing on Sigma Capital, you grant us a non-exclusive license to display and distribute the content on our platform. You may republish elsewhere with attribution.' },
  { q: 'How are contributor badges awarded?', a: 'Badges are awarded based on cumulative contributions: Bronze (10+ articles), Silver (25+ articles), Gold (40+ articles). Badge upgrades also consider content quality scores and reader engagement metrics.' },
  { q: 'What topics are most in demand?', a: 'We currently have high demand for: macroeconomic analysis, sector rotation strategies, AI/tech infrastructure research, options strategy guides, and emerging market analysis. Check the contributor dashboard for the latest editorial calendar.' },
  { q: 'Is there compensation for contributions?', a: 'Premium contributors with Gold or Silver badges are eligible for our revenue-sharing program. Compensation is based on article views, engagement metrics, and content quality scores. Contact editorial@sigmacapital.com for details.' },
];

const badgeColors: Record<string, string> = {
  Gold: 'bg-amber-500/20 text-amber-400',
  Silver: 'bg-slate-300/20 text-slate-300',
  Bronze: 'bg-orange-700/20 text-orange-400',
};

const statusColors: Record<string, string> = {
  Published: 'bg-emerald/20 text-emerald',
  Pending: 'bg-amber-500/20 text-amber-400',
  Rejected: 'bg-crimson/20 text-crimson',
};

export default function ContributorPortal() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Market Analysis',
    tickers: '',
    content: '',
  });
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        'contrib-section',
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

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="contrib-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite mb-2">
          Contributor Portal
        </h1>
        <p className="text-slategray text-lg">Share your research with the Sigma community</p>
      </section>

      {/* Submit Research Form */}
      <section className="contrib-section max-w-7xl mx-auto px-6 py-8">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-8">
          <h2 className="text-xl font-display font-medium text-offwhite mb-6">Submit Research</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-slategray uppercase tracking-wider mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter your research title"
                className="w-full bg-deepblack border border-subtleborder rounded-lg px-4 py-2.5 text-sm text-offwhite placeholder:text-slategray focus:outline-none focus:border-emerald/50 transition-colors"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono text-slategray uppercase tracking-wider mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-deepblack border border-subtleborder rounded-lg px-4 py-2.5 text-sm text-offwhite focus:outline-none focus:border-emerald/50 transition-colors appearance-none"
                >
                  <option value="Market Analysis">Market Analysis</option>
                  <option value="Technical Analysis">Technical Analysis</option>
                  <option value="Economic Data">Economic Data</option>
                  <option value="Education">Education</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-slategray uppercase tracking-wider mb-2">Ticker Symbols</label>
                <input
                  type="text"
                  value={formData.tickers}
                  onChange={(e) => setFormData({ ...formData, tickers: e.target.value })}
                  placeholder="e.g. AAPL, MSFT, NVDA"
                  className="w-full bg-deepblack border border-subtleborder rounded-lg px-4 py-2.5 text-sm text-offwhite placeholder:text-slategray focus:outline-none focus:border-emerald/50 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono text-slategray uppercase tracking-wider mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your research content here... (minimum 500 words)"
                rows={8}
                className="w-full bg-deepblack border border-subtleborder rounded-lg px-4 py-2.5 text-sm text-offwhite placeholder:text-slategray focus:outline-none focus:border-emerald/50 transition-colors resize-y"
              />
            </div>
            <button className="px-6 py-3 bg-emerald text-obsidian text-sm font-medium rounded-lg hover:bg-emerald/90 transition-colors flex items-center gap-2">
              Submit Research <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Guideline Cards */}
      <section className="contrib-section max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-4">
          {guidelines.map((guide, idx) => (
            <div key={idx} className="bg-charcoal border border-subtleborder rounded-xl p-6">
              <div className="text-emerald mb-4">{guide.icon}</div>
              <h3 className="text-sm font-medium text-offwhite mb-2">{guide.title}</h3>
              <p className="text-xs text-slategray leading-relaxed">{guide.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Contributors + Recent Submissions */}
      <section className="contrib-section max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Contributors */}
          <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
            <h2 className="text-lg font-medium text-offwhite mb-6">Top Contributors</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {topContributors.map((contributor, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-subtleborder/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-emerald/10 text-emerald text-xs font-mono flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm text-offwhite">{contributor.name}</p>
                      <p className="text-xs text-slategray">{contributor.articles} articles · {contributor.views} views</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-mono rounded ${badgeColors[contributor.badge]}`}>
                    {contributor.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
            <h2 className="text-lg font-medium text-offwhite mb-6">Recent Submissions</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-subtleborder">
                    <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider pb-3">Title</th>
                    <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider pb-3 hidden md:table-cell">Author</th>
                    <th className="text-left text-xs font-mono text-slategray uppercase tracking-wider pb-3 hidden sm:table-cell">Date</th>
                    <th className="text-right text-xs font-mono text-slategray uppercase tracking-wider pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSubmissions.map((sub, idx) => (
                    <tr key={idx} className="border-b border-subtleborder/50 hover:bg-deepblack/50 transition-colors">
                      <td className="py-3 text-sm text-offwhite pr-3 max-w-[200px] truncate">{sub.title}</td>
                      <td className="py-3 text-sm text-slategray hidden md:table-cell">{sub.author}</td>
                      <td className="py-3 text-xs font-mono text-slategray hidden sm:table-cell">{sub.date}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 text-[10px] font-mono rounded ${statusColors[sub.status]}`}>
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="contrib-section max-w-7xl mx-auto px-6 py-8 pb-16">
        <h2 className="text-lg font-medium text-offwhite mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-charcoal border border-subtleborder rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full text-left p-5 flex items-center justify-between hover:bg-deepblack/50 transition-colors"
              >
                <span className="text-sm text-offwhite pr-4">{faq.q}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={`text-slategray transition-transform flex-shrink-0 ${expandedFaq === idx ? 'rotate-180' : ''}`}
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {expandedFaq === idx && (
                <div className="px-5 pb-5 pt-0">
                  <div className="border-t border-subtleborder pt-4">
                    <p className="text-sm text-slategray leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
