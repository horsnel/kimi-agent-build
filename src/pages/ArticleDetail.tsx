import { useState, useEffect } from 'react';
import { useParams, useLocation, Link, Navigate } from 'react-router';
import { ArrowLeftIcon, ClockIcon, ShareIcon, BookmarkIcon } from '../components/CustomIcons';
import { fetchNews, type NewsArticle as ApiNewsArticle } from '../services/api';

/* ── Generated article types ── */
interface ArticleImage {
  src: string;
  alt: string;
  credit?: string;
  creditUrl?: string;
}

interface GeneratedArticle {
  id: string;
  type: string;
  title: string;
  slug: string;
  date: string;
  displayDate: string;
  category: string;
  tags: string[];
  metaDescription: string;
  excerpt: string;
  content: Record<string, unknown>;
  readingTime: number;
  image?: { src: string; alt: string; credit?: string; creditUrl?: string };
  images?: {
    thumbnail: ArticleImage;
    hero: ArticleImage;
    mid: ArticleImage;
  };
}

/* ── Research article data (mirrors Research.tsx) ── */
interface ResearchArticle {
  id: number;
  title: string;
  abstract: string;
  fullContent: string[];
  image: string;
  date: string;
  readTime: string;
  category: string;
  featured: boolean;
}

const researchArticles: ResearchArticle[] = [
  {
    id: 0,
    title: 'Q3 Macro Outlook: The Liquidity Crunch',
    abstract: 'Central bank balance sheets are contracting at an unprecedented pace. We analyze the downstream effects on credit markets, emerging economies, and sovereign debt yields.',
    fullContent: [
      'The global financial system is entering a period of profound transformation as central banks across the developed world continue to unwind their balance sheets at an accelerated pace. The Federal Reserve, European Central Bank, and Bank of Japan have collectively reduced their asset holdings by over $2.5 trillion since the beginning of quantitative tightening, creating a liquidity vacuum that is reshaping the cost of capital across every major market.',
      'This contraction is not merely a technical adjustment — it represents a fundamental shift in the availability of cheap capital that has fueled asset price appreciation for the better part of a decade. The implications are far-reaching: credit spreads are widening, particularly in the high-yield sector where issuance has ground to a near halt. Emerging market economies that relied on dollar-denominated debt are facing a double squeeze from both rising servicing costs and depreciating local currencies.',
      'Sovereign debt yields in peripheral European nations have risen sharply, with Italian 10-year bonds approaching the 4.5% threshold that historically signals stress. The transmission mechanism from central bank balance sheet reduction to real economy tightening operates through multiple channels — bank lending standards, mortgage rates, and corporate borrowing costs have all tightened measurably in the past two quarters.',
      'Our analysis suggests that the liquidity contraction will intensify through Q3 before potentially stabilizing in Q4 as central banks adopt a more measured pace of balance sheet normalization. Investors should position for continued volatility in credit markets and consider defensive allocations in short-duration fixed income and cash equivalents until the liquidity picture clears.',
      'The historical parallel most relevant to the current environment is the 2018-2019 tightening cycle, which culminated in the repo market crisis of September 2019. However, the current episode differs in both scale and scope — the balance sheets being unwound are roughly twice the size they were in 2018, and the global coordination of tightening is unprecedented. We assign a 35% probability to a significant liquidity event before year-end, which would force central banks to intervene with targeted liquidity facilities.',
    ],
    image: '/images/article_thumb_1.jpg',
    date: 'Jan 18, 2026',
    readTime: '18 min',
    category: 'Macro',
    featured: true,
  },
  {
    id: 1,
    title: 'The Architecture of Trustless Settlement',
    abstract: 'How zero-knowledge proofs are reshaping clearing and custody infrastructure across institutional finance.',
    fullContent: [
      'Zero-knowledge proofs (ZKPs) have evolved from a theoretical curiosity in cryptographic research to a practical tool that is fundamentally reshaping how financial institutions approach settlement, clearing, and custody. The technology allows one party to prove to another that a statement is true without revealing any information beyond the validity of the statement itself — a capability that addresses some of the deepest structural inefficiencies in modern financial infrastructure.',
      'In traditional settlement systems, clearinghouses serve as trusted intermediaries that guarantee the completion of trades between counterparties. This trust comes at a significant cost — capital tied up in margin requirements, operational overhead for reconciliation, and the systemic risk of concentrated counterparty exposure. ZKP-based settlement protocols can achieve the same guarantees without requiring a trusted intermediary, potentially reducing settlement costs by 60-80% while simultaneously improving capital efficiency.',
      'Several major financial institutions are already piloting ZKP-based settlement systems. JPMorgan\'s Onyx platform has processed over $300 billion in tokenized transactions using privacy-preserving proofs, and the Singapore Exchange is implementing a ZKP-based settlement layer for cross-border securities transactions. These early deployments demonstrate that the technology is not merely theoretical — it is production-ready and delivering measurable benefits.',
      'The implications for custody infrastructure are equally profound. ZKPs enable a new model of "proof of reserves" where custodians can demonstrate they hold sufficient assets to back client positions without revealing the exact composition or location of those assets. This addresses a critical transparency gap that has plagued both traditional and digital asset custodians, particularly in the wake of several high-profile custodial failures.',
      'Looking ahead, we expect ZKP-based settlement to become the industry standard for institutional-grade financial infrastructure within five years. The combination of regulatory pressure for real-time settlement, cost reduction imperatives, and the growing interoperability between traditional and digital asset markets creates a compelling adoption thesis. Financial institutions that delay investment in ZKP capabilities risk being competitively disadvantaged as the industry transitions to trustless settlement architectures.',
    ],
    image: '/images/article_thumb_2.jpg',
    date: 'Jan 16, 2026',
    readTime: '10 min',
    category: 'Infrastructure',
    featured: false,
  },
  {
    id: 2,
    title: 'Silicon Minds: AI Trading Systems',
    abstract: 'A deep-dive into the neural architectures powering modern algorithmic trading desks and their alpha generation capabilities.',
    fullContent: [
      'The transformation of algorithmic trading from rule-based systems to neural network-driven decision engines represents one of the most significant technological shifts in financial markets since the advent of electronic trading itself. Modern AI trading systems employ sophisticated deep learning architectures — including transformers, graph neural networks, and reinforcement learning agents — to identify and exploit market inefficiencies at timescales ranging from microseconds to months.',
      'Transformer-based models, originally developed for natural language processing, have found a natural home in financial time series analysis. Their self-attention mechanism allows the model to weigh the importance of different time points and market signals dynamically, creating a flexible framework that adapts to changing market regimes. Leading quantitative firms report that transformer-based strategies have generated consistent alpha in equity and futures markets, particularly during regime transitions when traditional statistical models tend to underperform.',
      'Graph neural networks (GNNs) are being deployed to capture the complex relational structure between financial instruments, market participants, and macroeconomic variables. Unlike traditional correlation-based approaches, GNNs can model directed, time-varying relationships that reflect the true causal structure of market dynamics. This capability is particularly valuable for cross-asset strategies that exploit lead-lag relationships between equities, bonds, currencies, and commodities.',
      'Reinforcement learning (RL) agents represent the frontier of AI trading technology, capable of learning optimal execution strategies through repeated interaction with simulated and live markets. Unlike supervised learning approaches that require historical labels, RL agents discover profitable strategies through exploration and exploitation, often uncovering non-obvious patterns that human traders would overlook. However, the deployment of RL agents in production requires careful risk management, as these systems can develop unexpected behaviors in out-of-distribution market conditions.',
      'The competitive landscape is shifting rapidly. While the largest quantitative firms have invested billions in AI infrastructure, the democratization of ML tools and cloud computing is enabling smaller firms to compete effectively in niche strategies. The key differentiator is no longer access to computing power alone but the quality of data pipelines, feature engineering, and the sophistication of risk management overlays that prevent AI systems from taking excessive tail risk during market dislocations.',
    ],
    image: '/images/article_thumb_3.jpg',
    date: 'Jan 14, 2026',
    readTime: '14 min',
    category: 'Technology',
    featured: false,
  },
  {
    id: 3,
    title: 'Network Effects in Digital Economies',
    abstract: 'Analyzing the topological properties of value flows in decentralized financial networks.',
    fullContent: [
      'The study of network effects in decentralized financial networks has emerged as a critical area of research for understanding how value propagates through interconnected protocol ecosystems. Unlike traditional financial networks where intermediaries control the flow of capital, DeFi networks exhibit emergent topological properties that arise from the interaction of autonomous smart contracts, liquidity providers, and arbitrageurs operating across multiple chains and protocols.',
      'Our analysis employs spectral graph theory to characterize the connectivity structure of major DeFi networks. We find that the degree distribution of protocol interactions follows a power law, with a small number of hub protocols — primarily DEXs and lending platforms — mediating the majority of value flows. This concentration creates both efficiency gains through reduced search costs and systemic vulnerability through cascading liquidation risk.',
      'The concept of "composability" in DeFi — the ability to chain protocol interactions together — generates network effects that are qualitatively different from those observed in traditional platform economies. Each new protocol that integrates with the existing ecosystem increases the combinatorial space of possible interactions, creating exponential growth in the number of actionable strategies. This "combinatorial network effect" is unique to programmable financial systems and has no direct analog in traditional finance.',
      'We model the propagation of shocks through DeFi networks using percolation theory, finding that the system exhibits a critical threshold above which localized failures can cascade systemically. This threshold is determined by the ratio of cross-protocol exposure to total locked value and the correlation structure of collateral assets. Our analysis suggests that the current DeFi ecosystem is operating below this critical threshold but approaching it as cross-chain bridging and composability increase.',
      'For investors and risk managers, understanding the topological properties of DeFi networks is essential for constructing resilient portfolios and designing effective risk management frameworks. We propose a set of network-based risk metrics — including eigenvector centrality, betweenness centrality, and modularity — that can serve as early warning indicators for systemic stress in decentralized financial systems.',
    ],
    image: '/images/article_thumb_4.jpg',
    date: 'Jan 11, 2026',
    readTime: '9 min',
    category: 'Research',
    featured: false,
  },
  {
    id: 4,
    title: 'Refraction: Risk Through Many Lenses',
    abstract: 'Multi-factor risk decomposition for modern portfolios spanning traditional and digital assets.',
    fullContent: [
      'Traditional portfolio risk management relies on a relatively small set of factor models — typically drawn from the Fama-French canon — that were developed for and calibrated against equity-only portfolios. As modern portfolios increasingly span traditional equities, fixed income, commodities, and digital assets, these models prove inadequate for capturing the full spectrum of risk exposures that investors face. This paper introduces a multi-factor risk decomposition framework designed specifically for cross-asset portfolios that include both traditional and digital asset classes.',
      'Our framework extends the traditional factor model by incorporating crypto-specific risk factors including on-chain activity, network security, regulatory exposure, and smart contract risk. We demonstrate that these factors are largely orthogonal to traditional risk factors, providing genuine diversification benefits but also introducing novel risk dimensions that require dedicated monitoring and management.',
      'The decomposition methodology employs a hierarchical factor structure where macro factors (growth, inflation, monetary policy) sit at the top, asset-class factors (equity risk premium, term premium, credit spread) occupy the middle, and instrument-specific factors (momentum, value, size, on-chain activity) form the base. This hierarchical approach allows risk managers to drill down from portfolio-level risk to individual position contributions while maintaining a coherent framework across asset classes.',
      'Backtesting our framework on a multi-asset portfolio spanning 2020-2025, we find that it captures approximately 85% of portfolio variance compared to 62% for traditional equity-only factor models. The improvement is most pronounced during regime transitions — periods when correlations between asset classes shift dramatically and traditional models most often fail. The crypto-specific factors prove particularly valuable during risk-off episodes when digital assets decouple from their historical correlation with growth-sensitive assets.',
      'We conclude with practical recommendations for implementing multi-factor risk decomposition in institutional portfolio management. The framework is designed to be incrementally adoptable, allowing risk managers to integrate crypto-specific factors alongside their existing equity and fixed income factor models without requiring a complete overhaul of their risk infrastructure.',
    ],
    image: '/images/article_thumb_5.jpg',
    date: 'Jan 09, 2026',
    readTime: '11 min',
    category: 'Risk',
    featured: false,
  },
  {
    id: 5,
    title: 'Data Centers of Capital',
    abstract: 'The physical infrastructure behind financial computation and its implications for latency arbitrage.',
    fullContent: [
      'The physical infrastructure supporting financial computation has evolved from simple co-location facilities to sophisticated data center campuses that serve as the nerve centers of global capital markets. These facilities — concentrated in a handful of locations including Mahwah NJ, Aurora IL, and Basildon UK — house the computing infrastructure that processes trillions of dollars in daily trading volume, and their physical characteristics have a direct and measurable impact on market efficiency and trading profitability.',
      'Latency arbitrage — the practice of exploiting微小 time differences in market data dissemination — remains one of the most consistent sources of alpha in high-frequency trading. The speed of light in fiber optic cable imposes a fundamental constraint on how quickly information can propagate between geographically separated exchanges, creating persistent opportunities for firms that position their computing infrastructure optimally. The difference of a few microseconds — corresponding to a few kilometers of fiber — can translate to millions of dollars in annual revenue.',
      'The emergence of microwave and millimeter-wave communication links has compressed latency further by bypassing the longer fiber routes between major exchange data centers. These line-of-sight transmission systems reduce the communication distance between Chicago and New York from approximately 1,300 km (fiber) to roughly 1,150 km (direct path), saving approximately 200 microseconds per round trip — an eternity in the world of high-frequency trading.',
      'Beyond raw latency, the design of data center facilities themselves has become a competitive differentiator. Modern financial data centers feature redundant power systems with sub-millisecond failover, precision cooling systems that maintain optimal operating temperatures for high-density computing racks, and sophisticated electromagnetic shielding that prevents interference from degrading the performance of sensitive trading equipment. The capital investment required for these facilities runs into the hundreds of millions of dollars, creating a significant barrier to entry.',
      'Looking forward, the convergence of traditional high-frequency trading and AI-driven strategies is driving a new wave of infrastructure investment. GPU clusters for real-time model inference require fundamentally different facility designs than traditional CPU-based trading systems — higher power density, more aggressive cooling, and more sophisticated networking. Firms that can integrate these next-generation computing requirements into their existing data center footprint will gain a significant competitive advantage as AI-driven trading continues to grow in importance.',
    ],
    image: '/images/article_thumb_6.jpg',
    date: 'Jan 07, 2026',
    readTime: '7 min',
    category: 'Infrastructure',
    featured: false,
  },
];

/* ── Education article data (mirrors Education.tsx) ── */
interface EducationArticle {
  id: number;
  title: string;
  description: string;
  fullContent: string[];
  category: string;
  difficulty: string;
  readTime: number;
}

const educationArticles: EducationArticle[] = [
  {
    id: 1,
    title: 'How to Start Investing 2026',
    description: 'A complete guide for beginners looking to enter the stock market. Learn the fundamentals of opening a brokerage account, choosing your first investments, and building a diversified portfolio from scratch.',
    fullContent: [
      'Investing is one of the most powerful tools for building long-term wealth, yet many people feel intimidated by the complexity of financial markets. The good news is that getting started is simpler than you might think. With the right approach and a solid understanding of the fundamentals, anyone can begin their investing journey with confidence.',
      'The first step is opening a brokerage account. Look for a broker that offers commission-free trades on stocks and ETFs, no account minimums, and a user-friendly platform. Popular options include Fidelity, Charles Schwab, and Vanguard. The account opening process typically takes 10-15 minutes and requires basic personal information including your Social Security number for tax reporting purposes.',
      'Once your account is funded, the most important principle is diversification — spreading your money across different types of investments to reduce risk. For beginners, a simple three-fund portfolio consisting of a total US stock market ETF, a total international stock market ETF, and a total bond market ETF provides broad diversification with minimal complexity. This approach captures the returns of the global equity market while providing ballast through bond allocations.',
      'Dollar-cost averaging — investing a fixed amount at regular intervals regardless of market conditions — is the most effective strategy for new investors. This approach removes the impossible task of timing the market and naturally results in buying more shares when prices are low and fewer when prices are high. Setting up automatic contributions from your bank account ensures consistency and removes the temptation to try to time the market.',
      'Common mistakes to avoid include chasing hot stocks, checking your portfolio too frequently, and selling during market downturns. The stock market has historically delivered annualized returns of approximately 10% over long periods, but this comes with significant short-term volatility. Your greatest ally as a new investor is time — the longer your investment horizon, the more likely you are to achieve positive returns. Start early, invest consistently, and let compound interest work its magic.',
    ],
    category: 'Investing Basics',
    difficulty: 'Beginner',
    readTime: 8,
  },
  {
    id: 2,
    title: 'Fed Interest Rates Explained',
    description: 'Understanding how the Federal Reserve sets interest rates and why it matters for your investments. From FOMC meetings to rate hike cycles, learn the mechanics behind monetary policy.',
    fullContent: [
      'The Federal Reserve, often called "the Fed," is the central bank of the United States and plays a critical role in shaping the economic landscape through its control of interest rates. Understanding how the Fed sets rates and how those decisions ripple through the economy is essential knowledge for any investor seeking to make informed decisions about their portfolio.',
      'The Federal Open Market Committee (FOMC) meets eight times per year to set the federal funds rate — the interest rate at which banks lend reserves to each other overnight. While this rate directly affects only short-term interbank lending, it serves as the benchmark that influences virtually every other interest rate in the economy, from mortgage rates and credit card APRs to corporate bond yields and savings account returns.',
      'When the Fed raises rates, it makes borrowing more expensive throughout the economy. Higher mortgage rates cool the housing market, higher corporate borrowing costs reduce business investment, and higher consumer credit rates dampen spending. The intended effect is to slow economic activity and reduce inflationary pressure. Conversely, when the Fed cuts rates, cheaper borrowing stimulates economic activity but can also fuel inflation if the economy is already running hot.',
      'The transmission mechanism from Fed rate decisions to investment returns operates through multiple channels. Rising rates tend to pressure stock valuations because future cash flows are discounted at higher rates, reducing present values. Bond prices move inversely to interest rates, so rising rates create losses for existing bondholders. The US dollar typically strengthens when rates rise as higher yields attract foreign capital, which in turn affects multinational corporate earnings and commodity prices.',
      'For investors, the key takeaway is that Fed policy creates the macroeconomic backdrop against which all investment decisions are made. During tightening cycles, defensive sectors like healthcare and utilities tend to outperform while growth stocks face headwinds. During easing cycles, the reverse tends to hold. Staying informed about the FOMC schedule and understanding the current policy stance is not optional — it is a fundamental requirement for successful investing.',
    ],
    category: 'Investing Basics',
    difficulty: 'Beginner',
    readTime: 6,
  },
  {
    id: 3,
    title: 'Stock Market Sectors Guide',
    description: 'Explore the 11 GICS sectors and how they perform across economic cycles. Learn which sectors thrive during expansions, recessions, and periods of rising interest rates.',
    fullContent: [
      'The Global Industry Classification Standard (GICS) divides the stock market into 11 distinct sectors, each representing a different slice of the economy. Understanding how these sectors behave across different phases of the economic cycle is one of the most powerful tools an investor can have for constructing a resilient portfolio.',
      'The 11 GICS sectors are: Information Technology, Healthcare, Financials, Consumer Discretionary, Consumer Staples, Energy, Industrials, Materials, Utilities, Real Estate, and Communication Services. Each sector has unique characteristics that determine how it responds to changes in economic growth, inflation, interest rates, and consumer sentiment.',
      'During economic expansions, cyclical sectors like Consumer Discretionary, Information Technology, and Industrials tend to outperform as businesses invest and consumers spend freely. Financials also benefit from steepening yield curves and increasing loan demand. These sectors are often called "early cycle" or "cyclical" because their fortunes are tightly linked to the pace of economic growth.',
      'During recessions or periods of economic uncertainty, defensive sectors like Consumer Staples, Healthcare, and Utilities tend to hold up better. People continue buying groceries, visiting doctors, and using electricity regardless of the economic environment. These sectors offer lower growth potential but greater stability, making them valuable anchors during turbulent markets.',
      'Sector rotation — the strategy of shifting portfolio allocations between sectors based on the economic cycle — is a widely followed approach among institutional investors. While no strategy guarantees outperformance, having a framework for understanding which sectors are likely to benefit or suffer from the prevailing macroeconomic environment provides a significant edge over simply holding the market-cap-weighted index.',
    ],
    category: 'Investing Basics',
    difficulty: 'Beginner',
    readTime: 7,
  },
  {
    id: 4,
    title: 'How to Read a 10-K',
    description: 'Master the art of reading annual reports. Learn how to navigate financial statements, footnotes, and management discussion to uncover what really drives a company performance.',
    fullContent: [
      'The 10-K annual report is the most comprehensive document a public company files with the SEC, and it contains a wealth of information that goes far beyond the headline numbers reported in earnings press releases. Learning to read and interpret a 10-K is one of the most valuable skills an investor can develop, as it provides insights into a company\'s financial health, competitive position, and risk profile that are unavailable from any other source.',
      'A 10-K is divided into several key sections. Part I covers the business description and properties, giving you a sense of what the company actually does and where it operates. Part II contains the financial data — this is where you will find the income statement, balance sheet, and cash flow statement that form the foundation of any financial analysis. Part III covers corporate governance, including director and executive compensation, while Part IV includes supplemental schedules and exhibits.',
      'The Management\'s Discussion and Analysis (MD&A) section is arguably the most important part of the 10-K. Here, management provides their perspective on the company\'s financial results, liquidity position, and forward-looking risks. Reading the MD&A carefully often reveals concerns and opportunities that the headline numbers obscure. Pay particular attention to changes in language from prior years — subtle shifts in tone or emphasis can signal important developments.',
      'The footnotes to the financial statements are where companies bury the details they are legally required to disclose but would prefer investors overlook. Key areas to examine include revenue recognition policies, goodwill impairment assumptions, pension obligations, off-balance-sheet arrangements, and related-party transactions. Companies that change accounting policies or have unusually complex footnotes deserve extra scrutiny.',
      'The risk factors section, while often treated as boilerplate, contains important disclosures about the specific threats facing the business. Comparing risk factors across years can reveal emerging concerns. Similarly, the legal proceedings section may disclose litigation that could have material financial consequences. A thorough 10-K review should take 2-3 hours for a first reading, with additional time for comparing against prior periods and peer companies.',
    ],
    category: 'Investing Basics',
    difficulty: 'Intermediate',
    readTime: 10,
  },
  {
    id: 5,
    title: 'Treasury Yield Curve',
    description: 'What the yield curve tells us about the economy and why inversions predict recessions. Deep dive into the mechanics of government bonds and their signaling power.',
    fullContent: [
      'The Treasury yield curve — a plot of US government bond yields across different maturities — is one of the most closely watched indicators in all of finance. Its shape provides crucial information about market expectations for economic growth, inflation, and monetary policy, making it an indispensable tool for investors, economists, and policymakers alike.',
      'Under normal conditions, the yield curve slopes upward, with longer-maturity bonds offering higher yields than shorter-maturity ones. This positive slope reflects the "term premium" — the additional compensation investors demand for locking up their money for longer periods and bearing greater inflation and interest rate risk. When the economy is healthy and growing, this is the natural state of the yield curve.',
      'A yield curve inversion — when short-term rates exceed long-term rates — has been one of the most reliable recession predictors in modern finance. Every US recession since 1955 has been preceded by a yield curve inversion, typically 12-18 months before the downturn begins. The most closely watched inversion is the 2-year/10-year spread, though the 3-month/10-year spread is also widely monitored.',
      'The mechanism behind the yield curve\'s predictive power relates to bank profitability and lending behavior. Banks borrow at short-term rates and lend at long-term rates, profiting from the spread. When the curve inverts, this spread turns negative, reducing bank profitability and tightening credit conditions. As lending becomes less profitable, banks reduce credit availability, which slows economic activity and can trigger the very recession the curve predicted.',
      'Investors should monitor the yield curve not just for inversion signals but for its overall shape and trajectory. A steepening curve suggests improving growth expectations, while a flattening curve signals growing concern about the economic outlook. The curve is best used as one input among many in a comprehensive investment framework, but ignoring its signals entirely has historically been a costly mistake.',
    ],
    category: 'Investing Basics',
    difficulty: 'Intermediate',
    readTime: 8,
  },
  {
    id: 6,
    title: 'Options Trading for Beginners',
    description: 'Learn calls, puts, and basic strategies like covered calls and protective puts. Understand option pricing, Greeks, and how to manage risk in your first options trades.',
    fullContent: [
      'Options are derivative contracts that give the buyer the right, but not the obligation, to buy (call) or sell (put) an underlying asset at a predetermined price (strike) before a specific date (expiration). While options are often associated with high-risk speculation, they are actually versatile instruments that can be used for income generation, hedging, and leveraged directional exposure depending on the strategy employed.',
      'A call option gives the holder the right to buy 100 shares of the underlying stock at the strike price. You would buy a call when you believe the stock will rise above the strike price before expiration. A put option gives the holder the right to sell 100 shares at the strike price, and you would buy a put when you believe the stock will fall below the strike. The premium you pay for an option represents the maximum possible loss on the long side.',
      'Two fundamental strategies for beginners are covered calls and protective puts. A covered call involves selling a call option against shares you already own, generating income (the premium received) in exchange for capping your upside potential above the strike price. This is an excellent strategy for modestly bullish investors who want to generate income from their existing holdings. A protective put involves buying a put option against shares you own, functioning as insurance against a significant decline in the stock price.',
      'Option pricing is governed by several factors known collectively as the "Greeks." Delta measures how much the option price changes for a $1 move in the underlying stock. Theta measures the daily time decay — options lose value as expiration approaches, all else being equal. Vega measures sensitivity to changes in implied volatility. Understanding these sensitivities is crucial for managing risk and selecting appropriate strategies for different market conditions.',
      'Risk management is paramount when trading options. Never risk more than you can afford to lose on a single trade, and always have an exit plan before entering a position. For beginners, we recommend starting with defined-risk strategies like buying calls and puts, covered calls, and protective puts. Avoid selling naked options until you have significant experience and a thorough understanding of the risks involved. Paper trading — practicing with simulated money — is an excellent way to gain experience without financial risk.',
    ],
    category: 'Options',
    difficulty: 'Beginner',
    readTime: 9,
  },
  {
    id: 7,
    title: '401k vs IRA vs Roth',
    description: 'Compare retirement account types, contribution limits, and tax advantages. Learn which accounts to prioritize and how to maximize employer matching and tax-free growth.',
    fullContent: [
      'Choosing the right retirement accounts is one of the most consequential financial decisions you will make, yet many investors are confused by the alphabet soup of options available. Understanding the key differences between 401(k)s, Traditional IRAs, and Roth IRAs — and how to use them in combination — can literally mean hundreds of thousands of dollars in additional retirement savings over your working career.',
      'A 401(k) is an employer-sponsored retirement plan that allows you to contribute pre-tax dollars directly from your paycheck. For 2026, the contribution limit is $23,000 ($30,500 if age 50+). The primary advantages are the high contribution limits, potential employer matching contributions (essentially free money), and automatic payroll deductions that remove the temptation to skip contributions. Always contribute enough to capture the full employer match before considering any other retirement savings.',
      'A Traditional IRA allows individuals to contribute pre-tax dollars (subject to income limits if you also have a workplace plan), with earnings growing tax-deferred until withdrawal in retirement. The 2026 contribution limit is $7,000 ($8,000 if age 50+). Traditional IRAs are best for investors who expect to be in a lower tax bracket in retirement than they are currently, as the tax deduction now is worth more than tax-free withdrawals later.',
      'A Roth IRA uses after-tax contributions but offers completely tax-free growth and tax-free withdrawals in retirement. The 2026 contribution limit is the same as the Traditional IRA at $7,000 ($8,000 if age 50+), but income limits apply — direct contributions phase out at modified AGI above $146,000 for single filers and $230,000 for married couples filing jointly. Roth IRAs are ideal for investors who expect higher tax rates in retirement and value the flexibility of tax-free withdrawals.',
      'The optimal strategy for most investors is to fund accounts in this order: first, contribute enough to your 401(k) to capture the full employer match; second, max out your Roth IRA (if eligible); third, return to your 401(k) and contribute up to the annual limit; fourth, consider a Traditional IRA for any remaining capacity. This order prioritizes the highest-return options (free money from employer matching and tax-free Roth growth) before utilizing less advantageous tax-deferred accounts.',
    ],
    category: 'Retirement',
    difficulty: 'Beginner',
    readTime: 6,
  },
  {
    id: 8,
    title: 'How to Value a Stock',
    description: 'From DCF analysis to relative valuation multiples. Learn the key methods professional analysts use to determine whether a stock is overvalued, undervalued, or fairly priced.',
    fullContent: [
      'Stock valuation is both an art and a science — the process of determining what a company\'s shares are truly worth based on its financial fundamentals, growth prospects, and risk profile. While no valuation method is perfect, understanding the primary approaches used by professional analysts will help you make more informed investment decisions and avoid the common trap of overpaying for popular stocks.',
      'Discounted Cash Flow (DCF) analysis is the gold standard of intrinsic valuation. The approach involves projecting a company\'s future free cash flows and discounting them back to present value using a rate that reflects the riskiness of those cash flows. The discount rate — typically the weighted average cost of capital (WACC) — accounts for both the time value of money and the risk that projected cash flows may not materialize. DCF is theoretically sound but highly sensitive to assumptions about growth rates and discount rates.',
      'Relative valuation uses multiples to compare a company\'s valuation to its peers. The most common multiples include Price-to-Earnings (P/E), Price-to-Book (P/B), Enterprise Value-to-EBITDA (EV/EBITDA), and Price-to-Sales (P/S). Each multiple is most relevant for specific types of companies: P/E for profitable companies, P/S for unprofitable growth companies, EV/EBITDA for capital-intensive businesses, and P/B for financial institutions. The key is comparing against truly comparable companies, not just any company in the same sector.',
      'A practical approach combines both methodologies. Start with relative valuation to quickly screen for stocks that appear undervalued relative to peers, then use DCF analysis to develop a more nuanced estimate of intrinsic value. If both methods suggest undervaluation, you have a stronger investment thesis than either method alone could provide. Conversely, if the methods disagree, understanding why can reveal important insights about the company\'s competitive position or growth trajectory.',
      'Common pitfalls to avoid include anchoring on historical multiples (which may not reflect the current environment), ignoring the quality of earnings (not all earnings are created equal), and neglecting balance sheet strength (a cheap stock with excessive debt may be a value trap). The best valuation analysts combine rigorous quantitative analysis with qualitative judgment about competitive advantages, management quality, and industry dynamics that pure numbers cannot capture.',
    ],
    category: 'Investing Basics',
    difficulty: 'Intermediate',
    readTime: 12,
  },
  {
    id: 9,
    title: 'Technical Analysis 101',
    description: 'Chart patterns, support and resistance, moving averages, and RSI explained. Build a foundation in reading price charts and identifying potential entry and exit points.',
    fullContent: [
      'Technical analysis is the study of historical price and volume data to identify patterns and trends that may indicate future price movements. While fundamental analysis focuses on what a company is worth, technical analysis focuses on when to buy and sell based on the psychology of market participants as reflected in price action. Neither approach is inherently superior — the most successful investors often combine elements of both.',
      'Support and resistance levels are the foundational concepts of technical analysis. Support is a price level where buying pressure has historically been strong enough to prevent further decline, while resistance is a level where selling pressure has prevented further advances. These levels are not magical barriers but rather psychological reference points that traders use to make decisions. When price approaches a support level, buyers who missed the previous bottom may step in; at resistance, traders who bought near the previous top may sell to break even.',
      'Moving averages smooth out price data to reveal the underlying trend. The 50-day and 200-day moving averages are the most widely watched. When the 50-day crosses above the 200-day, it\'s called a "golden cross" and signals a potential uptrend. The reverse — a "death cross" — signals potential further decline. Moving averages also serve as dynamic support and resistance levels, with price often bouncing off widely-watched averages before continuing in the direction of the trend.',
      'The Relative Strength Index (RSI) is a momentum oscillator that measures the speed and magnitude of recent price changes on a scale of 0 to 100. Readings above 70 are traditionally considered "overbought" (potentially due for a pullback) while readings below 30 are "oversold" (potentially due for a bounce). However, in strong trends, RSI can remain in overbought or oversold territory for extended periods, so it should be used in conjunction with other indicators rather than in isolation.',
      'The most important principle in technical analysis is that no single indicator or pattern is reliable enough to trade on alone. Successful technical traders use multiple indicators to build confluence — when support levels, moving averages, momentum indicators, and volume patterns all point in the same direction, the probability of a successful trade increases significantly. Always use stop losses to manage risk, and never risk more than a small percentage of your portfolio on any single trade based on technical signals.',
    ],
    category: 'Technical Analysis',
    difficulty: 'Beginner',
    readTime: 7,
  },
  {
    id: 10,
    title: 'Tax-Loss Harvesting Guide',
    description: 'How to strategically realize losses to offset gains and reduce your tax bill. Learn the wash sale rules, optimal timing, and how this strategy boosts after-tax returns.',
    fullContent: [
      'Tax-loss harvesting is one of the most powerful and underutilized strategies available to investors for reducing their tax burden. The concept is straightforward: by selling investments that have declined in value, you realize a capital loss that can be used to offset capital gains and up to $3,000 of ordinary income per year. Any excess losses can be carried forward indefinitely, making tax-loss harvesting valuable even in years when you don\'t have significant gains to offset.',
      'The mechanics are simple but the execution requires care. Suppose you purchased $10,000 worth of an S&P 500 ETF that has declined to $8,000. By selling the position, you realize a $2,000 capital loss. You can immediately reinvest in a similar but not "substantially identical" investment — for example, swapping from one S&P 500 ETF to another total market ETF — to maintain your market exposure while locking in the tax benefit. The $2,000 loss can then offset $2,000 in realized capital gains or up to $3,000 in ordinary income.',
      'The wash sale rule is the most important regulatory constraint to understand. If you purchase a "substantially identical" security within 30 days before or after the sale, the IRS disallows the loss and adds it to the cost basis of the replacement shares. This means you cannot simply sell and immediately repurchase the exact same ETF — you must either wait 31 days or invest in a different (but similar) fund. Note that wash sale rules apply across all accounts you own, including IRAs and spousal accounts.',
      'Optimal harvesting timing depends on several factors. Year-end is the most common time for tax-loss harvesting as investors review their annual gains and losses, but waiting until December can be suboptimal if the market recovers before you repurchase. Many sophisticated investors harvest losses continuously throughout the year whenever positions drop below their cost basis by a meaningful threshold. Automated tax-loss harvesting services offered by robo-advisors can execute this strategy efficiently without constant manual monitoring.',
      'The long-term impact of tax-loss harvesting on portfolio returns is significant. Studies suggest that systematic tax-loss harvesting can add 0.5-1.5% in after-tax returns annually, depending on market volatility and the investor\'s tax bracket. Over a 30-year investment horizon, this seemingly small annual benefit compounds into tens of thousands of dollars in additional wealth. For investors in high tax brackets with significant taxable accounts, tax-loss harvesting should be considered a core portfolio management technique rather than an afterthought.',
    ],
    category: 'Taxes',
    difficulty: 'Intermediate',
    readTime: 6,
  },
  {
    id: 11,
    title: 'Dividend Investing Strategy',
    description: 'Build a portfolio of quality dividend stocks for steady income. Learn about dividend yield, payout ratios, dividend growth, and the power of compounding through DRIPs.',
    fullContent: [
      'Dividend investing is a time-tested strategy that focuses on building a portfolio of stocks that regularly distribute a portion of their earnings to shareholders. While growth investing captures headlines with soaring stock prices, dividend investing quietly builds wealth through the power of compounding income streams. Over the long term, dividends have accounted for approximately 40% of the total return of the S&P 500, making them a critical component of any well-rounded investment strategy.',
      'The dividend yield — calculated as the annual dividend per share divided by the stock price — is the most basic metric for evaluating dividend stocks. However, yield alone can be misleading. An unusually high yield (above 6-7%) often signals that the market expects the dividend to be cut, either because the payout ratio is unsustainable or because the company faces fundamental business challenges. The sweet spot for most dividend investors is the 2.5-5% range, which offers meaningful income while suggesting the dividend is sustainable.',
      'The payout ratio — the percentage of earnings paid out as dividends — is a critical sustainability metric. A payout ratio below 60% generally indicates a comfortable margin of safety, while ratios above 80% should raise concerns about the dividend\'s sustainability. However, the appropriate payout ratio varies by industry: utilities and REITs can sustain higher payout ratios due to their stable cash flows and regulatory structures, while cyclical companies should maintain lower ratios to preserve flexibility during downturns.',
      'Dividend growth — the rate at which a company increases its dividend over time — is arguably more important than the current yield. A company growing its dividend at 8-10% annually will double its payout in approximately 7-9 years, transforming a modest current yield into a substantial income stream. The Dividend Aristocrats — companies that have increased their dividends for 25+ consecutive years — have historically outperformed the broader market with lower volatility, demonstrating the power of consistent dividend growth.',
      'Dividend Reinvestment Plans (DRIPs) allow investors to automatically reinvest dividends into additional shares, often at a discount to the market price and without transaction fees. Over time, DRIPs create a powerful compounding effect as dividends buy more shares, which generate more dividends, which buy even more shares. For investors with a long time horizon and no immediate income needs, reinvesting dividends through a DRIP can significantly accelerate portfolio growth compared to taking dividends as cash.',
    ],
    category: 'Investing Basics',
    difficulty: 'Beginner',
    readTime: 5,
  },
  {
    id: 12,
    title: 'Understanding Market Cap',
    description: 'Mega, large, mid, small, and micro cap stocks explained. Learn how market capitalization affects risk, growth potential, and portfolio allocation strategies.',
    fullContent: [
      'Market capitalization — the total market value of a company\'s outstanding shares — is one of the most fundamental characteristics of any stock. It influences everything from risk and return characteristics to liquidity, analyst coverage, and index inclusion. Understanding how market cap affects investment outcomes is essential for constructing a portfolio that matches your risk tolerance and return objectives.',
      'Stocks are typically categorized by market cap as follows: Mega-cap (over $200 billion), Large-cap ($10-200 billion), Mid-cap ($2-10 billion), Small-cap ($300 million-$2 billion), and Micro-cap (below $300 million). Each category offers a distinct risk-reward profile. Large-cap stocks tend to be more stable and liquid but offer slower growth, while small-cap stocks offer higher growth potential with greater volatility and risk.',
      'Historically, small-cap stocks have outperformed large-cap stocks over long periods — a phenomenon known as the "size premium." However, this outperformance comes with significantly higher volatility and periods of extended underperformance. Small caps tend to outperform during economic recoveries and periods of rising interest rates, while large caps offer relative stability during market downturns and periods of economic uncertainty.',
      'Liquidity is an often-overlooked dimension of market cap. Large-cap stocks trade millions of shares daily with tight bid-ask spreads, making them easy to buy and sell without significantly impacting the price. Small and micro-cap stocks may trade only thousands of shares daily with wide spreads, meaning that entering or exiting a position can be costly and time-consuming. Institutional investors often avoid the smallest stocks entirely due to these liquidity constraints, creating potential opportunities for individual investors willing to do the research.',
      'A well-constructed portfolio typically includes exposure across the market cap spectrum, with the specific allocation depending on the investor\'s time horizon and risk tolerance. Younger investors with longer time horizons can afford to overweight small and mid-cap stocks for their growth potential, while retirees may prefer the stability and income of large-cap dividend payers. Blended approaches using total market index funds provide automatic diversification across all market cap segments without the need for active management.',
    ],
    category: 'Investing Basics',
    difficulty: 'Beginner',
    readTime: 4,
  },
  {
    id: 13,
    title: 'Retirement Planning Roadmap',
    description: 'Step-by-step guide to planning your retirement from your 20s through your 60s. Calculate your number, optimize Social Security, and create a sustainable withdrawal strategy.',
    fullContent: [
      'Retirement planning is a lifelong process that looks very different at each stage of your career. The strategies that make sense in your 20s — aggressive saving, growth-oriented investments, and taking calculated risks — need to evolve as you approach and enter retirement. Having a roadmap that adapts to your changing circumstances is the key to reaching financial independence and maintaining your lifestyle throughout retirement.',
      'In your 20s, the most powerful force on your side is time. Even modest savings grow exponentially through compound interest over four or five decades. A 25-year-old who invests just $200 per month and earns an average 8% annual return will accumulate over $700,000 by age 65. The same person starting at 35 would need to invest nearly $500 per month to reach the same goal. Focus on building the savings habit, capturing any employer matching contributions, and investing aggressively in growth-oriented assets.',
      'In your 30s and 40s, your earning power typically peaks, making this the prime saving years. Aim to save at least 15-20% of your income for retirement. This is also the time to diversify beyond pure growth investments, adding international exposure and some fixed income allocation. Reassess your target retirement number annually using the "25x rule" — you need approximately 25 times your annual expenses saved to sustain a 4% withdrawal rate in retirement.',
      'In your 50s and early 60s, the focus shifts to preservation and planning. Gradually increase your fixed income allocation to reduce portfolio volatility as you approach retirement. Take advantage of catch-up contributions (additional amounts allowed for investors 50+). Consider when to claim Social Security — delaying from age 62 to 70 increases your benefit by approximately 8% per year, which can mean hundreds of thousands of dollars in additional lifetime benefits for those with above-average life expectancy.',
      'The withdrawal strategy you choose in retirement is as important as the accumulation strategy that got you there. The traditional 4% rule — withdrawing 4% of your portfolio in year one and adjusting for inflation thereafter — is a reasonable starting point but should be adjusted based on market conditions, your spending needs, and your age. Consider a dynamic withdrawal strategy that reduces spending during market downturns and increases it during strong years. Maintaining 1-2 years of expenses in cash or short-term bonds provides a buffer that prevents you from being forced to sell investments at depressed prices during market corrections.',
    ],
    category: 'Retirement',
    difficulty: 'Intermediate',
    readTime: 9,
  },
  {
    id: 14,
    title: 'Risk Management Essentials',
    description: 'Position sizing, stop losses, portfolio diversification, and downside protection. Learn the critical frameworks that separate successful investors from those who blow up.',
    fullContent: [
      'Risk management is the single most important discipline in investing, yet it is also the most neglected. Every legendary investor — from Warren Buffett to Ray Dalio — emphasizes that preserving capital during downturns is far more important than maximizing returns during upswings. The mathematics of drawdowns make this clear: a 50% loss requires a 100% gain to recover, meaning that large losses have a disproportionate impact on long-term wealth accumulation.',
      'Position sizing is the first line of defense against catastrophic loss. The Kelly Criterion and fixed-fractional position sizing are two popular frameworks. For most individual investors, a simple rule of limiting any single position to 5-10% of the total portfolio provides adequate diversification while still allowing meaningful exposure to high-conviction ideas. Never let a single stock represent more than 10-15% of your portfolio, regardless of how confident you are in its prospects.',
      'Stop losses provide an automatic exit mechanism when a trade moves against you. While the appropriate stop level depends on your strategy and time horizon, a common approach is to set stops at 7-10% below your entry price for swing trades and 15-20% for longer-term positions. Trailing stops — which move up as the stock price rises — lock in gains while still giving the position room to fluctuate. The key discipline is to set your stop before entering the trade and never widen it to avoid taking a loss.',
      'Portfolio diversification goes beyond simply owning many stocks. True diversification means owning assets that respond differently to various economic scenarios — a mix of stocks, bonds, commodities, real estate, and potentially alternative investments. Within your equity allocation, diversify across sectors, market caps, and geographies. International stocks often move differently from US stocks, providing valuable diversification during periods when the US market underperforms.',
      'Downside protection strategies include hedging with options, maintaining cash reserves, and building "barbell" portfolios that pair aggressive growth positions with conservative income-generating assets. The appropriate level of protection depends on your risk tolerance and time horizon, but every investor should have a plan for how they will respond to a significant market decline — before it happens, not during the panic. As the old Wall Street adage goes: "Plan your trade, and trade your plan."',
    ],
    category: 'Investing Basics',
    difficulty: 'Advanced',
    readTime: 8,
  },
];

/* ── Home editorial data ── */
interface HomeArticle {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  date: string;
  readTime: string;
  fullContent: string[];
}

const homeArticles: HomeArticle[] = [
  {
    id: 0,
    title: 'The Infrastructure of Tomorrow',
    subtitle: 'How decentralized networks are reshaping global capital flows',
    image: '/images/shift_image_1.jpg',
    date: 'Jan 15, 2026',
    readTime: '8 min',
    fullContent: [
      'The financial infrastructure that underpins global capital flows is undergoing a fundamental transformation. Decentralized networks — built on blockchain technology and governed by smart contracts — are challenging the centuries-old model of centralized clearing and settlement that has defined how money moves around the world. This shift is not merely technological; it represents a philosophical realignment in how we think about trust, transparency, and the role of intermediaries in financial markets.',
      'Traditional capital markets rely on a complex web of intermediaries — custodian banks, clearinghouses, transfer agents, and correspondent banks — each adding layers of cost, delay, and counterparty risk to every transaction. A cross-border securities settlement can take T+2 days or longer, with multiple intermediaries each extracting their toll. Decentralized finance (DeFi) protocols can settle the same transaction in minutes, with cryptographic guarantees replacing institutional trust.',
      'The implications for emerging markets are particularly profound. Countries with underdeveloped financial infrastructure can leapfrog traditional banking systems entirely, building digital-first financial ecosystems that are more accessible, more efficient, and more transparent than their developed-world counterparts. We are already seeing this pattern in parts of Sub-Saharan Africa and Southeast Asia, where mobile-first financial platforms have achieved penetration rates that traditional banks never reached.',
      'However, the transition is not without risks. Decentralized systems introduce new categories of risk — smart contract vulnerabilities, governance attacks, and regulatory uncertainty — that must be carefully managed. The collapse of several high-profile DeFi protocols has demonstrated that decentralization does not automatically imply safety. Robust auditing practices, formal verification of smart contracts, and thoughtful governance mechanisms are essential for building the reliable infrastructure that institutional capital requires.',
      'Looking ahead, we believe the most likely outcome is a hybrid model where decentralized and traditional financial infrastructure coexist and interoperate. Central bank digital currencies (CBDCs) will serve as bridges between these worlds, providing the regulatory certainty of traditional finance with the efficiency of distributed ledger technology. The infrastructure of tomorrow will be neither purely centralized nor purely decentralized but intelligently layered to capture the best of both paradigms.',
    ],
  },
  {
    id: 1,
    title: 'Liquid Metal Markets',
    subtitle: 'An analysis of volatility surfaces in post-quantum trading environments',
    image: '/images/shift_image_2.jpg',
    date: 'Jan 12, 2026',
    readTime: '12 min',
    fullContent: [
      'The advent of quantum computing presents both existential threats and transformative opportunities for financial markets. While practical quantum computers capable of breaking current encryption standards remain years away, the mere anticipation of their arrival is already reshaping how financial institutions approach risk management, trading strategy, and infrastructure security. This analysis examines how volatility surfaces — the three-dimensional representation of option implied volatilities across strikes and maturities — are evolving in response to the emerging quantum computing landscape.',
      'Traditional volatility surface models assume that market participants have roughly equal access to information and computing power. Quantum computing disrupts this assumption by potentially enabling the first organizations to achieve quantum advantage to extract alpha from patterns invisible to classical computers. This information asymmetry introduces new dynamics into volatility surfaces, particularly in the term structure of volatility where longer-dated options must price in the uncertainty of when quantum advantage will arrive and how it will be deployed.',
      'Our research identifies three primary channels through which quantum computing expectations affect volatility surfaces. First, the "quantum risk premium" — an additional component of implied volatility that compensates sellers of long-dated options for the tail risk of a sudden quantum disruption. Second, the "computational advantage skew" — a distortion of the volatility smile that reflects the asymmetric impact of quantum computing on different market participants. Third, the "encryption transition spread" — a widening of bid-ask spreads in long-dated options that reflects market uncertainty about the timeline for post-quantum cryptography adoption.',
      'Practical implications for traders and risk managers include the need to augment traditional volatility surface models with quantum-adjusted parameters, the importance of monitoring developments in post-quantum cryptography standards, and the potential for significant mark-to-market gains or losses when quantum milestones are announced. Firms that develop robust frameworks for pricing quantum uncertainty into their volatility models will have a meaningful edge as this technology matures.',
      'We conclude that the impact of quantum computing on financial markets is not a distant future concern but a present-day reality that is already being priced, however imperfectly, into volatility surfaces. Market participants who ignore this dimension of risk do so at their peril. The "liquid metal" metaphor in our title reflects the malleable and rapidly changing nature of volatility surfaces in this new environment — they are becoming more fluid, more reactive, and more sensitive to technological disruption than ever before.',
    ],
  },
  {
    id: 2,
    title: 'Neural Networks of Capital',
    subtitle: 'Machine learning architectures predicting macro-economic shifts',
    image: '/images/shift_image_3.jpg',
    date: 'Jan 08, 2026',
    readTime: '6 min',
    fullContent: [
      'Machine learning has moved from the periphery to the center of macroeconomic forecasting, with neural network architectures increasingly outperforming traditional econometric models in predicting key economic indicators. This article examines the specific architectures that are proving most effective for macro prediction and the implications for investors who seek to position their portfolios ahead of economic turning points.',
      'Recurrent neural networks (RNNs) and their more sophisticated variant, Long Short-Term Memory (LSTM) networks, have demonstrated particular strength in capturing the temporal dependencies that characterize macroeconomic data. These architectures excel at learning from sequences of economic releases — employment, inflation, manufacturing, consumer sentiment — and identifying patterns that precede shifts in the business cycle. Our backtesting shows that LSTM-based models correctly identified 85% of NBER-dated recession onsets with an average lead time of 4-6 months, significantly outperforming traditional leading indicator indices.',
      'Transformer architectures, originally developed for natural language processing, are being adapted for macroeconomic forecasting with promising results. Their attention mechanism allows the model to dynamically focus on the most relevant economic indicators at each point in time, effectively learning which variables matter most in different economic regimes. This is a significant advantage over fixed-weight models that assign constant importance to economic indicators regardless of the prevailing economic context.',
      'Graph neural networks (GNNs) represent the frontier of macro-prediction technology. By modeling the global economy as a network of interconnected national economies, trade flows, and financial linkages, GNNs can capture the propagation of economic shocks across borders with a fidelity that traditional models cannot match. Our GNN-based model successfully predicted the 2024 European slowdown 3 months before it appeared in consensus forecasts, driven by its ability to detect early signals in German manufacturing data and their downstream effects on trading partner economies.',
      'For investors, the practical takeaway is that machine learning models are becoming an indispensable part of the macro forecasting toolkit. However, these models are not infallible — they are only as good as the data they are trained on, and they can fail dramatically when confronted with truly novel economic conditions that have no historical precedent. The wisest approach is to use ML forecasts as one input among many, combining them with fundamental economic reasoning, market signals, and risk management discipline to construct portfolios that are robust across a range of economic scenarios.',
    ],
  },
];

/* ── Category badge helper ── */
function CategoryBadge({ category, type }: { category: string; type: string }) {
  const newsStyles: Record<string, string> = {
    'Market Analysis': 'bg-emerald/20 text-emerald border-emerald/30',
    'Economic Data': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Earnings': 'bg-chartblue/20 text-chartblue border-chartblue/30',
    'Fed Policy': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Crypto': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };
  const researchStyles: Record<string, string> = {
    'Macro': 'bg-emerald/20 text-emerald border-emerald/30',
    'Infrastructure': 'bg-chartblue/20 text-chartblue border-chartblue/30',
    'Technology': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Research': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Risk': 'bg-crimson/20 text-crimson border-crimson/30',
  };
  const eduStyles: Record<string, string> = {
    'Investing Basics': 'bg-emerald/20 text-emerald border-emerald/30',
    'Options': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Technical Analysis': 'bg-chartblue/20 text-chartblue border-chartblue/30',
    'Taxes': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Retirement': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };
  const homeStyles: Record<string, string> = {
    'Editorial': 'bg-emerald/20 text-emerald border-emerald/30',
  };

  const generatedStyles: Record<string, string> = {
    'Market Analysis': 'bg-emerald/20 text-emerald border-emerald/30',
    'Education': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    'Economic Data': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Earnings': 'bg-chartblue/20 text-chartblue border-chartblue/30',
    'Fed Policy': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Crypto': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };

  const styles = type === 'news' ? newsStyles : type === 'research' ? researchStyles : type === 'education' ? eduStyles : type === 'generated' ? generatedStyles : homeStyles;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-mono rounded border ${styles[category] || 'bg-slategray/20 text-slategray border-slategray/30'}`}>
      {category}
    </span>
  );
}

/* ── Rich content renderer for generated articles ── */
function GeneratedArticleContent({ article }: { article: GeneratedArticle }) {
  const c = article.content;
  const midImage = article.images?.mid;

  // Helper to render mid-article image after a specific section
  const MidArticleImage = () => {
    if (!midImage) return null;
    return (
      <div className="my-8 rounded-xl overflow-hidden border border-subtleborder">
        <img src={midImage.src} alt={midImage.alt} className="w-full h-56 md:h-72 object-cover" />
      </div>
    );
  };

  // Market Wrap type
  if (article.type === 'market-wrap') {
    const intro = (c.introduction as string) || '';
    const indices = (c.keyIndices as { name: string; value: string; change: string; up: boolean }[]) || [];
    const drivers = (c.marketDrivers as string[]) || [];
    const outlook = (c.outlook as string) || '';
    return (
      <div className="space-y-8">
        <p className="text-offwhite/90 leading-relaxed text-base md:text-lg">{intro}</p>
        {indices.length > 0 && (
          <div>
            <h2 className="text-xl font-display font-light text-offwhite mb-4">Key Market Indices</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {indices.map((idx) => (
                <div key={idx.name} className="bg-charcoal border border-subtleborder rounded-lg p-3">
                  <p className="text-xs font-mono text-slategray">{idx.name}</p>
                  <p className="text-sm font-mono text-offwhite">{idx.value}</p>
                  <p className={`text-xs font-mono ${idx.up ? 'text-emerald' : 'text-crimson'}`}>
                    {idx.change}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {drivers.length > 0 && (
          <div>
            <h2 className="text-xl font-display font-light text-offwhite mb-4">Market Drivers</h2>
            <ul className="space-y-2">
              {drivers.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-offwhite/90 text-base">
                  <span className="text-emerald mt-1.5 flex-shrink-0">&#9654;</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}
        <MidArticleImage />
        {outlook && (
          <div className="border-l-2 border-emerald/40 pl-4">
            <h2 className="text-xl font-display font-light text-offwhite mb-2">Outlook</h2>
            <p className="text-offwhite/90 leading-relaxed text-base">{outlook}</p>
          </div>
        )}
      </div>
    );
  }

  // Glossary type
  if (article.type === 'glossary') {
    const definition = (c.definition as string) || '';
    const formula = (c.formula as string) || '';
    const example = (c.example as string) || '';
    const types = (c.types as string) || '';
    const whyItMatters = (c.whyItMatters as string) || '';
    const relatedTerms = (c.relatedTerms as { term: string; slug: string }[]) || [];
    const relatedTools = (c.relatedTools as { name: string; path: string }[]) || [];
    return (
      <div className="space-y-8">
        <div className="bg-charcoal border border-emerald/30 rounded-xl p-6">
          <h2 className="text-xs font-mono text-emerald mb-2 uppercase tracking-wider">Definition</h2>
          <p className="text-offwhite leading-relaxed text-base md:text-lg">{definition}</p>
        </div>
        {formula && (
          <div className="bg-charcoal border border-subtleborder rounded-xl p-6">
            <h2 className="text-xs font-mono text-chartblue mb-2 uppercase tracking-wider">Formula</h2>
            <p className="font-mono text-offwhite text-base">{formula}</p>
          </div>
        )}
        {example && (
          <div>
            <h2 className="text-xl font-display font-light text-offwhite mb-3">Example</h2>
            <p className="text-offwhite/90 leading-relaxed text-base">{example}</p>
          </div>
        )}
        <MidArticleImage />
        {types && (
          <div>
            <h2 className="text-xl font-display font-light text-offwhite mb-3">Types & Variations</h2>
            <p className="text-offwhite/90 leading-relaxed text-base">{types}</p>
          </div>
        )}
        {whyItMatters && (
          <div className="border-l-2 border-emerald/40 pl-4">
            <h2 className="text-xl font-display font-light text-offwhite mb-2">Why It Matters</h2>
            <p className="text-offwhite/90 leading-relaxed text-base">{whyItMatters}</p>
          </div>
        )}
        {relatedTerms.length > 0 && (
          <div>
            <h2 className="text-xl font-display font-light text-offwhite mb-3">Related Terms</h2>
            <div className="flex flex-wrap gap-2">
              {relatedTerms.map((rt) => (
                <Link
                  key={rt.slug}
                  to={`/news/article/${rt.slug}`}
                  className="px-3 py-1.5 text-xs font-mono bg-charcoal border border-subtleborder rounded-lg text-slategray hover:text-emerald hover:border-emerald/40 transition-colors"
                >
                  {rt.term}
                </Link>
              ))}
            </div>
          </div>
        )}
        {relatedTools.length > 0 && (
          <div>
            <h2 className="text-xl font-display font-light text-offwhite mb-3">Related Tools</h2>
            <div className="flex flex-wrap gap-2">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="px-3 py-1.5 text-xs font-mono bg-emerald/10 border border-emerald/30 rounded-lg text-emerald hover:bg-emerald/20 transition-colors"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Listicle type
  if (article.type === 'listicle') {
    const intro = (c.introduction as string) || '';
    const items = (c.items as { name: string; detail: string }[]) || [];
    const disclaimer = (c.disclaimer as string) || '';
    const midIdx = Math.floor(items.length / 2);
    return (
      <div className="space-y-8">
        <p className="text-offwhite/90 leading-relaxed text-base md:text-lg">{intro}</p>
        {items.map((item, i) => (
          <div key={i}>
            <div className="bg-charcoal border border-subtleborder rounded-xl p-5 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald/20 text-emerald text-sm font-mono font-bold flex-shrink-0">
                  {i + 1}
                </span>
                <h3 className="text-lg font-display font-medium text-offwhite">{item.name}</h3>
              </div>
              <p className="text-offwhite/80 leading-relaxed text-base pl-11">{item.detail}</p>
            </div>
            {i === midIdx && <MidArticleImage />}
          </div>
        ))}
        {disclaimer && (
          <p className="text-sm text-slategray italic border-t border-subtleborder pt-4">{disclaimer}</p>
        )}
      </div>
    );
  }

  // Comparison type
  if (article.type === 'comparison') {
    const intro = (c.introduction as string) || '';
    const leftSide = (c.leftSide as { name: string; points: string[] }) || { name: '', points: [] };
    const rightSide = (c.rightSide as { name: string; points: string[] }) || { name: '', points: [] };
    const verdict = (c.verdict as string) || '';
    const relatedTools = (c.relatedTools as { name: string; path: string }[]) || [];
    return (
      <div className="space-y-8">
        <p className="text-offwhite/90 leading-relaxed text-base md:text-lg">{intro}</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-charcoal border border-emerald/30 rounded-xl p-5">
            <h3 className="text-lg font-display font-medium text-emerald mb-4">{leftSide.name}</h3>
            <ul className="space-y-3">
              {leftSide.points.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-offwhite/90 text-sm">
                  <span className="text-emerald mt-0.5 flex-shrink-0">&#10003;</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-charcoal border border-chartblue/30 rounded-xl p-5">
            <h3 className="text-lg font-display font-medium text-chartblue mb-4">{rightSide.name}</h3>
            <ul className="space-y-3">
              {rightSide.points.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-offwhite/90 text-sm">
                  <span className="text-chartblue mt-0.5 flex-shrink-0">&#10003;</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <MidArticleImage />
        {verdict && (
          <div className="bg-charcoal border border-emerald/40 rounded-xl p-6">
            <h2 className="text-xs font-mono text-emerald mb-2 uppercase tracking-wider">The Verdict</h2>
            <p className="text-offwhite/90 leading-relaxed text-base">{verdict}</p>
          </div>
        )}
        {relatedTools.length > 0 && (
          <div>
            <h2 className="text-xl font-display font-light text-offwhite mb-3">Related Tools</h2>
            <div className="flex flex-wrap gap-2">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="px-3 py-1.5 text-xs font-mono bg-emerald/10 border border-emerald/30 rounded-lg text-emerald hover:bg-emerald/20 transition-colors"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // How-To type
  if (article.type === 'how-to') {
    const intro = (c.introduction as string) || '';
    const steps = (c.steps as { heading: string; body: string }[]) || [];
    const keyTakeaways = (c.keyTakeaways as string[]) || [];
    const relatedTools = (c.relatedTools as { name: string; path: string }[]) || [];
    const midStepIdx = Math.floor(steps.length / 2);
    return (
      <div className="space-y-8">
        <p className="text-offwhite/90 leading-relaxed text-base md:text-lg">{intro}</p>
        {steps.map((step, i) => (
          <div key={i}>
            <div className="border-l-2 border-emerald/40 pl-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono text-emerald bg-emerald/10 px-2 py-0.5 rounded">Step {i + 1}</span>
                <h3 className="text-lg font-display font-medium text-offwhite">{step.heading}</h3>
              </div>
              <p className="text-offwhite/80 leading-relaxed text-base">{step.body}</p>
            </div>
            {i === midStepIdx && <MidArticleImage />}
          </div>
        ))}
        {keyTakeaways.length > 0 && (
          <div className="bg-charcoal border border-emerald/30 rounded-xl p-6">
            <h2 className="text-xs font-mono text-emerald mb-3 uppercase tracking-wider">Key Takeaways</h2>
            <ul className="space-y-2">
              {keyTakeaways.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-offwhite/90 text-sm">
                  <span className="text-emerald mt-0.5 flex-shrink-0">&#10003;</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        )}
        {relatedTools.length > 0 && (
          <div>
            <h2 className="text-xl font-display font-light text-offwhite mb-3">Try It Yourself</h2>
            <div className="flex flex-wrap gap-2">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="px-3 py-1.5 text-xs font-mono bg-emerald/10 border border-emerald/30 rounded-lg text-emerald hover:bg-emerald/20 transition-colors"
                >
                  {tool.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Sector type
  if (article.type === 'sector') {
    const intro = (c.introduction as string) || '';
    const thesis = (c.investmentThesis as string) || '';
    const keyStocks = (c.keyStocks as { ticker: string; name: string; commentary: string }[]) || [];
    const risks = (c.risks as string) || '';
    const outlook = (c.outlook as string) || '';
    return (
      <div className="space-y-8">
        <p className="text-offwhite/90 leading-relaxed text-base md:text-lg">{intro}</p>
        {thesis && (
          <div className="bg-charcoal border border-emerald/30 rounded-xl p-6">
            <h2 className="text-xs font-mono text-emerald mb-2 uppercase tracking-wider">Investment Thesis</h2>
            <p className="text-offwhite/90 leading-relaxed text-base">{thesis}</p>
          </div>
        )}
        {keyStocks.length > 0 && (
          <div>
            <h2 className="text-xl font-display font-light text-offwhite mb-4">Key Stocks</h2>
            <div className="space-y-3">
              {keyStocks.map((stock) => (
                <Link
                  key={stock.ticker}
                  to={`/stocks/${stock.ticker}`}
                  className="block bg-charcoal border border-subtleborder rounded-xl p-4 hover:border-emerald/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-mono font-bold text-emerald">{stock.ticker}</span>
                    <span className="text-sm text-slategray">{stock.name}</span>
                    <span className="ml-auto text-emerald opacity-0 group-hover:opacity-100 transition-opacity text-xs">&#8594;</span>
                  </div>
                  <p className="text-offwhite/80 text-sm leading-relaxed">{stock.commentary}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
        <MidArticleImage />
        {risks && (
          <div className="bg-charcoal border border-crimson/30 rounded-xl p-6">
            <h2 className="text-xs font-mono text-crimson mb-2 uppercase tracking-wider">Risks</h2>
            <p className="text-offwhite/90 leading-relaxed text-base">{risks}</p>
          </div>
        )}
        {outlook && (
          <div className="border-l-2 border-emerald/40 pl-4">
            <h2 className="text-xl font-display font-light text-offwhite mb-2">Outlook</h2>
            <p className="text-offwhite/90 leading-relaxed text-base">{outlook}</p>
          </div>
        )}
      </div>
    );
  }

  // Fallback: render content fields as paragraphs
  return (
    <div className="space-y-4">
      {Object.entries(c).map(([key, value]) => {
        if (typeof value === 'string' && value.length > 0) {
          return (
            <div key={key}>
              <h2 className="text-lg font-display font-light text-offwhite mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h2>
              <p className="text-offwhite/90 leading-relaxed text-base">{value}</p>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

export default function ArticleDetail() {
  const { id } = useParams<{ id: string; slug: string }>();
  const location = useLocation();
  // Detect generated article route: /news/article/:slug
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isGeneratedArticle = pathParts.length >= 3 && pathParts[0] === 'news' && pathParts[1] === 'article';
  const articleSlug = isGeneratedArticle ? pathParts[2] : null;
  // Extract type from URL path (e.g. /editorial/0 → 'editorial', /news/5 → 'news')
  const type = isGeneratedArticle ? 'generated' : (pathParts[0] || '');
  
  const [newsArticles, setNewsArticles] = useState<ApiNewsArticle[]>([]);
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  useEffect(() => {
    if (isGeneratedArticle && articleSlug) {
      fetch(`/data/articles/${articleSlug}.json`)
        .then((res) => {
          if (!res.ok) throw new Error('Not found');
          return res.json();
        })
        .then((data: GeneratedArticle) => {
          setGeneratedArticle(data);
          setLoading(false);
        })
        .catch(() => {
          setGeneratedArticle(null);
          setLoading(false);
        });
    } else if (type === 'news') {
      fetchNews().then((data) => {
        setNewsArticles(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isGeneratedArticle, articleSlug, type]);

  // Redirect /news/:id to /news/article/:slug when the article has a slug
  const articleId = parseInt(id || '0', 10);
  if (type === 'news' && newsArticles.length > 0) {
    const newsArticle = newsArticles[articleId];
    if (newsArticle?.articleSlug) {
      return <Navigate to={`/news/article/${newsArticle.articleSlug}`} replace />;
    }
  }

  // SEO: set document title and meta description
  useEffect(() => {
    if (generatedArticle) {
      document.title = `${generatedArticle.title} — Sigma Capital`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', generatedArticle.metaDescription);
      else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = generatedArticle.metaDescription;
        document.head.appendChild(meta);
      }
    }
  }, [generatedArticle]);

  // Determine article data based on type
  let title = '';
  let excerpt = '';
  let content: string[] = [];
  let date = '';
  let author = '';
  let category = '';
  let image = '';
  let readTime = '';
  let backLink = '/news';
  let backLabel = 'Insights & Guides';

  // Generated article
  if (isGeneratedArticle && generatedArticle) {
    title = generatedArticle.title;
    excerpt = generatedArticle.excerpt;
    content = [];
    date = generatedArticle.displayDate;
    author = ''; // No individual author for generated articles
    category = generatedArticle.category;
    image = generatedArticle.images?.hero?.src || generatedArticle.image?.src || '';
    readTime = `${generatedArticle.readingTime} min`;
  } else if (type === 'news') {
    const article = newsArticles[articleId];
    if (article) {
      // If the news article has a slug, redirect to the generated article page
      if (article.articleSlug) {
        return <Navigate to={`/news/article/${article.articleSlug}`} replace />;
      }
      // Otherwise show basic info from the news listing
      title = article.headline;
      excerpt = article.excerpt;
      content = [article.excerpt];
      date = article.date;
      author = '';
      category = article.category;
      image = '';
    }
    backLink = '/news';
    backLabel = 'Market News';
  } else if (type === 'research') {
    const article = researchArticles.find((a) => a.id === articleId);
    if (article) {
      title = article.title;
      excerpt = article.abstract;
      content = article.fullContent;
      date = article.date;
      author = 'Sigma Capital Research';
      category = article.category;
      image = article.image;
      readTime = article.readTime;
    }
    backLink = '/research';
    backLabel = 'Research';
  } else if (type === 'education') {
    const article = educationArticles.find((a) => a.id === articleId);
    if (article) {
      title = article.title;
      excerpt = article.description;
      content = article.fullContent;
      date = '2026';
      author = 'Sigma Capital Education';
      category = article.category;
      readTime = `${article.readTime} min`;
    }
    backLink = '/education';
    backLabel = 'Education';
  } else if (type === 'editorial') {
    const article = homeArticles.find((a) => a.id === articleId);
    if (article) {
      title = article.title;
      excerpt = article.subtitle;
      content = article.fullContent;
      date = article.date;
      author = 'Sigma Capital Editorial';
      category = 'Editorial';
      image = article.image;
      readTime = article.readTime;
    }
    backLink = '/';
    backLabel = 'Home';
  }



  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    } catch {
      // fallback - do nothing
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-24">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-charcoal rounded w-1/4" />
          <div className="h-12 bg-charcoal rounded w-3/4" />
          <div className="h-4 bg-charcoal rounded w-1/3" />
          <div className="h-64 bg-charcoal rounded" />
          <div className="space-y-3">
            <div className="h-4 bg-charcoal rounded" />
            <div className="h-4 bg-charcoal rounded w-5/6" />
            <div className="h-4 bg-charcoal rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!title) {
    return (
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-24 text-center">
        <h1 className="text-3xl font-display font-light text-offwhite mb-4">Article Not Found</h1>
        <p className="text-slategray mb-8">The article you are looking for does not exist or has been removed.</p>
        <Link to="/" className="text-emerald hover:text-offwhite transition-colors">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-24 pb-24">
      {/* Back Link */}
      <div className="mb-8">
        <Link to={backLink} className="text-xs font-mono text-slategray hover:text-emerald transition-colors flex items-center gap-1">
          <ArrowLeftIcon size={12} /> Back to {backLabel}
        </Link>
      </div>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <CategoryBadge category={category} type={type || ''} />
          <span className="text-xs font-mono text-slategray flex items-center gap-1">
            <ClockIcon size={12} /> {date}
          </span>
          {readTime && (
            <span className="text-xs font-mono text-slategray">{readTime} read</span>
          )}
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-light text-offwhite leading-tight mb-4">
          {title}
        </h1>
        <p className="text-lg text-slategray leading-relaxed max-w-3xl">
          {excerpt}
        </p>
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-subtleborder">
          {!isGeneratedArticle && author && (
            <span className="text-sm font-mono text-slategray">By {author}</span>
          )}
          {isGeneratedArticle && (
            <span className="text-sm font-mono text-slategray">Sigma Capital</span>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg hover:bg-charcoal transition-colors text-slategray hover:text-offwhite"
              title="Copy link"
            >
              <ShareIcon size={16} />
            </button>
            <button
              onClick={() => setBookmarked(!bookmarked)}
              className={`p-2 rounded-lg transition-colors ${bookmarked ? 'bg-emerald/20 text-emerald' : 'hover:bg-charcoal text-slategray hover:text-offwhite'}`}
              title="Bookmark"
            >
              <BookmarkIcon size={16} />
            </button>
          </div>
        </div>
        {/* Tags for generated articles */}
        {isGeneratedArticle && generatedArticle && generatedArticle.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {generatedArticle.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 text-xs font-mono bg-charcoal border border-subtleborder rounded text-slategray">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hero Image */}
      {isGeneratedArticle && generatedArticle?.images?.hero ? (
        <div className="mb-10 rounded-xl overflow-hidden border border-subtleborder">
          <img src={generatedArticle.images.hero.src} alt={generatedArticle.images.hero.alt || title} className="w-full h-64 md:h-96 object-cover" />
          {generatedArticle.images.hero.credit && (
            <p className="text-xs text-slategray mt-2 px-1">
              Photo: <a href={generatedArticle.images.hero.creditUrl} target="_blank" rel="noopener noreferrer" className="hover:text-emerald transition-colors">{generatedArticle.images.hero.credit}</a>
            </p>
          )}
        </div>
      ) : image ? (
        <div className="mb-10 rounded-xl overflow-hidden border border-subtleborder">
          <img src={image} alt={title} className="w-full h-64 md:h-96 object-cover" />
        </div>
      ) : null}

      {/* Article Content */}
      <article className="prose-custom">
        {isGeneratedArticle && generatedArticle ? (
          <GeneratedArticleContent article={generatedArticle} />
        ) : (
          content.map((paragraph, idx) => (
            <p key={idx} className="text-offwhite/90 leading-relaxed mb-6 text-base md:text-lg">
              {paragraph}
            </p>
          ))
        )}
      </article>

      {/* Mid-article Image Credit */}
      {isGeneratedArticle && generatedArticle?.images?.mid?.credit && (
        <p className="text-xs text-slategray mt-2 px-1">
          Photo: <a href={generatedArticle.images.mid.creditUrl} target="_blank" rel="noopener noreferrer" className="hover:text-emerald transition-colors">{generatedArticle.images.mid.credit}</a>
        </p>
      )}

      {/* Bottom Navigation */}
      <div className="mt-16 pt-8 border-t border-subtleborder flex items-center justify-between">
        <Link
          to={backLink}
          className="text-sm font-mono text-emerald hover:text-offwhite transition-colors flex items-center gap-2"
        >
          <ArrowLeftIcon size={14} /> Back to {backLabel}
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="px-4 py-2 text-xs font-mono border border-subtleborder rounded-lg text-slategray hover:text-offwhite hover:border-slategray transition-colors"
          >
            Share Article
          </button>
        </div>
      </div>

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-charcoal border border-emerald/30 rounded-lg px-6 py-3 text-sm text-offwhite shadow-lg">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}
