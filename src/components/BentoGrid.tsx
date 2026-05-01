import { useState, useEffect } from 'react';
import React from 'react';
import { TrendUpIcon, TrendDownIcon, PieChartIcon, MarketPulseIcon, GlobeIcon, CandlestickIcon } from './CustomIcons';
import { AreaChart, Area, ResponsiveContainer, Treemap } from 'recharts';
import { fetchMarketIndices, fetchFearGreed, type MarketIndex, type FearGreedData } from '../services/api';

interface TreemapCellProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
}

const sectorData = [
  { name: 'Technology', size: 32, fill: '#10B981' },
  { name: 'Healthcare', size: 18, fill: '#3B82F6' },
  { name: 'Finance', size: 14, fill: '#6366F1' },
  { name: 'Energy', size: 10, fill: '#F59E0B' },
  { name: 'Consumer', size: 12, fill: '#EF4444' },
  { name: 'Industrials', size: 8, fill: '#8B5CF6' },
  { name: 'Materials', size: 4, fill: '#6B7280' },
  { name: 'Utilities', size: 2, fill: '#4B5563' },
];

const TreemapCell: React.FC<TreemapCellProps> = ({ x = 0, y = 0, width = 0, height = 0, index = 0 }) => {
  const item = sectorData[index];
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={item?.fill || '#333'} stroke="#111111" strokeWidth={2} rx={4} />
      {width > 60 && height > 30 && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={12} fontFamily="JetBrains Mono">
          {item?.name}
        </text>
      )}
    </g>
  );
};

const defaultMovers = [
  { symbol: 'NVDA', change: '+3.52%', volume: '52.1M', up: true },
  { symbol: 'TSLA', change: '-2.14%', volume: '38.4M', up: false },
  { symbol: 'META', change: '+1.87%', volume: '18.2M', up: true },
  { symbol: 'AMD', change: '+4.21%', volume: '31.7M', up: true },
  { symbol: 'COIN', change: '-5.30%', volume: '12.8M', up: false },
];

function MiniSparkline({ data, up }: { data: number[]; up: boolean }) {
  const color = up ? '#10B981' : '#EF4444';
  return (
    <div className="w-20 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data.map((v, i) => ({ i, v }))}>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={color} fillOpacity={0.1} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function BentoGrid() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [fearGreed, setFearGreed] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [indicesData, fgData] = await Promise.all([
          fetchMarketIndices(),
          fetchFearGreed(),
        ]);
        setIndices(indicesData);
        setFearGreed(fgData);
      } catch (e) {
        console.warn('BentoGrid: using fallback data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Format indices for display
  const displayIndices = indices.length > 0 ? indices.slice(0, 4).map(idx => ({
    name: idx.name,
    value: idx.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    change: `${idx.changePercent >= 0 ? '+' : ''}${idx.changePercent.toFixed(2)}%`,
    up: idx.changePercent >= 0,
    sparkline: idx.sparkline.length > 0 ? idx.sparkline : [idx.value * 0.99, idx.value * 0.995, idx.value * 1.001, idx.value],
  })) : [
    { name: 'S&P 500', value: '5,980.25', change: '+0.62%', up: true, sparkline: [5800, 5850, 5820, 5900, 5880, 5950, 5920, 5980] },
    { name: 'NASDAQ', value: '21,340.80', change: '-0.18%', up: false, sparkline: [21500, 21400, 21350, 21450, 21300, 21200, 21350, 21340] },
    { name: 'DOW', value: '43,120.50', change: '+0.34%', up: true, sparkline: [42800, 42900, 43000, 42950, 43100, 43050, 43200, 43120] },
    { name: 'VIX', value: '14.20', change: '-3.15%', up: false, sparkline: [15.2, 14.8, 15.0, 14.5, 14.3, 14.6, 14.1, 14.2] },
  ];

  const gaugeValue = fearGreed?.currentValue || 72;
  const gaugeLabel = fearGreed?.currentLabel || 'Greed';
  const gaugeAngle = (gaugeValue / 100) * 180 - 90;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Global Indices - 2x2 block */}
      <div className="lg:col-span-2 lg:row-span-2 bg-charcoal border border-subtleborder rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <GlobeIcon size={18} className="text-emerald" />
          <h3 className="text-sm font-medium text-offwhite">Global Indices</h3>
          {loading && <span className="ml-2 w-2 h-2 bg-emerald rounded-full animate-pulse" />}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {displayIndices.map((idx) => (
            <div key={idx.name} className="bg-deepblack border border-subtleborder rounded-lg p-4">
              <div className="text-xs font-mono text-slategray mb-1">{idx.name}</div>
              <div className="text-lg font-mono font-medium text-offwhite mb-2">{idx.value}</div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono flex items-center gap-1 ${idx.up ? 'text-emerald' : 'text-crimson'}`}>
                  {idx.up ? <TrendUpIcon size={12} /> : <TrendDownIcon size={12} />}
                  {idx.change}
                </span>
                <MiniSparkline data={idx.sparkline} up={idx.up} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sector Heatmap */}
      <div className="lg:col-span-2 bg-charcoal border border-subtleborder rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon size={18} className="text-emerald" />
          <h3 className="text-sm font-medium text-offwhite">Sector Heatmap</h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={sectorData}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#111111"
              fill="#111111"
              content={<TreemapCell />}
            />
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fear & Greed */}
      <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <MarketPulseIcon size={18} className="text-emerald" />
          <h3 className="text-sm font-medium text-offwhite">Fear & Greed</h3>
          {loading && <span className="ml-2 w-2 h-2 bg-emerald rounded-full animate-pulse" />}
        </div>
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-16 overflow-hidden mb-2">
            <div className="absolute inset-0 rounded-t-full border-[8px] border-deepblack"></div>
            <div
              className="absolute inset-0 rounded-t-full border-[8px]"
              style={{
                borderColor: gaugeValue > 60 ? '#10B981' : gaugeValue > 40 ? '#F59E0B' : '#EF4444',
                clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`,
              }}
            ></div>
            <div
              className="absolute bottom-0 left-1/2 w-0.5 h-6 bg-offwhite origin-bottom transition-transform duration-1000"
              style={{ transform: `translateX(-50%) rotate(${gaugeAngle}deg)` }}
            ></div>
          </div>
          <div className={`text-2xl font-mono font-bold ${gaugeValue > 60 ? 'text-emerald' : gaugeValue > 40 ? 'text-amber-400' : 'text-crimson'}`}>{gaugeValue}</div>
          <div className="text-xs font-mono text-slategray mt-1">{gaugeLabel}</div>
        </div>
      </div>

      {/* Top Movers */}
      <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CandlestickIcon size={18} className="text-emerald" />
          <h3 className="text-sm font-medium text-offwhite">Top Movers</h3>
        </div>
        <div className="space-y-3">
          {defaultMovers.map((m) => (
            <div key={m.symbol} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono font-medium text-offwhite">{m.symbol}</span>
                <span className="text-xs font-mono text-slategray">{m.volume}</span>
              </div>
              <span className={`text-xs font-mono flex items-center gap-1 ${m.up ? 'text-emerald' : 'text-crimson'}`}>
                {m.up ? <TrendUpIcon size={12} /> : <TrendDownIcon size={12} />}
                {m.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
