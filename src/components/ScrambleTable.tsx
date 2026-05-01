import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { HexagonIcon } from './CustomIcons';
import { useGeoCurrency } from '../hooks/useGeoCurrency';

const scrambleChars = ['$', '%', '#', '@', '&', '*', '!', '?', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

interface OrderRow {
  asset: string;
  type: string;
  volume: string;
  price: number;
  status: 'active' | 'pending' | 'inactive';
  latency: string;
}

const initialData: OrderRow[] = [
  { asset: 'AAPL', type: 'BUY', volume: '2.4M', price: 228.50, status: 'active', latency: '12ms' },
  { asset: 'NVDA', type: 'SELL', volume: '890K', price: 138.20, status: 'active', latency: '8ms' },
  { asset: 'TSLA', type: 'BUY', volume: '1.1M', price: 420.80, status: 'pending', latency: '23ms' },
  { asset: 'MSFT', type: 'BUY', volume: '560K', price: 445.30, status: 'active', latency: '15ms' },
  { asset: 'AMZN', type: 'SELL', volume: '340K', price: 198.60, status: 'active', latency: '11ms' },
  { asset: 'GOOGL', type: 'BUY', volume: '780K', price: 176.40, status: 'pending', latency: '19ms' },
  { asset: 'META', type: 'SELL', volume: '420K', price: 612.80, status: 'active', latency: '9ms' },
  { asset: 'AMD', type: 'BUY', volume: '1.5M', price: 124.60, status: 'active', latency: '14ms' },
];

function scrambleText(element: HTMLElement, finalText: string, duration = 0.8) {
  const originalChars = finalText.split('');
  const proxy = { progress: 0 };

  gsap.to(proxy, {
    progress: 1,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      const progress = proxy.progress;
      let result = '';
      for (let i = 0; i < originalChars.length; i++) {
        if (originalChars[i] === ' ') {
          result += ' ';
        } else if (Math.random() > progress || progress < 0.1) {
          result += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        } else {
          result += originalChars[i];
        }
      }
      element.textContent = result;
    },
    onComplete: () => {
      element.textContent = finalText;
    },
  });
}

export default function ScrambleTable() {
  const [rows, setRows] = useState<OrderRow[]>(initialData);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const cellRefs = useRef<(HTMLTableCellElement | null)[][]>([]);
  const isPausedRef = useRef(false);
  const { formatLocalShort } = useGeoCurrency();

  const handleMouseEnter = () => {
    isPausedRef.current = true;
  };

  const handleMouseLeave = () => {
    isPausedRef.current = false;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPausedRef.current) return;

      const newRow: OrderRow = {
        asset: ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'AMD', 'NFLX', 'CRM'][Math.floor(Math.random() * 10)],
        type: Math.random() > 0.5 ? 'BUY' : 'SELL',
        volume: `${(Math.random() * 3).toFixed(1)}M`,
        price: +(100 + Math.random() * 500).toFixed(2),
        status: Math.random() > 0.3 ? 'active' : 'pending',
        latency: `${Math.floor(Math.random() * 25 + 5)}ms`,
      };

      setRows((prev) => {
        const updated = [newRow, ...prev.slice(0, 7)];
        return updated;
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Animate the first row when it changes
    const firstRow = rowRefs.current[0];
    if (firstRow) {
      gsap.fromTo(
        firstRow,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );

      const cells = cellRefs.current[0];
      if (cells) {
        cells.forEach((cell, idx) => {
          if (cell) {
            const keys = ['asset', 'type', 'volume', 'price', 'status', 'latency'] as const;
            const val = rows[0][keys[idx]];
            scrambleText(cell, String(val), 0.8);
          }
        });
      }
    }
  }, [rows]);

  const statusMap = {
    active: { label: 'Filled', color: 'text-emerald' as const },
    pending: { label: 'Pending', color: 'text-amber-500' as const },
    inactive: { label: 'Expired', color: 'text-slategray' as const },
  };

  return (
    <div className="w-full overflow-x-auto" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-subtleborder">
            {['Asset', 'Type', 'Volume', 'Price', 'Status', 'Latency'].map((h) => (
              <th key={h} className="text-left py-3 px-4 text-xs font-mono font-medium text-slategray uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={`${row.asset}-${rowIdx}`}
              ref={(el) => { rowRefs.current[rowIdx] = el; }}
              className="border-b border-subtleborder/50 hover:bg-charcoal/50 transition-colors"
            >
              {(['asset', 'type', 'volume', 'price', 'status', 'latency'] as const).map((key, colIdx) => (
                <td
                  key={key}
                  ref={(el) => {
                    if (!cellRefs.current[rowIdx]) cellRefs.current[rowIdx] = [];
                    cellRefs.current[rowIdx][colIdx] = el;
                  }}
                  className={`py-3 px-4 text-sm font-mono ${
                    key === 'type'
                      ? row.type === 'BUY'
                        ? 'text-emerald'
                        : 'text-crimson'
                      : key === 'status'
                      ? statusMap[row.status].color
                      : 'text-offwhite'
                  }`}
                >
                  {key === 'status' ? (
                    <span className="flex items-center gap-2">
                      <HexagonIcon status={row.status} size={14} />
                      {statusMap[row.status].label}
                    </span>
                  ) : key === 'price' ? (
                    formatLocalShort(row.price)
                  ) : (
                    row[key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
