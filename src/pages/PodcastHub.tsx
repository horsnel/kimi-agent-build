import { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ClockIcon } from '../components/CustomIcons';

gsap.registerPlugin(ScrollTrigger);

type PodcastCategory = 'All' | 'Market Analysis' | 'Interviews' | 'Education' | 'Quick Takes';

interface Episode {
  title: string;
  duration: string;
  date: string;
  category: PodcastCategory;
  featured?: boolean;
  transcript?: string;
}

const categories: PodcastCategory[] = ['All', 'Market Analysis', 'Interviews', 'Education', 'Quick Takes'];

const episodes: Episode[] = [
  {
    title: 'Why the Yield Curve Inversion Matters',
    duration: '45 min',
    date: 'Jan 19, 2026',
    category: 'Market Analysis',
    featured: true,
    transcript: `Welcome to the Sigma Capital podcast. Today we're diving deep into one of the most watched indicators in all of finance — the yield curve. For the past 24 months, the 2-year to 10-year Treasury spread has been inverted, and that's had every economist and portfolio manager on edge. Historically, every recession in the past 50 years has been preceded by a yield curve inversion, with the average lead time being about 14 months.

But here's where it gets interesting. The curve has recently un-inverted, and that's actually when the clock starts ticking. Our analysis of the last 8 inversion cycles shows that the period between un-inversion and recession onset averages just 6 months. However, this cycle is different — we have unprecedented fiscal stimulus, a labor market that continues to defy gravity, and AI-driven productivity gains that could offset traditional recessionary forces.

So what should investors do? First, don't panic. Second, look at the leading indicators within the leading indicators — things like the Sahm Rule, ISM new orders, and credit spreads. These will give you a much earlier signal than waiting for the NBER to officially declare a recession. And third, consider that the market itself is a forward-looking mechanism. If equities are making new highs while the curve is un-inverting, it may be telling you that the soft landing is actually achievable this time.`,
  },
  {
    title: 'Interview: Former Fed Economist on Rate Policy',
    duration: '52 min',
    date: 'Jan 16, 2026',
    category: 'Interviews',
  },
  {
    title: 'Earnings Season Preview: What to Expect',
    duration: '38 min',
    date: 'Jan 13, 2026',
    category: 'Market Analysis',
  },
  {
    title: 'Technical Analysis Deep Dive: Chart Patterns',
    duration: '44 min',
    date: 'Jan 10, 2026',
    category: 'Education',
  },
  {
    title: 'Crypto Regulation: Where We\'re Headed',
    duration: '41 min',
    date: 'Jan 7, 2026',
    category: 'Market Analysis',
  },
  {
    title: 'Retirement Planning in Your 30s',
    duration: '36 min',
    date: 'Jan 4, 2026',
    category: 'Education',
  },
  {
    title: 'The Psychology of Market Bubbles',
    duration: '48 min',
    date: 'Dec 31, 2025',
    category: 'Education',
  },
  {
    title: 'Options Strategies for Income Generation',
    duration: '39 min',
    date: 'Dec 28, 2025',
    category: 'Education',
  },
  {
    title: 'Global Markets: Emerging Opportunities',
    duration: '42 min',
    date: 'Dec 24, 2025',
    category: 'Market Analysis',
  },
  {
    title: 'Quick Take: Jobs Report Breakdown',
    duration: '12 min',
    date: 'Jan 20, 2026',
    category: 'Quick Takes',
  },
];

const categoryColors: Record<string, string> = {
  'Market Analysis': 'bg-emerald/20 text-emerald',
  'Interviews': 'bg-purple-500/20 text-purple-400',
  'Education': 'bg-chartblue/20 text-chartblue',
  'Quick Takes': 'bg-amber-500/20 text-amber-400',
};

function parseDurationToSeconds(duration: string): number {
  const parts = duration.toLowerCase().split(' ');
  let seconds = 0;
  for (let i = 0; i < parts.length; i++) {
    const num = parseInt(parts[i]);
    if (!isNaN(num) && i + 1 < parts.length) {
      if (parts[i + 1].startsWith('h')) seconds += num * 3600;
      else if (parts[i + 1].startsWith('min')) seconds += num * 60;
      else if (parts[i + 1].startsWith('s')) seconds += num;
    }
  }
  return seconds || 300; // default 5 min
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PodcastHub() {
  const [activeCategory, setActiveCategory] = useState<PodcastCategory>('All');
  const [expandedTranscript, setExpandedTranscript] = useState(false);
  const [expandedEpisodeIdx, setExpandedEpisodeIdx] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // TTS state
  const [playingEpisode, setPlayingEpisode] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speechRate, setSpeechRate] = useState(1);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.pod-section',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const stopPlayback = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setPlayingEpisode(null);
    setProgress(0);
  }, []);

  const handlePlay = useCallback((episode: Episode) => {
    if (!episode.transcript) return;

    // If same episode is playing, pause/resume
    if (playingEpisode === episode.title) {
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else {
        window.speechSynthesis.resume();
        setIsPlaying(true);
      }
      return;
    }

    // Stop any current playback
    window.speechSynthesis.cancel();
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Start new playback
    const utterance = new SpeechSynthesisUtterance(episode.transcript);
    utterance.rate = speechRate;
    utterance.pitch = 1;

    const totalDuration = parseDurationToSeconds(episode.duration) * 1000;
    let elapsed = 0;
    const interval = 100;

    utterance.onstart = () => {
      setIsPlaying(true);
      setPlayingEpisode(episode.title);
      setProgress(0);

      progressIntervalRef.current = setInterval(() => {
        elapsed += interval;
        const pct = Math.min((elapsed / totalDuration) * 100, 100);
        setProgress(pct);
      }, interval);
    };

    utterance.onend = () => {
      stopPlayback();
    };

    utterance.onerror = () => {
      stopPlayback();
    };

    window.speechSynthesis.speak(utterance);
  }, [playingEpisode, isPlaying, speechRate, stopPlayback]);

  const handleStop = useCallback(() => {
    stopPlayback();
  }, [stopPlayback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const featured = episodes.find((e) => e.featured);
  const otherEpisodes = episodes.filter((e) => !e.featured);
  const filteredEpisodes = activeCategory === 'All'
    ? otherEpisodes
    : otherEpisodes.filter((e) => e.category === activeCategory);

  return (
    <div ref={sectionRef}>
      {/* Hero */}
      <section className="pod-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite mb-2">
          Podcast Hub
        </h1>
        <div className="flex items-center gap-3">
          <p className="text-slategray text-lg">Market insights and expert interviews on demand</p>
        </div>
      </section>

      {/* TTS Player Bar */}
      {playingEpisode && (
        <section className="pod-section max-w-7xl mx-auto px-6 pb-4">
          <div className="bg-charcoal border border-emerald/30 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button onClick={isPlaying ? () => { window.speechSynthesis.pause(); setIsPlaying(false); } : () => { window.speechSynthesis.resume(); setIsPlaying(true); }} className="w-10 h-10 bg-emerald rounded-full flex items-center justify-center hover:bg-emerald/90 transition-colors">
                  {isPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-obsidian">
                      <rect x="3" y="2" width="4" height="12" fill="currentColor" />
                      <rect x="9" y="2" width="4" height="12" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-obsidian ml-0.5">
                      <path d="M4 2l10 6-10 6V2z" fill="currentColor" />
                    </svg>
                  )}
                </button>
                <button onClick={handleStop} className="w-8 h-8 bg-deepblack border border-subtleborder rounded-full flex items-center justify-center hover:border-emerald/50 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-slategray">
                    <rect x="2" y="2" width="8" height="8" fill="currentColor" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-offwhite truncate mb-1">{playingEpisode}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-deepblack rounded-full overflow-hidden">
                    <div className="h-full bg-emerald rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-xs font-mono text-slategray shrink-0">{formatTime(progress * parseDurationToSeconds(featured?.duration ?? '5 min') / 100)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono text-slategray">Speed:</span>
                <select
                  value={speechRate}
                  onChange={(e) => setSpeechRate(Number(e.target.value))}
                  className="bg-deepblack border border-subtleborder rounded text-xs font-mono text-offwhite px-1 py-0.5 focus:outline-none focus:border-emerald/50"
                >
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Episode */}
      {featured && (
        <section className="pod-section max-w-7xl mx-auto px-6 pb-8">
          <div className="bg-charcoal border border-emerald/30 rounded-xl p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 bg-emerald/20 text-emerald text-xs font-mono rounded">Featured Episode</span>
              <span className={`px-2 py-0.5 text-xs font-mono rounded ${categoryColors[featured.category]}`}>
                {featured.category}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-medium text-offwhite mb-4">{featured.title}</h2>
            <div className="flex items-center gap-4 mb-6 text-sm text-slategray">
              <span className="flex items-center gap-1.5">
                <ClockIcon size={14} /> {featured.duration}
              </span>
              <span>{featured.date}</span>
            </div>

            <div className="flex items-center gap-6 mb-6">
              {featured.transcript ? (
                <button onClick={() => handlePlay(featured)} className="w-14 h-14 bg-emerald rounded-full flex items-center justify-center hover:bg-emerald/90 transition-colors group relative">
                  {playingEpisode === featured.title && isPlaying ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-obsidian">
                      <rect x="4" y="3" width="5" height="14" fill="currentColor" />
                      <rect x="11" y="3" width="5" height="14" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-obsidian ml-0.5">
                      <path d="M5 3l12 7-12 7V3z" fill="currentColor" />
                    </svg>
                  )}
                </button>
              ) : (
                <div className="w-14 h-14 bg-slategray/20 rounded-full flex items-center justify-center cursor-not-allowed">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-slategray">
                    <path d="M5 3l12 7-12 7V3z" fill="currentColor" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <div className="bg-deepblack rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald h-full rounded-full transition-all" style={{ width: playingEpisode === featured.title ? `${progress}%` : '0%' }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs font-mono text-slategray">{playingEpisode === featured.title ? formatTime(progress * parseDurationToSeconds(featured.duration) / 100) : '0:00'}</span>
                  <span className="text-xs font-mono text-slategray">{featured.duration}</span>
                </div>
              </div>
            </div>

            {featured.transcript && (
              <div>
                <button
                  onClick={() => setExpandedTranscript(!expandedTranscript)}
                  className="text-sm font-mono text-emerald hover:text-emerald/80 transition-colors flex items-center gap-1 mb-4"
                >
                  {expandedTranscript ? 'Hide' : 'Show'} Transcript
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className={`transition-transform ${expandedTranscript ? 'rotate-180' : ''}`}
                  >
                    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {expandedTranscript && (
                  <div className="bg-deepblack border border-subtleborder rounded-xl p-6">
                    <div className="text-sm text-slategray leading-relaxed space-y-4">
                      {featured.transcript.split('\n\n').map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="pod-section max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-mono rounded-lg transition-colors ${
                activeCategory === cat
                  ? 'bg-emerald text-obsidian'
                  : 'bg-charcoal border border-subtleborder text-slategray hover:text-offwhite hover:border-slategray'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Episodes Grid */}
      <section className="pod-section max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEpisodes.map((episode, idx) => (
            <article
              key={idx}
              className="bg-charcoal border border-subtleborder rounded-xl p-6 hover:border-emerald/50 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <span className={`px-2 py-0.5 text-xs font-mono rounded ${categoryColors[episode.category]}`}>
                  {episode.category}
                </span>
                {episode.transcript ? (
                  <button onClick={() => handlePlay(episode)} className="w-10 h-10 bg-emerald/10 border border-emerald/30 rounded-full flex items-center justify-center hover:bg-emerald/20 transition-colors group-hover:border-emerald/50">
                    {playingEpisode === episode.title && isPlaying ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-emerald">
                        <rect x="3" y="2" width="3" height="10" fill="currentColor" />
                        <rect x="8" y="2" width="3" height="10" fill="currentColor" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-emerald ml-0.5">
                        <path d="M4 2l8 5-8 5V2z" fill="currentColor" />
                      </svg>
                    )}
                  </button>
                ) : (
                  <div className="w-10 h-10 bg-slategray/10 border border-slategray/30 rounded-full flex items-center justify-center cursor-not-allowed">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-slategray/50">
                      <path d="M4 2l8 5-8 5V2z" fill="currentColor" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="text-base font-medium text-offwhite mb-3 group-hover:text-emerald transition-colors leading-snug">
                {episode.title}
              </h3>
              <div className="flex items-center gap-3 text-xs font-mono text-slategray mb-4">
                <span className="flex items-center gap-1"><ClockIcon size={12} /> {episode.duration}</span>
                <span>{episode.date}</span>
              </div>
              {episode.transcript ? (
                <button
                  onClick={() => setExpandedEpisodeIdx(expandedEpisodeIdx === idx ? null : idx)}
                  className="text-sm font-mono text-emerald hover:text-emerald/80 transition-colors flex items-center gap-1"
                >
                  {expandedEpisodeIdx === idx ? 'Hide' : 'Show'} Transcript
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className={`transition-transform ${expandedEpisodeIdx === idx ? 'rotate-180' : ''}`}
                  >
                    <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ) : (
                <p className="text-xs text-slategray italic">Transcript coming soon — subscribe to be notified</p>
              )}
              {expandedEpisodeIdx === idx && episode.transcript && (
                <div className="mt-4 bg-deepblack border border-subtleborder rounded-lg p-4">
                  <div className="text-sm text-slategray leading-relaxed space-y-3">
                    {episode.transcript.split('\n\n').map((paragraph, pidx) => (
                      <p key={pidx}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Subscribe On */}
      <section className="pod-section max-w-7xl mx-auto px-6 py-12">
        <div className="bg-charcoal border border-subtleborder rounded-xl p-8 text-center">
          <h2 className="text-xl font-display font-medium text-offwhite mb-2">Subscribe On</h2>
          <p className="text-sm text-slategray mb-6">Listen wherever you get your podcasts</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#" className="w-full sm:w-auto px-6 py-3 bg-deepblack border border-subtleborder rounded-xl text-offwhite text-sm font-medium hover:border-emerald/50 hover:text-emerald transition-colors flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-slategray">
                <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 21.99C7.79 22.03 6.8 20.68 5.96 19.47C4.25 16.56 2.93 11.3 4.7 7.72C5.57 5.94 7.36 4.86 9.28 4.84C10.56 4.82 11.78 5.71 12.58 5.71C13.38 5.71 14.86 4.62 16.42 4.8C17.09 4.83 18.89 5.09 20.04 6.78C19.93 6.85 17.69 8.16 17.72 10.88C17.75 14.14 20.6 15.18 20.63 15.2C20.61 15.27 20.17 16.78 19.08 18.34L18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
              </svg>
              Apple Podcasts
            </a>
            <a href="#" className="w-full sm:w-auto px-6 py-3 bg-deepblack border border-subtleborder rounded-xl text-offwhite text-sm font-medium hover:border-emerald/50 hover:text-emerald transition-colors flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-slategray">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 14.36c-.24.24-.56.36-.88.36s-.64-.12-.88-.36l-2.88-2.88c-.24-.24-.36-.56-.36-.88V8c0-.68.56-1.24 1.24-1.24s1.24.56 1.24 1.24v4.12l2.52 2.52c.48.48.48 1.24 0 1.72z" />
              </svg>
              Spotify
            </a>
            <a href="#" className="w-full sm:w-auto px-6 py-3 bg-deepblack border border-subtleborder rounded-xl text-offwhite text-sm font-medium hover:border-emerald/50 hover:text-emerald transition-colors flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-slategray">
                <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
              </svg>
              YouTube
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
