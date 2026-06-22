import React, { useState, useEffect } from 'react';
import { getReadOnlyContract } from '../utils/contractConnection';
import { getActiveProvider } from '../utils/walletSession';
import { getHistoryLabel } from '../utils/historyLabels';
import { formatAddress } from '../utils/formatAddress';

const HistoryTimeline = ({ chequeId, updatedAt }) => {
  const [historyItems, setHistoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [chequeId, updatedAt]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError('');

      const provider = getActiveProvider();
      // We use getReadOnlyContract for pure view functions to avoid signer caching issues
      const contract = getReadOnlyContract(provider);

      const history = await contract.getChequeHistory(chequeId);
      
      // history is an array of structs: { timestamp, actor, action }
      // Sort newest to oldest if needed, or oldest to newest. 
      // Usually timeline is oldest to newest, but let's show newest first at top.
      const reversedHistory = [...history].reverse();
      setHistoryItems(reversedHistory);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("İşlem geçmişi yüklenirken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString('tr-TR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  if (isLoading && historyItems.length === 0) {
    return <div className="loading-msg">Geçmiş yükleniyor...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (historyItems.length === 0) {
    return (
      <div className="history-timeline-container">
        <h4 className="timeline-title">İşlem Geçmişi</h4>
        <p className="text-muted">İşlem geçmişi bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="history-timeline-container">
      <h4 className="timeline-title">İşlem Geçmişi</h4>
      <div className="timeline">
        {historyItems.map((item, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-marker"></div>
            <div className="timeline-content">
              <div className="timeline-header">
                <span className="timeline-action">{getHistoryLabel(item.action)}</span>
                <span className="timeline-date">{formatTime(item.timestamp)}</span>
              </div>
              <div className="timeline-actor">
                Kişi: <span className="monospace-small">{formatAddress(item.actor)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryTimeline;
