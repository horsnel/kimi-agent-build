import { Routes, Route } from 'react-router';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import Markets from './pages/Markets';
import Research from './pages/Research';
import Tools from './pages/Tools';

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
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
