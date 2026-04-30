'use client';

import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface YieldPoint {
  maturity: string;
  yield: number;
}

type YearKey = '2006' | '2007' | '2008' | '2019' | '2020' | '2022' | '2024' | '2026';

const maturities = ['3M', '6M', '1Y', '2Y', '3Y', '5Y', '7Y', '10Y', '20Y', '30Y'];

const yieldData: Record<YearKey, number[]> = {
  '2006': [4.8, 4.9, 4.8, 4.7, 4.7, 4.6, 4.6, 4.5, 4.5, 4.4],
  '2007': [4.5, 4.5, 4.4, 4.3, 4.3, 4.3, 4.4, 4.4, 4.5, 4.5],
  '2008': [3.8, 3.2, 2.6, 2.2, 2.4, 2.8, 3.1, 3.4, 3.9, 4.1],
  '2019': [2.0, 1.9, 1.8, 1.7, 1.7, 1.7, 1.8, 1.9, 2.2, 2.3],
  '2020': [0.1, 0.2, 0.3, 0.4, 0.5, 0.7, 0.9, 1.0, 1.4, 1.5],
  '2022': [4.5, 4.7, 4.9, 4.7, 4.5, 4.2, 4.1, 3.9, 3.8, 3.7],
  '2024': [4.3, 4.4, 4.5, 4.5, 4.4, 4.3, 4.3, 4.2, 4.5, 4.4],
  '2026': [4.1, 4.2, 4.1, 4.0, 4.0, 4.1, 4.2, 4.3, 4.6, 4.5],
};

const years: YearKey[] = ['2006', '2007', '2008', '2019', '2020', '2022', '2024', '2026'];

const yearDescriptions: Record<YearKey, string> = {
  '2006': 'Normal Curve',
  '2007': 'Slightly Flat',
  '2008': 'Inverted',
  '2019': 'Slight Inversion',
  '2020': 'Very Low Rates',
  '2022': 'Steep Rising',
  '2024': 'Normal-ish',
  '2026': 'Current',
};

function buildPoints(values: number[]): YieldPoint[] {
  return maturities.map((m, i) => ({ maturity: m, yield: values[i] }));
}

function interpolate(a: number[], b: number[], t: number): number[] {
  return a.map((v, i) => v + (b[i] - v) * t);
}

export default function YieldCurveAnimator() {
  const [selectedYear, setSelectedYear] = useState<YearKey>('2026');
  const [displayValues, setDisplayValues] = useState<number[]>(yieldData['2026']);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevYear, setPrevYear] = useState<YearKey>('2026');

  const isInverted = displayValues[0] > displayValues[displayValues.length - 1];

  const handleYearChange = useCallback((year: YearKey) => {
    if (year === selectedYear || isAnimating) return;
    setPrevYear(selectedYear);
    setSelectedYear(year);
    setIsAnimating(true);
  }, [selectedYear, isAnimating]);

  useEffect(() => {
    if (!isAnimating) return;

    const startValues = yieldData[prevYear];
    const endValues = yieldData[selectedYear];
    const duration = 800;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      setDisplayValues(interpolate(startValues, endValues, eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [isAnimating, selectedYear, prevYear]);

  const chartData = buildPoints(displayValues);

  return (
    <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-medium text-offwhite">Yield Curve Animator</h3>
          <p className="text-xs font-mono text-slategray mt-1">{yearDescriptions[selectedYear]} — {selectedYear}</p>
        </div>
        {isInverted && (
          <span className="bg-crimson/20 text-crimson text-xs font-mono font-medium px-3 py-1 rounded-full animate-pulse">
            ⚠ Inversion Alert
          </span>
        )}
      </div>

      {/* Year Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => handleYearChange(year)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 ${
              selectedYear === year
                ? 'bg-emerald text-obsidian'
                : 'bg-deepblack text-slategray hover:text-offwhite hover:bg-deepblack/80 border border-subtleborder'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
            <XAxis
              dataKey="maturity"
              tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: '#222222' }}
              tickLine={{ stroke: '#222222' }}
            />
            <YAxis
              domain={[0, 6]}
              tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: '#222222' }}
              tickLine={{ stroke: '#222222' }}
              tickFormatter={(v: number) => `${v}%`}
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
              formatter={(value: number) => [`${value.toFixed(2)}%`, 'Yield']}
            />
            <Line
              type="monotone"
              dataKey="yield"
              stroke="#10B981"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#10B981', stroke: '#111111', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#10B981', stroke: '#E8E8E6', strokeWidth: 2 }}
              animationDuration={0}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Maturity labels */}
      <div className="mt-4 flex justify-between text-xs font-mono text-slategray">
        <span>Short-term</span>
        <span>Long-term</span>
      </div>
    </div>
  );
}
