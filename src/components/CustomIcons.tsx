import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const SigmaIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 6h16L8 12l8 6H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TrendUpIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M2 14l5-5 3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 6h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TrendDownIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M2 6l5 5 3-3 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 14h4v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const HexagonIcon: React.FC<IconProps & { status?: 'active' | 'pending' | 'inactive' }> = ({ 
  className = '', size = 16, status = 'active' 
}) => {
  const colors = {
    active: '#10B981',
    pending: '#F59E0B',
    inactive: '#6B7280',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path 
        d="M8 1l6.5 3.75v6.5L8 15 1.5 11.25v-6.5L8 1z" 
        fill={colors[status]} 
        fillOpacity="0.15"
        stroke={colors[status]} 
        strokeWidth="1"
      />
    </svg>
  );
};

export const CandlestickIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M7 2v2M7 16v2M13 4v2M13 14v2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <rect x="5" y="4" width="4" height="12" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none" />
    <rect x="11" y="6" width="4" height="8" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none" />
  </svg>
);

export const MarketPulseIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M1 10h3l2-6 3 12 3-8 2 2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const GlobeIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
    <ellipse cx="10" cy="10" rx="3" ry="7" stroke="currentColor" strokeWidth="1" />
    <path d="M3 10h14" stroke="currentColor" strokeWidth="1" />
  </svg>
);

export const CalculatorIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 6h6M7 10h2M11 10h2M7 14h2M11 14h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

export const FilterIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M2 5h16M5 5v3a3 3 0 006 0V5M9 8v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChartBarIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M2 18V10M7 18V6M12 18V2M17 18v-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const PieChartIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 3a7 7 0 007 7H10V3z" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const BellIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M4 8a6 6 0 0112 0v3l2 2H2l2-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M8 17a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowRightIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M4 10h12M12 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowUpRightIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
    <path d="M4 12l8-8M6 4h8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const BookOpenIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M2 5a3 3 0 013-3h4v12H5a3 3 0 01-3-3V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M18 5a3 3 0 00-3-3h-4v12h4a3 3 0 003-3V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

export const ZapIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M11 2L3 11h6l-2 7 10-9h-6l2-7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const LayerStackIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M2 6l8 4 8-4M2 10l8 4 8-4M2 14l8 4 8-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CpuIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <rect x="5" y="5" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 8h4v4H8z" stroke="currentColor" strokeWidth="1" />
    <path d="M5 3v2M10 3v2M15 3v2M5 15v2M10 15v2M15 15v2M3 5h2M3 10h2M3 15h2M15 5h2M15 10h2M15 15h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

export const DatabaseIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <ellipse cx="10" cy="4" rx="7" ry="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 4v8c0 1.66 3.13 3 7 3s7-1.34 7-3V4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 8c0 1.66 3.13 3 7 3s7-1.34 7-3" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M10 2L3 5v4.5a9 9 0 007 8.5 9 9 0 007-8.5V5l-7-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M14 14l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const MenuIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const XIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M16 10H4M8 6l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ShareIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <circle cx="15" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="5" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="15" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7.5 11l5 2.5M7.5 9l5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const BookmarkIcon: React.FC<IconProps> = ({ className = '', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
    <path d="M4 3a1 1 0 011-1h10a1 1 0 011 1v15l-6-3.5L4 18V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);
