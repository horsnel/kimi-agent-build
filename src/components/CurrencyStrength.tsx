'use client';

import { useState, useMemo } from 'react';

interface CurrencyData {
  code: string;
  name: string;
  strength: number;
  change: number;
}

const currencies: CurrencyData[] = [
  { code: 'USD', name: 'US Dollar', strength: 78, change: 0.3 },
  { code: 'EUR', name: 'Euro', strength: 62, change: -0.2 },
  { code: 'GBP', name: 'British Pound', strength: 55, change: 0.5 },
  { code: 'JPY', name: 'Japanese Yen', strength: 35, change: -0.8 },
  { code: 'CHF', name: 'Swiss Franc', strength: 58, change: 0.1 },
  { code: 'CAD', name: 'Canadian Dollar', strength: 48, change: -0.4 },
  { code: 'AUD', name: 'Australian Dollar', strength: 42, change: 0.6 },
  { code: 'NZD', name: 'New Zealand Dollar', strength: 38, change: -0.3 },
];

type SortMode = 'strength' | 'change';

function getBarBgClass(strength: number): string {
  if (strength > 60) return 'bg-emerald';
  if (strength >= 40) return 'bg-amber-500';
  return 'bg-crimson';
}

function getTextColorClass(strength: number): string {
  if (strength > 60) return 'text-emerald';
  if (strength >= 40) return 'text-amber-500';
  return 'text-crimson';
}

export default function CurrencyStrength() {
  const [sortMode, setSortMode] = useState<SortMode>('strength');

  const sortedCurrencies = useMemo(() => {
    const sorted = [...currencies];
    if (sortMode === 'strength') {
      sorted.sort((a, b) => b.strength - a.strength);
    } else {
      sorted.sort((a, b) => b.change - a.change);
    }
    return sorted;
  }, [sortMode]);

  return (
    <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-medium text-offwhite">Currency Strength Meter</h3>
          <p className="text-xs font-mono text-slategray mt-1">Relative strength index (0-100)</p>
        </div>
        <div className="flex gap-1 bg-deepblack rounded-lg p-1 border border-subtleborder">
          <button
            onClick={() => setSortMode('strength')}
            className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
              sortMode === 'strength'
                ? 'bg-emerald text-obsidian font-medium'
                : 'text-slategray hover:text-offwhite'
            }`}
          >
            Strength
          </button>
          <button
            onClick={() => setSortMode('change')}
            className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
              sortMode === 'change'
                ? 'bg-emerald text-obsidian font-medium'
                : 'text-slategray hover:text-offwhite'
            }`}
          >
            24h Change
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {sortedCurrencies.map((currency) => (
          <div key={currency.code} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono font-medium text-offwhite w-8">{currency.code}</span>
                <span className="text-xs font-mono text-slategray hidden sm:inline">{currency.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-mono font-medium ${getTextColorClass(currency.strength)}`}>
                  {currency.strength}
                </span>
                <span className={`text-xs font-mono flex items-center gap-0.5 ${
                  currency.change >= 0 ? 'text-emerald' : 'text-crimson'
                }`}>
                  {currency.change >= 0 ? '▲' : '▼'}
                  {currency.change >= 0 ? '+' : ''}{currency.change.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="h-2 bg-deepblack rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${getBarBgClass(currency.strength)}`}
                style={{ width: `${currency.strength}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-subtleborder">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-emerald" />
          <span className="text-xs font-mono text-slategray">Strong (&gt;60)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-amber-500" />
          <span className="text-xs font-mono text-slategray">Moderate (40-60)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-crimson" />
          <span className="text-xs font-mono text-slategray">Weak (&lt;40)</span>
        </div>
      </div>
    </div>
  );
}
