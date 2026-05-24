import React, { useState } from 'react'
import WalletConnect from './components/WalletConnect'
import CreateCheque from './components/CreateCheque'
import ChequeList from './components/ChequeList'
import IntermediaryPanel from './components/IntermediaryPanel'
import './App.css'

function App() {
  const [account, setAccount] = useState(null);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ChainCheck</h1>
        <p>Dijital Çek Yönetim Sistemi (Demo)</p>
      </header>
      
      <main className="app-main">
        <section className="dashboard-section">
          <h2>Dashboard</h2>
          <WalletConnect onAccountChange={setAccount} />
        </section>

        {account && (
          <>
            <section className="dashboard-section" style={{ marginTop: '2rem' }}>
              <IntermediaryPanel account={account} />
            </section>
            
            <section className="dashboard-section" style={{ marginTop: '2rem' }}>
              <ChequeList account={account} />
            </section>
            
            <section className="dashboard-section" style={{ marginTop: '2rem' }}>
              <CreateCheque account={account} />
            </section>
          </>
        )}
      </main>
      
      <footer className="app-footer">
        <p>ChainCheck Sprint 1 - Local Development</p>
      </footer>
    </div>
  )
}

export default App
