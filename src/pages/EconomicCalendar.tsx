import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ClockIcon, FilterIcon } from '../components/CustomIcons';
import { fetchEconomicCalendar, type EconomicEvent as ApiEconomicEvent } from '../services/api';

gsap.registerPlugin(ScrollTrigger);

type Importance = 'High' | 'Medium' | 'Low';
type EconomicEvent = ApiEconomicEvent;

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
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEconomicCalendar()
      .then(setEconomicEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
        <div className="animate-pulse">
          <div className="h-10 bg-charcoal rounded w-1/3 mx-auto mb-4" />
          <div className="h-6 bg-charcoal rounded w-1/2 mx-auto" />
        </div>
        <p className="text-slategray text-sm mt-4">Loading economic calendar...</p>
      </div>
    );
  }

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
