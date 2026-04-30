import { Routes, Route } from 'react-router';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import Markets from './pages/Markets';
import Research from './pages/Research';
import Tools from './pages/Tools';
import EconomicCalendar from './pages/EconomicCalendar';
import StockScreener from './pages/StockScreener';
import StockAnalysis from './pages/StockAnalysis';
import Education from './pages/Education';
import News from './pages/News';
import RetirementScore from './pages/RetirementScore';
import MortgageCalculator from './pages/MortgageCalculator';
import PortfolioBacktester from './pages/PortfolioBacktester';
import TaxLossHarvesting from './pages/TaxLossHarvesting';
import OptionsCalculator from './pages/OptionsCalculator';
import SectorRotation from './pages/SectorRotation';
import InsiderTrading from './pages/InsiderTrading';
import EarningsPreview from './pages/EarningsPreview';
import DCFValuation from './pages/DCFValuation';
import FedDecoder from './pages/FedDecoder';
import CryptoOnChain from './pages/CryptoOnChain';
import HedgeFundTracker from './pages/HedgeFundTracker';
import IPOPipeline from './pages/IPOPipeline';
import MemberDashboard from './pages/MemberDashboard';
import NewsletterArchive from './pages/NewsletterArchive';
import Glossary from './pages/Glossary';
import PodcastHub from './pages/PodcastHub';
import ContributorPortal from './pages/ContributorPortal';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div className="min-h-screen bg-obsidian text-offwhite">
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/research" element={<Research />} />
          <Route path="/tools" element={<Tools />} />
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
          <Route path="/dashboard" element={<MemberDashboard />} />
          <Route path="/newsletter" element={<NewsletterArchive />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/podcast" element={<PodcastHub />} />
          <Route path="/contribute" element={<ContributorPortal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
