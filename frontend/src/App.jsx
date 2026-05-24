import React from 'react'
import WalletConnect from './components/WalletConnect'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ChainCheck</h1>
        <p>Dijital Çek Yönetim Sistemi (Demo)</p>
      </header>
      
      <main className="app-main">
        <section className="dashboard-section">
          <h2>Dashboard</h2>
          <WalletConnect />
        </section>
      </main>
      
      <footer className="app-footer">
        <p>ChainCheck Sprint 1 - Local Development</p>
      </footer>
    </div>
  )
}

export default App
