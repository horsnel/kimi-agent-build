import { Suspense, lazy, Component, type ErrorInfo, type ReactNode } from 'react';
import { Routes, Route, useLocation } from 'react-router';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// ── Error Boundary ─────────────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Sigma ErrorBoundary:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-obsidian text-offwhite flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-display">Something went wrong</h1>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            className="px-6 py-2 bg-emerald text-obsidian rounded-lg font-medium hover:bg-emerald/90 transition-colors"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Loading Fallback ───────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-emerald/30 border-t-emerald rounded-full animate-spin" />
    </div>
  );
}

// ── Lazy-loaded pages (code splitting) ─────────────────────────────────────
const Home              = lazy(() => import('./pages/Home'));
const Markets           = lazy(() => import('./pages/Markets'));
const Research          = lazy(() => import('./pages/Research'));
const Tools             = lazy(() => import('./pages/Tools'));
const EconomicCalendar  = lazy(() => import('./pages/EconomicCalendar'));
const StockScreener     = lazy(() => import('./pages/StockScreener'));
const StockAnalysis     = lazy(() => import('./pages/StockAnalysis'));
const Education         = lazy(() => import('./pages/Education'));
const News              = lazy(() => import('./pages/News'));
const RetirementScore   = lazy(() => import('./pages/RetirementScore'));
const MortgageCalculator= lazy(() => import('./pages/MortgageCalculator'));
const PortfolioBacktester = lazy(() => import('./pages/PortfolioBacktester'));
const TaxLossHarvesting = lazy(() => import('./pages/TaxLossHarvesting'));
const OptionsCalculator = lazy(() => import('./pages/OptionsCalculator'));
const SectorRotation    = lazy(() => import('./pages/SectorRotation'));
const InsiderTrading    = lazy(() => import('./pages/InsiderTrading'));
const EarningsPreview   = lazy(() => import('./pages/EarningsPreview'));
const DCFValuation      = lazy(() => import('./pages/DCFValuation'));
const FedDecoder        = lazy(() => import('./pages/FedDecoder'));
const CryptoOnChain     = lazy(() => import('./pages/CryptoOnChain'));
const HedgeFundTracker  = lazy(() => import('./pages/HedgeFundTracker'));
const IPOPipeline       = lazy(() => import('./pages/IPOPipeline'));
const AIAdvisor         = lazy(() => import('./pages/AIAdvisor'));
const RealTimeAlerts    = lazy(() => import('./pages/RealTimeAlerts'));
const PortfolioOptimizer = lazy(() => import('./pages/PortfolioOptimizer'));
const MemberDashboard   = lazy(() => import('./pages/MemberDashboard'));
const NewsletterArchive = lazy(() => import('./pages/NewsletterArchive'));
const Glossary          = lazy(() => import('./pages/Glossary'));
const PodcastHub        = lazy(() => import('./pages/PodcastHub'));
const ContributorPortal = lazy(() => import('./pages/ContributorPortal'));
const NotFound          = lazy(() => import('./pages/NotFound'));
const ArticleDetail     = lazy(() => import('./pages/ArticleDetail'));
const PrivacyPolicy     = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService    = lazy(() => import('./pages/TermsOfService'));
const Disclaimer        = lazy(() => import('./pages/Disclaimer'));
const CookiePolicy      = lazy(() => import('./pages/CookiePolicy'));
const CompoundInterestPage = lazy(() => import('./pages/CompoundInterestPage'));
const SignIn            = lazy(() => import('./pages/SignIn'));
const SignUp            = lazy(() => import('./pages/SignUp'));
const Onboarding        = lazy(() => import('./pages/Onboarding'));

const AUTH_ROUTES = ['/signin', '/signup', '/onboarding'];

export default function App() {
  const location = useLocation();
  const isAuthPage = AUTH_ROUTES.includes(location.pathname);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-obsidian text-offwhite">
        <ScrollToTop />
        {!isAuthPage && <Navigation />}
        <main>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/markets" element={<Markets />} />
              <Route path="/research" element={<Research />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/tools/compound" element={<CompoundInterestPage />} />
              <Route path="/calendar" element={<EconomicCalendar />} />
              <Route path="/screener" element={<StockScreener />} />
              <Route path="/stocks/:ticker" element={<StockAnalysis />} />
              <Route path="/education" element={<Education />} />
              <Route path="/news" element={<News />} />
              <Route path="/tools/retirement" element={<RetirementScore />} />
              <Route path="/tools/mortgage" element={<MortgageCalculator />} />
              <Route path="/tools/backtester" element={<PortfolioBacktester />} />
              <Route path="/tools/tax-loss" element={<TaxLossHarvesting />} />
              <Route path="/tools/options" element={<OptionsCalculator />} />
              <Route path="/premium/sector-rotation" element={<SectorRotation />} />
              <Route path="/premium/insider-trading" element={<InsiderTrading />} />
              <Route path="/premium/earnings-preview" element={<EarningsPreview />} />
              <Route path="/premium/valuation" element={<DCFValuation />} />
              <Route path="/premium/fed-decoder" element={<FedDecoder />} />
              <Route path="/premium/crypto-onchain" element={<CryptoOnChain />} />
              <Route path="/premium/hedge-fund" element={<HedgeFundTracker />} />
              <Route path="/premium/ipo-pipeline" element={<IPOPipeline />} />
              <Route path="/premium/ai-advisor" element={<AIAdvisor />} />
              <Route path="/premium/real-time-alerts" element={<RealTimeAlerts />} />
              <Route path="/premium/portfolio-optimizer" element={<PortfolioOptimizer />} />
              <Route path="/dashboard" element={<MemberDashboard />} />
              <Route path="/newsletter" element={<NewsletterArchive />} />
              <Route path="/glossary" element={<Glossary />} />
              <Route path="/podcast" element={<PodcastHub />} />
              <Route path="/contribute" element={<ContributorPortal />} />
              <Route path="/news/article/:slug" element={<ArticleDetail />} />
              <Route path="/news/:id" element={<ArticleDetail />} />
              <Route path="/research/:id" element={<ArticleDetail />} />
              <Route path="/education/:id" element={<ArticleDetail />} />
              <Route path="/editorial/:id" element={<ArticleDetail />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        {!isAuthPage && <Footer />}
      </div>
    </ErrorBoundary>
  );
}
