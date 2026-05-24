import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getContract, INTERMEDIARY_ADDRESS, isConfigValid } from '../utils/contractConnection';
import { formatAmount, formatDate } from '../utils/formatters';
import StatusBadge from './StatusBadge';
import ChequeDetail from './ChequeDetail';

const IntermediaryPanel = ({ account }) => {
  const [pendingCheques, setPendingCheques] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedChequeId, setExpandedChequeId] = useState(null);

  const safeAccount = account ? account.toLowerCase() : '';
  const safeIntermediary = INTERMEDIARY_ADDRESS ? INTERMEDIARY_ADDRESS.toLowerCase() : '';
  const isIntermediary = safeAccount && safeIntermediary && safeAccount === safeIntermediary;

  useEffect(() => {
    if (isIntermediary && isConfigValid()) {
      fetchPendingPayments();
    }
  }, [account, isIntermediary]);

  const fetchPendingPayments = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(account);
      const contract = getContract(signer);

      const counter = await contract.chequeCounter();
      const totalCheques = Number(counter);
      
      if (totalCheques === 0) {
        setPendingCheques([]);
        setIsLoading(false);
        return;
      }

      // Fetch all cheques
      const chequePromises = [];
      for (let i = 1; i <= totalCheques; i++) {
        chequePromises.push(contract.getCheque(i));
      }
      
      const allCheques = await Promise.all(chequePromises);
      
      // Filter only PaymentRequested (status === 4)
      const paymentRequestedCheques = allCheques.filter(c => Number(c.status) === 4);
      
      // Show newest first
      paymentRequestedCheques.reverse();
      
      setPendingCheques(paymentRequestedCheques);
    } catch (err) {
      console.error("Error fetching payment requests:", err);
      setError("Ödeme talepleri yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDetail = (id) => {
    setExpandedChequeId(expandedChequeId === id ? null : id);
  };

  if (!isIntermediary) {
    return null; // Only show for the intermediary
  }

  return (
    <div className="cheque-list-container">
      <div className="list-header" style={{ borderBottomColor: 'var(--warning-bg)' }}>
        <h3 style={{ color: 'var(--warning-text)' }}>Aracı Kurum Paneli</h3>
        <button className="btn btn-small" onClick={fetchPendingPayments} disabled={isLoading}>
          {isLoading ? 'Yenileniyor...' : 'Yenile'}
        </button>
      </div>

      <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Ödeme talebi oluşturulmuş (Ödemeye Gönderildi) çekleri buradan yönetebilirsiniz.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      {!isLoading && pendingCheques.length === 0 && !error && (
        <div className="empty-state">
          <p>Bekleyen ödeme talebi bulunmuyor.</p>
        </div>
      )}

      <div className="cheques-grid">
        {pendingCheques.map((cheque) => {
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
                  <span className="summary-label">Mevcut Sahip</span>
                  <span className="summary-value">{cheque.currentOwner.substring(0,6)}...{cheque.currentOwner.substring(38)}</span>
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
                  {/* Reuse ChequeDetail which already has "Ödendi Olarak İşaretle" logic */}
                  <ChequeDetail 
                    cheque={cheque} 
                    account={account} 
                    onRefresh={fetchPendingPayments} 
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IntermediaryPanel;
