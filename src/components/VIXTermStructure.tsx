'use client';

import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TermPoint {
  month: string;
  current: number;
  previous: number;
}

const currentData: number[] = [14.2, 15.1, 15.8, 16.2, 16.5, 16.8, 17.0];
const previousData: number[] = [15.5, 16.0, 16.3, 16.5, 16.7, 16.9, 17.1];
const months = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'];

const termStructureData: TermPoint[] = months.map((month, i) => ({
  month,
  current: currentData[i],
  previous: previousData[i],
}));

const VIX_SPOT = 14.2;

type ViewMode = 'contango' | 'backwardation';

export default function VIXTermStructure() {
  const [viewMode, setViewMode] = useState<ViewMode>('contango');

  const isContango = useMemo(() => {
    return currentData[0] < currentData[currentData.length - 1];
  }, []);

  const displayData = useMemo(() => {
    if (viewMode === 'contango') return termStructureData;
    // Backwardation view: invert the curve
    return months.map((month, i) => ({
      month,
      current: currentData[6 - i],
      previous: previousData[6 - i],
    }));
  }, [viewMode]);

  const statusLabel = viewMode === 'contango' ? 'Contango' : 'Backwardation';
  const statusColor = viewMode === 'contango' ? 'text-emerald' : 'text-crimson';
  const statusBg = viewMode === 'contango' ? 'bg-emerald/20' : 'bg-crimson/20';

  return (
    <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-medium text-offwhite">VIX Term Structure</h3>
          <p className="text-xs font-mono text-slategray mt-1">Futures curve M1–M7</p>
        </div>
        <span className={`${statusBg} ${statusColor} text-xs font-mono font-medium px-3 py-1 rounded-full`}>
          {statusLabel}
        </span>
      </div>

      {/* VIX Spot Price */}
      <div className="flex items-end gap-3 mb-6">
        <span className="text-4xl font-display font-light text-offwhite tracking-tight">{VIX_SPOT}</span>
        <span className="text-sm font-mono text-slategray mb-1">VIX Spot</span>
      </div>

      {/* Toggle */}
      <div className="flex gap-1 bg-deepblack rounded-lg p-1 border border-subtleborder mb-6 w-fit">
        <button
          onClick={() => setViewMode('contango')}
          className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
            viewMode === 'contango'
              ? 'bg-emerald text-obsidian font-medium'
              : 'text-slategray hover:text-offwhite'
          }`}
        >
          Contango
        </button>
        <button
          onClick={() => setViewMode('backwardation')}
          className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
            viewMode === 'backwardation'
              ? 'bg-crimson text-obsidian font-medium'
              : 'text-slategray hover:text-offwhite'
          }`}
        >
          Backwardation
        </button>
      </div>

      {/* Chart */}
      <div className="h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: '#222222' }}
              tickLine={{ stroke: '#222222' }}
            />
            <YAxis
              domain={[12, 19]}
              tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'JetBrains Mono' }}
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
            />
            <Line
              type="monotone"
              dataKey="previous"
              stroke="#6B7280"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={{ r: 3, fill: '#6B7280', stroke: '#111111', strokeWidth: 1.5 }}
              name="1 Week Ago"
              animationDuration={500}
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke="#10B981"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#10B981', stroke: '#111111', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#10B981', stroke: '#E8E8E6', strokeWidth: 2 }}
              name="Current"
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-subtleborder">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-emerald rounded" />
          <span className="text-xs font-mono text-slategray">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-slategray rounded" style={{ borderStyle: 'dashed' }} />
          <span className="text-xs font-mono text-slategray">1 Week Ago</span>
        </div>
      </div>
    </div>
  );
}
