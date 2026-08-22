import React, { useState, useEffect } from 'react';
import { getReadOnlyContract, INTERMEDIARY_ADDRESS, isConfigValid, normalizeCheque } from '../utils/contractConnection';
import { getActiveProvider } from '../utils/walletSession';
import { formatAmount, formatDate } from '../utils/formatters';
import StatusBadge from './StatusBadge';
import ChequeDetail from './ChequeDetail';

const IntermediaryPanel = ({ account, isDeployed }) => {
  const [pendingCheques, setPendingCheques] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedChequeId, setExpandedChequeId] = useState(null);

  // Aracı kurum adresiyle eşleşmiyor mu kontrolü
  const safeAccount = account ? account.toLowerCase() : '';
  const safeIntermediary = INTERMEDIARY_ADDRESS ? INTERMEDIARY_ADDRESS.toLowerCase() : '';
  const isIntermediary = safeAccount === safeIntermediary;

  useEffect(() => {
    if (account && isConfigValid() && isIntermediary && isDeployed) {
      fetchPaymentRequests();
    }
  }, [account, isIntermediary, isDeployed]);

  const fetchPaymentRequests = async () => {
    if (!isDeployed) return;

    try {
      setIsLoading(true);
      setError('');
      
      const provider = getActiveProvider();
      const contract = getReadOnlyContract(provider);

      // Iterate total cheques to find payment requests and bounced cheques
      const counter = await contract.chequeCounter();
      const totalCheques = Number(counter);

      if (totalCheques === 0) {
        setPendingCheques([]);
        setIsLoading(false);
        return;
      }

      // We need to check all cheques if they are in PaymentRequested (4) or Bounced (7) status
      const chequePromises = [];
      for (let i = 1; i <= totalCheques; i++) {
        chequePromises.push(contract.getCheque(i));
      }
      
      const allCheques = await Promise.all(chequePromises);
      
      const normalizedCheques = allCheques.map(normalizeCheque);

      // Filter PaymentRequested (4) and Bounced (7)
      const relevantCheques = normalizedCheques.filter(c => c.status === 4 || c.status === 7);
      
      // Show newest first
      relevantCheques.reverse();
      
      setPendingCheques(relevantCheques);
    } catch (err) {
      console.error("Error fetching payment requests:", err);
      setError("Tahsil talepleri okunurken teknik bir hata oluştu. Detaylar console ekranına yazdırıldı.");
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
        <button className="btn btn-small" onClick={fetchPaymentRequests} disabled={isLoading}>
          {isLoading ? 'Yenileniyor...' : 'Yenile'}
        </button>
      </div>

      <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Tahsil talebi oluşturulmuş (Ödemeye Gönderildi) çekleri buradan yönetebilirsiniz.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      {!isLoading && pendingCheques.length === 0 && !error && (
        <div className="empty-state">
          <p>Bekleyen tahsil talebi bulunmuyor.</p>
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
                  <ChequeDetail
                    cheque={cheque}
                    account={account}
                    onRefresh={fetchPaymentRequests}
                    isDeployed={isDeployed}
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
