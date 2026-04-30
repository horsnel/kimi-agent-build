'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface IndicatorData {
  name: string;
  consensus: number;
  actual: number;
  surprise: number;
  beat: boolean;
}

const indicators: IndicatorData[] = [
  { name: 'CPI', consensus: 3.1, actual: 3.4, surprise: ((3.4 - 3.1) / 3.1 * 100), beat: true },
  { name: 'NFP', consensus: 180, actual: 210, surprise: ((210 - 180) / 180 * 100), beat: true },
  { name: 'GDP', consensus: 2.0, actual: 2.3, surprise: ((2.3 - 2.0) / 2.0 * 100), beat: true },
  { name: 'PMI', consensus: 52.0, actual: 51.2, surprise: ((51.2 - 52.0) / 52.0 * 100), beat: false },
  { name: 'Retail', consensus: 0.5, actual: 0.8, surprise: ((0.8 - 0.5) / 0.5 * 100), beat: true },
  { name: 'Durable', consensus: -1.0, actual: -0.5, surprise: ((-0.5 - (-1.0)) / Math.abs(-1.0) * 100), beat: true },
  { name: 'Housing', consensus: 1.3, actual: 1.1, surprise: ((1.1 - 1.3) / 1.3 * 100), beat: false },
  { name: 'Claims', consensus: 220, actual: 235, surprise: ((235 - 220) / 220 * 100), beat: false },
];

// For chart data, we need normalized values so they fit on the same scale
// We'll use separate bars for consensus and actual with the raw values
const chartData = indicators.map((ind) => ({
  name: ind.name,
  consensus: ind.consensus,
  actual: ind.actual,
  beat: ind.beat,
  surprise: ind.surprise,
}));

const CITI_ESI = +28.5;

export default function EconomicSurpriseIndex() {
  return (
    <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-medium text-offwhite">Economic Surprise Index</h3>
          <p className="text-xs font-mono text-slategray mt-1">Consensus vs Actual</p>
        </div>
        <div className="flex items-center gap-2 bg-deepblack border border-subtleborder rounded-lg px-4 py-2">
          <span className="text-xs font-mono text-slategray">Citi ESI</span>
          <span className="text-lg font-mono font-bold text-emerald">+{CITI_ESI}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: '#222222' }}
              tickLine={{ stroke: '#222222' }}
            />
            <YAxis
              tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: '#222222' }}
              tickLine={{ stroke: '#222222' }}
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
              formatter={(value: number, name: string) => {
                const label = name === 'consensus' ? 'Consensus' : 'Actual';
                return [value, label];
              }}
            />
            <Bar dataKey="consensus" fill="#6B7280" radius={[4, 4, 0, 0]} name="consensus" opacity={0.6} />
            <Bar dataKey="actual" radius={[4, 4, 0, 0]} name="actual">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.beat ? '#10B981' : '#EF4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Surprise Indicators */}
      <div className="mt-4 pt-4 border-t border-subtleborder">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {indicators.map((ind) => (
            <div key={ind.name} className="bg-deepblack border border-subtleborder rounded-lg p-3 text-center">
              <div className="text-xs font-mono text-slategray">{ind.name}</div>
              <div className={`text-sm font-mono font-bold mt-1 ${ind.beat ? 'text-emerald' : 'text-crimson'}`}>
                {ind.beat ? '+' : ''}{ind.surprise.toFixed(1)}%
              </div>
              <div className="text-[10px] font-mono text-slategray mt-0.5">
                {ind.beat ? 'Beat' : 'Miss'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-subtleborder">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#6B7280', opacity: 0.6 }} />
          <span className="text-xs font-mono text-slategray">Consensus</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-emerald" />
          <span className="text-xs font-mono text-slategray">Beat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-crimson" />
          <span className="text-xs font-mono text-slategray">Miss</span>
        </div>
      </div>
    </div>
  );
}
