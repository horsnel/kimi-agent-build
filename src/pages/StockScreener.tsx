import { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FilterIcon, SearchIcon, TrendUpIcon, TrendDownIcon } from '../components/CustomIcons';
import { Link } from 'react-router';
import { fetchStockScreener, type StockScreenerResult } from '../services/api';

gsap.registerPlugin(ScrollTrigger);

type MarketCap = 'All' | 'Mega' | 'Large' | 'Mid' | 'Small';
type SortField = 'ticker' | 'price' | 'change' | 'marketCap' | 'pe' | 'dividendYield' | 'volume' | 'sector';
type SortDir = 'asc' | 'desc';

interface Stock {
  ticker: string;
  company: string;
  price: number;
  change: number;
  marketCap: string;
  marketCapCategory: MarketCap;
  pe: number;
  dividendYield: number;
  volume: string;
  sector: string;
}

const fallbackStocks: Stock[] = [
  { ticker: 'AAPL', company: 'Apple Inc.', price: 227.63, change: 1.24, marketCap: '$3.52T', marketCapCategory: 'Mega', pe: 37.2, dividendYield: 0.5, volume: '52.3M', sector: 'Technology' },
  { ticker: 'MSFT', company: 'Microsoft Corp.', price: 415.56, change: 0.87, marketCap: '$3.09T', marketCapCategory: 'Mega', pe: 35.8, dividendYield: 0.7, volume: '22.1M', sector: 'Technology' },
  { ticker: 'GOOGL', company: 'Alphabet Inc.', price: 174.82, change: -0.32, marketCap: '$2.16T', marketCapCategory: 'Mega', pe: 24.1, dividendYield: 0.0, volume: '28.9M', sector: 'Technology' },
  { ticker: 'AMZN', company: 'Amazon.com Inc.', price: 205.74, change: 1.85, marketCap: '$2.14T', marketCapCategory: 'Mega', pe: 62.4, dividendYield: 0.0, volume: '48.7M', sector: 'Consumer' },
  { ticker: 'NVDA', company: 'NVIDIA Corp.', price: 875.28, change: 3.42, marketCap: '$2.16T', marketCapCategory: 'Mega', pe: 68.3, dividendYield: 0.02, volume: '41.5M', sector: 'Technology' },
  { ticker: 'META', company: 'Meta Platforms Inc.', price: 505.95, change: -0.56, marketCap: '$1.29T', marketCapCategory: 'Mega', pe: 27.9, dividendYield: 0.4, volume: '18.3M', sector: 'Technology' },
  { ticker: 'TSLA', company: 'Tesla Inc.', price: 188.13, change: -2.18, marketCap: '$599B', marketCapCategory: 'Mega', pe: 44.6, dividendYield: 0.0, volume: '112.7M', sector: 'Consumer' },
  { ticker: 'JPM', company: 'JPMorgan Chase & Co.', price: 198.47, change: 0.64, marketCap: '$572B', marketCapCategory: 'Mega', pe: 12.1, dividendYield: 2.3, volume: '9.8M', sector: 'Finance' },
  { ticker: 'V', company: 'Visa Inc.', price: 280.31, change: 0.42, marketCap: '$574B', marketCapCategory: 'Mega', pe: 31.2, dividendYield: 0.7, volume: '6.5M', sector: 'Finance' },
  { ticker: 'JNJ', company: 'Johnson & Johnson', price: 156.82, change: -0.18, marketCap: '$378B', marketCapCategory: 'Large', pe: 22.5, dividendYield: 3.0, volume: '7.2M', sector: 'Healthcare' },
  { ticker: 'WMT', company: 'Walmart Inc.', price: 168.54, change: 0.93, marketCap: '$454B', marketCapCategory: 'Large', pe: 28.7, dividendYield: 1.3, volume: '8.1M', sector: 'Consumer' },
  { ticker: 'PG', company: 'Procter & Gamble Co.', price: 162.37, change: 0.28, marketCap: '$382B', marketCapCategory: 'Large', pe: 26.4, dividendYield: 2.4, volume: '6.9M', sector: 'Consumer' },
  { ticker: 'UNH', company: 'UnitedHealth Group', price: 527.15, change: 1.07, marketCap: '$488B', marketCapCategory: 'Large', pe: 21.8, dividendYield: 1.4, volume: '3.4M', sector: 'Healthcare' },
  { ticker: 'HD', company: 'Home Depot Inc.', price: 362.18, change: -0.71, marketCap: '$359B', marketCapCategory: 'Large', pe: 24.3, dividendYield: 2.5, volume: '4.2M', sector: 'Consumer' },
  { ticker: 'MA', company: 'Mastercard Inc.', price: 462.73, change: 0.55, marketCap: '$432B', marketCapCategory: 'Large', pe: 35.6, dividendYield: 0.6, volume: '3.1M', sector: 'Finance' },
  { ticker: 'DIS', company: 'Walt Disney Co.', price: 112.54, change: -1.23, marketCap: '$205B', marketCapCategory: 'Large', pe: 72.8, dividendYield: 0.0, volume: '11.6M', sector: 'Consumer' },
  { ticker: 'NFLX', company: 'Netflix Inc.', price: 628.47, change: 2.14, marketCap: '$272B', marketCapCategory: 'Large', pe: 48.9, dividendYield: 0.0, volume: '5.8M', sector: 'Technology' },
  { ticker: 'PYPL', company: 'PayPal Holdings Inc.', price: 63.82, change: -0.87, marketCap: '$70B', marketCapCategory: 'Mid', pe: 17.3, dividendYield: 0.0, volume: '14.2M', sector: 'Finance' },
  { ticker: 'INTC', company: 'Intel Corp.', price: 43.27, change: -1.65, marketCap: '$182B', marketCapCategory: 'Large', pe: 108.2, dividendYield: 1.1, volume: '38.9M', sector: 'Technology' },
  { ticker: 'CSCO', company: 'Cisco Systems Inc.', price: 50.14, change: 0.32, marketCap: '$203B', marketCapCategory: 'Large', pe: 15.4, dividendYield: 3.0, volume: '18.7M', sector: 'Technology' },
  { ticker: 'PFE', company: 'Pfizer Inc.', price: 27.63, change: 0.54, marketCap: '$156B', marketCapCategory: 'Large', pe: 44.2, dividendYield: 5.8, volume: '32.1M', sector: 'Healthcare' },
  { ticker: 'BA', company: 'Boeing Co.', price: 204.87, change: 1.92, marketCap: '$125B', marketCapCategory: 'Large', pe: -18.5, dividendYield: 0.0, volume: '7.3M', sector: 'Industrials' },
  { ticker: 'XOM', company: 'Exxon Mobil Corp.', price: 104.56, change: -0.43, marketCap: '$428B', marketCapCategory: 'Large', pe: 12.7, dividendYield: 3.5, volume: '14.8M', sector: 'Energy' },
  { ticker: 'CVX', company: 'Chevron Corp.', price: 155.28, change: -0.61, marketCap: '$291B', marketCapCategory: 'Large', pe: 14.1, dividendYield: 4.0, volume: '8.5M', sector: 'Energy' },
];

const sectors = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer', 'Industrials'];

function SortHeader({ field, sortField, sortDir, onSort, children }: { field: SortField; sortField: SortField; sortDir: SortDir; onSort: (f: SortField) => void; children: React.ReactNode }) {
  return (
    <th
      className="text-left text-xs font-mono text-slategray px-4 py-3 cursor-pointer hover:text-offwhite transition-colors select-none"
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-emerald">{sortDir === 'asc' ? '↑' : '↓'}</span>
        )}
      </span>
    </th>
  );
}

export default function StockScreener() {
  const [allStocks, setAllStocks] = useState<Stock[]>(fallbackStocks);
  const [loading, setLoading] = useState(true);
  const [marketCap, setMarketCap] = useState<MarketCap>('All');
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [peMin, setPeMin] = useState('');
  const [peMax, setPeMax] = useState('');
  const [dividendMin, setDividendMin] = useState(0);
  const [volumeMin, setVolumeMin] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortField, setSortField] = useState<SortField>('ticker');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await fetchStockScreener();
        setAllStocks(result.map((s: StockScreenerResult) => ({
          ticker: s.ticker,
          company: s.company,
          price: s.price,
          change: s.change,
          marketCap: s.marketCap,
          marketCapCategory: s.marketCapCategory as MarketCap,
          pe: s.pe,
          dividendYield: s.dividendYield,
          volume: s.volume,
          sector: s.sector,
        })));
      } catch (e) {
        console.warn('StockScreener: using fallback data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.screener-section',
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
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const resetFilters = () => {
    setMarketCap('All');
    setSelectedSectors([]);
    setPeMin('');
    setPeMax('');
    setDividendMin(0);
    setVolumeMin('');
    setPriceMin('');
    setPriceMax('');
    setSearchQuery('');
  };

  const filtered = useMemo(() => {
    let result = allStocks;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) => s.ticker.toLowerCase().includes(q) || s.company.toLowerCase().includes(q)
      );
    }

    if (marketCap !== 'All') {
      result = result.filter((s) => s.marketCapCategory === marketCap);
    }

    if (selectedSectors.length > 0) {
      result = result.filter((s) => selectedSectors.includes(s.sector));
    }

    if (peMin) {
      const min = parseFloat(peMin);
      if (!isNaN(min)) result = result.filter((s) => s.pe >= min || s.pe < 0);
    }
    if (peMax) {
      const max = parseFloat(peMax);
      if (!isNaN(max)) result = result.filter((s) => s.pe <= max);
    }

    result = result.filter((s) => s.dividendYield >= dividendMin);

    if (volumeMin) {
      const min = parseFloat(volumeMin);
      if (!isNaN(min)) result = result.filter((s) => parseFloat(s.volume) >= min);
    }

    if (priceMin) {
      const min = parseFloat(priceMin);
      if (!isNaN(min)) result = result.filter((s) => s.price >= min);
    }
    if (priceMax) {
      const max = parseFloat(priceMax);
      if (!isNaN(max)) result = result.filter((s) => s.price <= max);
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'ticker': cmp = a.ticker.localeCompare(b.ticker); break;
        case 'price': cmp = a.price - b.price; break;
        case 'change': cmp = a.change - b.change; break;
        case 'pe': cmp = a.pe - b.pe; break;
        case 'dividendYield': cmp = a.dividendYield - b.dividendYield; break;
        case 'volume': cmp = parseFloat(a.volume) - parseFloat(b.volume); break;
        case 'sector': cmp = a.sector.localeCompare(b.sector); break;
        default: cmp = 0;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [allStocks, searchQuery, marketCap, selectedSectors, peMin, peMax, dividendMin, volumeMin, priceMin, priceMax, sortField, sortDir]);

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="screener-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite mb-2">
          Stock Screener
          {loading && <span className="ml-2 w-2 h-2 bg-emerald rounded-full animate-pulse inline-block align-middle" />}
        </h1>
        <p className="text-slategray max-w-xl">
          Filter and discover stocks based on fundamentals and technicals
        </p>
      </section>

      {/* Filter Panel */}
      <section className="screener-section max-w-7xl mx-auto px-6 pb-8">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <FilterIcon size={16} className="text-emerald" />
            <h2 className="text-sm font-medium text-offwhite">Filters</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Market Cap */}
            <div>
              <label className="block text-xs font-mono text-slategray mb-2">Market Cap</label>
              <select
                value={marketCap}
                onChange={(e) => setMarketCap(e.target.value as MarketCap)}
                className="w-full bg-deepblack border border-subtleborder rounded-lg px-3 py-2 text-sm text-offwhite font-mono focus:outline-none focus:border-emerald/50"
              >
                <option value="All">All</option>
                <option value="Mega">Mega ($200B+)</option>
                <option value="Large">Large ($10B-$200B)</option>
                <option value="Mid">Mid ($2B-$10B)</option>
                <option value="Small">Small (&lt;$2B)</option>
              </select>
            </div>

            {/* Sector */}
            <div>
              <label className="block text-xs font-mono text-slategray mb-2">Sector</label>
              <div className="flex flex-wrap gap-2">
                {sectors.map((sector) => (
                  <button
                    key={sector}
                    onClick={() => toggleSector(sector)}
                    className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
                      selectedSectors.includes(sector)
                        ? 'bg-emerald/20 border-emerald/50 text-emerald'
                        : 'bg-deepblack border-subtleborder text-slategray hover:text-offwhite'
                    }`}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>

            {/* P/E Range */}
            <div>
              <label className="block text-xs font-mono text-slategray mb-2">P/E Range</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={peMin}
                  onChange={(e) => setPeMin(e.target.value)}
                  className="w-full bg-deepblack border border-subtleborder rounded-lg px-3 py-2 text-sm text-offwhite font-mono focus:outline-none focus:border-emerald/50"
                />
                <span className="text-slategray text-xs">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={peMax}
                  onChange={(e) => setPeMax(e.target.value)}
                  className="w-full bg-deepblack border border-subtleborder rounded-lg px-3 py-2 text-sm text-offwhite font-mono focus:outline-none focus:border-emerald/50"
                />
              </div>
            </div>

            {/* Dividend Yield */}
            <div>
              <label className="block text-xs font-mono text-slategray mb-2">
                Dividend Yield: {dividendMin.toFixed(1)}%+
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={dividendMin}
                onChange={(e) => setDividendMin(parseFloat(e.target.value))}
                className="w-full accent-emerald"
              />
              <div className="flex justify-between text-xs text-slategray font-mono mt-1">
                <span>0%</span>
                <span>5%</span>
              </div>
            </div>

            {/* Volume Min */}
            <div>
              <label className="block text-xs font-mono text-slategray mb-2">Min Volume (M)</label>
              <input
                type="number"
                placeholder="e.g. 10"
                value={volumeMin}
                onChange={(e) => setVolumeMin(e.target.value)}
                className="w-full bg-deepblack border border-subtleborder rounded-lg px-3 py-2 text-sm text-offwhite font-mono focus:outline-none focus:border-emerald/50"
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-mono text-slategray mb-2">Price Range</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full bg-deepblack border border-subtleborder rounded-lg px-3 py-2 text-sm text-offwhite font-mono focus:outline-none focus:border-emerald/50"
                />
                <span className="text-slategray text-xs">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full bg-deepblack border border-subtleborder rounded-lg px-3 py-2 text-sm text-offwhite font-mono focus:outline-none focus:border-emerald/50"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-xs font-mono text-slategray border border-subtleborder rounded-lg hover:text-offwhite hover:border-slategray transition-colors"
            >
              Reset Filters
            </button>
            <div className="flex-1" />
            <span className="text-xs font-mono text-slategray self-center">{filtered.length} results</span>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="screener-section max-w-7xl mx-auto px-6 pb-4">
        <div className="relative">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slategray" />
          <input
            type="text"
            placeholder="Search by ticker or company name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-charcoal border border-subtleborder rounded-xl pl-10 pr-4 py-3 text-sm text-offwhite font-mono focus:outline-none focus:border-emerald/50"
          />
        </div>
      </section>

      {/* Results Table - Desktop */}
      <section className="screener-section max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-charcoal border border-subtleborder rounded-xl overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-subtleborder">
                  <SortHeader field="ticker" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Ticker</SortHeader>
                  <th className="text-left text-xs font-mono text-slategray px-4 py-3">Company</th>
                  <SortHeader field="price" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Price</SortHeader>
                  <SortHeader field="change" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Change%</SortHeader>
                  <th className="text-left text-xs font-mono text-slategray px-4 py-3">Mkt Cap</th>
                  <SortHeader field="pe" sortField={sortField} sortDir={sortDir} onSort={handleSort}>P/E</SortHeader>
                  <SortHeader field="dividendYield" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Div Yield</SortHeader>
                  <SortHeader field="volume" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Volume</SortHeader>
                  <SortHeader field="sector" sortField={sortField} sortDir={sortDir} onSort={handleSort}>Sector</SortHeader>
                </tr>
              </thead>
              <tbody>
                {filtered.map((stock) => (
                  <tr key={stock.ticker} className="border-b border-subtleborder/50 hover:bg-deepblack/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/stocks/${stock.ticker}`} className="text-sm text-emerald font-mono hover:underline">
                        {stock.ticker}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-offwhite">{stock.company}</td>
                    <td className="px-4 py-3 text-sm text-offwhite font-mono">${stock.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-mono">
                      <span className={`flex items-center gap-1 ${stock.change >= 0 ? 'text-emerald' : 'text-crimson'}`}>
                        {stock.change >= 0 ? <TrendUpIcon size={12} /> : <TrendDownIcon size={12} />}
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slategray font-mono">{stock.marketCap}</td>
                    <td className="px-4 py-3 text-sm text-slategray font-mono">{stock.pe.toFixed(1)}</td>
                    <td className="px-4 py-3 text-sm text-slategray font-mono">{stock.dividendYield.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-sm text-slategray font-mono">{stock.volume}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-deepblack border border-subtleborder text-slategray">
                        {stock.sector}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            {filtered.map((stock) => (
              <Link
                key={stock.ticker}
                to={`/stocks/${stock.ticker}`}
                className="block p-4 border-b border-subtleborder/50 hover:bg-deepblack/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald font-mono font-medium">{stock.ticker}</span>
                    <span className="text-xs text-slategray font-mono">{stock.sector}</span>
                  </div>
                  <span className={`text-sm font-mono flex items-center gap-1 ${stock.change >= 0 ? 'text-emerald' : 'text-crimson'}`}>
                    {stock.change >= 0 ? <TrendUpIcon size={12} /> : <TrendDownIcon size={12} />}
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                  </span>
                </div>
                <p className="text-xs text-slategray mb-2">{stock.company}</p>
                <div className="grid grid-cols-4 gap-2 text-xs font-mono">
                  <div>
                    <p className="text-slategray">Price</p>
                    <p className="text-offwhite">${stock.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slategray">Mkt Cap</p>
                    <p className="text-offwhite">{stock.marketCap}</p>
                  </div>
                  <div>
                    <p className="text-slategray">P/E</p>
                    <p className="text-offwhite">{stock.pe.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-slategray">Div</p>
                    <p className="text-offwhite">{stock.dividendYield.toFixed(1)}%</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
