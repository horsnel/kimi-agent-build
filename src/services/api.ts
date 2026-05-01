/**
 * Sigma Capital — Frontend API Service Layer
 *
 * Typed fetch functions with mock fallbacks so the site works standalone.
 * All data types, 16+ fetch functions, comprehensive mock data, and the useApi hook.
 */

import { useState, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  sparkline: number[];
}

export interface StockScreenerResult {
  ticker: string;
  company: string;
  price: number;
  change: number;
  marketCap: string;
  marketCapCategory: 'Mega' | 'Large' | 'Mid' | 'Small';
  pe: number;
  dividendYield: number;
  volume: string;
  sector: string;
}

export interface StockPricePoint {
  date: string;
  price: number;
}

export interface StockEarnings {
  quarter: string;
  actual: number;
  estimate: number;
}

export interface StockDetail {
  ticker: string;
  company: string;
  price: number;
  change: number;
  marketCap: string;
  pe: number;
  eps: number;
  beta: number;
  open: number;
  high: number;
  low: number;
  volume: string;
  avgVolume: string;
  dividend: number;
  week52Low: number;
  week52High: number;
  earnings: StockEarnings[];
  analystBuy: number;
  analystHold: number;
  analystSell: number;
  news: { headline: string; date: string; source: string }[];
  priceHistory: StockPricePoint[];
  recommendation: string;
}

export interface CryptoAsset {
  rank: number;
  name: string;
  ticker: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: string;
  volume24h: string;
  sparkline: number[];
  sector: string;
}

export interface CryptoOnChainData {
  btcPrice: string;
  marketCap: string;
  volume24h: string;
  activeAddresses: string;
  exchangeFlows: { day: string; flow: number }[];
  whaleTransactions: {
    time: string;
    from: string;
    to: string;
    amount: number;
    value: number;
    type: string;
  }[];
  onChainIndicators: {
    name: string;
    value: number;
    badge: string;
    badgeColor: string;
    explanation: string;
  }[];
  activeAddressesData: { day: string; addresses: number }[];
}

export interface YieldCurveData {
  maturity: string;
  yield: number;
}

export interface EconomicEvent {
  id: number;
  date: string;
  time: string;
  event: string;
  country: string;
  flag: string;
  importance: 'High' | 'Medium' | 'Low';
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  isPast: boolean;
}

export interface FearGreedData {
  currentValue: number;
  currentLabel: string;
  oneWeekAgo: number;
  oneMonthAgo: number;
  oneYearAgo: number;
  components: { label: string; value: number }[];
}

export interface CryptoFearGreedData {
  currentValue: number;
  currentLabel: string;
  history: { day: number; value: number }[];
  components: { label: string; value: number; color: string }[];
}

export interface NewsArticle {
  id: number;
  headline: string;
  excerpt: string;
  date: string;
  author: string;
  category: 'Market Analysis' | 'Economic Data' | 'Earnings' | 'Fed Policy' | 'Crypto';
  featured?: boolean;
  source: string;
}

export interface InsiderFiling {
  date: string;
  insider: string;
  title: string;
  company: string;
  transaction: 'Purchase' | 'Sale';
  shares: number;
  price: number;
  totalValue: number;
}

export interface IpoData {
  upcoming: {
    company: string;
    date: string;
    valuation: number;
    underwriters: string;
    sector: string;
    risk: 'Low' | 'Medium' | 'High';
  }[];
  recent: {
    company: string;
    ipoPrice: number;
    currentPrice: number;
    returnPct: number;
  }[];
  spacs: {
    name: string;
    ticker: string;
    status: string;
    target: string;
    trust: string;
  }[];
}

export interface EarningsCompany {
  ticker: string;
  name: string;
  epsHistory: { quarter: string; estimate: number; actual: number }[];
  whisperNumber: number;
  consensusEPS: number;
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  beatRate: number;
}

export interface CommodityData {
  commodities: {
    name: string;
    price: number;
    change: number;
    unit: string;
  }[];
  correlationMatrix: number[][];
  commodityNames: string[];
}

export interface CurrencyData {
  code: string;
  name: string;
  strength: number;
  change: number;
}

export interface DataManifest {
  lastUpdated: string | null;
  scrapers: Record<string, { status: string; timestamp: string; duration: string; error?: string }>;
  status: string;
  runType: string | null;
}

export interface HedgeFundData {
  name: string;
  aum: string;
  holdings: number;
  topHolding: string;
  positions: {
    stock: string;
    shares: string;
    value: number;
    pct: number;
    change: string;
  }[];
  sectors: { name: string; value: number }[];
  notableMoves: { title: string; detail: string; badge: string }[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════

const MOCK_MARKET_INDICES: MarketIndex[] = [
  {
    symbol: 'SPX',
    name: 'S&P 500',
    value: 5412.8,
    change: 66.35,
    changePercent: 1.24,
    sparkline: [5310, 5325, 5298, 5340, 5355, 5330, 5368, 5380, 5350, 5375, 5395, 5360, 5388, 5412],
  },
  {
    symbol: 'NDX',
    name: 'NASDAQ',
    value: 21340.8,
    change: -42.68,
    changePercent: -0.2,
    sparkline: [21450, 21420, 21380, 21400, 21350, 21370, 21320, 21360, 21330, 21350, 21380, 21340],
  },
  {
    symbol: 'DJI',
    name: 'DOW',
    value: 43120.5,
    change: 129.36,
    changePercent: 0.3,
    sparkline: [42900, 42950, 42920, 42980, 43020, 43050, 43000, 43040, 43080, 43120],
  },
  {
    symbol: 'VIX',
    name: 'VIX',
    value: 14.2,
    change: -0.45,
    changePercent: -3.1,
    sparkline: [15.2, 15.0, 14.8, 15.1, 14.6, 14.5, 14.8, 14.3, 14.5, 14.2],
  },
];

const MOCK_STOCK_SCREENER: StockScreenerResult[] = [
  { ticker: 'AAPL', company: 'Apple Inc.', price: 227.63, change: 1.24, marketCap: '$3.52T', marketCapCategory: 'Mega', pe: 37.2, dividendYield: 0.5, volume: '52.3M', sector: 'Technology' },
  { ticker: 'MSFT', company: 'Microsoft Corp.', price: 415.56, change: 0.87, marketCap: '$3.09T', marketCapCategory: 'Mega', pe: 35.8, dividendYield: 0.7, volume: '22.1M', sector: 'Technology' },
  { ticker: 'GOOGL', company: 'Alphabet Inc.', price: 174.82, change: -0.32, marketCap: '$2.16T', marketCapCategory: 'Mega', pe: 24.1, dividendYield: 0.0, volume: '28.9M', sector: 'Technology' },
  { ticker: 'AMZN', company: 'Amazon.com Inc.', price: 205.74, change: 1.85, marketCap: '$2.14T', marketCapCategory: 'Mega', pe: 62.4, dividendYield: 0.0, volume: '48.7M', sector: 'Consumer' },
  { ticker: 'NVDA', company: 'NVIDIA Corp.', price: 875.28, change: 3.42, marketCap: '$2.16T', marketCapCategory: 'Mega', pe: 68.3, dividendYield: 0.02, volume: '41.5M', sector: 'Technology' },
  { ticker: 'META', company: 'Meta Platforms Inc.', price: 505.95, change: -0.56, marketCap: '$1.29T', marketCapCategory: 'Mega', pe: 27.9, dividendYield: 0.4, volume: '18.3M', sector: 'Technology' },
  { ticker: 'TSLA', company: 'Tesla Inc.', price: 188.13, change: -2.18, marketCap: '$599B', marketCapCategory: 'Mega', pe: 44.6, dividendYield: 0.0, volume: '112.7M', sector: 'Consumer' },
  { ticker: 'JPM', company: 'JPMorgan Chase & Co.', price: 198.47, change: 0.64, marketCap: '$572B', marketCapCategory: 'Mega', pe: 12.1, dividendYield: 2.3, volume: '9.8M', sector: 'Finance' },
  { ticker: 'V', company: 'Visa Inc.', price: 280.31, change: 0.42, marketCap: '$574B', marketCapCategory: 'Mega', pe: 31.2, dividendYield: 0.7, volume: '6.5M', sector: 'Finance' },
  { ticker: 'JNJ', company: 'Johnson & Johnson', price: 156.82, change: -0.18, marketCap: '$378B', marketCapCategory: 'Large', pe: 22.5, dividendYield: 3.0, volume: '7.2M', sector: 'Healthcare' },
  { ticker: 'WMT', company: 'Walmart Inc.', price: 168.54, change: 0.93, marketCap: '$454B', marketCapCategory: 'Large', pe: 28.7, dividendYield: 1.3, volume: '8.1M', sector: 'Consumer' },
  { ticker: 'PG', company: 'Procter & Gamble Co.', price: 162.37, change: 0.28, marketCap: '$382B', marketCapCategory: 'Large', pe: 26.4, dividendYield: 2.4, volume: '6.9M', sector: 'Consumer' },
  { ticker: 'UNH', company: 'UnitedHealth Group', price: 527.15, change: 1.07, marketCap: '$488B', marketCapCategory: 'Large', pe: 21.8, dividendYield: 1.4, volume: '3.4M', sector: 'Healthcare' },
  { ticker: 'HD', company: 'Home Depot Inc.', price: 362.18, change: -0.71, marketCap: '$359B', marketCapCategory: 'Large', pe: 24.3, dividendYield: 2.5, volume: '4.2M', sector: 'Consumer' },
  { ticker: 'MA', company: 'Mastercard Inc.', price: 462.73, change: 0.55, marketCap: '$432B', marketCapCategory: 'Large', pe: 35.6, dividendYield: 0.6, volume: '3.1M', sector: 'Finance' },
  { ticker: 'DIS', company: 'Walt Disney Co.', price: 112.54, change: -1.23, marketCap: '$205B', marketCapCategory: 'Large', pe: 72.8, dividendYield: 0.0, volume: '11.6M', sector: 'Consumer' },
  { ticker: 'NFLX', company: 'Netflix Inc.', price: 628.47, change: 2.14, marketCap: '$272B', marketCapCategory: 'Large', pe: 48.9, dividendYield: 0.0, volume: '5.8M', sector: 'Technology' },
  { ticker: 'PYPL', company: 'PayPal Holdings Inc.', price: 63.82, change: -0.87, marketCap: '$70B', marketCapCategory: 'Mid', pe: 17.3, dividendYield: 0.0, volume: '14.2M', sector: 'Finance' },
  { ticker: 'INTC', company: 'Intel Corp.', price: 43.27, change: -1.65, marketCap: '$182B', marketCapCategory: 'Large', pe: 108.2, dividendYield: 1.1, volume: '38.9M', sector: 'Technology' },
  { ticker: 'CSCO', company: 'Cisco Systems Inc.', price: 50.14, change: 0.32, marketCap: '$203B', marketCapCategory: 'Large', pe: 15.4, dividendYield: 3.0, volume: '18.7M', sector: 'Technology' },
  { ticker: 'PFE', company: 'Pfizer Inc.', price: 27.63, change: 0.54, marketCap: '$156B', marketCapCategory: 'Large', pe: 44.2, dividendYield: 5.8, volume: '32.1M', sector: 'Healthcare' },
  { ticker: 'BA', company: 'Boeing Co.', price: 204.87, change: 1.92, marketCap: '$125B', marketCapCategory: 'Large', pe: -18.5, dividendYield: 0.0, volume: '7.3M', sector: 'Industrials' },
  { ticker: 'XOM', company: 'Exxon Mobil Corp.', price: 104.56, change: -0.43, marketCap: '$428B', marketCapCategory: 'Large', pe: 12.7, dividendYield: 3.5, volume: '14.8M', sector: 'Energy' },
  { ticker: 'CVX', company: 'Chevron Corp.', price: 155.28, change: -0.61, marketCap: '$291B', marketCapCategory: 'Large', pe: 14.1, dividendYield: 4.0, volume: '8.5M', sector: 'Energy' },
];

function generatePriceHistory(basePrice: number, points: number, volatility: number): StockPricePoint[] {
  const data: StockPricePoint[] = [];
  let price = basePrice * (1 - volatility * 2 + Math.random() * volatility);
  for (let i = 0; i < points; i++) {
    price = price * (1 + (Math.random() - 0.48) * volatility);
    data.push({ date: `Day ${i + 1}`, price: Math.round(price * 100) / 100 });
  }
  return data;
}

const MOCK_STOCK_DETAILS: Record<string, StockDetail> = {
  AAPL: {
    ticker: 'AAPL',
    company: 'Apple Inc.',
    price: 227.63,
    change: 1.24,
    marketCap: '$3.52T',
    pe: 37.2,
    eps: 6.12,
    beta: 1.28,
    open: 224.5,
    high: 229.18,
    low: 223.87,
    volume: '52.3M',
    avgVolume: '54.1M',
    dividend: 0.96,
    week52Low: 164.08,
    week52High: 237.49,
    earnings: [
      { quarter: 'Q1 2025', actual: 2.18, estimate: 2.1 },
      { quarter: 'Q2 2025', actual: 1.53, estimate: 1.5 },
      { quarter: 'Q3 2025', actual: 1.47, estimate: 1.45 },
      { quarter: 'Q4 2025', actual: 2.35, estimate: 2.28 },
    ],
    analystBuy: 22,
    analystHold: 6,
    analystSell: 2,
    news: [
      { headline: 'Apple Vision Pro Sales Exceed Expectations in Q4', date: 'Mar 3, 2026', source: 'Bloomberg' },
      { headline: 'Apple Services Revenue Hits Record $24B', date: 'Feb 28, 2026', source: 'Reuters' },
      { headline: 'Apple Announces $110B Share Buyback Program', date: 'Feb 25, 2026', source: 'CNBC' },
      { headline: 'iPhone 17 Pro Demand Stronger Than Expected', date: 'Feb 20, 2026', source: 'WSJ' },
    ],
    priceHistory: generatePriceHistory(227.63, 30, 0.02),
    recommendation: 'Buy',
  },
  MSFT: {
    ticker: 'MSFT',
    company: 'Microsoft Corp.',
    price: 415.56,
    change: 0.87,
    marketCap: '$3.09T',
    pe: 35.8,
    eps: 11.61,
    beta: 0.89,
    open: 411.2,
    high: 418.42,
    low: 409.15,
    volume: '22.1M',
    avgVolume: '23.5M',
    dividend: 3.0,
    week52Low: 309.45,
    week52High: 430.82,
    earnings: [
      { quarter: 'Q1 2025', actual: 2.93, estimate: 2.78 },
      { quarter: 'Q2 2025', actual: 2.14, estimate: 2.1 },
      { quarter: 'Q3 2025', actual: 3.3, estimate: 3.1 },
      { quarter: 'Q4 2025', actual: 3.52, estimate: 3.45 },
    ],
    analystBuy: 28,
    analystHold: 4,
    analystSell: 1,
    news: [
      { headline: 'Microsoft Azure Revenue Grows 31% YoY', date: 'Mar 2, 2026', source: 'TechCrunch' },
      { headline: 'Copilot Enterprise Adoption Reaches 60% of Fortune 500', date: 'Feb 27, 2026', source: 'Forbes' },
      { headline: 'Microsoft Cloud Revenue Tops Expectations', date: 'Feb 22, 2026', source: 'Bloomberg' },
      { headline: 'Xbox Gaming Division Posts Strong Quarter', date: 'Feb 18, 2026', source: 'IGN' },
    ],
    priceHistory: generatePriceHistory(415.56, 30, 0.015),
    recommendation: 'Strong Buy',
  },
  NVDA: {
    ticker: 'NVDA',
    company: 'NVIDIA Corp.',
    price: 875.28,
    change: 3.42,
    marketCap: '$2.16T',
    pe: 68.3,
    eps: 12.81,
    beta: 1.72,
    open: 848.9,
    high: 882.15,
    low: 842.3,
    volume: '41.5M',
    avgVolume: '39.2M',
    dividend: 0.16,
    week52Low: 419.38,
    week52High: 902.5,
    earnings: [
      { quarter: 'Q1 2025', actual: 6.12, estimate: 5.59 },
      { quarter: 'Q2 2025', actual: 6.78, estimate: 6.4 },
      { quarter: 'Q3 2025', actual: 8.24, estimate: 7.65 },
      { quarter: 'Q4 2025', actual: 10.32, estimate: 9.85 },
    ],
    analystBuy: 32,
    analystHold: 5,
    analystSell: 2,
    news: [
      { headline: 'NVIDIA Beats Q4 Estimates, Stock Rises 8%', date: 'Mar 4, 2026', source: 'CNBC' },
      { headline: 'NVIDIA Announces Next-Gen Blackwell Ultra GPU', date: 'Feb 28, 2026', source: 'Wired' },
      { headline: 'Data Center Revenue Surges 265% Year-Over-Year', date: 'Feb 25, 2026', source: 'Bloomberg' },
      { headline: 'NVIDIA Expands Automotive AI Partnerships', date: 'Feb 20, 2026', source: 'Reuters' },
    ],
    priceHistory: generatePriceHistory(875.28, 30, 0.03),
    recommendation: 'Strong Buy',
  },
  TSLA: {
    ticker: 'TSLA',
    company: 'Tesla Inc.',
    price: 188.13,
    change: -2.18,
    marketCap: '$599B',
    pe: 44.6,
    eps: 4.22,
    beta: 2.31,
    open: 192.4,
    high: 193.87,
    low: 186.52,
    volume: '112.7M',
    avgVolume: '98.4M',
    dividend: 0,
    week52Low: 138.8,
    week52High: 278.98,
    earnings: [
      { quarter: 'Q1 2025', actual: 0.45, estimate: 0.52 },
      { quarter: 'Q2 2025', actual: 0.72, estimate: 0.65 },
      { quarter: 'Q3 2025', actual: 1.05, estimate: 0.98 },
      { quarter: 'Q4 2025', actual: 0.73, estimate: 0.8 },
    ],
    analystBuy: 12,
    analystHold: 14,
    analystSell: 8,
    news: [
      { headline: 'Tesla Cybertruck Deliveries Hit 100K Milestone', date: 'Mar 3, 2026', source: 'Electrek' },
      { headline: 'Tesla FSD v13 Receives Regulatory Approval in EU', date: 'Feb 28, 2026', source: 'Reuters' },
      { headline: 'Tesla Energy Storage Revenue Doubles in Q4', date: 'Feb 24, 2026', source: 'Bloomberg' },
      { headline: 'Model Y Refresh Launches to Strong Pre-Orders', date: 'Feb 19, 2026', source: 'CNBC' },
    ],
    priceHistory: generatePriceHistory(188.13, 30, 0.03),
    recommendation: 'Hold',
  },
};

const MOCK_CRYPTO_OVERVIEW: CryptoAsset[] = [
  { rank: 1, name: 'Bitcoin', ticker: 'BTC', price: 97420.5, change24h: 2.41, change7d: 5.12, marketCap: '$1.92T', volume24h: '$42.1B', sparkline: [94200, 95100, 94800, 96000, 95500, 96800, 96200, 97100, 96500, 97420], sector: 'Currency' },
  { rank: 2, name: 'Ethereum', ticker: 'ETH', price: 3580.2, change24h: 1.82, change7d: 3.45, marketCap: '$430B', volume24h: '$18.3B', sparkline: [3400, 3420, 3450, 3480, 3510, 3490, 3530, 3550, 3520, 3580], sector: 'Smart Contract' },
  { rank: 3, name: 'Solana', ticker: 'SOL', price: 198.4, change24h: 5.63, change7d: 12.1, marketCap: '$94B', volume24h: '$5.2B', sparkline: [178, 182, 185, 188, 190, 192, 194, 195, 197, 198], sector: 'L1' },
  { rank: 4, name: 'Cardano', ticker: 'ADA', price: 0.85, change24h: -1.24, change7d: -3.2, marketCap: '$30B', volume24h: '$890M', sparkline: [0.88, 0.87, 0.86, 0.87, 0.86, 0.85, 0.86, 0.85, 0.84, 0.85], sector: 'L1' },
  { rank: 5, name: 'Sui', ticker: 'SUI', price: 3.42, change24h: 8.91, change7d: 22.5, marketCap: '$10.2B', volume24h: '$1.1B', sparkline: [2.9, 3.0, 3.05, 3.1, 3.15, 3.2, 3.25, 3.3, 3.35, 3.42], sector: 'L1' },
  { rank: 6, name: 'Aptos', ticker: 'APT', price: 7.8, change24h: 3.21, change7d: 8.4, marketCap: '$3.8B', volume24h: '$320M', sparkline: [7.2, 7.3, 7.4, 7.5, 7.4, 7.5, 7.6, 7.7, 7.6, 7.8], sector: 'L1' },
  { rank: 7, name: 'Avalanche', ticker: 'AVAX', price: 38.5, change24h: -2.15, change7d: -5.8, marketCap: '$15.6B', volume24h: '$780M', sparkline: [40.5, 40.2, 39.8, 40.0, 39.5, 39.2, 39.0, 38.8, 38.6, 38.5], sector: 'L1' },
  { rank: 8, name: 'Chainlink', ticker: 'LINK', price: 18.2, change24h: 0.95, change7d: 2.3, marketCap: '$11.8B', volume24h: '$450M', sparkline: [17.5, 17.6, 17.8, 17.7, 17.9, 18.0, 17.8, 18.1, 18.0, 18.2], sector: 'Oracle' },
  { rank: 9, name: 'Aave', ticker: 'AAVE', price: 312.4, change24h: 4.33, change7d: 9.1, marketCap: '$4.7B', volume24h: '$280M', sparkline: [290, 295, 298, 300, 302, 305, 308, 306, 310, 312], sector: 'DeFi' },
  { rank: 10, name: 'Uniswap', ticker: 'UNI', price: 9.8, change24h: -0.75, change7d: -1.2, marketCap: '$5.9B', volume24h: '$190M', sparkline: [10.0, 9.9, 9.95, 9.9, 9.85, 9.9, 9.8, 9.85, 9.82, 9.8], sector: 'DeFi' },
  { rank: 11, name: 'Near Protocol', ticker: 'NEAR', price: 4.2, change24h: 6.12, change7d: 15.3, marketCap: '$5.1B', volume24h: '$340M', sparkline: [3.6, 3.7, 3.8, 3.9, 3.85, 3.95, 4.0, 4.05, 4.1, 4.2], sector: 'AI' },
  { rank: 12, name: 'Render', ticker: 'RNDR', price: 7.15, change24h: 12.4, change7d: 28.6, marketCap: '$3.7B', volume24h: '$420M', sparkline: [5.8, 6.0, 6.2, 6.3, 6.5, 6.6, 6.8, 6.9, 7.0, 7.15], sector: 'AI' },
];

const MOCK_CRYPTO_ONCHAIN: CryptoOnChainData = {
  btcPrice: '$97,250',
  marketCap: '$1.92T',
  volume24h: '$38.5B',
  activeAddresses: '1.02M',
  exchangeFlows: [
    { day: 'Mon', flow: 2400 },
    { day: 'Tue', flow: -1800 },
    { day: 'Wed', flow: -3200 },
    { day: 'Thu', flow: 800 },
    { day: 'Fri', flow: -2100 },
    { day: 'Sat', flow: 500 },
    { day: 'Sun', flow: -1500 },
  ],
  whaleTransactions: [
    { time: '1h ago', from: '3FZbgi...', to: 'Binance', amount: 452, value: 43900000, type: 'Transfer' },
    { time: '2h ago', from: 'Coinbase', to: '1A1zP1...', amount: 1100, value: 107000000, type: 'Withdrawal' },
    { time: '3h ago', from: 'bc1qxy...', to: 'Kraken', amount: 890, value: 86500000, type: 'Deposit' },
    { time: '5h ago', from: '3J98t1...', to: '1FeexV...', amount: 2100, value: 204000000, type: 'Transfer' },
    { time: '8h ago', from: 'Binance', to: 'bc1q42...', amount: 650, value: 63200000, type: 'Withdrawal' },
  ],
  onChainIndicators: [
    { name: 'NVT Ratio', value: 62.4, badge: 'Normal', badgeColor: 'bg-amber-500/20 text-amber-400', explanation: 'Network Value to Transaction ratio. Elevated (>70) suggests overvaluation; Normal (45-70); Low (<45) suggests undervaluation.' },
    { name: 'MVRV Z-Score', value: 1.8, badge: 'Neutral', badgeColor: 'bg-amber-500/20 text-amber-400', explanation: 'Market Value to Realized Value Z-Score. Overvalued (>7), Neutral (-1 to 7), Undervalued (<-1).' },
    { name: 'SOPR', value: 1.04, badge: 'Profit Taking', badgeColor: 'bg-emerald/20 text-emerald', explanation: 'Spent Output Profit Ratio. >1 indicates holders are selling at a profit (profit taking); <1 indicates capitulation.' },
  ],
  activeAddressesData: Array.from({ length: 30 }, (_, i) => ({
    day: `${i + 1}`,
    addresses: Math.round(950000 + Math.sin(i * 0.5) * 120000 + Math.cos(i * 0.3) * 40000 + Math.sin(i * 1.2) * 30000),
  })),
};

const MOCK_YIELD_CURVE: YieldCurveData[] = [
  { maturity: '3M', yield: 4.1 },
  { maturity: '6M', yield: 4.2 },
  { maturity: '1Y', yield: 4.1 },
  { maturity: '2Y', yield: 4.0 },
  { maturity: '3Y', yield: 4.0 },
  { maturity: '5Y', yield: 4.1 },
  { maturity: '7Y', yield: 4.2 },
  { maturity: '10Y', yield: 4.3 },
  { maturity: '20Y', yield: 4.6 },
  { maturity: '30Y', yield: 4.5 },
];

const MOCK_ECONOMIC_CALENDAR: EconomicEvent[] = [
  { id: 1, date: 'Mar 4', time: '08:30 ET', event: 'ISM Manufacturing PMI', country: 'US', flag: '🇺🇸', importance: 'High', actual: '52.3', forecast: '51.8', previous: '51.2', isPast: true },
  { id: 2, date: 'Mar 4', time: '10:00 ET', event: 'Construction Spending', country: 'US', flag: '🇺🇸', importance: 'Low', actual: '0.6%', forecast: '0.4%', previous: '0.3%', isPast: true },
  { id: 3, date: 'Mar 5', time: '04:30 GMT', event: 'Services PMI', country: 'EU', flag: '🇪🇺', importance: 'Medium', actual: '51.2', forecast: '50.8', previous: '50.7', isPast: true },
  { id: 4, date: 'Mar 5', time: '08:15 ET', event: 'ADP Non-Farm Employment', country: 'US', flag: '🇺🇸', importance: 'Medium', actual: '142K', forecast: '150K', previous: '111K', isPast: true },
  { id: 5, date: 'Mar 5', time: '12:00 GMT', event: 'ECB Rate Decision', country: 'EU', flag: '🇪🇺', importance: 'High', actual: '4.00%', forecast: '4.00%', previous: '4.25%', isPast: true },
  { id: 6, date: 'Mar 6', time: '02:00 JST', event: 'BoJ Policy Statement', country: 'JP', flag: '🇯🇵', importance: 'High', actual: '-0.10%', forecast: '-0.10%', previous: '-0.10%', isPast: true },
  { id: 7, date: 'Mar 6', time: '08:30 ET', event: 'Jobless Claims', country: 'US', flag: '🇺🇸', importance: 'Medium', actual: '215K', forecast: '220K', previous: '218K', isPast: true },
  { id: 8, date: 'Mar 6', time: '07:00 GMT', event: 'GDP (QoQ)', country: 'UK', flag: '🇬🇧', importance: 'High', actual: '0.3%', forecast: '0.2%', previous: '-0.1%', isPast: true },
  { id: 9, date: 'Mar 7', time: '08:30 ET', event: 'Non-Farm Payrolls', country: 'US', flag: '🇺🇸', importance: 'High', actual: '275K', forecast: '200K', previous: '229K', isPast: true },
  { id: 10, date: 'Mar 7', time: '08:30 ET', event: 'Unemployment Rate', country: 'US', flag: '🇺🇸', importance: 'High', actual: '3.9%', forecast: '4.0%', previous: '3.7%', isPast: true },
  { id: 11, date: 'Mar 10', time: '01:30 CST', event: 'CPI (YoY)', country: 'CN', flag: '🇨🇳', importance: 'High', actual: null, forecast: '0.5%', previous: '0.3%', isPast: false },
  { id: 12, date: 'Mar 11', time: '08:30 ET', event: 'CPI (MoM)', country: 'US', flag: '🇺🇸', importance: 'High', actual: null, forecast: '0.3%', previous: '0.4%', isPast: false },
  { id: 13, date: 'Mar 11', time: '08:30 ET', event: 'Core CPI (YoY)', country: 'US', flag: '🇺🇸', importance: 'High', actual: null, forecast: '3.7%', previous: '3.9%', isPast: false },
  { id: 14, date: 'Mar 12', time: '08:30 ET', event: 'Retail Sales (MoM)', country: 'US', flag: '🇺🇸', importance: 'Medium', actual: null, forecast: '0.5%', previous: '0.6%', isPast: false },
  { id: 15, date: 'Mar 12', time: '07:00 GMT', event: 'Manufacturing PMI', country: 'UK', flag: '🇬🇧', importance: 'Medium', actual: null, forecast: '47.5', previous: '47.1', isPast: false },
  { id: 16, date: 'Mar 13', time: '08:30 ET', event: 'PPI (MoM)', country: 'US', flag: '🇺🇸', importance: 'Medium', actual: null, forecast: '0.2%', previous: '0.3%', isPast: false },
  { id: 17, date: 'Mar 14', time: '10:00 ET', event: 'Consumer Sentiment', country: 'US', flag: '🇺🇸', importance: 'Medium', actual: null, forecast: '77.0', previous: '76.9', isPast: false },
  { id: 18, date: 'Mar 18', time: '14:00 ET', event: 'Fed Rate Decision', country: 'US', flag: '🇺🇸', importance: 'High', actual: null, forecast: '5.25%', previous: '5.50%', isPast: false },
];

const MOCK_FEAR_GREED: FearGreedData = {
  currentValue: 68,
  currentLabel: 'Greed',
  oneWeekAgo: 55,
  oneMonthAgo: 42,
  oneYearAgo: 35,
  components: [
    { label: 'Stock Price Momentum', value: 72 },
    { label: 'Stock Price Strength', value: 65 },
    { label: 'Market Volatility', value: 58 },
    { label: 'Safe Haven Demand', value: 48 },
    { label: 'Junk Bond Demand', value: 74 },
    { label: 'Market Breadth', value: 70 },
    { label: 'Put/Call Ratio', value: 62 },
  ],
};

const MOCK_CRYPTO_FEAR_GREED: CryptoFearGreedData = {
  currentValue: 64,
  currentLabel: 'Greed',
  history: Array.from({ length: 30 }, (_, i) => {
    const base = 55;
    const wave = Math.sin(i * 0.4) * 12;
    const noise = Math.sin(i * 1.3) * 5;
    return { day: i + 1, value: Math.round(Math.max(15, Math.min(85, base + wave + noise))) };
  }),
  components: [
    { label: 'Social Media', value: 72, color: '#10B981' },
    { label: 'Volatility', value: 55, color: '#F59E0B' },
    { label: 'Market Momentum', value: 68, color: '#3B82F6' },
    { label: 'Dominance', value: 58, color: '#8B5CF6' },
  ],
};

const MOCK_NEWS: NewsArticle[] = [
  { id: 0, headline: 'Fed Signals Potential Rate Cuts Amid Cooling Inflation Data', excerpt: 'Federal Reserve Chair Jerome Powell indicated the central bank is increasingly confident that inflation is on a sustainable path toward 2%, opening the door to potential rate cuts in the coming months. Markets reacted with a sharp rally across equities and bonds.', date: 'Mar 4, 2026', author: 'Sarah Chen', category: 'Fed Policy', featured: true, source: 'Bloomberg' },
  { id: 1, headline: 'S&P 500 Closes at Record High on Strong Earnings', excerpt: 'The benchmark index surpassed 5,400 for the first time as better-than-expected corporate earnings fueled investor optimism about the economic outlook.', date: 'Mar 4, 2026', author: 'Michael Torres', category: 'Market Analysis', source: 'CNBC' },
  { id: 2, headline: 'Treasury Yields Drop After Weak Jobs Data', excerpt: 'The 10-year yield fell below 4.1% after non-farm payrolls came in well below expectations, reinforcing bets on Fed rate cuts later this year.', date: 'Mar 3, 2026', author: 'Emily Watson', category: 'Economic Data', source: 'Reuters' },
  { id: 3, headline: 'NVIDIA Beats Q4 Estimates, Stock Rises 8%', excerpt: 'The chipmaker reported revenue of $22.1 billion, crushing Wall Street expectations as data center demand continues to surge amid the AI spending boom.', date: 'Mar 3, 2026', author: 'David Kim', category: 'Earnings', source: 'WSJ' },
  { id: 4, headline: 'Bitcoin Surges Past $100K Milestone', excerpt: 'The worlds largest cryptocurrency crossed the six-figure mark for the first time, driven by institutional inflows and growing ETF adoption.', date: 'Mar 2, 2026', author: 'Alex Rivera', category: 'Crypto', source: 'CoinDesk' },
  { id: 5, headline: 'ECB Holds Rates Steady, Signals June Cut', excerpt: 'The European Central Bank kept rates unchanged at 4% but President Lagarde hinted at a potential cut in June as eurozone inflation continues to decelerate.', date: 'Mar 2, 2026', author: 'Hans Mueller', category: 'Fed Policy', source: 'Financial Times' },
  { id: 6, headline: 'Microsoft Cloud Revenue Tops Expectations', excerpt: 'Azure revenue grew 31% year-over-year, beating estimates and signaling that enterprise AI adoption is accelerating faster than anticipated.', date: 'Mar 1, 2026', author: 'Jennifer Park', category: 'Earnings', source: 'TechCrunch' },
  { id: 7, headline: 'Housing Starts Decline for Third Straight Month', excerpt: 'New residential construction fell 3.2% in February, as elevated mortgage rates and material costs continued to weigh on the housing market.', date: 'Mar 1, 2026', author: 'Robert Chen', category: 'Economic Data', source: 'Bloomberg' },
  { id: 8, headline: 'Oil Prices Rally on OPEC Supply Cuts', excerpt: 'Crude oil surged above $82 per barrel after OPEC+ announced extended production cuts through Q2, tightening global supply expectations.', date: 'Feb 28, 2026', author: 'Layla Hassan', category: 'Market Analysis', source: 'Reuters' },
  { id: 9, headline: 'Consumer Confidence Index Falls to 6-Month Low', excerpt: 'The Conference Board index dropped to 68.2 as Americans grew more concerned about the labor market outlook and persistent inflation in services.', date: 'Feb 28, 2026', author: 'Maria Santos', category: 'Economic Data', source: 'CNBC' },
  { id: 10, headline: 'Gold Hits All-Time High on Safe Haven Demand', excerpt: 'Gold futures surpassed $2,680/oz as geopolitical tensions and central bank buying pushed the precious metal to unprecedented levels.', date: 'Feb 27, 2026', author: 'Thomas Wright', category: 'Market Analysis', source: 'WSJ' },
  { id: 11, headline: 'Ethereum ETF Inflows Reach Record $2.1B in Single Week', excerpt: 'Spot Ethereum ETFs attracted massive institutional inflows, signaling growing mainstream acceptance of the second-largest cryptocurrency.', date: 'Feb 26, 2026', author: 'Nina Patel', category: 'Crypto', source: 'CoinDesk' },
  { id: 12, headline: 'Fed Minutes Reveal Debate Over Pace of Balance Sheet Reduction', excerpt: 'The latest FOMC minutes showed officials debating whether to slow the pace of quantitative tightening amid evolving market liquidity conditions.', date: 'Feb 25, 2026', author: 'Sarah Chen', category: 'Fed Policy', source: 'Bloomberg' },
  { id: 13, headline: 'Amazon Announces $15B Investment in AI Infrastructure', excerpt: 'Amazon Web Services committed $15 billion to expand its data center capacity for AI workloads, the largest single investment in cloud infrastructure.', date: 'Feb 24, 2026', author: 'Michael Torres', category: 'Earnings', source: 'Forbes' },
  { id: 14, headline: 'China Manufacturing PMI Contracts for Fifth Month', excerpt: 'The official NBS manufacturing PMI came in at 49.1, below the 50 expansion threshold, raising concerns about the pace of economic recovery.', date: 'Feb 23, 2026', author: 'Wei Zhang', category: 'Economic Data', source: 'Reuters' },
  { id: 15, headline: 'Solana DeFi TVL Surpasses $12B as Ecosystem Expands', excerpt: 'Total value locked in Solana DeFi protocols reached a new all-time high, driven by increased stablecoin usage and DEX trading volumes.', date: 'Feb 22, 2026', author: 'Alex Rivera', category: 'Crypto', source: 'The Block' },
];

const MOCK_INSIDER_TRADING: InsiderFiling[] = [
  { date: 'Jan 22, 2026', insider: 'Tim Cook', title: 'CEO', company: 'AAPL', transaction: 'Sale', shares: 100000, price: 210, totalValue: 21000000 },
  { date: 'Jan 21, 2026', insider: 'Jensen Huang', title: 'CEO', company: 'NVDA', transaction: 'Sale', shares: 50000, price: 620, totalValue: 31000000 },
  { date: 'Jan 20, 2026', insider: 'Satya Nadella', title: 'CEO', company: 'MSFT', transaction: 'Purchase', shares: 10000, price: 420, totalValue: 4200000 },
  { date: 'Jan 19, 2026', insider: 'Mark Zuckerberg', title: 'CEO', company: 'META', transaction: 'Sale', shares: 28000, price: 520, totalValue: 14560000 },
  { date: 'Jan 18, 2026', insider: 'Andy Jassy', title: 'CEO', company: 'AMZN', transaction: 'Sale', shares: 20000, price: 185, totalValue: 3700000 },
  { date: 'Jan 17, 2026', insider: 'Jamie Dimon', title: 'CEO', company: 'JPM', transaction: 'Sale', shares: 75000, price: 168, totalValue: 12600000 },
  { date: 'Jan 16, 2026', insider: 'Lisa Su', title: 'CEO', company: 'AMD', transaction: 'Purchase', shares: 15000, price: 145, totalValue: 2175000 },
  { date: 'Jan 15, 2026', insider: 'Safra Catz', title: 'CEO', company: 'ORCL', transaction: 'Sale', shares: 40000, price: 132, totalValue: 5280000 },
  { date: 'Jan 14, 2026', insider: 'Arvind Krishna', title: 'CEO', company: 'IBM', transaction: 'Purchase', shares: 8000, price: 198, totalValue: 1584000 },
  { date: 'Jan 13, 2026', insider: 'David Solomon', title: 'CEO', company: 'GS', transaction: 'Sale', shares: 18000, price: 425, totalValue: 7650000 },
  { date: 'Jan 12, 2026', insider: 'Jane Fraser', title: 'CEO', company: 'C', transaction: 'Purchase', shares: 25000, price: 62, totalValue: 1550000 },
  { date: 'Jan 11, 2026', insider: 'Brian Moynihan', title: 'CEO', company: 'BAC', transaction: 'Sale', shares: 35000, price: 38, totalValue: 1330000 },
  { date: 'Jan 10, 2026', insider: 'Pat Gelsinger', title: 'Former CEO', company: 'INTC', transaction: 'Sale', shares: 50000, price: 24, totalValue: 1200000 },
  { date: 'Jan 9, 2026', insider: 'Reed Hastings', title: 'Chairman', company: 'NFLX', transaction: 'Sale', shares: 12000, price: 680, totalValue: 8160000 },
];

const MOCK_IPO_PIPELINE: IpoData = {
  upcoming: [
    { company: 'Stripe', date: 'May 2026', valuation: 65, underwriters: 'GS / MS', sector: 'Fintech', risk: 'Medium' },
    { company: 'Databricks', date: 'Jun 2026', valuation: 43, underwriters: 'JPM / GS', sector: 'Enterprise Software', risk: 'Low' },
    { company: 'Canva', date: 'Jun 2026', valuation: 26, underwriters: 'MS / UBS', sector: 'Design SaaS', risk: 'Low' },
    { company: 'SpaceX Spinoff', date: 'Jul 2026', valuation: 15, underwriters: 'Unspecified', sector: 'Aerospace', risk: 'High' },
    { company: 'Discord', date: 'Jul 2026', valuation: 15, underwriters: 'GS / MS', sector: 'Communication', risk: 'Medium' },
    { company: 'Plaid', date: 'Aug 2026', valuation: 12, underwriters: 'JPM / Citi', sector: 'Fintech', risk: 'Low' },
    { company: 'Anduril', date: 'Sep 2026', valuation: 8, underwriters: 'Unspecified', sector: 'Defense Tech', risk: 'High' },
    { company: 'Wiz', date: 'Sep 2026', valuation: 7, underwriters: 'GS / MS', sector: 'Cybersecurity', risk: 'Low' },
    { company: 'Rippling', date: 'Oct 2026', valuation: 5, underwriters: 'Unspecified', sector: 'HR SaaS', risk: 'Medium' },
  ],
  recent: [
    { company: 'Arm Holdings', ipoPrice: 51, currentPrice: 68, returnPct: 33.3 },
    { company: 'Instacart', ipoPrice: 30, currentPrice: 28, returnPct: -6.7 },
    { company: 'Klaviyo', ipoPrice: 30, currentPrice: 36, returnPct: 20.0 },
    { company: 'Birkenstock', ipoPrice: 46, currentPrice: 52, returnPct: 13.0 },
    { company: 'Cava', ipoPrice: 22, currentPrice: 48, returnPct: 118.2 },
    { company: 'Oddity Tech', ipoPrice: 35, currentPrice: 42, returnPct: 20.0 },
  ],
  spacs: [
    { name: 'Aurora Acquisition Corp.', ticker: 'AURC', status: 'Searching', target: 'Fintech', trust: '$240M' },
    { name: 'Horizon Capital II', ticker: 'HZNC', status: 'Filed', target: 'Healthcare', trust: '$180M' },
    { name: 'Graphite Holdings', ticker: 'GRPH', status: 'Merger Vote', target: 'AI/ML', trust: '$320M' },
    { name: 'Vantage Point Inc.', ticker: 'VPTI', status: 'Closing', target: 'Clean Energy', trust: '$150M' },
  ],
};

const MOCK_EARNINGS_CALENDAR: EarningsCompany[] = [
  {
    ticker: 'AAPL', name: 'Apple Inc.',
    epsHistory: [
      { quarter: 'Q1 2025', estimate: 1.9, actual: 2.1 },
      { quarter: 'Q2 2025', estimate: 1.55, actual: 1.65 },
      { quarter: 'Q3 2025', estimate: 1.45, actual: 1.52 },
      { quarter: 'Q4 2025', estimate: 2.4, actual: 2.5 },
    ],
    whisperNumber: 2.58, consensusEPS: 2.45, sentiment: 'Bullish', beatRate: 82,
  },
  {
    ticker: 'MSFT', name: 'Microsoft Corp.',
    epsHistory: [
      { quarter: 'Q1 2025', estimate: 2.78, actual: 2.95 },
      { quarter: 'Q2 2025', estimate: 2.95, actual: 3.1 },
      { quarter: 'Q3 2025', estimate: 3.05, actual: 3.22 },
      { quarter: 'Q4 2025', estimate: 3.18, actual: 3.3 },
    ],
    whisperNumber: 3.35, consensusEPS: 3.22, sentiment: 'Bullish', beatRate: 88,
  },
  {
    ticker: 'GOOGL', name: 'Alphabet Inc.',
    epsHistory: [
      { quarter: 'Q1 2025', estimate: 1.52, actual: 1.59 },
      { quarter: 'Q2 2025', estimate: 1.65, actual: 1.72 },
      { quarter: 'Q3 2025', estimate: 1.78, actual: 1.84 },
      { quarter: 'Q4 2025', estimate: 1.95, actual: 2.02 },
    ],
    whisperNumber: 2.05, consensusEPS: 1.98, sentiment: 'Neutral', beatRate: 75,
  },
  {
    ticker: 'AMZN', name: 'Amazon.com Inc.',
    epsHistory: [
      { quarter: 'Q1 2025', estimate: 0.82, actual: 0.98 },
      { quarter: 'Q2 2025', estimate: 1.05, actual: 1.18 },
      { quarter: 'Q3 2025', estimate: 1.22, actual: 1.35 },
      { quarter: 'Q4 2025', estimate: 1.48, actual: 1.62 },
    ],
    whisperNumber: 1.68, consensusEPS: 1.52, sentiment: 'Bullish', beatRate: 78,
  },
  {
    ticker: 'META', name: 'Meta Platforms',
    epsHistory: [
      { quarter: 'Q1 2025', estimate: 4.35, actual: 4.72 },
      { quarter: 'Q2 2025', estimate: 4.8, actual: 5.16 },
      { quarter: 'Q3 2025', estimate: 5.1, actual: 5.42 },
      { quarter: 'Q4 2025', estimate: 5.5, actual: 5.88 },
    ],
    whisperNumber: 5.95, consensusEPS: 5.62, sentiment: 'Bullish', beatRate: 85,
  },
  {
    ticker: 'TSLA', name: 'Tesla Inc.',
    epsHistory: [
      { quarter: 'Q1 2025', estimate: 0.75, actual: 0.62 },
      { quarter: 'Q2 2025', estimate: 0.82, actual: 0.78 },
      { quarter: 'Q3 2025', estimate: 0.9, actual: 0.85 },
      { quarter: 'Q4 2025', estimate: 1.05, actual: 0.95 },
    ],
    whisperNumber: 0.92, consensusEPS: 1.02, sentiment: 'Bearish', beatRate: 42,
  },
  {
    ticker: 'NVDA', name: 'NVIDIA Corp.',
    epsHistory: [
      { quarter: 'Q1 2025', estimate: 0.64, actual: 0.82 },
      { quarter: 'Q2 2025', estimate: 0.9, actual: 1.12 },
      { quarter: 'Q3 2025', estimate: 1.2, actual: 1.45 },
      { quarter: 'Q4 2025', estimate: 1.55, actual: 1.82 },
    ],
    whisperNumber: 1.9, consensusEPS: 1.65, sentiment: 'Bullish', beatRate: 92,
  },
  {
    ticker: 'NFLX', name: 'Netflix Inc.',
    epsHistory: [
      { quarter: 'Q1 2025', estimate: 4.5, actual: 5.28 },
      { quarter: 'Q2 2025', estimate: 5.8, actual: 6.1 },
      { quarter: 'Q3 2025', estimate: 6.4, actual: 7.02 },
      { quarter: 'Q4 2025', estimate: 7.2, actual: 7.85 },
    ],
    whisperNumber: 8.1, consensusEPS: 7.5, sentiment: 'Bullish', beatRate: 80,
  },
];

const MOCK_COMMODITIES: CommodityData = {
  commodities: [
    { name: 'Gold', price: 2680.5, change: 0.9, unit: '$/oz' },
    { name: 'Silver', price: 31.42, change: 1.2, unit: '$/oz' },
    { name: 'Oil (WTI)', price: 78.4, change: -1.2, unit: '$/bbl' },
    { name: 'Nat Gas', price: 2.85, change: -0.8, unit: '$/MMBtu' },
    { name: 'Copper', price: 4.18, change: 0.5, unit: '$/lb' },
    { name: 'Wheat', price: 582.25, change: -0.3, unit: '¢/bu' },
    { name: 'Corn', price: 438.5, change: -0.5, unit: '¢/bu' },
    { name: 'Soybeans', price: 1182.0, change: 0.2, unit: '¢/bu' },
  ],
  commodityNames: ['Gold', 'Silver', 'Oil', 'Nat Gas', 'Copper', 'Wheat', 'Corn', 'Soybeans'],
  correlationMatrix: [
    [1.0, 0.85, 0.15, 0.05, 0.3, -0.1, -0.08, 0.05],
    [0.85, 1.0, 0.2, 0.08, 0.35, -0.05, -0.03, 0.1],
    [0.15, 0.2, 1.0, 0.7, 0.45, 0.15, 0.1, 0.2],
    [0.05, 0.08, 0.7, 1.0, 0.25, 0.12, 0.08, 0.05],
    [0.3, 0.35, 0.45, 0.25, 1.0, 0.1, 0.05, 0.15],
    [-0.1, -0.05, 0.15, 0.12, 0.1, 1.0, 0.75, 0.6],
    [-0.08, -0.03, 0.1, 0.08, 0.05, 0.75, 1.0, 0.65],
    [0.05, 0.1, 0.2, 0.05, 0.15, 0.6, 0.65, 1.0],
  ],
};

const MOCK_CURRENCIES: CurrencyData[] = [
  { code: 'USD', name: 'US Dollar', strength: 78, change: 0.3 },
  { code: 'EUR', name: 'Euro', strength: 62, change: -0.2 },
  { code: 'GBP', name: 'British Pound', strength: 55, change: 0.5 },
  { code: 'JPY', name: 'Japanese Yen', strength: 35, change: -0.8 },
  { code: 'CHF', name: 'Swiss Franc', strength: 58, change: 0.1 },
  { code: 'CAD', name: 'Canadian Dollar', strength: 48, change: -0.4 },
  { code: 'AUD', name: 'Australian Dollar', strength: 42, change: 0.6 },
  { code: 'NZD', name: 'New Zealand Dollar', strength: 38, change: -0.3 },
];

const MOCK_MANIFEST: DataManifest = {
  lastUpdated: '2026-03-04T18:30:00Z',
  scrapers: {
    stocks: { status: 'success', timestamp: '2026-03-04T18:28:15Z', duration: '12.3s' },
    crypto: { status: 'success', timestamp: '2026-03-04T18:28:28Z', duration: '8.5s' },
    sec: { status: 'success', timestamp: '2026-03-04T18:28:42Z', duration: '15.2s' },
    economic: { status: 'success', timestamp: '2026-03-04T18:29:05Z', duration: '22.1s' },
    fear_greed: { status: 'success', timestamp: '2026-03-04T18:29:12Z', duration: '3.8s' },
    news: { status: 'success', timestamp: '2026-03-04T18:29:28Z', duration: '18.4s' },
    earnings: { status: 'success', timestamp: '2026-03-04T18:29:45Z', duration: '14.6s' },
    commodities: { status: 'success', timestamp: '2026-03-04T18:30:00Z', duration: '9.2s' },
  },
  status: 'success',
  runType: 'daily',
};

const MOCK_HEDGE_FUNDS: Record<string, HedgeFundData> = {
  Citadel: {
    name: 'Citadel',
    aum: '$63B',
    holdings: 1247,
    topHolding: 'AAPL',
    positions: [
      { stock: 'AAPL', shares: '12.4M', value: 2604, pct: 4.1, change: 'Increased' },
      { stock: 'MSFT', shares: '5.8M', value: 2436, pct: 3.9, change: 'Unchanged' },
      { stock: 'NVDA', shares: '3.2M', value: 1984, pct: 3.1, change: 'Increased' },
      { stock: 'AMZN', shares: '9.1M', value: 1684, pct: 2.7, change: 'New' },
      { stock: 'META', shares: '2.8M', value: 1456, pct: 2.3, change: 'Unchanged' },
      { stock: 'GOOGL', shares: '7.5M', value: 1313, pct: 2.1, change: 'Decreased' },
      { stock: 'JPM', shares: '7.2M', value: 1210, pct: 1.9, change: 'Unchanged' },
      { stock: 'V', shares: '3.1M', value: 968, pct: 1.5, change: 'New' },
      { stock: 'UNH', shares: '2.0M', value: 940, pct: 1.5, change: 'Increased' },
      { stock: 'LLY', shares: '0.9M', value: 792, pct: 1.3, change: 'Unchanged' },
      { stock: 'TSLA', shares: '2.5M', value: 598, pct: 0.9, change: 'Decreased' },
      { stock: 'BRK.B', shares: '2.1M', value: 504, pct: 0.8, change: 'Unchanged' },
    ],
    sectors: [
      { name: 'Technology', value: 38 },
      { name: 'Healthcare', value: 18 },
      { name: 'Finance', value: 15 },
      { name: 'Consumer', value: 14 },
      { name: 'Energy', value: 8 },
      { name: 'Other', value: 7 },
    ],
    notableMoves: [
      { title: 'Biggest New Position', detail: 'AMZN — $1.68B', badge: 'emerald' },
      { title: 'Largest Exit', detail: 'BABA — $892M', badge: 'crimson' },
      { title: 'Biggest Increase', detail: 'AAPL +42%', badge: 'chartblue' },
    ],
  },
  Bridgewater: {
    name: 'Bridgewater Associates',
    aum: '$97B',
    holdings: 892,
    topHolding: 'GLD',
    positions: [
      { stock: 'GLD', shares: '18.5M', value: 3811, pct: 3.9, change: 'Increased' },
      { stock: 'SPY', shares: '7.2M', value: 3564, pct: 3.7, change: 'Unchanged' },
      { stock: 'TLT', shares: '9.8M', value: 980, pct: 1.0, change: 'New' },
      { stock: 'EEM', shares: '22.1M', value: 995, pct: 1.0, change: 'Increased' },
      { stock: 'IVV', shares: '1.8M', value: 896, pct: 0.9, change: 'Unchanged' },
      { stock: 'VTI', shares: '2.1M', value: 519, pct: 0.5, change: 'Decreased' },
      { stock: 'IWM', shares: '3.2M', value: 640, pct: 0.7, change: 'New' },
      { stock: 'AGG', shares: '4.5M', value: 450, pct: 0.5, change: 'Unchanged' },
      { stock: 'QQQ', shares: '0.9M', value: 450, pct: 0.5, change: 'Decreased' },
      { stock: 'VGK', shares: '5.1M', value: 306, pct: 0.3, change: 'Unchanged' },
      { stock: 'COIN', shares: '1.2M', value: 288, pct: 0.3, change: 'New' },
      { stock: 'BND', shares: '5.8M', value: 348, pct: 0.4, change: 'Unchanged' },
    ],
    sectors: [
      { name: 'Technology', value: 12 },
      { name: 'Healthcare', value: 8 },
      { name: 'Finance', value: 35 },
      { name: 'Consumer', value: 10 },
      { name: 'Energy', value: 15 },
      { name: 'Other', value: 20 },
    ],
    notableMoves: [
      { title: 'Biggest New Position', detail: 'TLT — $980M', badge: 'emerald' },
      { title: 'Largest Exit', detail: 'LQD — $542M', badge: 'crimson' },
      { title: 'Biggest Increase', detail: 'GLD +28%', badge: 'chartblue' },
    ],
  },
  'Pershing Square': {
    name: 'Pershing Square',
    aum: '$18B',
    holdings: 34,
    topHolding: 'AAPL',
    positions: [
      { stock: 'AAPL', shares: '25.2M', value: 5292, pct: 29.4, change: 'Unchanged' },
      { stock: 'GOOGL', shares: '8.1M', value: 1418, pct: 7.9, change: 'Increased' },
      { stock: 'BKNG', shares: '0.6M', value: 2520, pct: 14.0, change: 'Unchanged' },
      { stock: 'CMG', shares: '0.4M', value: 184, pct: 1.0, change: 'New' },
      { stock: 'HLT', shares: '3.2M', value: 672, pct: 3.7, change: 'Unchanged' },
      { stock: 'LMT', shares: '0.7M', value: 301, pct: 1.7, change: 'Decreased' },
      { stock: 'META', shares: '1.1M', value: 572, pct: 3.2, change: 'Increased' },
      { stock: 'MSFT', shares: '1.0M', value: 420, pct: 2.3, change: 'Unchanged' },
      { stock: 'NFLX', shares: '0.5M', value: 340, pct: 1.9, change: 'New' },
      { stock: 'NVDA', shares: '0.3M', value: 186, pct: 1.0, change: 'Increased' },
      { stock: 'TDG', shares: '0.2M', value: 168, pct: 0.9, change: 'Unchanged' },
      { stock: 'UNH', shares: '0.4M', value: 188, pct: 1.0, change: 'Unchanged' },
    ],
    sectors: [
      { name: 'Technology', value: 45 },
      { name: 'Healthcare', value: 12 },
      { name: 'Finance', value: 5 },
      { name: 'Consumer', value: 25 },
      { name: 'Energy', value: 3 },
      { name: 'Other', value: 10 },
    ],
    notableMoves: [
      { title: 'Biggest New Position', detail: 'CMG — $184M', badge: 'emerald' },
      { title: 'Largest Exit', detail: 'MCK — $312M', badge: 'crimson' },
      { title: 'Biggest Increase', detail: 'GOOGL +65%', badge: 'chartblue' },
    ],
  },
  'Tiger Global': {
    name: 'Tiger Global',
    aum: '$24B',
    holdings: 156,
    topHolding: 'MSFT',
    positions: [
      { stock: 'MSFT', shares: '4.2M', value: 1764, pct: 7.4, change: 'Increased' },
      { stock: 'AMZN', shares: '6.8M', value: 1258, pct: 5.2, change: 'Unchanged' },
      { stock: 'NVDA', shares: '1.5M', value: 930, pct: 3.9, change: 'New' },
      { stock: 'CRM', shares: '3.2M', value: 896, pct: 3.7, change: 'Unchanged' },
      { stock: 'SHOP', shares: '8.1M', value: 648, pct: 2.7, change: 'Decreased' },
      { stock: 'SNOW', shares: '4.5M', value: 405, pct: 1.7, change: 'New' },
      { stock: 'DDOG', shares: '2.8M', value: 252, pct: 1.0, change: 'Unchanged' },
      { stock: 'NET', shares: '3.1M', value: 186, pct: 0.8, change: 'Increased' },
      { stock: 'MDB', shares: '0.8M', value: 168, pct: 0.7, change: 'Unchanged' },
      { stock: 'ZS', shares: '0.9M', value: 144, pct: 0.6, change: 'Decreased' },
      { stock: 'CRWD', shares: '0.5M', value: 125, pct: 0.5, change: 'New' },
      { stock: 'COIN', shares: '0.6M', value: 108, pct: 0.5, change: 'Unchanged' },
    ],
    sectors: [
      { name: 'Technology', value: 62 },
      { name: 'Healthcare', value: 8 },
      { name: 'Finance', value: 10 },
      { name: 'Consumer', value: 12 },
      { name: 'Energy', value: 2 },
      { name: 'Other', value: 6 },
    ],
    notableMoves: [
      { title: 'Biggest New Position', detail: 'NVDA — $930M', badge: 'emerald' },
      { title: 'Largest Exit', detail: 'SE — $412M', badge: 'crimson' },
      { title: 'Biggest Increase', detail: 'MSFT +38%', badge: 'chartblue' },
    ],
  },
  Renaissance: {
    name: 'Renaissance Technologies',
    aum: '$106B',
    holdings: 3456,
    topHolding: 'NVDA',
    positions: [
      { stock: 'NVDA', shares: '8.2M', value: 5084, pct: 4.8, change: 'Increased' },
      { stock: 'AAPL', shares: '18.5M', value: 3885, pct: 3.7, change: 'Unchanged' },
      { stock: 'MSFT', shares: '7.1M', value: 2982, pct: 2.8, change: 'Increased' },
      { stock: 'META', shares: '4.2M', value: 2184, pct: 2.1, change: 'New' },
      { stock: 'AMZN', shares: '9.5M', value: 1758, pct: 1.7, change: 'Unchanged' },
      { stock: 'GOOGL', shares: '8.8M', value: 1540, pct: 1.5, change: 'Decreased' },
      { stock: 'AVGO', shares: '2.1M', value: 1239, pct: 1.2, change: 'New' },
      { stock: 'TSLA', shares: '4.8M', value: 1147, pct: 1.1, change: 'Unchanged' },
      { stock: 'LLY', shares: '1.2M', value: 1056, pct: 1.0, change: 'Increased' },
      { stock: 'V', shares: '2.8M', value: 874, pct: 0.8, change: 'Unchanged' },
      { stock: 'JPM', shares: '4.5M', value: 756, pct: 0.7, change: 'Decreased' },
      { stock: 'UNH', shares: '1.4M', value: 658, pct: 0.6, change: 'Unchanged' },
    ],
    sectors: [
      { name: 'Technology', value: 42 },
      { name: 'Healthcare', value: 15 },
      { name: 'Finance', value: 12 },
      { name: 'Consumer', value: 16 },
      { name: 'Energy', value: 8 },
      { name: 'Other', value: 7 },
    ],
    notableMoves: [
      { title: 'Biggest New Position', detail: 'META — $2.18B', badge: 'emerald' },
      { title: 'Largest Exit', detail: 'XOM — $1.42B', badge: 'crimson' },
      { title: 'Biggest Increase', detail: 'NVDA +55%', badge: 'chartblue' },
    ],
  },
  'Two Sigma': {
    name: 'Two Sigma',
    aum: '$58B',
    holdings: 2103,
    topHolding: 'AMZN',
    positions: [
      { stock: 'AMZN', shares: '11.2M', value: 2072, pct: 3.6, change: 'Increased' },
      { stock: 'AAPL', shares: '8.5M', value: 1785, pct: 3.1, change: 'Unchanged' },
      { stock: 'NVDA', shares: '2.4M', value: 1488, pct: 2.6, change: 'New' },
      { stock: 'MSFT', shares: '3.1M', value: 1302, pct: 2.3, change: 'Increased' },
      { stock: 'GOOGL', shares: '5.8M', value: 1015, pct: 1.8, change: 'Unchanged' },
      { stock: 'META', shares: '1.5M', value: 780, pct: 1.4, change: 'Decreased' },
      { stock: 'TSLA', shares: '2.8M', value: 669, pct: 1.2, change: 'New' },
      { stock: 'AVGO', shares: '1.0M', value: 590, pct: 1.0, change: 'Unchanged' },
      { stock: 'JPM', shares: '3.0M', value: 504, pct: 0.9, change: 'Unchanged' },
      { stock: 'V', shares: '1.2M', value: 375, pct: 0.7, change: 'Increased' },
      { stock: 'CRM', shares: '1.4M', value: 392, pct: 0.7, change: 'Unchanged' },
      { stock: 'NFLX', shares: '0.4M', value: 272, pct: 0.5, change: 'Decreased' },
    ],
    sectors: [
      { name: 'Technology', value: 48 },
      { name: 'Healthcare', value: 10 },
      { name: 'Finance', value: 14 },
      { name: 'Consumer', value: 15 },
      { name: 'Energy', value: 6 },
      { name: 'Other', value: 7 },
    ],
    notableMoves: [
      { title: 'Biggest New Position', detail: 'NVDA — $1.49B', badge: 'emerald' },
      { title: 'Largest Exit', detail: 'DIS — $612M', badge: 'crimson' },
      { title: 'Biggest Increase', detail: 'AMZN +32%', badge: 'chartblue' },
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// FETCH FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export async function fetchMarketIndices(): Promise<MarketIndex[]> {
  try {
    const response = await fetch('/data/indices.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const raw = await response.json();
    // Transform scraper format to MarketIndex format
    return raw.map((item: any) => ({
      symbol: item.ticker?.replace('^', '') || item.name?.charAt(0) || '',
      name: item.name,
      value: parseFloat(String(item.value).replace(/,/g, '')),
      change: parseFloat(String(item.change).replace('+', '')),
      changePercent: item.changePercent || 0,
      sparkline: item.sparkline?.length ? item.sparkline : MOCK_MARKET_INDICES.find(m => m.name === item.name)?.sparkline || [],
    }));
  } catch (error) {
    console.warn('Using mock data for market indices:', error);
    return MOCK_MARKET_INDICES;
  }
}

export async function fetchStockScreener(): Promise<StockScreenerResult[]> {
  try {
    const response = await fetch('/data/stock_screener.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Using mock data for stock screener:', error);
    return MOCK_STOCK_SCREENER;
  }
}

export async function fetchStockDetail(ticker: string): Promise<StockDetail> {
  try {
    const response = await fetch(`/data/stocks/${ticker.toUpperCase()}.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Using mock data for stock detail ${ticker}:`, error);
    return MOCK_STOCK_DETAILS[ticker.toUpperCase()] ?? MOCK_STOCK_DETAILS['AAPL'];
  }
}

export async function fetchCryptoOverview(): Promise<CryptoAsset[]> {
  try {
    const response = await fetch('/data/crypto.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const raw = await response.json();
    // Transform CoinGecko scraper format to CryptoAsset format
    const sectorMap: Record<string, string> = { BTC: 'Currency', ETH: 'Smart Contract', USDT: 'Stablecoin', USDC: 'Stablecoin', SOL: 'L1', BNB: 'L1', XRP: 'L1', ADA: 'L1', DOGE: 'Meme', DOT: 'L1', LINK: 'Oracle', AVAX: 'L1', MATIC: 'L1', UNI: 'DeFi', ATOM: 'L1' };
    return raw.slice(0, 20).map((item: any) => ({
      rank: item.rank || item.market_cap_rank || 0,
      name: item.name,
      ticker: (item.symbol || item.ticker || '').toUpperCase(),
      price: item.price || item.current_price || 0,
      change24h: item.change24h || item.price_change_percentage_24h || 0,
      change7d: item.change7d || item.price_change_percentage_7d || 0,
      marketCap: formatLargeNumber(item.marketCap || item.market_cap || 0),
      volume24h: formatLargeNumber(item.volume24h || item.total_volume || 0),
      sparkline: item.sparkline?.length ? item.sparkline : [],
      sector: sectorMap[(item.symbol || item.ticker || '').toUpperCase()] || 'Other',
    }));
  } catch (error) {
    console.warn('Using mock data for crypto overview:', error);
    return MOCK_CRYPTO_OVERVIEW;
  }
}

function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toFixed(2)}`;
}

export async function fetchCryptoOnChain(): Promise<CryptoOnChainData> {
  try {
    const response = await fetch('/data/crypto_onchain.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Using mock data for crypto on-chain:', error);
    return MOCK_CRYPTO_ONCHAIN;
  }
}

export async function fetchYieldCurve(): Promise<YieldCurveData[]> {
  try {
    const response = await fetch('/data/yield_curve.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Using mock data for yield curve:', error);
    return MOCK_YIELD_CURVE;
  }
}

export async function fetchEconomicCalendar(): Promise<EconomicEvent[]> {
  try {
    const response = await fetch('/data/economic_calendar.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Using mock data for economic calendar:', error);
    return MOCK_ECONOMIC_CALENDAR;
  }
}

export async function fetchFearGreed(): Promise<FearGreedData> {
  try {
    const response = await fetch('/data/fear_greed.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const raw = await response.json();
    // Transform scraper format: { current: { value, label }, oneWeekAgo: { value, label }, ... }
    if (raw.current) {
      return {
        currentValue: raw.current.value,
        currentLabel: raw.current.label,
        oneWeekAgo: raw.oneWeekAgo?.value || 55,
        oneMonthAgo: raw.oneMonthAgo?.value || 42,
        oneYearAgo: raw.oneYearAgo?.value || 35,
        components: raw.components || MOCK_FEAR_GREED.components,
      };
    }
    return raw;
  } catch (error) {
    console.warn('Using mock data for fear & greed:', error);
    return MOCK_FEAR_GREED;
  }
}

export async function fetchCryptoFearGreed(): Promise<CryptoFearGreedData> {
  try {
    const response = await fetch('/data/crypto_fear_greed.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Using mock data for crypto fear & greed:', error);
    return MOCK_CRYPTO_FEAR_GREED;
  }
}

export async function fetchNews(): Promise<NewsArticle[]> {
  try {
    const response = await fetch('/data/news.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Using mock data for news:', error);
    return MOCK_NEWS;
  }
}

export async function fetchInsiderTrading(): Promise<InsiderFiling[]> {
  try {
    const response = await fetch('/data/insider_trading.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Using mock data for insider trading:', error);
    return MOCK_INSIDER_TRADING;
  }
}

export async function fetchIpoPipeline(): Promise<IpoData> {
  try {
    const response = await fetch('/data/ipo_pipeline.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Using mock data for IPO pipeline:', error);
    return MOCK_IPO_PIPELINE;
  }
}

export async function fetchEarningsCalendar(): Promise<EarningsCompany[]> {
  try {
    const response = await fetch('/data/earnings_calendar.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Using mock data for earnings calendar:', error);
    return MOCK_EARNINGS_CALENDAR;
  }
}

export async function fetchCommodities(): Promise<CommodityData> {
  try {
    const response = await fetch('/data/commodities.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Using mock data for commodities:', error);
    return MOCK_COMMODITIES;
  }
}

export async function fetchCurrencies(): Promise<CurrencyData[]> {
  try {
    const response = await fetch('/data/currencies.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Using mock data for currencies:', error);
    return MOCK_CURRENCIES;
  }
}

export async function fetchManifest(): Promise<DataManifest> {
  try {
    const response = await fetch('/data/manifest.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Using mock data for manifest:', error);
    return MOCK_MANIFEST;
  }
}

export async function fetchHedgeFundTracker(): Promise<Record<string, HedgeFundData>> {
  try {
    const response = await fetch('/data/hedge_fund_tracker.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Using mock data for hedge fund tracker:', error);
    return MOCK_HEDGE_FUNDS;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// useApi HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useApi<T>(fetcher: () => Promise<T>, defaultValue: T) {
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    fetcher()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [fetcher]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
