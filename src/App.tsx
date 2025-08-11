import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import CryptoGraph from './components/CryptoGraph/CryptoGraph';
import Header from './components/Header/Header';
import { AlertProvider, useAlert } from './components/AlertContext/AlertContext';
import { Alert } from '@mui/material';
import CryptoSearchType from './types/CryptoType';

function GlobalAlert() {
  const { alert, hideAlert } = useAlert();
  if (!alert.severity) return null;

  return (
    <Alert severity={alert.severity} onClose={hideAlert}>
      {alert.message}
    </Alert>
  );
}

function App() { 
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoSearchType | null>(null);

  return (
    <AlertProvider>
      <div className="App">
        <GlobalAlert />
        <Header onSelectCrypto={setSelectedCrypto} />
        {selectedCrypto ? <CryptoGraph selectedCrypto={selectedCrypto} /> : <div className="placeholder">Select a cryptocurrency to view its graph</div>}
      </div>
    </AlertProvider>
  );
}

export default App;
