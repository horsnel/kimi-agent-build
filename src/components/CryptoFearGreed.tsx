'use client';

import { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const CURRENT_VALUE = 64;
const CURRENT_LABEL = 'Greed';

const sparklineData = Array.from({ length: 30 }, (_, i) => {
  const base = 55;
  const wave = Math.sin(i * 0.4) * 12;
  const noise = Math.sin(i * 1.3) * 5;
  return { day: i + 1, value: Math.round(Math.max(15, Math.min(85, base + wave + noise))) };
});

interface ComponentBreakdown {
  label: string;
  value: number;
  color: string;
}

const components: ComponentBreakdown[] = [
  { label: 'Social Media', value: 72, color: '#10B981' },
  { label: 'Volatility', value: 55, color: '#F59E0B' },
  { label: 'Market Momentum', value: 68, color: '#3B82F6' },
  { label: 'Dominance', value: 58, color: '#8B5CF6' },
];

const ZONES = [
  { label: 'Extreme Fear', min: 0, max: 20, color: '#EF4444' },
  { label: 'Fear', min: 20, max: 40, color: '#F97316' },
  { label: 'Neutral', min: 40, max: 60, color: '#F59E0B' },
  { label: 'Greed', min: 60, max: 80, color: '#10B981' },
  { label: 'Extreme Greed', min: 80, max: 100, color: '#34D399' },
];

function getZoneColor(value: number): string {
  for (const zone of ZONES) {
    if (value >= zone.min && value < zone.max) return zone.color;
  }
  return ZONES[ZONES.length - 1].color;
}

export default function CryptoFearGreed() {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [needleAngle, setNeedleAngle] = useState(-90);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate the value counting up
    const duration = 1500;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(eased * CURRENT_VALUE);
      const currentAngle = -90 + eased * (CURRENT_VALUE / 100) * 180;

      setAnimatedValue(currentVal);
      setNeedleAngle(currentAngle);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  // SVG semicircle gauge
  const gaugeWidth = 280;
  const gaugeHeight = 160;
  const centerX = gaugeWidth / 2;
  const centerY = gaugeHeight - 10;
  const radius = 120;

  // Draw arc segments for each zone
  const zoneArcs = ZONES.map((zone) => {
    const startAngle = Math.PI + ((zone.min / 100) * Math.PI);
    const endAngle = Math.PI + ((zone.max / 100) * Math.PI);
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    const largeArc = (zone.max - zone.min) > 50 ? 1 : 0;

    return {
      path: `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      color: zone.color,
      label: zone.label,
    };
  });

  // Inner arc for background
  const innerRadius = radius - 20;
  const zoneInnerArcs = ZONES.map((zone) => {
    const startAngle = Math.PI + ((zone.min / 100) * Math.PI);
    const endAngle = Math.PI + ((zone.max / 100) * Math.PI);
    const x1 = centerX + innerRadius * Math.cos(startAngle);
    const y1 = centerY + innerRadius * Math.sin(startAngle);
    const x2 = centerX + innerRadius * Math.cos(endAngle);
    const y2 = centerY + innerRadius * Math.sin(endAngle);
    const largeArc = (zone.max - zone.min) > 50 ? 1 : 0;

    return {
      path: `M ${x1} ${y1} A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
      color: zone.color,
    };
  });

  // Needle position
  const needleRad = ((needleAngle + 90) / 180) * Math.PI + Math.PI;
  const needleLength = radius - 30;
  const needleX = centerX + needleLength * Math.cos(needleRad);
  const needleY = centerY + needleLength * Math.sin(needleRad);

  const activeColor = getZoneColor(CURRENT_VALUE);

  return (
    <div className="bg-charcoal border border-subtleborder rounded-xl p-6" ref={containerRef}>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-offwhite">Crypto Fear & Greed Index</h3>
        <p className="text-xs font-mono text-slategray mt-1">Market sentiment analysis</p>
      </div>

      {/* Semicircle Gauge */}
      <div className="flex flex-col items-center">
        <svg width={gaugeWidth} height={gaugeHeight} viewBox={`0 0 ${gaugeWidth} ${gaugeHeight}`}>
          {/* Outer arc segments */}
          {zoneArcs.map((arc, i) => (
            <path
              key={`outer-${i}`}
              d={arc.path}
              fill="none"
              stroke={arc.color}
              strokeWidth={20}
              strokeLinecap="butt"
              opacity={0.35}
            />
          ))}

          {/* Inner arc segments (active portion) */}
          {zoneInnerArcs.map((arc, i) => (
            <path
              key={`inner-${i}`}
              d={arc.path}
              fill="none"
              stroke={arc.color}
              strokeWidth={12}
              strokeLinecap="butt"
              opacity={ZONES[i].min < CURRENT_VALUE ? 1 : 0.15}
            />
          ))}

          {/* Needle */}
          <line
            x1={centerX}
            y1={centerY}
            x2={needleX}
            y2={needleY}
            stroke={activeColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            style={{ transition: 'all 0.3s ease-out' }}
          />

          {/* Center dot */}
          <circle cx={centerX} cy={centerY} r={6} fill={activeColor} />
          <circle cx={centerX} cy={centerY} r={3} fill="#111111" />

          {/* Zone labels */}
          {ZONES.map((zone, i) => {
            const midAngle = Math.PI + (((zone.min + zone.max) / 2 / 100) * Math.PI);
            const labelRadius = radius + 18;
            const lx = centerX + labelRadius * Math.cos(midAngle);
            const ly = centerY + labelRadius * Math.sin(midAngle);

            return (
              <text
                key={i}
                x={lx}
                y={ly}
                textAnchor="middle"
                fill="#6B7280"
                fontSize={8}
                fontFamily="JetBrains Mono"
              >
                {zone.label}
              </text>
            );
          })}
        </svg>

        {/* Current Value */}
        <div className="text-center -mt-2">
          <span className="text-4xl font-display font-light text-offwhite tracking-tight">{animatedValue}</span>
          <div className="text-sm font-mono font-medium mt-1" style={{ color: activeColor }}>
            {CURRENT_LABEL}
          </div>
        </div>
      </div>

      {/* 30-Day Sparkline */}
      <div className="mt-6 pt-4 border-t border-subtleborder">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-slategray">30-Day Trend</span>
          <span className="text-xs font-mono text-offwhite">{sparklineData[sparklineData.length - 1].value}</span>
        </div>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Area
                type="monotone"
                dataKey="value"
                stroke={activeColor}
                strokeWidth={1.5}
                fill={activeColor}
                fillOpacity={0.15}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Component Breakdown */}
      <div className="mt-4 pt-4 border-t border-subtleborder">
        <span className="text-xs font-mono text-slategray mb-3 block">Component Breakdown</span>
        <div className="space-y-3">
          {components.map((comp) => (
            <div key={comp.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-slategray">{comp.label}</span>
                <span className="text-xs font-mono text-offwhite">{comp.value}</span>
              </div>
              <div className="h-1.5 bg-deepblack rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${comp.value}%`, backgroundColor: comp.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
