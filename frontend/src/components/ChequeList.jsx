import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getContract, isConfigValid } from '../utils/contractConnection';
import { formatAddress } from '../utils/formatAddress';
import { formatAmount, formatDate } from '../utils/formatters';
import StatusBadge from './StatusBadge';
import ChequeDetail from './ChequeDetail';

const ChequeList = ({ account }) => {
  const [cheques, setCheques] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedChequeId, setExpandedChequeId] = useState(null);

  useEffect(() => {
    if (account && isConfigValid()) {
      fetchCheques();
    }
  }, [account]);

  const fetchCheques = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      // Read-only operations don't strictly need a signer, but it's safer to use the connected account's perspective
      const signer = await provider.getSigner(account);
      const contract = getContract(signer);

      // Fetch user's cheque IDs
      const chequeIds = await contract.getUserCheques(account);
      
      if (chequeIds.length === 0) {
        setCheques([]);
        setIsLoading(false);
        return;
      }

      // Fetch details for each cheque
      // Reverse to show newest first
      const reversedIds = [...chequeIds].reverse();
      
      const chequePromises = reversedIds.map(id => contract.getCheque(id));
      const fetchedCheques = await Promise.all(chequePromises);
      
      setCheques(fetchedCheques);
    } catch (err) {
      console.error("Error fetching cheques:", err);
      setError("Çekler yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDetail = (id) => {
    setExpandedChequeId(expandedChequeId === id ? null : id);
  };

  if (!account) {
    return (
      <div className="cheque-list-container">
        <h3>Çeklerim</h3>
        <p className="text-muted">Çekleri görüntülemek için cüzdanınızı bağlayın.</p>
      </div>
    );
  }

  return (
    <div className="cheque-list-container">
      <div className="list-header">
        <h3>Çeklerim</h3>
        <button className="btn btn-small" onClick={fetchCheques} disabled={isLoading}>
          {isLoading ? 'Yenileniyor...' : 'Yenile'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!isLoading && cheques.length === 0 && !error && (
        <div className="empty-state">
          <p>Henüz görüntülenecek çek bulunmuyor.</p>
        </div>
      )}

      <div className="cheques-grid">
        {cheques.map((cheque) => {
          const id = cheque.id.toString();
          const isExpanded = expandedChequeId === id;

          return (
            <div key={id} className={`cheque-card ${isExpanded ? 'expanded' : ''}`}>
              <div className="cheque-card-summary" onClick={() => toggleDetail(id)}>
                <div className="summary-col">
                  <span className="summary-label">Çek ID</span>
                  <span className="summary-value">#{id}</span>
                </div>
                <div className="summary-col">
                  <span className="summary-label">Tutar</span>
                  <span className="summary-value amount">{formatAmount(cheque.amount)}</span>
                </div>
                <div className="summary-col hidden-mobile">
                  <span className="summary-label">Vade</span>
                  <span className="summary-value">{formatDate(cheque.dueDate)}</span>
                </div>
                <div className="summary-col">
                  <span className="summary-label">Durum</span>
                  <StatusBadge statusIndex={cheque.status} />
                </div>
                <div className="summary-col toggle-col">
                  <span className="toggle-icon">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="cheque-card-expanded">
                  <ChequeDetail cheque={cheque} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChequeList;
