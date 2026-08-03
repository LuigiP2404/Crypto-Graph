import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import './App.css';
import theme from './theme';
import CryptoGraph from './components/CryptoGraph/CryptoGraph';
import Header from './components/Header/Header';
import { AlertProvider } from './components/AlertContext/AlertContext';
import CryptoSearchType from './types/CryptoType';

const EmptyState = () => (
  <div className="empty">
    <div className="empty-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 20h18" strokeLinecap="round" />
        <rect x="5" y="10" width="3.5" height="7" rx="1" />
        <path d="M6.75 7v3M6.75 17v2" strokeLinecap="round" />
        <rect x="15.5" y="6" width="3.5" height="8" rx="1" />
        <path d="M17.25 3v3M17.25 14v3" strokeLinecap="round" />
      </svg>
    </div>
    <h2 className="empty-title">Search a cryptocurrency to get started</h2>
    <p className="empty-text">
      Type at least 3 characters in the search bar above to pull live market data and an
      interactive candlestick chart.
    </p>
    <div className="empty-hints">
      <span className="empty-hint">bitcoin</span>
      <span className="empty-hint">ethereum</span>
      <span className="empty-hint">solana</span>
    </div>
  </div>
);

function App() {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoSearchType | null>(null);

  return (
    <ThemeProvider theme={theme}>
      <AlertProvider>
        <div className="App">
          <div className="App-backdrop" aria-hidden="true" />
          <Header onSelectCrypto={setSelectedCrypto} />
          <main className="App-main">
            {selectedCrypto ? (
              <CryptoGraph selectedCrypto={selectedCrypto} />
            ) : (
              <EmptyState />
            )}
          </main>
        </div>
      </AlertProvider>
    </ThemeProvider>
  );
}

export default App;
