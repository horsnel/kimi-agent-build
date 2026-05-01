'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useGeoCurrency } from '../hooks/useGeoCurrency';

type ViewMode = 'flowmap' | 'netflows';

interface AssetFlow {
  name: string;
  inflow: number;
  outflow: number;
  netFlow: number;
  color: string;
}

const assetFlows: AssetFlow[] = [
  { name: 'Equities', inflow: 12.4, outflow: 0, netFlow: 12.4, color: '#10B981' },
  { name: 'Bonds', inflow: 3.2, outflow: 0, netFlow: 3.2, color: '#3B82F6' },
  { name: 'Crypto', inflow: 0, outflow: 1.8, netFlow: -1.8, color: '#F59E0B' },
  { name: 'Commodities', inflow: 0, outflow: 0.5, netFlow: -0.5, color: '#EF4444' },
  { name: 'Cash', inflow: 2.1, outflow: 0, netFlow: 2.1, color: '#8B5CF6' },
];

const totalInflow = assetFlows.reduce((sum, a) => sum + a.inflow, 0);
const totalOutflow = assetFlows.reduce((sum, a) => sum + a.outflow, 0);
const netFlow = totalInflow - totalOutflow;

// Flow connections for Sankey-style diagram
interface FlowConnection {
  from: number;
  to: number;
  amount: number;
}

const flowConnections: FlowConnection[] = [
  { from: 0, to: 4, amount: 3.2 },  // Equities -> Cash
  { from: 4, to: 1, amount: 1.5 },  // Cash -> Bonds
  { from: 2, to: 0, amount: 2.8 },  // Crypto -> Equities
  { from: 3, to: 0, amount: 1.1 },  // Commodities -> Equities
  { from: 2, to: 4, amount: 1.0 },  // Crypto -> Cash
  { from: 1, to: 0, amount: 0.8 },  // Bonds -> Equities
];

const assetBoxPositions = [
  { x: 40, y: 30 },   // Equities (left)
  { x: 40, y: 120 },  // Bonds
  { x: 220, y: 75 },  // Crypto (right)
  { x: 220, y: 165 }, // Commodities
  { x: 130, y: 210 }, // Cash (bottom center)
];

const boxWidth = 100;
const boxHeight = 40;

function generateCurvedPath(
  x1: number, y1: number,
  x2: number, y2: number
): string {
  const midX = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
}

const netFlowsChartData = assetFlows.map((a) => ({
  name: a.name,
  value: a.netFlow,
  isPositive: a.netFlow >= 0,
}));

export default function FlowDiagram() {
  const { formatChartTick, formatLarge } = useGeoCurrency();
  const [viewMode, setViewMode] = useState<ViewMode>('flowmap');

  return (
    <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-medium text-offwhite">Capital Flow Diagram</h3>
          <p className="text-xs font-mono text-slategray mt-1">Inter-asset class flow analysis</p>
        </div>
        <div className="flex gap-1 bg-deepblack rounded-lg p-1 border border-subtleborder">
          <button
            onClick={() => setViewMode('flowmap')}
            className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
              viewMode === 'flowmap'
                ? 'bg-emerald text-obsidian font-medium'
                : 'text-slategray hover:text-offwhite'
            }`}
          >
            Flow Map
          </button>
          <button
            onClick={() => setViewMode('netflows')}
            className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
              viewMode === 'netflows'
                ? 'bg-emerald text-obsidian font-medium'
                : 'text-slategray hover:text-offwhite'
            }`}
          >
            Net Flows
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-deepblack border border-subtleborder rounded-lg p-3 text-center">
          <div className="text-xs font-mono text-slategray mb-1">Total Inflow</div>
          <div className="text-lg font-mono font-bold text-emerald">{formatLarge(totalInflow * 1e9)}</div>
        </div>
        <div className="bg-deepblack border border-subtleborder rounded-lg p-3 text-center">
          <div className="text-xs font-mono text-slategray mb-1">Total Outflow</div>
          <div className="text-lg font-mono font-bold text-crimson">{formatLarge(totalOutflow * 1e9)}</div>
        </div>
        <div className="bg-deepblack border border-subtleborder rounded-lg p-3 text-center">
          <div className="text-xs font-mono text-slategray mb-1">Net Flow</div>
          <div className={`text-lg font-mono font-bold ${netFlow >= 0 ? 'text-emerald' : 'text-crimson'}`}>
            {netFlow >= 0 ? '+' : ''}{formatLarge(netFlow * 1e9)}
          </div>
        </div>
      </div>

      {viewMode === 'flowmap' ? (
        /* Flow Map View - SVG Sankey-style */
        <div className="flex justify-center">
          <svg viewBox="0 0 360 280" className="w-full max-w-lg" style={{ minHeight: '280px' }}>
            {/* Flow lines */}
            {flowConnections.map((conn, i) => {
              const fromPos = assetBoxPositions[conn.from];
              const toPos = assetBoxPositions[conn.to];
              const maxAmount = 3.2;
              const thickness = Math.max(1, (conn.amount / maxAmount) * 10);

              const x1 = fromPos.x + boxWidth;
              const y1 = fromPos.y + boxHeight / 2;
              const x2 = toPos.x;
              const y2 = toPos.y + boxHeight / 2;

              return (
                <g key={i}>
                  <path
                    d={generateCurvedPath(x1, y1, x2, y2)}
                    fill="none"
                    stroke={assetFlows[conn.from].color}
                    strokeWidth={thickness}
                    opacity={0.4}
                  />
                  {/* Flow amount label at midpoint */}
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 6}
                    textAnchor="middle"
                    fill="#6B7280"
                    fontSize={8}
                    fontFamily="JetBrains Mono"
                  >
                    {formatLarge(conn.amount * 1e9)}
                  </text>
                </g>
              );
            })}

            {/* Asset class boxes */}
            {assetFlows.map((asset, i) => {
              const pos = assetBoxPositions[i];
              return (
                <g key={asset.name}>
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={boxWidth}
                    height={boxHeight}
                    rx={6}
                    fill="#111111"
                    stroke={asset.color}
                    strokeWidth={1.5}
                  />
                  <text
                    x={pos.x + boxWidth / 2}
                    y={pos.y + 16}
                    textAnchor="middle"
                    fill="#E8E8E6"
                    fontSize={10}
                    fontFamily="JetBrains Mono"
                    fontWeight="600"
                  >
                    {asset.name}
                  </text>
                  <text
                    x={pos.x + boxWidth / 2}
                    y={pos.y + 30}
                    textAnchor="middle"
                    fill={asset.netFlow >= 0 ? '#10B981' : '#EF4444'}
                    fontSize={9}
                    fontFamily="JetBrains Mono"
                  >
                    {asset.netFlow >= 0 ? '+' : ''}{formatLarge(asset.netFlow * 1e9)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        /* Net Flows View - Horizontal BarChart */
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={netFlowsChartData}
              layout="vertical"
              margin={{ top: 5, right: 40, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#222222" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#222222' }}
                tickLine={{ stroke: '#222222' }}
                tickFormatter={(v: number) => formatChartTick(v * 1e9)}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#E8E8E6', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                axisLine={{ stroke: '#222222' }}
                tickLine={{ stroke: '#222222' }}
                width={75}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111111',
                  border: '1px solid #222222',
                  borderRadius: '8px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: 12,
                }}
                labelStyle={{ color: '#E8E8E6' }}
                formatter={(value: number) => [`${value >= 0 ? '+' : ''}${formatChartTick(value * 1e9)}`, 'Net Flow']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={800}>
                {netFlowsChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isPositive ? '#10B981' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Asset class color legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-subtleborder flex-wrap">
        {assetFlows.map((asset) => (
          <div key={asset.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: asset.color }} />
            <span className="text-[10px] font-mono text-slategray">{asset.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
