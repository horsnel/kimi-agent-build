import { useRef, useEffect, useState } from 'react';
import { TrendUpIcon, TrendDownIcon } from './CustomIcons';
import { fetchMarketIndices, fetchCryptoOverview } from '../services/api';

interface TickerItem {
  symbol: string;
  price: string;
  change: string;
  up: boolean;
}

const defaultTickers: TickerItem[] = [
  { symbol: 'BTC', price: '$97,420', change: '+2.4%', up: true },
  { symbol: 'ETH', price: '$3,580', change: '+1.8%', up: true },
  { symbol: 'SPX', price: '5,980.25', change: '+0.6%', up: true },
  { symbol: 'NDX', price: '21,340.80', change: '-0.2%', up: false },
  { symbol: 'DJI', price: '43,120.50', change: '+0.3%', up: true },
  { symbol: 'VIX', price: '14.20', change: '-3.1%', up: false },
  { symbol: 'GOLD', price: '$2,680', change: '+0.9%', up: true },
  { symbol: 'OIL', price: '$78.40', change: '-1.2%', up: false },
  { symbol: 'EUR/USD', price: '1.0840', change: '+0.1%', up: true },
  { symbol: '10Y', price: '4.32%', change: '+0.05%', up: true },
  { symbol: 'AAPL', price: '$228.50', change: '+1.2%', up: true },
  { symbol: 'NVDA', price: '$138.20', change: '+3.5%', up: true },
  { symbol: 'TSLA', price: '$420.80', change: '-2.1%', up: false },
  { symbol: 'MSFT', price: '$445.30', change: '+0.4%', up: true },
  { symbol: 'AMZN', price: '$198.60', change: '+0.7%', up: true },
];

function formatPrice(val: number, name: string): string {
  if (name.includes('S&P') || name.includes('DOW') || name === 'VIX' || name.includes('NASDAQ')) {
    return val.toLocaleString('en-US', { minimumFractionDigits: 2 });
  }
  if (val >= 1000) return `$${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (val >= 1) return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${val.toFixed(4)}`;
}

export default function TickerTape() {
  const tapeRef = useRef<HTMLDivElement>(null);
  const [tickers, setTickers] = useState<TickerItem[]>(defaultTickers);

  useEffect(() => {
    async function loadTickerData() {
      try {
        const [indices, crypto] = await Promise.all([
          fetchMarketIndices(),
          fetchCryptoOverview(),
        ]);

        const items: TickerItem[] = [];

        // Add market indices
        for (const idx of indices.slice(0, 4)) {
          items.push({
            symbol: idx.name === 'S&P 500' ? 'SPX' : idx.name === 'NASDAQ' ? 'NDX' : idx.name === 'DOW' ? 'DJI' : idx.symbol,
            price: formatPrice(idx.value, idx.name),
            change: `${idx.changePercent >= 0 ? '+' : ''}${idx.changePercent.toFixed(1)}%`,
            up: idx.changePercent >= 0,
          });
        }

        // Add top cryptos
        for (const c of crypto.slice(0, 5)) {
          items.push({
            symbol: c.ticker,
            price: formatPrice(c.price, c.name),
            change: `${c.change24h >= 0 ? '+' : ''}${c.change24h.toFixed(1)}%`,
            up: c.change24h >= 0,
          });
        }

        if (items.length > 0) {
          setTickers(items);
        }
      } catch (e) {
        // Keep default tickers
      }
    }
    loadTickerData();
  }, []);

  useEffect(() => {
    const tape = tapeRef.current;
    if (!tape) return;
    
    let animationId: number;
    let pos = 0;
    const speed = 0.5;
    
    const animate = () => {
      pos -= speed;
      const halfWidth = tape.scrollWidth / 2;
      if (Math.abs(pos) >= halfWidth) {
        pos = 0;
      }
      tape.style.transform = `translateX(${pos}px)`;
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationId);
  }, [tickers]);

  const content = (
    <>
      {tickers.map((t, i) => (
        <div key={i} className="flex items-center gap-2 px-5 shrink-0">
          <span className="text-xs font-mono font-medium text-offwhite">{t.symbol}</span>
          <span className="text-xs font-mono text-slategray">{t.price}</span>
          <span className={`text-xs font-mono flex items-center gap-0.5 ${t.up ? 'text-emerald' : 'text-crimson'}`}>
            {t.up ? <TrendUpIcon size={12} /> : <TrendDownIcon size={12} />}
            {t.change}
          </span>
        </div>
      ))}
    </>
  );

  return (
    <div className="w-full overflow-hidden bg-deepblack border-y border-subtleborder py-2">
      <div ref={tapeRef} className="flex whitespace-nowrap will-change-transform">
        {content}
        {content}
      </div>
    </div>
  );
}
