import { useRef, useEffect } from 'react';
import { TrendUpIcon, TrendDownIcon } from './CustomIcons';

const tickers = [
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

export default function TickerTape() {
  const tapeRef = useRef<HTMLDivElement>(null);

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
  }, []);

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
