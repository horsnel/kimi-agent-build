import { useState, useEffect, useCallback, createContext, useContext } from 'react';

/* ── Country → Currency mapping (60+ countries) ── */
const COUNTRY_CURRENCY: Record<string, { code: string; symbol: string; name: string; locale: string }> = {
  US: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  GB: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  EU: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  DE: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  FR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'fr-FR' },
  IT: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'it-IT' },
  ES: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'es-ES' },
  NL: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'nl-NL' },
  PT: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'pt-PT' },
  IE: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-IE' },
  AT: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-AT' },
  BE: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'fr-BE' },
  FI: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'fi-FI' },
  GR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'el-GR' },
  LU: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'fr-LU' },
  MT: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-MT' },
  SI: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'sl-SI' },
  SK: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'sk-SK' },
  EE: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'et-EE' },
  LV: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'lv-LV' },
  LT: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'lt-LT' },
  CY: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'el-CY' },
  JP: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  CN: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  IN: { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  BR: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  KR: { code: 'KRW', symbol: '₩', name: 'South Korean Won', locale: 'ko-KR' },
  AU: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  CA: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA' },
  CH: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
  HK: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'en-HK' },
  SG: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  SE: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE' },
  NO: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO' },
  DK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', locale: 'da-DK' },
  NZ: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ' },
  ZA: { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
  MX: { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', locale: 'es-MX' },
  AR: { code: 'ARS', symbol: '$', name: 'Argentine Peso', locale: 'es-AR' },
  NG: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG' },
  KE: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE' },
  GH: { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', locale: 'en-GH' },
  EG: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', locale: 'ar-EG' },
  SA: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', locale: 'ar-SA' },
  AE: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
  IL: { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', locale: 'he-IL' },
  TR: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', locale: 'tr-TR' },
  TH: { code: 'THB', symbol: '฿', name: 'Thai Baht', locale: 'th-TH' },
  PH: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', locale: 'en-PH' },
  MY: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY' },
  ID: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID' },
  VN: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', locale: 'vi-VN' },
  PL: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', locale: 'pl-PL' },
  CZ: { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', locale: 'cs-CZ' },
  HU: { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', locale: 'hu-HU' },
  RO: { code: 'RON', symbol: 'lei', name: 'Romanian Leu', locale: 'ro-RO' },
  RU: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', locale: 'ru-RU' },
  CO: { code: 'COP', symbol: '$', name: 'Colombian Peso', locale: 'es-CO' },
  CL: { code: 'CLP', symbol: '$', name: 'Chilean Peso', locale: 'es-CL' },
  PE: { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol', locale: 'es-PE' },
  TW: { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar', locale: 'zh-TW' },
  PK: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', locale: 'ur-PK' },
  BD: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', locale: 'bn-BD' },
  UA: { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', locale: 'uk-UA' },
  TZ: { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', locale: 'en-TZ' },
  UG: { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', locale: 'en-UG' },
  MA: { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham', locale: 'ar-MA' },
  IQ: { code: 'IQD', symbol: 'ع.د', name: 'Iraqi Dinar', locale: 'ar-IQ' },
  KW: { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', locale: 'ar-KW' },
  QA: { code: 'QAR', symbol: '﷼', name: 'Qatari Riyal', locale: 'ar-QA' },
  BH: { code: 'BHD', symbol: 'د.ب', name: 'Bahraini Dinar', locale: 'ar-BH' },
  OM: { code: 'OMR', symbol: '﷼', name: 'Omani Rial', locale: 'ar-OM' },
  JO: { code: 'JOD', symbol: 'د.ا', name: 'Jordanian Dinar', locale: 'ar-JO' },
  LB: { code: 'LBP', symbol: 'ل.ل', name: 'Lebanese Pound', locale: 'ar-LB' },
  NP: { code: 'NPR', symbol: 'रू', name: 'Nepalese Rupee', locale: 'ne-NP' },
  LK: { code: 'LKR', symbol: 'ரூ', name: 'Sri Lankan Rupee', locale: 'si-LK' },
  MM: { code: 'MMK', symbol: 'K', name: 'Myanmar Kyat', locale: 'my-MM' },
  KH: { code: 'KHR', symbol: '៛', name: 'Cambodian Riel', locale: 'km-KH' },
};

const DEFAULT_CURRENCY = COUNTRY_CURRENCY.US;

/* ── Types ── */
interface GeoCurrencyState {
  countryCode: string | null;
  currency: typeof DEFAULT_CURRENCY;
  rates: Record<string, number>;
  loading: boolean;
  error: string | null;
  convert: (usdAmount: number) => number;
  formatLocal: (usdAmount: number) => string;
  formatLocalShort: (usdAmount: number) => string;
  formatChartTick: (usdAmount: number) => string;
  formatLarge: (usdAmount: number) => string;
  isUSD: boolean;
}

const GeoCurrencyContext = createContext<GeoCurrencyState>({
  countryCode: null,
  currency: DEFAULT_CURRENCY,
  rates: {},
  loading: true,
  error: null,
  convert: (n) => n,
  formatLocal: (n) => `$${n.toLocaleString()}`,
  formatLocalShort: (n) => `$${n.toLocaleString()}`,
  formatChartTick: (n) => `$${n.toLocaleString()}`,
  formatLarge: (n) => `$${n.toLocaleString()}`,
  isUSD: true,
});

export const useGeoCurrency = () => useContext(GeoCurrencyContext);

/* ── Provider ── */
export function GeoCurrencyProvider({ children }: { children: React.ReactNode }) {
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Detect country (silent, invisible, multiple fallbacks)
  useEffect(() => {
    let cancelled = false;

    async function detectCountry() {
      // Try localStorage cache first (24h TTL)
      try {
        const cached = localStorage.getItem('geo_currency_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          const age = Date.now() - parsed.timestamp;
          if (age < 24 * 60 * 60 * 1000 && parsed.countryCode) {
            setCountryCode(parsed.countryCode);
            const mapped = COUNTRY_CURRENCY[parsed.countryCode as keyof typeof COUNTRY_CURRENCY];
            if (mapped) {
              setCurrency(mapped);
              // Also restore cached rate
              if (parsed.rate && parsed.currencyCode) {
                setRates({ USD: 1, [parsed.currencyCode]: parsed.rate });
                setLoading(false);
              }
            }
            return;
          }
        }
      } catch { /* ignore cache errors */ }

      // Try multiple free geolocation APIs in order
      const apis = [
        async () => {
          const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
          if (res.ok) { const d = await res.json(); return d.country_code as string; }
          return null;
        },
        async () => {
          const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(5000) });
          if (res.ok) { const d = await res.json(); return d.country_code as string; }
          return null;
        },
        async () => {
          const res = await fetch('https://api.ipbase.com/v2/info', { signal: AbortSignal.timeout(5000) });
          if (res.ok) { const d = await res.json(); return d?.data?.location?.country?.alpha2 as string; }
          return null;
        },
        async () => {
          const res = await fetch('https://ipapi.com/json/', { signal: AbortSignal.timeout(5000) });
          if (res.ok) { const d = await res.json(); return d.country as string; }
          return null;
        },
      ];

      for (const api of apis) {
        try {
          const code = await api();
          if (!cancelled && code) {
            setCountryCode(code);
            const mapped = COUNTRY_CURRENCY[code as keyof typeof COUNTRY_CURRENCY];
            if (mapped) setCurrency(mapped);
            return; // success, stop trying
          }
        } catch {
          // try next API
        }
      }
    }

    detectCountry();
    return () => { cancelled = true; };
  }, []);

  // Step 2: Fetch exchange rates (multiple fallbacks)
  useEffect(() => {
    let cancelled = false;

    async function fetchRates() {
      if (currency.code === 'USD') {
        setRates({ USD: 1 });
        setLoading(false);
        return;
      }

      // Helper to cache the rate in localStorage
      const cacheRate = (rate: number) => {
        try {
          localStorage.setItem('geo_currency_cache', JSON.stringify({
            countryCode,
            currencyCode: currency.code,
            rate,
            timestamp: Date.now(),
          }));
        } catch { /* ignore */ }
      };

      // Try frankfurter.app first (ECB data, reliable)
      try {
        const res = await fetch(
          `https://api.frankfurter.app/latest?from=USD&to=${currency.code}`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.rates && data.rates[currency.code]) {
            const rate = data.rates[currency.code];
            setRates({ USD: 1, [currency.code]: rate });
            cacheRate(rate);
            setLoading(false);
            return;
          }
        }
      } catch { /* fallback */ }

      // Fallback: open.er-api.com
      try {
        const res2 = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(8000) });
        if (res2.ok) {
          const data2 = await res2.json();
          if (!cancelled && data2.rates && data2.rates[currency.code]) {
            const rate = data2.rates[currency.code];
            setRates({ USD: 1, [currency.code]: rate });
            cacheRate(rate);
            setLoading(false);
            return;
          }
        }
      } catch { /* fallback */ }

      // Fallback: exchangerate-api.com free tier
      try {
        const res3 = await fetch('https://v6.exchangerate-api.com/v6/latest/USD', { signal: AbortSignal.timeout(8000) });
        if (res3.ok) {
          const data3 = await res3.json();
          if (!cancelled && data3.conversion_rates && data3.conversion_rates[currency.code]) {
            const rate = data3.conversion_rates[currency.code];
            setRates({ USD: 1, [currency.code]: rate });
            cacheRate(rate);
            setLoading(false);
            return;
          }
        }
      } catch { /* all failed */ }

      if (!cancelled) {
        setError('Rate fetch failed');
        setLoading(false);
      }
    }

    fetchRates();
    return () => { cancelled = true; };
  }, [currency.code]);

  // Convert USD amount to local currency
  const convert = useCallback(
    (usdAmount: number): number => {
      const rate = rates[currency.code] || 1;
      return usdAmount * rate;
    },
    [rates, currency.code]
  );

  // Format with full local currency symbol + amount (for general display)
  const formatLocal = useCallback(
    (usdAmount: number): string => {
      const localAmount = convert(usdAmount);
      try {
        return new Intl.NumberFormat(currency.locale, {
          style: 'currency',
          currency: currency.code,
          minimumFractionDigits: localAmount < 1 ? 4 : 2,
          maximumFractionDigits: localAmount < 1 ? 6 : 2,
        }).format(localAmount);
      } catch {
        return `${currency.symbol}${localAmount.toLocaleString()}`;
      }
    },
    [convert, currency]
  );

  // Shorter format for tight spaces (e.g., tables, cards)
  const formatLocalShort = useCallback(
    (usdAmount: number): string => {
      const localAmount = convert(usdAmount);
      if (localAmount >= 1_000_000_000) {
        return `${currency.symbol}${(localAmount / 1_000_000_000).toFixed(1)}B`;
      }
      if (localAmount >= 1_000_000) {
        return `${currency.symbol}${(localAmount / 1_000_000).toFixed(1)}M`;
      }
      if (localAmount >= 100_000) {
        return `${currency.symbol}${(localAmount / 1_000).toFixed(0)}K`;
      }
      try {
        return new Intl.NumberFormat(currency.locale, {
          style: 'currency',
          currency: currency.code,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(localAmount);
      } catch {
        return `${currency.symbol}${localAmount.toFixed(2)}`;
      }
    },
    [convert, currency]
  );

  // Chart tick formatter — compact format for axis labels
  const formatChartTick = useCallback(
    (usdAmount: number): string => {
      const localAmount = convert(usdAmount);
      if (localAmount >= 1_000_000_000) {
        return `${currency.symbol}${(localAmount / 1_000_000_000).toFixed(1)}B`;
      }
      if (localAmount >= 1_000_000) {
        return `${currency.symbol}${(localAmount / 1_000_000).toFixed(1)}M`;
      }
      if (localAmount >= 1_000) {
        return `${currency.symbol}${(localAmount / 1_000).toFixed(0)}K`;
      }
      return `${currency.symbol}${localAmount.toFixed(0)}`;
    },
    [convert, currency]
  );

  // Large number formatter — for billions/millions like AUM, market cap, etc.
  const formatLarge = useCallback(
    (usdAmount: number): string => {
      const localAmount = convert(usdAmount);
      if (localAmount >= 1_000_000_000) {
        return `${currency.symbol}${(localAmount / 1_000_000_000).toFixed(1)}B`;
      }
      if (localAmount >= 1_000_000) {
        return `${currency.symbol}${(localAmount / 1_000_000).toFixed(0)}M`;
      }
      if (localAmount >= 1_000) {
        return `${currency.symbol}${(localAmount / 1_000).toFixed(1)}K`;
      }
      try {
        return new Intl.NumberFormat(currency.locale, {
          style: 'currency',
          currency: currency.code,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(localAmount);
      } catch {
        return `${currency.symbol}${localAmount.toFixed(2)}`;
      }
    },
    [convert, currency]
  );

  const isUSD = currency.code === 'USD';

  return (
    <GeoCurrencyContext.Provider
      value={{
        countryCode,
        currency,
        rates,
        loading,
        error,
        convert,
        formatLocal,
        formatLocalShort,
        formatChartTick,
        formatLarge,
        isUSD,
      }}
    >
      {children}
    </GeoCurrencyContext.Provider>
  );
}

/* ── Convenience component for rendering local prices in JSX ── */
export function LocalPrice({
  usd,
  short = false,
  className = '',
  showOriginal = false,
}: {
  usd: number;
  short?: boolean;
  className?: string;
  showOriginal?: boolean;
}) {
  const { formatLocal, formatLocalShort, isUSD, loading } = useGeoCurrency();

  if (loading) {
    return <span className={className}>${usd.toLocaleString()}</span>;
  }

  const formatted = short ? formatLocalShort(usd) : formatLocal(usd);

  if (isUSD) {
    return <span className={className}>{formatted}</span>;
  }

  return (
    <span className={className}>
      {formatted}
      {showOriginal && (
        <span className="text-slategray text-xs ml-1">(≈ ${usd.toLocaleString()} USD)</span>
      )}
    </span>
  );
}

/* ── Large price component for AUM, market cap, etc. ── */
export function LocalLargePrice({
  usd,
  className = '',
}: {
  usd: number;
  className?: string;
}) {
  const { formatLarge, loading } = useGeoCurrency();

  if (loading) {
    return <span className={className}>${usd.toLocaleString()}</span>;
  }

  return <span className={className}>{formatLarge(usd)}</span>;
}

/* ── Tiny currency indicator (for footer/settings) ── */
export function CurrencyIndicator({ className = '' }: { className?: string }) {
  const { currency, countryCode, loading } = useGeoCurrency();

  if (loading) return null;

  return (
    <span className={`text-xs font-mono text-slategray ${className}`}>
      {currency.code} {currency.symbol}
      {countryCode && countryCode !== 'US' && ` · ${countryCode}`}
    </span>
  );
}
