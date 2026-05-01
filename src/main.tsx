import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { GeoCurrencyProvider } from './hooks/useGeoCurrency'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <GeoCurrencyProvider>
      <App />
    </GeoCurrencyProvider>
  </BrowserRouter>,
)
