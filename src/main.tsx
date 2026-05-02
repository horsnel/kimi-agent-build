import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { GeoCurrencyProvider } from './hooks/useGeoCurrency'
import './index.css'
import App from './App.tsx'

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <BrowserRouter>
      <GeoCurrencyProvider>
        <App />
      </GeoCurrencyProvider>
    </BrowserRouter>,
  );
} else {
  console.error('Root element not found');
}
