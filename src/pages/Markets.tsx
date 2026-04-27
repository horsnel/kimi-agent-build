import { useState, useEffect, useRef } from 'react';
import React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TickerTape from '../components/TickerTape';
import DashboardTable from '../components/DashboardTable';
import { TrendUpIcon, TrendDownIcon, PieChartIcon, FilterIcon } from '../components/CustomIcons';
import { Treemap, ResponsiveContainer } from 'recharts';

interface MarketTreemapCellProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
}

const MarketTreemapCell: React.FC<MarketTreemapCellProps> = ({ x = 0, y = 0, width = 0, height = 0, index = 0 }) => {
  const item = sectorBreakdown[index];
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={item?.up ? '#10B981' : '#EF4444'} stroke="#111111" strokeWidth={2} rx={4} fillOpacity={0.85} />
      {width > 60 && height > 40 && (
        <>
          <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={13} fontWeight={500} fontFamily="JetBrains Mono">
            {item?.name}
          </text>
          <text x={x + width / 2} y={y + height / 2 + 12} textAnchor="middle" fill="#fff" fontSize={11} fontFamily="JetBrains Mono">
            {item?.change}
          </text>
        </>
      )}
    </g>
  );
};

gsap.registerPlugin(ScrollTrigger);

const sectorBreakdown = [
  { name: 'Technology', size: 32, change: '+1.8%', up: true },
  { name: 'Healthcare', size: 18, change: '+0.4%', up: true },
  { name: 'Finance', size: 14, change: '-0.2%', up: false },
  { name: 'Energy', size: 10, change: '+2.1%', up: true },
  { name: 'Consumer', size: 12, change: '-0.8%', up: false },
  { name: 'Industrials', size: 8, change: '+0.1%', up: true },
  { name: 'Materials', size: 4, change: '-1.2%', up: false },
  { name: 'Utilities', size: 2, change: '+0.3%', up: true },
];

const filterTabs = ['All', 'L1', 'DeFi', 'AI', 'Oracle'];

export default function Markets() {
  const [activeTab, setActiveTab] = useState('All');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.markets-section',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
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
      <TickerTape />

      {/* Header */}
      <section className="markets-section max-w-7xl mx-auto px-6 pt-16 pb-8">
        <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite mb-2">
          Markets
        </h1>
        <p className="text-slategray">Real-time market data and analysis</p>
      </section>

      {/* Heatmap + Breakdown */}
      <section className="markets-section max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Treemap */}
          <div className="lg:col-span-3 bg-charcoal border border-subtleborder rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon size={18} className="text-emerald" />
              <h2 className="text-lg font-medium text-offwhite">Sector Heatmap</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={sectorBreakdown}
                  dataKey="size"
                  aspectRatio={4 / 3}
                  stroke="#111111"
                  fill="#111111"
                  content={<MarketTreemapCell />}
                />
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sector List */}
          <div className="lg:col-span-2 bg-charcoal border border-subtleborder rounded-xl p-6">
            <h2 className="text-lg font-medium text-offwhite mb-6">Sector Breakdown</h2>
            <div className="space-y-4">
              {sectorBreakdown.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-sm ${s.up ? 'bg-emerald' : 'bg-crimson'}`} />
                    <span className="text-sm text-offwhite">{s.name}</span>
                  </div>
                  <span className={`text-sm font-mono flex items-center gap-1 ${s.up ? 'text-emerald' : 'text-crimson'}`}>
                    {s.up ? <TrendUpIcon size={14} /> : <TrendDownIcon size={14} />}
                    {s.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Asset Screener */}
      <section className="markets-section max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-display font-light text-offwhite mb-1">Asset Screener</h2>
            <p className="text-sm text-slategray">Filter and analyze market opportunities</p>
          </div>
          <div className="flex items-center gap-2">
            <FilterIcon size={18} className="text-slategray" />
            <div className="flex bg-charcoal border border-subtleborder rounded-lg p-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                    activeTab === tab
                      ? 'bg-emerald text-obsidian'
                      : 'text-slategray hover:text-offwhite'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-charcoal border border-subtleborder rounded-xl overflow-hidden">
          <DashboardTable filterSector={activeTab === 'All' ? undefined : activeTab} maxRows={12} />
        </div>
      </section>
    </div>
  );
}
