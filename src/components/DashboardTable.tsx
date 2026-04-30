import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { HexagonIcon, ArrowUpRightIcon } from './CustomIcons';

interface AssetRow {
  rank: number;
  asset: string;
  ticker: string;
  price: number;
  change24h: number;
  marketCap: string;
  volume24h: string;
  sector: string;
  status: 'active' | 'pending' | 'inactive';
}

const assetData: AssetRow[] = [
  { rank: 1, asset: 'Bitcoin', ticker: 'BTC', price: 97420.50, change24h: 2.41, marketCap: '$1.92T', volume24h: '$42.1B', sector: 'Currency', status: 'active' },
  { rank: 2, asset: 'Ethereum', ticker: 'ETH', price: 3580.20, change24h: 1.82, marketCap: '$430B', volume24h: '$18.3B', sector: 'Smart Contract', status: 'active' },
  { rank: 3, asset: 'Solana', ticker: 'SOL', price: 198.40, change24h: 5.63, marketCap: '$94B', volume24h: '$5.2B', sector: 'L1', status: 'active' },
  { rank: 4, asset: 'Cardano', ticker: 'ADA', price: 0.85, change24h: -1.24, marketCap: '$30B', volume24h: '$890M', sector: 'L1', status: 'active' },
  { rank: 5, asset: 'Sui', ticker: 'SUI', price: 3.42, change24h: 8.91, marketCap: '$10.2B', volume24h: '$1.1B', sector: 'L1', status: 'pending' },
  { rank: 6, asset: 'Aptos', ticker: 'APT', price: 7.80, change24h: 3.21, marketCap: '$3.8B', volume24h: '$320M', sector: 'L1', status: 'active' },
  { rank: 7, asset: 'Avalanche', ticker: 'AVAX', price: 38.50, change24h: -2.15, marketCap: '$15.6B', volume24h: '$780M', sector: 'L1', status: 'active' },
  { rank: 8, asset: 'Chainlink', ticker: 'LINK', price: 18.20, change24h: 0.95, marketCap: '$11.8B', volume24h: '$450M', sector: 'Oracle', status: 'active' },
  { rank: 9, asset: 'Aave', ticker: 'AAVE', price: 312.40, change24h: 4.33, marketCap: '$4.7B', volume24h: '$280M', sector: 'DeFi', status: 'active' },
  { rank: 10, asset: 'Uniswap', ticker: 'UNI', price: 9.80, change24h: -0.75, marketCap: '$5.9B', volume24h: '$190M', sector: 'DeFi', status: 'active' },
  { rank: 11, asset: 'Near Protocol', ticker: 'NEAR', price: 4.20, change24h: 6.12, marketCap: '$5.1B', volume24h: '$340M', sector: 'AI', status: 'pending' },
  { rank: 12, asset: 'Render', ticker: 'RNDR', price: 7.15, change24h: 12.40, marketCap: '$3.7B', volume24h: '$420M', sector: 'AI', status: 'active' },
];

type SortKey = keyof AssetRow;
type SortDir = 'asc' | 'desc';

interface DashboardTableProps {
  filterSector?: string;
  maxRows?: number;
}

export default function DashboardTable({ filterSector, maxRows = 12 }: DashboardTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const filtered = useMemo(() => {
    let data = [...assetData];
    if (filterSector && filterSector !== 'All') {
      data = data.filter((d) => d.sector === filterSector);
    }
    return data.slice(0, maxRows);
  }, [filterSector, maxRows]);

  const sorted = useMemo(() => {
    const data = [...filtered];
    data.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return data;
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const headers: { key: SortKey; label: string }[] = [
    { key: 'rank', label: '#' },
    { key: 'asset', label: 'Asset' },
    { key: 'price', label: 'Price' },
    { key: 'change24h', label: '24h %' },
    { key: 'marketCap', label: 'Mkt Cap' },
    { key: 'volume24h', label: 'Volume' },
    { key: 'sector', label: 'Sector' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-subtleborder">
            {headers.map((h) => (
              <th
                key={h.key}
                onClick={() => handleSort(h.key)}
                className="text-left py-3 px-4 text-xs font-mono font-medium text-slategray uppercase tracking-wider cursor-pointer hover:text-offwhite transition-colors select-none"
              >
                <span className="flex items-center gap-1">
                  {h.label}
                  {sortKey === h.key && (
                    <span className="text-emerald">
                      {sortDir === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </span>
              </th>
            ))}
            <th className="py-3 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={row.ticker}
              className="border-b border-subtleborder/40 hover:bg-charcoal/60 transition-colors"
            >
              <td className="py-3 px-4 text-sm font-mono text-slategray">{row.rank}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-charcoal border border-subtleborder flex items-center justify-center text-xs font-mono font-bold text-offwhite">
                    {row.ticker[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-offwhite">{row.asset}</div>
                    <div className="text-xs font-mono text-slategray">{row.ticker}</div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-sm font-mono text-offwhite">
                ${row.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>
              <td className={`py-3 px-4 text-sm font-mono ${row.change24h >= 0 ? 'text-emerald' : 'text-crimson'}`}>
                {row.change24h >= 0 ? '+' : ''}{row.change24h.toFixed(2)}%
              </td>
              <td className="py-3 px-4 text-sm font-mono text-offwhite">{row.marketCap}</td>
              <td className="py-3 px-4 text-sm font-mono text-offwhite">{row.volume24h}</td>
              <td className="py-3 px-4 text-sm font-mono text-slategray">{row.sector}</td>
              <td className="py-3 px-4">
                <span className="flex items-center gap-2">
                  <HexagonIcon status={row.status} size={14} />
                  <span className={`text-xs font-mono ${row.status === 'active' ? 'text-emerald' : 'text-amber-500'}`}>
                    {row.status === 'active' ? 'Live' : 'Syncing'}
                  </span>
                </span>
              </td>
              <td className="py-3 px-4">
                <Link to={`/stocks/${row.ticker}`} className="text-slategray hover:text-emerald transition-colors inline-flex">
                  <ArrowUpRightIcon size={16} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
