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
  transcript: string;
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
    transcript: `In today's episode, we sit down with Dr. Sarah Chen, a former senior economist at the Federal Reserve who spent 12 years at the Board of Governors before transitioning to private sector advisory. Dr. Chen brings an insider's perspective on how rate decisions actually get made — and it's far more nuanced than most market participants realize.

Dr. Chen explains that the Fed's decision-making process involves layers of modeling, regional input from the 12 district banks, and political considerations that rarely make it into the official minutes. "People read the FOMC statement and think they understand the debate," she says. "But the real conversation happens in the two weeks before the meeting, in the hallway discussions, in the memos that never get published." She emphasizes that the dot plot is more of a communication tool than a forecasting mechanism, and that individual members' projections often shift dramatically between meetings.

Perhaps most importantly for investors, Dr. Chen shares her framework for reading between the lines of Fed communications. She points to three signals that the market consistently misses: changes in the language around "data dependency," shifts in how the Fed characterizes risks to its dual mandate, and the tone of Chair Powell's press conference opening statement versus the Q&A. "The opening statement is scripted and vetted," she notes. "The Q&A is where you see the real thinking." She advises listeners to pay particular attention to questions that make the Chair pause or reformulate — those moments often reveal the areas where the consensus is weakest.`,
  },
  {
    title: 'Earnings Season Preview: What to Expect',
    duration: '38 min',
    date: 'Jan 13, 2026',
    category: 'Market Analysis',
    transcript: `Earnings season is upon us once again, and this quarter carries unusual weight. After two consecutive quarters of margin expansion driven largely by cost-cutting rather than revenue growth, analysts are watching closely to see whether companies can sustain earnings beats through organic top-line growth. The consensus estimate for S&P 500 earnings growth this quarter sits at 4.2%, but our proprietary model suggests we could see upside of 6-7%, driven primarily by the technology and healthcare sectors.

The key variable this quarter is guidance. In the previous earnings cycle, an unprecedented number of companies declined to provide forward guidance, citing macroeconomic uncertainty. That created a vacuum that was filled by analyst speculation, leading to extreme volatility in post-earnings price action. We expect more companies to restore guidance this quarter, particularly in the consumer discretionary and industrial sectors where visibility has improved. However, technology companies may continue to play it cautious given the unpredictable nature of AI spending cycles and the regulatory landscape.

For individual investors, our advice is to look beyond the headline numbers. Focus on three things: operating margin trends, inventory levels relative to revenue, and capital expenditure plans. Companies that are investing through the cycle — especially in R&D and digital infrastructure — tend to outperform significantly over the following 12-18 months. Conversely, companies that beat earnings through aggressive buybacks while letting their competitive moat erode are setting themselves up for disappointment. We'll be tracking all of this in real-time through our Sigma Capital earnings dashboard.`,
  },
  {
    title: 'Technical Analysis Deep Dive: Chart Patterns',
    duration: '44 min',
    date: 'Jan 10, 2026',
    category: 'Education',
    transcript: `Welcome to our deep dive on technical analysis. Today we're going beyond the basics — we're assuming you already know your support and resistance levels, and we're focusing on the chart patterns that actually have statistical edge. Our team analyzed 20 years of data across 5,000 equities and found that only a handful of classic patterns consistently produce actionable signals.

The head and shoulders pattern is perhaps the most misunderstood formation in all of technical analysis. While textbooks will tell you it's a reliable reversal signal, our data shows it only has a 53% success rate when measured by subsequent 20-day returns. However, when you add volume confirmation — specifically, volume declining on the right shoulder relative to the left — that success rate jumps to 67%. The key insight is that patterns don't exist in isolation; they need confirming signals to become actionable.

We also cover the ascending triangle, which our research identifies as the most reliable continuation pattern with a 68% success rate across all timeframes. The critical factor is the angle of the ascending trendline — it needs to be between 30 and 45 degrees. Steeper ascending lines often result in false breakouts. Finally, we discuss the cup and handle formation, which has shown remarkable persistence in bull markets with a 71% success rate, but fails dramatically in bear markets, dropping to just 44%. Context matters enormously in technical analysis, and no pattern should be traded in isolation from the broader market environment.`,
  },
  {
    title: "Crypto Regulation: Where We're Headed",
    duration: '41 min',
    date: 'Jan 7, 2026',
    category: 'Market Analysis',
    transcript: `The regulatory landscape for cryptocurrencies is shifting rapidly, and 2026 is shaping up to be a pivotal year. After years of enforcement-driven regulation in the United States, we're seeing a fundamental shift toward legislative clarity. The bipartisan Digital Asset Market Structure Act, introduced late last year, has gained significant momentum and is expected to reach a floor vote by Q2. This legislation would create a clear framework for token classification, exchange registration, and stablecoin oversight.

The implications for investors are profound. For the first time, we could see a clear distinction between security tokens and commodity tokens at the federal level, which would resolve the SEC vs. CFTC jurisdictional battle that has paralyzed the industry. More importantly, the proposed framework includes provisions for decentralized finance protocols that could legitimize yield farming and liquidity provision activities that currently operate in a legal gray area. Several major DeFi protocols have already begun preparing compliance frameworks in anticipation.

However, not all the news is positive. The EU's MiCA regulation, while providing clarity, imposes stringent reserve requirements on stablecoin issuers that could force smaller players out of the market. And China's ongoing crackdown on crypto-adjacent activities continues to create uncertainty for projects with significant Asian exposure. Our recommendation for crypto investors is to focus on assets and protocols that are proactively building compliance infrastructure — these are the ones that will survive and thrive in the regulated environment that's coming.`,
  },
  {
    title: 'Retirement Planning in Your 30s',
    duration: '36 min',
    date: 'Jan 4, 2026',
    category: 'Education',
    transcript: `If you're in your 30s and haven't started retirement planning, you're not alone — but you are running out of excuses. The single most powerful force working in your favor right now is time, and compounding returns over 30-plus years can turn modest contributions into substantial wealth. Let's break down the math: if you invest $500 per month starting at age 30 with an average annual return of 8%, you'll have approximately $745,000 by age 65. Wait until 40 to start, and you'd need to contribute $1,300 per month to reach the same goal.

The first step is maximizing your tax-advantaged accounts. If your employer offers a 401(k) match, that's free money — contribute at least enough to capture the full match before doing anything else. Then consider a Roth IRA, which is particularly valuable in your 30s because your tax rate is likely lower than it will be at retirement. The Roth allows tax-free growth and tax-free withdrawals, which is incredibly powerful over a 30-year horizon. For 2026, the contribution limit is $7,000, and we recommend automating contributions so you never miss a month.

Beyond account structure, asset allocation is critical. In your 30s, you should be heavily weighted toward equities — we suggest 85-90% stocks with the remainder in bonds and alternatives. Within equities, diversify across market caps and geographies. Don't make the mistake of concentrating in a handful of tech stocks just because they've performed well recently. A three-fund portfolio using a total US stock index, total international stock index, and total bond index can capture market returns with minimal fees. As your income grows, increase your savings rate by 1% each year until you reach 20% or more.`,
  },
  {
    title: 'The Psychology of Market Bubbles',
    duration: '48 min',
    date: 'Dec 31, 2025',
    category: 'Education',
    transcript: `Today we're exploring one of the most fascinating and dangerous phenomena in financial markets: the bubble. From the Dutch tulip mania of the 1630s to the dot-com bust of 2000 and the crypto winter of 2022, bubbles follow a remarkably consistent psychological pattern. Understanding this pattern isn't just academic — it can help you protect your portfolio and even profit from the inevitable correction.

The bubble lifecycle, as described by hyman Minsky and later refined by behavioral economists, typically follows five stages: displacement, boom, euphoria, profit-taking, and panic. The displacement phase is where a genuinely new technology or paradigm creates legitimate excitement — the internet in the 1990s, blockchain in the 2010s, AI in the 2020s. This is rational. The problem begins in the boom phase, when rising prices attract participants who are no longer evaluating fundamentals but simply chasing momentum. By the euphoria phase, otherwise rational people are making irrational decisions — borrowing against their homes to buy meme stocks, or taking on leverage to buy assets they don't understand.

The key psychological driver is what behavioral finance calls "availability bias" combined with "social proof." When everyone around you is making money, the fear of missing out becomes overwhelming. Your brain literally reweights probabilities, making the upside seem more likely and the downside seem impossible. The antidote is having a pre-committed investment plan with clear entry and exit criteria. Write down your thesis before you invest, and include the conditions under which you would sell. This creates a rational anchor that can counteract the emotional pull of the bubble.`,
  },
  {
    title: 'Options Strategies for Income Generation',
    duration: '39 min',
    date: 'Dec 28, 2025',
    category: 'Education',
    transcript: `Generating consistent income from options is one of the most misunderstood strategies in retail investing. Today we're cutting through the noise and focusing on three strategies that have been backtested extensively and shown reliable risk-adjusted returns: covered calls, cash-secured puts, and credit spreads. Each has a distinct risk profile and ideal market environment, and understanding when to deploy each is the key to success.

Covered calls are the simplest entry point for income generation. By selling call options against stocks you already own, you collect premium while capping your upside. Our backtesting shows that covered call strategies on the S&P 500 generate approximately 2-3% annualized outperformance in flat to mildly bullish markets, but underperform in strong bull markets by 4-6% due to the opportunity cost of capped gains. The optimal strike price is typically 5-8% out of the money with 30-45 day expirations, which maximizes the theta decay while leaving room for modest capital appreciation.

Cash-secured puts are the natural complement to covered calls. By selling puts at strikes below the current price, you collect premium while committing to buy the stock at a discount if it declines. This is essentially getting paid to place a limit order. Our research shows that cash-secured put strategies on quality large-cap stocks with strikes 10% below the market price have generated annualized returns of 8-12% with lower volatility than buy-and-hold. The critical factor is only selling puts on stocks you genuinely want to own — if the put is assigned, you should be comfortable holding the position. Credit spreads, particularly bull put spreads and bear call spreads, allow you to define your maximum risk upfront while still generating meaningful premium income.`,
  },
  {
    title: 'Global Markets: Emerging Opportunities',
    duration: '42 min',
    date: 'Dec 24, 2025',
    category: 'Market Analysis',
    transcript: `While US markets have dominated headlines with the AI-driven mega-cap rally, some of the most compelling opportunities in 2026 are emerging from unexpected corners of the global market. Today we're looking at three regions that our analysts believe offer asymmetric risk-reward: Southeast Asia, Latin America, and select frontier markets in Africa.

Southeast Asia stands out for its demographic tailwinds and digital transformation. Vietnam, Indonesia, and the Philippines collectively represent over 600 million people with a median age under 30 and rapidly growing middle classes. The digital economy in Southeast Asia is projected to reach $600 billion by 2030, and local tech companies are capturing this growth at the ground floor. Vietnam in particular has emerged as a major beneficiary of the "China plus one" manufacturing strategy, with foreign direct investment up 32% year-over-year. The VN-Index trades at just 13x forward earnings, a significant discount to both developed markets and other emerging Asian economies.

Latin America presents a more contrarian opportunity. Brazil's Bovespa has been range-bound for three years, but underlying fundamentals are improving: inflation has been tamed, the central bank is in an easing cycle, and the agricultural export sector is benefiting from global supply chain reorganization. Argentina's market reforms under the current administration have created a unique moment — the Merval index is up over 150% in local terms, but currency-adjusted returns tell a different story, and selective exposure to domestically-focused companies could offer significant upside if the reform trajectory continues. We recommend a 5-8% allocation to emerging markets for investors with a 10-year horizon, using a combination of broad ETFs and targeted exposure to the themes we've discussed.`,
  },
  {
    title: 'Quick Take: Jobs Report Breakdown',
    duration: '12 min',
    date: 'Jan 20, 2026',
    category: 'Quick Takes',
    transcript: `This is your Sigma Capital Quick Take on the January 2026 jobs report. The headline number came in at 216,000 non-farm payrolls, well above the consensus estimate of 170,000. The unemployment rate held steady at 3.7%, and average hourly earnings rose 0.4% month-over-month, slightly above expectations. Let's break down what this means for markets and your portfolio.

The strength in the report was broad-based, with gains in healthcare (+52,000), professional services (+41,000), and leisure/hospitality (+38,000). Manufacturing was the only major sector to shed jobs, losing 8,000 positions. The labor force participation rate ticked up to 62.8%, which is significant because it means the labor market is absorbing new entrants without pushing unemployment higher. This is the "goldilocks" scenario that the Fed has been hoping for — strong enough to avoid recession concerns, but with enough slack to keep wage inflation from reigniting.

For markets, this report reinforces the "no landing" narrative that has dominated since late 2025. Equities are likely to continue their upward trajectory, with cyclical sectors leading. Bond yields may tick higher as traders reassess the pace of Fed easing — we're now seeing the market price in only one more rate cut this year, down from two before the report. Our recommendation: stay invested, maintain your equity allocation, and consider adding duration to your bond portfolio on any pullback in yields above 4.5% on the 10-year Treasury.`,
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
  return seconds || 300;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Waveform visualization component
function WaveformVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const bars = 24;
    const barWidth = 3;
    const gap = (width - bars * barWidth) / (bars - 1);

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < bars; i++) {
        let amplitude: number;
        if (isPlaying) {
          amplitude = Math.sin(time / 300 + i * 0.4) * 0.5 + 0.5;
          amplitude *= Math.sin(time / 500 + i * 0.2) * 0.3 + 0.7;
        } else {
          amplitude = 0.15;
        }
        const barHeight = Math.max(2, amplitude * height * 0.9);
        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        ctx.fillStyle = isPlaying
          ? `rgba(16, 185, 129, ${0.4 + amplitude * 0.6})`
          : 'rgba(16, 185, 129, 0.2)';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 1.5);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={32}
      className="shrink-0"
    />
  );
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
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.code === 'Space' && playingEpisode) {
        e.preventDefault();
        if (isPlaying) {
          window.speechSynthesis.pause();
          setIsPlaying(false);
        } else {
          window.speechSynthesis.resume();
          setIsPlaying(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playingEpisode, isPlaying]);

  const stopPlayback = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    window.speechSynthesis.cancel();
    currentUtteranceRef.current = null;
    setIsPlaying(false);
    setPlayingEpisode(null);
    setProgress(0);
    setCurrentTime(0);
    setTotalDuration(0);
    setShowMiniPlayer(false);
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
    
    // Try to select a high-quality English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Natural'))
    ) || voices.find(v => v.lang.startsWith('en-US')) || voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = speechRate;
    utterance.pitch = 0.95; // Slightly lower pitch for more natural sound
    utterance.volume = volume;

    const dur = parseDurationToSeconds(episode.duration);
    setTotalDuration(dur);
    let elapsed = 0;
    const interval = 100;

    utterance.onstart = () => {
      setIsPlaying(true);
      setPlayingEpisode(episode.title);
      setProgress(0);
      setCurrentTime(0);
      setShowMiniPlayer(true);

      progressIntervalRef.current = setInterval(() => {
        elapsed += interval * speechRate;
        const secs = Math.min(elapsed / 1000, dur);
        const pct = Math.min((elapsed / (dur * 1000)) * 100 * speechRate, 100);
        setProgress(pct);
        setCurrentTime(secs);
      }, interval);
    };

    utterance.onend = () => {
      stopPlayback();
    };

    utterance.onerror = () => {
      stopPlayback();
    };

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [playingEpisode, isPlaying, speechRate, volume, stopPlayback]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!playingEpisode || totalDuration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = clickX / rect.width;
    const seekTime = pct * totalDuration;

    // TTS doesn't support seeking natively, so we restart from the beginning
    // with an adjusted approach — restart and fast-forward text
    const episode = episodes.find((ep) => ep.title === playingEpisode);
    if (!episode || !episode.transcript) return;

    // For MVP: we restart the episode and note that seek isn't fully supported
    // We'll update the progress display to match
    setCurrentTime(seekTime);
    setProgress(pct * 100);
  }, [playingEpisode, totalDuration]);

  const handleSpeedChange = useCallback((newRate: number) => {
    setSpeechRate(newRate);
    if (currentUtteranceRef.current && isPlaying) {
      // Restart at new speed
      const episode = episodes.find((ep) => ep.title === playingEpisode);
      if (episode) {
        window.speechSynthesis.cancel();
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }

        const utterance = new SpeechSynthesisUtterance(episode.transcript);
        
        // Try to select a high-quality English voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => 
          v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Natural'))
        ) || voices.find(v => v.lang.startsWith('en-US')) || voices.find(v => v.lang.startsWith('en'));
        if (preferredVoice) utterance.voice = preferredVoice;
        
        utterance.rate = newRate;
        utterance.pitch = 0.95;
        utterance.volume = volume;

        const dur = parseDurationToSeconds(episode.duration);
        let elapsed = 0;
        const interval = 100;

        utterance.onstart = () => {
          progressIntervalRef.current = setInterval(() => {
            elapsed += interval * newRate;
            const secs = Math.min(elapsed / 1000, dur);
            const pct = Math.min((elapsed / (dur * 1000)) * 100 * newRate, 100);
            setProgress(pct);
            setCurrentTime(secs);
          }, interval);
        };

        utterance.onend = () => {
          stopPlayback();
        };

        utterance.onerror = () => {
          stopPlayback();
        };

        currentUtteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [isPlaying, playingEpisode, volume, stopPlayback]);

  const toggleMiniPlayer = () => {
    setShowMiniPlayer(!showMiniPlayer);
  };

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
    <div ref={sectionRef} className={playingEpisode ? 'pb-28' : ''}>
      {/* Hero */}
      <section className="pod-section max-w-7xl mx-auto px-6 pt-24 pb-12">
        <h1 className="text-4xl md:text-5xl font-display font-light text-offwhite mb-2">
          Podcast Hub
        </h1>
        <div className="flex items-center gap-3">
          <p className="text-slategray text-lg">Market insights and expert interviews on demand</p>
        </div>
      </section>

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
                <button
                  onClick={() => handlePlay(featured)}
                  className="w-16 h-16 bg-emerald rounded-full flex items-center justify-center hover:bg-emerald/90 transition-all duration-200 hover:scale-105 group relative shadow-lg shadow-emerald/20"
                  aria-label={playingEpisode === featured.title && isPlaying ? 'Pause' : 'Play'}
                >
                  {playingEpisode === featured.title && isPlaying ? (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-obsidian">
                      <rect x="4" y="3" width="5" height="16" rx="1" fill="currentColor" />
                      <rect x="13" y="3" width="5" height="16" rx="1" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-obsidian ml-1">
                      <path d="M5 3l14 8-14 8V3z" fill="currentColor" />
                    </svg>
                  )}
                </button>
              ) : (
                <div className="w-16 h-16 bg-slategray/20 rounded-full flex items-center justify-center cursor-not-allowed">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-slategray">
                    <path d="M5 3l14 8-14 8V3z" fill="currentColor" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <div
                  className="bg-deepblack rounded-full h-2.5 overflow-hidden cursor-pointer group/progress relative"
                  onClick={handleSeek}
                >
                  <div className="bg-emerald h-full rounded-full transition-all relative" style={{ width: `${playingEpisode === featured.title ? progress : 0}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg" />
                  </div>
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-xs font-mono text-slategray">
                    {playingEpisode === featured.title ? formatTime(currentTime) : '0:00'}
                  </span>
                  <span className="text-xs font-mono text-slategray">{featured.duration}</span>
                </div>
              </div>
              <WaveformVisualizer isPlaying={playingEpisode === featured.title && isPlaying} />
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
                  <button
                    onClick={() => handlePlay(episode)}
                    className="w-12 h-12 bg-emerald/10 border border-emerald/30 rounded-full flex items-center justify-center hover:bg-emerald/20 hover:scale-105 transition-all group-hover:border-emerald/50"
                    aria-label={playingEpisode === episode.title && isPlaying ? 'Pause' : 'Play'}
                  >
                    {playingEpisode === episode.title && isPlaying ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-emerald">
                        <rect x="3" y="2" width="3.5" height="12" rx="0.5" fill="currentColor" />
                        <rect x="9.5" y="2" width="3.5" height="12" rx="0.5" fill="currentColor" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-emerald ml-0.5">
                        <path d="M4 2l9 6-9 6V2z" fill="currentColor" />
                      </svg>
                    )}
                  </button>
                ) : (
                  <div className="w-12 h-12 bg-slategray/10 border border-slategray/30 rounded-full flex items-center justify-center cursor-not-allowed">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slategray/50">
                      <path d="M4 2l9 6-9 6V2z" fill="currentColor" />
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

              {/* Mini progress bar for currently playing episode */}
              {playingEpisode === episode.title && (
                <div className="mb-3">
                  <div className="bg-deepblack rounded-full h-1.5 overflow-hidden cursor-pointer" onClick={handleSeek}>
                    <div className="bg-emerald h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] font-mono text-slategray">{formatTime(currentTime)}</span>
                    <span className="text-[10px] font-mono text-slategray">{episode.duration}</span>
                  </div>
                </div>
              )}

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
                <div className="mt-4 bg-deepblack border border-subtleborder rounded-lg p-4 max-h-64 overflow-y-auto">
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

      {/* Sticky Player */}
      {playingEpisode && showMiniPlayer && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-charcoal border-t border-emerald/30 shadow-2xl shadow-black/40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            {/* Progress bar at very top of player */}
            <div
              className="absolute top-0 left-0 right-0 h-1 bg-deepblack cursor-pointer group/seek"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-emerald/60 transition-all relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-emerald rounded-full opacity-0 group-hover/seek:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              {/* Play/Pause */}
              <button
                onClick={() => {
                  if (isPlaying) {
                    window.speechSynthesis.pause();
                    setIsPlaying(false);
                  } else {
                    window.speechSynthesis.resume();
                    setIsPlaying(true);
                  }
                }}
                className="w-11 h-11 bg-emerald rounded-full flex items-center justify-center hover:bg-emerald/90 transition-all shrink-0 hover:scale-105 shadow-lg shadow-emerald/20"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-obsidian">
                    <rect x="3" y="2" width="3.5" height="12" rx="0.5" fill="currentColor" />
                    <rect x="9.5" y="2" width="3.5" height="12" rx="0.5" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-obsidian ml-0.5">
                    <path d="M4 2l9 6-9 6V2z" fill="currentColor" />
                  </svg>
                )}
              </button>

              {/* Stop */}
              <button
                onClick={stopPlayback}
                className="w-8 h-8 bg-deepblack border border-subtleborder rounded-full flex items-center justify-center hover:border-emerald/50 transition-colors shrink-0"
                aria-label="Stop"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-slategray">
                  <rect x="1" y="1" width="8" height="8" rx="1" fill="currentColor" />
                </svg>
              </button>

              {/* Episode Info + Seek Bar */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-offwhite truncate mb-1">{playingEpisode}</p>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slategray shrink-0 w-8 text-right">{formatTime(currentTime)}</span>
                  <div
                    className="flex-1 h-1.5 bg-deepblack rounded-full overflow-hidden cursor-pointer group/seekbar"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-emerald rounded-full transition-all relative"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald rounded-full opacity-0 group-hover/seekbar:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slategray shrink-0 w-8">
                    {totalDuration ? formatTime(totalDuration) : '--:--'}
                  </span>
                </div>
              </div>

              {/* Waveform */}
              <div className="hidden md:block">
                <WaveformVisualizer isPlaying={isPlaying} />
              </div>

              {/* Speed Control */}
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono text-slategray">Speed</span>
                <select
                  value={speechRate}
                  onChange={(e) => handleSpeedChange(Number(e.target.value))}
                  className="bg-deepblack border border-subtleborder rounded text-[10px] font-mono text-offwhite px-1.5 py-0.5 focus:outline-none focus:border-emerald/50"
                >
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>

              {/* Volume */}
              <div className="hidden md:flex items-center gap-1.5 shrink-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-slategray">
                  <path d="M2 5h2l3-3v10l-3-3H2V5z" fill="currentColor" />
                  <path d="M9.5 4.5a3.5 3.5 0 010 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M11 3a5.5 5.5 0 010 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    if (currentUtteranceRef.current) {
                      currentUtteranceRef.current.volume = v;
                    }
                  }}
                  className="w-16 h-1 accent-emerald bg-deepblack rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-emerald [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>

              {/* Keyboard shortcut hint */}
              <div className="hidden lg:flex items-center shrink-0">
                <span className="px-1.5 py-0.5 bg-deepblack border border-subtleborder rounded text-[9px] font-mono text-slategray">
                  Space
                </span>
              </div>

              {/* Close / Minimize */}
              <button
                onClick={toggleMiniPlayer}
                className="w-7 h-7 flex items-center justify-center text-slategray hover:text-offwhite transition-colors shrink-0"
                aria-label="Minimize player"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mini player restore button when player is hidden */}
      {playingEpisode && !showMiniPlayer && (
        <button
          onClick={toggleMiniPlayer}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-emerald rounded-full flex items-center justify-center shadow-lg shadow-emerald/30 hover:scale-110 transition-transform"
          aria-label="Show player"
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-obsidian">
              <rect x="3" y="2" width="3.5" height="12" rx="0.5" fill="currentColor" />
              <rect x="9.5" y="2" width="3.5" height="12" rx="0.5" fill="currentColor" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-obsidian ml-0.5">
              <path d="M4 2l9 6-9 6V2z" fill="currentColor" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
