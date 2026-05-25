import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getContract, isConfigValid } from '../utils/contractConnection';
import { formatAddress } from '../utils/formatAddress';
import { formatAmount, formatDate } from '../utils/formatters';
import StatusBadge from './StatusBadge';
import ChequeDetail from './ChequeDetail';

const ChequeList = ({ account, isDeployed }) => {
  const [cheques, setCheques] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedChequeId, setExpandedChequeId] = useState(null);

  useEffect(() => {
    if (account && isConfigValid() && isDeployed) {
      fetchCheques();
    }
  }, [account, isDeployed]);

  const fetchCheques = async () => {
    if (!isDeployed) return;
    
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
      // Convert chequeIds (which is a Proxy/Result of BigInts) to a standard array of BigInts/Strings
      const idArray = Array.from(chequeIds);
      const reversedIds = idArray.reverse();
      
      const chequePromises = reversedIds.map(id => contract.getCheque(id));
      const fetchedCheques = await Promise.all(chequePromises);
      
      // Normalize ethers v6 Result objects into clean JS objects
      const normalizedCheques = fetchedCheques.map(c => ({
        id: c.id ? c.id.toString() : '0',
        creator: c.creator,
        firstReceiver: c.firstReceiver,
        currentOwner: c.currentOwner,
        pendingReceiver: c.pendingReceiver,
        intermediary: c.intermediary,
        amount: c.amount ? c.amount.toString() : '0',
        dueDate: c.dueDate ? Number(c.dueDate) : 0,
        identityHash: c.identityHash,
        maskedName: c.maskedReceiverName, // Note: Smart contract field is maskedReceiverName
        status: c.status ? Number(c.status) : 0,
        createdAt: c.createdAt ? Number(c.createdAt) : 0,
        updatedAt: c.updatedAt ? Number(c.updatedAt) : 0
      }));
      
      setCheques(normalizedCheques);
    } catch (err) {
      console.error("DEBUG: Error fetching cheques details:", err);
      if (err.info) console.error("DEBUG Error Info:", err.info);
      if (err.reason) console.error("DEBUG Error Reason:", err.reason);
      
      // Catch specific "could not decode result data" (BAD_DATA) or CALL_EXCEPTION
      const isDecodeError = err.code === 'CALL_EXCEPTION' || err.code === 'BAD_DATA' || (err.message && err.message.includes('decode result data'));
      
      if (isDecodeError) {
        setError("Contract okunamadı. Local deploy scriptini tekrar çalıştırın.");
      } else {
        setError(`Çekler yüklenirken bir hata oluştu: ${err.shortMessage || err.message}`);
      }
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
                  <ChequeDetail 
                    cheque={cheque} 
                    account={account} 
                    onRefresh={fetchCheques} 
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

export default ChequeList;
