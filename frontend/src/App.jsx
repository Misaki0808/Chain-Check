import React, { useState } from 'react'
import WalletConnect from './components/WalletConnect'
import CreateCheque from './components/CreateCheque'
import ChequeList from './components/ChequeList'
import IntermediaryPanel from './components/IntermediaryPanel'
import UserSummary from './components/UserSummary'
import { INTERMEDIARY_ADDRESS } from './utils/contractConnection'
import './App.css'

function App() {
  const [account, setAccount] = useState(null);
  const [isDeployed, setIsDeployed] = useState(false);
  const [activeTab, setActiveTab] = useState('ozet');

  const isIntermediary = account && INTERMEDIARY_ADDRESS && account.toLowerCase() === INTERMEDIARY_ADDRESS.toLowerCase();

  const renderContent = () => {
    if (activeTab === 'ozet') {
      return (
        <section className="dashboard-section">
          <UserSummary account={account} isDeployed={isDeployed} />
        </section>
      );
    }
    if (activeTab === 'ceklerim') {
      return (
        <section className="dashboard-section">
          <ChequeList account={account} isDeployed={isDeployed} filterType="ceklerim" />
        </section>
      );
    }
    if (activeTab === 'duzenle') {
      return (
        <section className="dashboard-section">
          <CreateCheque account={account} isDeployed={isDeployed} />
        </section>
      );
    }
    if (activeTab === 'alacaklarim') {
      return (
        <section className="dashboard-section">
          <ChequeList account={account} isDeployed={isDeployed} filterType="alacaklarim" />
        </section>
      );
    }
    if (activeTab === 'araci') {
      return (
        <section className="dashboard-section">
          <IntermediaryPanel account={account} isDeployed={isDeployed} />
        </section>
      );
    }
  };

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <h1>ChainCheck</h1>
          <p>Dijital Çek (Demo)</p>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'ozet' ? 'active' : ''}`} 
            onClick={() => setActiveTab('ozet')}
          >
            Özet
          </button>
          <button 
            className={`nav-item ${activeTab === 'ceklerim' ? 'active' : ''}`} 
            onClick={() => setActiveTab('ceklerim')}
          >
            Çeklerim
          </button>
          <button 
            className={`nav-item ${activeTab === 'duzenle' ? 'active' : ''}`} 
            onClick={() => setActiveTab('duzenle')}
          >
            Çek Düzenle
          </button>
          <button 
            className={`nav-item ${activeTab === 'alacaklarim' ? 'active' : ''}`} 
            onClick={() => setActiveTab('alacaklarim')}
          >
            Alacaklarım
          </button>
          {isIntermediary && (
            <button 
              className={`nav-item ${activeTab === 'araci' ? 'active' : ''}`} 
              onClick={() => setActiveTab('araci')}
            >
              Aracı Kurum Paneli
            </button>
          )}
        </nav>
        <div className="sidebar-footer">
          <p>Sprint 1</p>
        </div>
      </aside>

      <main className="app-main-content">
        <header className="content-header">
          <WalletConnect onAccountChange={setAccount} onDeployStatusChange={setIsDeployed} />
        </header>

        <div className="content-body">
          {account ? (
            renderContent()
          ) : (
            <section className="dashboard-section">
              <div className="empty-state">
                <p>Lütfen devam etmek için cüzdanınızı bağlayın.</p>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

export default App;
