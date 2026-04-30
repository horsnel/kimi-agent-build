import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ClockIcon, FilterIcon } from '../components/CustomIcons';

gsap.registerPlugin(ScrollTrigger);

type Importance = 'High' | 'Medium' | 'Low';

interface EconomicEvent {
  id: number;
  date: string;
  time: string;
  event: string;
  country: string;
  flag: string;
  importance: Importance;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  isPast: boolean;
}

const economicEvents: EconomicEvent[] = [
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
  { id: 19, date: 'Mar 20', time: '02:00 JST', event: 'BoJ Rate Decision', country: 'JP', flag: '🇯🇵', importance: 'High', actual: null, forecast: '-0.10%', previous: '-0.10%', isPast: false },
  { id: 20, date: 'Mar 21', time: '07:00 GMT', event: 'Retail Sales (MoM)', country: 'UK', flag: '🇬🇧', importance: 'Medium', actual: null, forecast: '0.8%', previous: '0.5%', isPast: false },
];

const timeFilters = ['This Week', 'This Month', 'Next Month'] as const;
const countryFilters = [
  { code: 'US', flag: '🇺🇸', label: 'US' },
  { code: 'EU', flag: '🇪🇺', label: 'EU' },
  { code: 'UK', flag: '🇬🇧', label: 'UK' },
  { code: 'JP', flag: '🇯🇵', label: 'JP' },
  { code: 'CN', flag: '🇨🇳', label: 'CN' },
];

function ImportanceBadge({ level }: { level: Importance }) {
  const styles: Record<Importance, string> = {
    High: 'bg-crimson/20 text-crimson border-crimson/30',
    Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    Low: 'bg-slategray/20 text-slategray border-slategray/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-mono rounded border ${styles[level]}`}>
      {level}
    </span>
  );
}

function compareActualForecast(actual: string | null, forecast: string | null): 'beat' | 'miss' | 'neutral' {
  if (!actual || !forecast) return 'neutral';
  const aNum = parseFloat(actual.replace(/[^0-9.-]/g, ''));
  const fNum = parseFloat(forecast.replace(/[^0-9.-]/g, ''));
  if (isNaN(aNum) || isNaN(fNum)) return 'neutral';
  return aNum > fNum ? 'beat' : aNum < fNum ? 'miss' : 'neutral';
}

export default function EconomicCalendar() {
  const [timeFilter, setTimeFilter] = useState<string>('This Week');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.calendar-section',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const toggleCountry = (code: string) => {
    setSelectedCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const filtered = economicEvents.filter((e) => {
    if (selectedCountries.length > 0 && !selectedCountries.includes(e.country)) return false;
    return true;
  });

  const totalEvents = filtered.length;
  const highImpact = filtered.filter((e) => e.importance === 'High').length;
  const countries = new Set(filtered.map((e) => e.country)).size;
  const upcoming = filtered.filter((e) => !e.isPast).length;

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="calendar-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite mb-2">
          Economic Calendar
        </h1>
        <p className="text-slategray max-w-xl">
          Track high-impact economic events and data releases
        </p>
      </section>

      {/* Filter Bar */}
      <section className="calendar-section max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2">
            <FilterIcon size={16} className="text-slategray" />
            <span className="text-xs font-mono text-slategray mr-2">Time:</span>
            <div className="flex bg-deepblack border border-subtleborder rounded-lg p-1">
              {timeFilters.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeFilter(tf)}
                  className={`px-3 py-1.5 text-xs font-mono rounded transition-colors ${
                    timeFilter === tf
                      ? 'bg-emerald text-obsidian'
                      : 'text-slategray hover:text-offwhite'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slategray mr-2">Country:</span>
            <div className="flex gap-1">
              {countryFilters.map((cf) => (
                <button
                  key={cf.code}
                  onClick={() => toggleCountry(cf.code)}
                  className={`px-2.5 py-1.5 text-xs font-mono rounded border transition-colors ${
                    selectedCountries.includes(cf.code)
                      ? 'bg-emerald/20 border-emerald/50 text-emerald'
                      : 'bg-deepblack border-subtleborder text-slategray hover:text-offwhite'
                  }`}
                >
                  {cf.flag} {cf.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="calendar-section max-w-7xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Events', value: totalEvents, color: 'text-offwhite' },
            { label: 'High Impact', value: highImpact, color: 'text-crimson' },
            { label: 'Countries', value: countries, color: 'text-emerald' },
            { label: 'Upcoming', value: upcoming, color: 'text-chartblue' },
          ].map((stat) => (
            <div key={stat.label} className="bg-charcoal border border-subtleborder rounded-xl p-5">
              <p className="text-xs font-mono text-slategray mb-1">{stat.label}</p>
              <p className={`text-2xl font-display font-light ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Calendar Table */}
      <section className="calendar-section max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-charcoal border border-subtleborder rounded-xl overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-subtleborder">
                  <th className="text-left text-xs font-mono text-slategray px-5 py-3">Date</th>
                  <th className="text-left text-xs font-mono text-slategray px-5 py-3">Time</th>
                  <th className="text-left text-xs font-mono text-slategray px-5 py-3">Event</th>
                  <th className="text-left text-xs font-mono text-slategray px-5 py-3">Country</th>
                  <th className="text-left text-xs font-mono text-slategray px-5 py-3">Importance</th>
                  <th className="text-right text-xs font-mono text-slategray px-5 py-3">Actual</th>
                  <th className="text-right text-xs font-mono text-slategray px-5 py-3">Forecast</th>
                  <th className="text-right text-xs font-mono text-slategray px-5 py-3">Previous</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event) => {
                  const comparison = event.isPast ? compareActualForecast(event.actual, event.forecast) : 'neutral';
                  return (
                    <tr
                      key={event.id}
                      className="border-b border-subtleborder/50 hover:bg-deepblack/50 transition-colors"
                    >
                      <td className="px-5 py-3 text-sm text-offwhite font-mono">{event.date}</td>
                      <td className="px-5 py-3 text-sm text-slategray font-mono flex items-center gap-1.5">
                        <ClockIcon size={12} /> {event.time}
                      </td>
                      <td className="px-5 py-3 text-sm text-offwhite">{event.event}</td>
                      <td className="px-5 py-3 text-sm font-mono">
                        {event.flag} {event.country}
                      </td>
                      <td className="px-5 py-3">
                        <ImportanceBadge level={event.importance} />
                      </td>
                      <td className={`px-5 py-3 text-sm text-right font-mono ${
                        !event.isPast
                          ? 'text-slategray'
                          : comparison === 'beat'
                          ? 'text-emerald'
                          : comparison === 'miss'
                          ? 'text-crimson'
                          : 'text-offwhite'
                      }`}>
                        {event.actual ?? '\u2014'}
                      </td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-slategray">
                        {event.forecast ?? '\u2014'}
                      </td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-slategray">
                        {event.previous ?? '\u2014'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">
            {filtered.map((event) => {
              const comparison = event.isPast ? compareActualForecast(event.actual, event.forecast) : 'neutral';
              return (
                <div key={event.id} className="p-4 border-b border-subtleborder/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-offwhite">{event.flag}</span>
                      <span className="text-sm text-offwhite">{event.event}</span>
                    </div>
                    <ImportanceBadge level={event.importance} />
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-slategray mb-2">
                    <span>{event.date}</span>
                    <span className="flex items-center gap-1"><ClockIcon size={10} /> {event.time}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    <div>
                      <p className="text-slategray mb-0.5">Actual</p>
                      <p className={
                        !event.isPast
                          ? 'text-slategray'
                          : comparison === 'beat'
                          ? 'text-emerald'
                          : comparison === 'miss'
                          ? 'text-crimson'
                          : 'text-offwhite'
                      }>{event.actual ?? '\u2014'}</p>
                    </div>
                    <div>
                      <p className="text-slategray mb-0.5">Forecast</p>
                      <p className="text-offwhite">{event.forecast ?? '\u2014'}</p>
                    </div>
                    <div>
                      <p className="text-slategray mb-0.5">Previous</p>
                      <p className="text-offwhite">{event.previous ?? '\u2014'}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
