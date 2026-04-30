'use client';

import { useState } from 'react';

const commodities = ['Gold', 'Silver', 'Oil', 'Nat Gas', 'Copper', 'Wheat', 'Corn', 'Soybeans'];

// Correlation matrix (symmetric, diagonal = 1.0)
const correlationMatrix: number[][] = [
  // Gold   Silver  Oil    NatGas  Copper  Wheat   Corn    Soybeans
  [1.00,  0.85,  0.15,  0.05,  0.30, -0.10, -0.08,  0.05],  // Gold
  [0.85,  1.00,  0.20,  0.08,  0.35, -0.05, -0.03,  0.10],  // Silver
  [0.15,  0.20,  1.00,  0.70,  0.45,  0.15,  0.10,  0.20],  // Oil
  [0.05,  0.08,  0.70,  1.00,  0.25,  0.12,  0.08,  0.05],  // Nat Gas
  [0.30,  0.35,  0.45,  0.25,  1.00,  0.10,  0.05,  0.15],  // Copper
  [-0.10,-0.05,  0.15,  0.12,  0.10,  1.00,  0.75,  0.60],  // Wheat
  [-0.08,-0.03,  0.10,  0.08,  0.05,  0.75,  1.00,  0.65],  // Corn
  [0.05,  0.10,  0.20,  0.05,  0.15,  0.60,  0.65,  1.00],  // Soybeans
];

function getCellColor(value: number): string {
  if (value > 0) return '#10B981';
  if (value < 0) return '#EF4444';
  return '#6B7280';
}

function getCellOpacity(value: number): number {
  const absVal = Math.abs(value);
  return 0.3 + absVal * 0.7; // 0.3 to 1.0
}

interface TooltipInfo {
  row: string;
  col: string;
  value: number;
  x: number;
  y: number;
}

export default function CommodityCorrelation() {
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);

  const handleMouseEnter = (rowIdx: number, colIdx: number, e: React.MouseEvent) => {
    setTooltip({
      row: commodities[rowIdx],
      col: commodities[colIdx],
      value: correlationMatrix[rowIdx][colIdx],
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-sm font-medium text-offwhite">Commodity Correlation Matrix</h3>
        <p className="text-xs font-mono text-slategray mt-1">Rolling 90-day Pearson correlation</p>
      </div>

      <div className="overflow-x-auto">
        <div className="relative min-w-[480px]">
          {/* Column headers */}
          <div className="grid grid-cols-9 gap-0.5 mb-0.5 pl-20">
            {commodities.map((c) => (
              <div key={c} className="text-center text-[10px] font-mono text-slategray truncate px-0.5">
                {c}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {commodities.map((rowName, rowIdx) => (
            <div key={rowName} className="grid grid-cols-9 gap-0.5 mb-0.5 pl-20 relative">
              {/* Row label - absolute positioned */}
              {commodities.map((_colName, colIdx) => {
                const value = correlationMatrix[rowIdx][colIdx];
                const color = getCellColor(value);
                const opacity = getCellOpacity(value);
                const isDiagonal = rowIdx === colIdx;

                return (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className="aspect-square rounded-sm flex items-center justify-center cursor-crosshair transition-transform hover:scale-110 hover:z-10"
                    style={{
                      backgroundColor: isDiagonal ? '#222222' : color,
                      opacity: isDiagonal ? 1 : opacity,
                    }}
                    onMouseEnter={(e) => handleMouseEnter(rowIdx, colIdx, e)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <span className="text-[9px] font-mono text-offwhite font-medium select-none">
                      {value.toFixed(2)}
                    </span>
                  </div>
                );
              })}
              {/* Row label overlay */}
              <div className="absolute left-0 top-0 h-full w-20 flex items-center pr-2">
                <span className="text-[10px] font-mono text-slategray truncate">{rowName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="absolute z-50 bg-deepblack border border-subtleborder rounded-lg px-3 py-2 pointer-events-none shadow-lg"
          style={{ position: 'fixed' }}
        >
          <div className="text-xs font-mono text-offwhite font-medium">{tooltip.row} ↔ {tooltip.col}</div>
          <div className={`text-sm font-mono font-bold ${tooltip.value > 0 ? 'text-emerald' : tooltip.value < 0 ? 'text-crimson' : 'text-slategray'}`}>
            {tooltip.value > 0 ? '+' : ''}{tooltip.value.toFixed(2)}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-subtleborder">
        <div className="flex items-center gap-2">
          <div className="w-8 h-3 rounded-sm" style={{ backgroundColor: '#EF4444', opacity: 0.8 }} />
          <span className="text-xs font-mono text-slategray">Negative</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-3 rounded-sm" style={{ backgroundColor: '#6B7280', opacity: 0.3 }} />
          <span className="text-xs font-mono text-slategray">Neutral</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-3 rounded-sm" style={{ backgroundColor: '#10B981', opacity: 0.8 }} />
          <span className="text-xs font-mono text-slategray">Positive</span>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className="text-[10px] font-mono text-slategray">Opacity = Magnitude</span>
        </div>
      </div>
    </div>
  );
}
