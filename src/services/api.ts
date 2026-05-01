/**
 * Sigma Capital — Frontend API Service Layer
 *
 * Typed fetch functions that load data from JSON files.
 * All data types, 16+ fetch functions, and the useApi hook.
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
  category: 'Market Analysis' | 'Company News' | 'Economic Indicators' | 'Sector Performance' | 'Global Markets' | 'Investment Strategies' | 'Fed Policy' | 'Earnings' | 'Economic Data' | 'Crypto';
  featured?: boolean;
  source: string;
  articleSlug?: string;
  thumbnail?: string;
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
  aum: number | string;
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
      sparkline: item.sparkline?.length ? item.sparkline : [],
    }));
  } catch (error) {
    console.warn('Failed to fetch market indices:', error);
    return [];
  }
}

export async function fetchStockScreener(): Promise<StockScreenerResult[]> {
  try {
    const response = await fetch('/data/stock_screener.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch stock screener:', error);
    return [];
  }
}

export async function fetchStockDetail(ticker: string): Promise<StockDetail> {
  try {
    const response = await fetch(`/data/stocks/${ticker.toUpperCase()}.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Failed to fetch stock detail ${ticker}:`, error);
    return {
      ticker: ticker.toUpperCase(),
      company: ticker.toUpperCase(),
      price: 0,
      change: 0,
      marketCap: '$0',
      pe: 0,
      eps: 0,
      beta: 0,
      open: 0,
      high: 0,
      low: 0,
      volume: '0',
      avgVolume: '0',
      dividend: 0,
      week52Low: 0,
      week52High: 0,
      earnings: [],
      analystBuy: 0,
      analystHold: 0,
      analystSell: 0,
      news: [],
      priceHistory: [],
      recommendation: 'N/A',
    };
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
    console.warn('Failed to fetch crypto overview:', error);
    return [];
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
    console.warn('Failed to fetch crypto on-chain:', error);
    return {
      btcPrice: '$0',
      marketCap: '$0',
      volume24h: '$0',
      activeAddresses: '0',
      exchangeFlows: [],
      whaleTransactions: [],
      onChainIndicators: [],
      activeAddressesData: [],
    };
  }
}

export async function fetchYieldCurve(): Promise<YieldCurveData[]> {
  try {
    const response = await fetch('/data/yield_curve.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch yield curve:', error);
    return [];
  }
}

export async function fetchEconomicCalendar(): Promise<EconomicEvent[]> {
  try {
    const response = await fetch('/data/economic_calendar.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch economic calendar:', error);
    return [];
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
        oneWeekAgo: raw.oneWeekAgo?.value || 50,
        oneMonthAgo: raw.oneMonthAgo?.value || 50,
        oneYearAgo: raw.oneYearAgo?.value || 50,
        components: raw.components || [],
      };
    }
    return raw;
  } catch (error) {
    console.warn('Failed to fetch fear & greed:', error);
    return {
      currentValue: 50,
      currentLabel: 'Neutral',
      oneWeekAgo: 50,
      oneMonthAgo: 50,
      oneYearAgo: 50,
      components: [],
    };
  }
}

export async function fetchCryptoFearGreed(): Promise<CryptoFearGreedData> {
  try {
    const response = await fetch('/data/crypto_fear_greed.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch crypto fear & greed:', error);
    return {
      currentValue: 50,
      currentLabel: 'Neutral',
      history: [],
      components: [],
    };
  }
}

export async function fetchNews(): Promise<NewsArticle[]> {
  try {
    const response = await fetch('/data/news.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch news:', error);
    return [];
  }
}

export async function fetchInsiderTrading(): Promise<InsiderFiling[]> {
  try {
    const response = await fetch('/data/insider_trading.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch insider trading:', error);
    return [];
  }
}

export async function fetchIpoPipeline(): Promise<IpoData> {
  try {
    const response = await fetch('/data/ipo_pipeline.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch IPO pipeline:', error);
    return { upcoming: [], recent: [], spacs: [] };
  }
}

export async function fetchEarningsCalendar(): Promise<EarningsCompany[]> {
  try {
    const response = await fetch('/data/earnings_calendar.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch earnings calendar:', error);
    return [];
  }
}

export async function fetchCommodities(): Promise<CommodityData> {
  try {
    const response = await fetch('/data/commodities.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch commodities:', error);
    return {
      commodities: [],
      correlationMatrix: [],
      commodityNames: [],
    };
  }
}

export async function fetchCurrencies(): Promise<CurrencyData[]> {
  try {
    const response = await fetch('/data/currencies.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch currencies:', error);
    return [];
  }
}

export async function fetchManifest(): Promise<DataManifest> {
  try {
    const response = await fetch('/data/manifest.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch manifest:', error);
    return {
      lastUpdated: null,
      scrapers: {},
      status: 'error',
      runType: null,
    };
  }
}

export async function fetchHedgeFundTracker(): Promise<Record<string, HedgeFundData>> {
  try {
    const response = await fetch('/data/hedge_fund_tracker.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('Failed to fetch hedge fund tracker:', error);
    return {};
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
