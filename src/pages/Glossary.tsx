import { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SearchIcon } from '../components/CustomIcons';

gsap.registerPlugin(ScrollTrigger);

interface GlossaryTerm {
  term: string;
  definition: string;
  popular?: boolean;
}

const glossaryTerms: GlossaryTerm[] = [
  { term: '10-K', definition: 'An annual report required by the SEC that provides a comprehensive overview of a company\'s business and financial condition. It includes audited financial statements and is more detailed than the annual report sent to shareholders.', popular: true },
  { term: 'Alpha', definition: 'A measure of an investment\'s performance relative to a benchmark index. Positive alpha indicates the investment has outperformed the market after adjusting for risk, while negative alpha suggests underperformance.', popular: true },
  { term: 'Beta', definition: 'A measure of a stock\'s volatility in relation to the overall market. A beta of 1 indicates the stock moves with the market, while a beta greater than 1 indicates higher volatility and less than 1 indicates lower volatility.', popular: true },
  { term: 'Blue Chip', definition: 'Stocks of large, well-established, and financially sound companies with a history of reliable performance. Named after the highest-value chips in poker, these companies typically have market caps in the billions.' },
  { term: 'Bull/Bear Market', definition: 'A bull market refers to an extended period of rising asset prices, typically 20% or more from recent lows. A bear market is the opposite — a prolonged decline of 20% or more from recent highs, often accompanied by pessimism.', popular: true },
  { term: 'CAGR', definition: 'Compound Annual Growth Rate represents the mean annual growth rate of an investment over a specified period longer than one year. It smooths out volatility and provides a consistent rate of return that represents the investment\'s trajectory.' },
  { term: 'Compound Interest', definition: 'Interest calculated on both the initial principal and the accumulated interest from previous periods. Often called "interest on interest," it is the most powerful force in long-term wealth accumulation and the foundation of retirement planning.' },
  { term: 'DCF', definition: 'Discounted Cash Flow is a valuation method that estimates the value of an investment based on its expected future cash flows, adjusted for the time value of money. It helps determine whether an investment is overvalued or undervalued.' },
  { term: 'Dividend Yield', definition: 'A financial ratio that shows how much a company pays out in dividends each year relative to its stock price. Calculated as annual dividend per share divided by price per share, it represents the income return on investment.', popular: true },
  { term: 'EBITDA', definition: 'Earnings Before Interest, Taxes, Depreciation, and Amortization. A widely used measure of a company\'s operating profitability that strips out non-cash charges and financing costs to focus on core business performance.' },
  { term: 'EPS', definition: 'Earnings Per Share is calculated by dividing a company\'s net income by its outstanding shares. It serves as an indicator of a company\'s profitability and is a key metric in determining stock valuation through the P/E ratio.' },
  { term: 'ETF', definition: 'Exchange-Traded Fund is an investment fund that holds a collection of assets like stocks, bonds, or commodities and trades on a stock exchange like a single stock. ETFs typically offer lower fees and greater tax efficiency than mutual funds.', popular: true },
  { term: 'Fibonacci', definition: 'A technical analysis tool based on the Fibonacci sequence (0, 1, 1, 2, 3, 5, 8...). Traders use Fibonacci retracement levels (23.6%, 38.2%, 50%, 61.8%) to identify potential support and resistance levels in price movements.' },
  { term: 'GDP', definition: 'Gross Domestic Product is the total monetary value of all finished goods and services produced within a country\'s borders in a specific time period. It is the primary indicator used to gauge the health and size of a country\'s economy.' },
  { term: 'Hedge Fund', definition: 'An actively managed investment pool whose managers use a wide range of strategies, often including buying with borrowed money and trading esoteric assets, in an effort to beat average investment returns. Typically limited to accredited investors.' },
  { term: 'IPO', definition: 'Initial Public Offering is the process by which a privately held company offers shares to the public for the first time. It allows the company to raise capital from public investors and provides liquidity for early investors and employees.' },
  { term: 'Leverage', definition: 'The use of borrowed money to increase the potential return of an investment. While leverage can amplify gains, it equally amplifies losses, making it a double-edged sword that requires careful risk management.' },
  { term: 'Market Cap', definition: 'Market Capitalization is the total value of a company\'s outstanding shares, calculated by multiplying the current share price by the total number of shares. Companies are typically categorized as large-cap, mid-cap, or small-cap.', popular: true },
  { term: 'Moving Average', definition: 'A technical indicator that smooths out price data by creating a constantly updated average price over a specific time period. Common periods include 50-day and 200-day moving averages, which help identify trend direction and support/resistance.' },
  { term: 'NAV', definition: 'Net Asset Value represents the per-share value of a fund\'s assets minus its liabilities. Calculated at the end of each trading day for mutual funds, it represents the price at which investors buy or sell fund shares.' },
  { term: 'Option', definition: 'A financial derivative that gives the buyer the right, but not the obligation, to buy (call) or sell (put) an underlying asset at a predetermined price before or at expiration. Options are used for hedging, income, and speculation.' },
  { term: 'P/E Ratio', definition: 'Price-to-Earnings Ratio compares a company\'s current stock price to its earnings per share. A high P/E may indicate growth expectations or overvaluation, while a low P/E may suggest undervaluation or declining prospects.' },
  { term: 'REIT', definition: 'Real Estate Investment Trust is a company that owns, operates, or finances income-producing real estate. REITs allow individual investors to earn dividends from real estate investments without having to buy or manage properties themselves.' },
  { term: 'SEC', definition: 'The Securities and Exchange Commission is a U.S. government agency responsible for protecting investors, maintaining fair and orderly securities markets, and facilitating capital formation. It enforces federal securities laws and regulates the securities industry.' },
  { term: 'Sharpe Ratio', definition: 'A measure of risk-adjusted return calculated by subtracting the risk-free rate from the investment return and dividing by the standard deviation. A higher Sharpe ratio indicates better risk-adjusted performance; above 1.0 is considered good.' },
  { term: 'Short Selling', definition: 'An investment strategy that profits from a decline in a security\'s price. The seller borrows shares and sells them, hoping to buy them back at a lower price, return them to the lender, and pocket the difference as profit.' },
  { term: 'Volume', definition: 'The total number of shares or contracts traded in a security or market during a given period. High volume often indicates strong conviction behind a price move, while low volume can signal indecision or lack of interest.' },
  { term: 'Yield Curve', definition: 'A line that plots the interest rates of bonds having equal credit quality but different maturity dates. The shape of the yield curve — normal (upward sloping), flat, or inverted — provides important signals about future economic conditions.' },
  { term: 'Margin', definition: 'The amount of equity an investor has in their brokerage account. "Buying on margin" means borrowing money from a broker to purchase securities. Margin trading amplifies both potential gains and losses, requiring careful risk management.' },
  { term: 'Liquidity', definition: 'The ease with which an asset can be converted into cash without significantly affecting its market price. Cash is the most liquid asset, while real estate and collectibles are considered illiquid. High liquidity generally means lower transaction costs.' },
  { term: 'Arbitrage', definition: 'The practice of simultaneously buying and selling the same asset in different markets to profit from price differences. In efficient markets, arbitrage opportunities are rare and short-lived, as traders quickly exploit them.' },
  { term: 'Diversification', definition: 'A risk management strategy that involves spreading investments across various asset classes, sectors, and geographies. The goal is to reduce the impact of any single investment\'s poor performance on the overall portfolio.' },
];

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function Glossary() {
  const [search, setSearch] = useState('');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const termRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gloss-section',
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

  const filtered = useMemo(() => {
    let terms = glossaryTerms;
    if (search) {
      const q = search.toLowerCase();
      terms = terms.filter((t) => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q));
    }
    if (activeLetter) {
      terms = terms.filter((t) => t.term.charAt(0).toUpperCase() === activeLetter);
    }
    return terms;
  }, [search, activeLetter]);

  const popularTerms = glossaryTerms.filter((t) => t.popular);

  const availableLetters = useMemo(() => {
    return new Set(glossaryTerms.map((t) => t.term.charAt(0).toUpperCase()));
  }, []);

  const handleLetterClick = (letter: string) => {
    if (!availableLetters.has(letter)) return;
    setActiveLetter((prev) => (prev === letter ? null : letter));
    setSearch('');
  };

  const toggleExpand = (term: string) => {
    setExpandedTerm((prev) => (prev === term ? null : term));
  };

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="gloss-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite mb-2">
          Financial Glossary
        </h1>
        <p className="text-slategray text-lg">Your comprehensive reference for financial terminology</p>
      </section>

      {/* Popular Terms */}
      <section className="gloss-section max-w-7xl mx-auto px-6 pb-8">
        <h2 className="text-sm font-mono text-slategray uppercase tracking-wider mb-4">Popular Terms</h2>
        <div className="flex flex-wrap gap-2">
          {popularTerms.map((t) => (
            <button
              key={t.term}
              onClick={() => toggleExpand(t.term)}
              className="px-3 py-1.5 bg-emerald/10 border border-emerald/30 text-emerald text-sm font-mono rounded-lg hover:bg-emerald/20 transition-colors"
            >
              {t.term}
            </button>
          ))}
        </div>
      </section>

      {/* Search */}
      <section className="gloss-section max-w-7xl mx-auto px-6 pb-4">
        <div className="relative max-w-md">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slategray" />
          <input
            type="text"
            placeholder="Search terms..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveLetter(null); }}
            className="w-full bg-charcoal border border-subtleborder rounded-lg pl-10 pr-4 py-2.5 text-sm text-offwhite placeholder:text-slategray focus:outline-none focus:border-emerald/50 transition-colors"
          />
        </div>
      </section>

      {/* A-Z Navigation */}
      <section className="gloss-section max-w-7xl mx-auto px-6 py-4">
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {alphabet.map((letter) => {
            const available = availableLetters.has(letter);
            return (
              <button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                disabled={!available}
                className={`w-9 h-9 rounded-lg text-xs font-mono flex-shrink-0 flex items-center justify-center transition-colors ${
                  activeLetter === letter
                    ? 'bg-emerald text-obsidian'
                    : available
                    ? 'bg-charcoal border border-subtleborder text-offwhite hover:border-emerald/50 hover:text-emerald'
                    : 'bg-deepblack border border-subtleborder text-slategray/30 cursor-not-allowed'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </section>

      {/* Terms List */}
      <section className="gloss-section max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.term}
              ref={(el) => { termRefs.current[item.term] = el; }}
              className="bg-charcoal border border-subtleborder rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(item.term)}
                className="w-full text-left p-5 flex items-center justify-between hover:bg-deepblack/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-emerald/10 text-emerald text-xs font-mono flex items-center justify-center flex-shrink-0">
                    {item.term.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-base font-medium text-offwhite">{item.term}</span>
                  {item.popular && (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono bg-emerald/20 text-emerald rounded">POPULAR</span>
                  )}
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={`text-slategray transition-transform flex-shrink-0 ${expandedTerm === item.term ? 'rotate-180' : ''}`}
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {expandedTerm === item.term && (
                <div className="px-5 pb-5 pt-0">
                  <div className="border-t border-subtleborder pt-4">
                    <p className="text-sm text-slategray leading-relaxed">{item.definition}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bg-charcoal border border-subtleborder rounded-xl p-12 text-center">
            <p className="text-slategray">No terms found matching your search.</p>
          </div>
        )}
      </section>
    </div>
  );
}
