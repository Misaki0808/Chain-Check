import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getReadOnlyContract } from '../utils/contractConnection';
import { formatAddress } from '../utils/formatAddress';
import { formatAmount, formatDate } from '../utils/formatters';

const IssuerSummary = ({ creatorAddress, account }) => {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaidDetails, setShowPaidDetails] = useState(false);

  useEffect(() => {
    if (creatorAddress) {
      fetchIssuerSummary();
    }
  }, [creatorAddress]);

  const fetchIssuerSummary = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (!window.ethereum) throw new Error("MetaMask bulunamadı.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Use getReadOnlyContract to read data purely from provider
      const contract = getReadOnlyContract(provider);

      // Fetch all cheques related to this address
      const chequeIds = await contract.getUserCheques(creatorAddress);
      
      if (chequeIds.length === 0) {
        setMetrics({
          totalCreated: 0,
          paidCount: 0,
          pendingCount: 0,
          bouncedCount: 0,
          successRate: "Veri yok",
          paidTotalAmount: BigInt(0),
          pendingTotalAmount: BigInt(0),
          bouncedTotalAmount: BigInt(0),
          paidCheques: []
        });
        setIsLoading(false);
        return;
      }

      // Fetch details for each cheque
      const chequePromises = chequeIds.map(id => contract.getCheque(id));
      const allCheques = await Promise.all(chequePromises);

      // Filter only cheques where creator is this address
      const createdCheques = allCheques.filter(
        c => c.creator.toLowerCase() === creatorAddress.toLowerCase()
      );

      let paidCount = 0;
      let bouncedCount = 0;
      let pendingCount = 0;
      let paidTotalAmount = BigInt(0);
      let pendingTotalAmount = BigInt(0);
      let bouncedTotalAmount = BigInt(0);
      const paidCheques = [];

      createdCheques.forEach(c => {
        const status = Number(c.status);
        const amount = BigInt(c.amount);

        // Reddedilen (2) ve İptal Edilen (6) çekleri tamamen atla
        if (status === 2 || status === 6) return;

        if (status === 5) {
          paidCount++;
          paidTotalAmount += amount;
          paidCheques.push({
            id: c.id ? c.id.toString() : '0',
            amount: c.amount ? c.amount.toString() : '0',
            dueDate: c.dueDate ? Number(c.dueDate) : 0,
            updatedAt: c.updatedAt ? Number(c.updatedAt) : 0
          });
        } else if (status === 7) {
          bouncedCount++;
          bouncedTotalAmount += amount;
        } else if ([0, 1, 3, 4].includes(status)) {
          pendingCount++;
          pendingTotalAmount += amount;
        }
      });

      // Ödenen çekleri tarihe göre sırala
      paidCheques.sort((a, b) => b.updatedAt - a.updatedAt);

      // totalCreated: reddedilen ve iptal edilenler hariç
      const totalCreated = createdCheques.filter(c => {
        const s = Number(c.status);
        return s !== 2 && s !== 6;
      }).length;

      // Başarı oranı: paid / (paid + bounced + pending)
      const relevantCount = totalCreated;
      let successRate = "Veri yok";
      if (relevantCount > 0) {
        successRate = ((paidCount / relevantCount) * 100).toFixed(1) + "%";
      }

      setMetrics({
        totalCreated,
        paidCount,
        pendingCount,
        bouncedCount,
        successRate,
        paidTotalAmount,
        pendingTotalAmount,
        bouncedTotalAmount,
        paidCheques
      });
    } catch (err) {
      console.error("Error fetching issuer summary:", err);
      setError("Özet yüklenirken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading-msg" style={{ marginTop: '1.5rem' }}>Olusturan özeti yükleniyor...</div>;
  }

  if (error) {
    return <div className="alert alert-error" style={{ marginTop: '1.5rem' }}>{error}</div>;
  }

  if (!metrics) return null;

  return (
    <div className="issuer-summary-container">
      <h4 className="summary-title">Keşideci Özeti</h4>
      <p className="summary-subtitle">Kişi: <span className="monospace-small">{formatAddress(creatorAddress)}</span></p>
      
      <div className="summary-grid">
        <div className="summary-card">
          <span className="summary-card-label">Toplam Oluşturulan</span>
          <span className="summary-card-value">{metrics.totalCreated}</span>
        </div>
        <div className="summary-card">
          <span className="summary-card-label">Ödeme Başarı Oranı</span>
          <span className="summary-card-value highlight">{metrics.successRate}</span>
        </div>
        <div className="summary-card">
          <span className="summary-card-label">Ödenen</span>
          <span className="summary-card-value success">{metrics.paidCount}</span>
        </div>
        <div className="summary-card">
          <span className="summary-card-label">Devam Eden</span>
          <span className="summary-card-value warning">{metrics.pendingCount > 0 ? `${metrics.pendingCount} çek` : '—'}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{formatAmount(metrics.pendingTotalAmount)}</span>
        </div>
        <div 
          className="summary-card clickable-card"
          onClick={() => metrics.paidCheques.length > 0 && setShowPaidDetails(!showPaidDetails)}
          style={{ cursor: metrics.paidCheques.length > 0 ? 'pointer' : 'default' }}
          title={metrics.paidCheques.length > 0 ? 'Detayları görmek için tıklayın' : ''}
        >
          <span className="summary-card-label">
            Ödenen Toplam Tutar
            {metrics.paidCheques.length > 0 && <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem' }}>{showPaidDetails ? '▲' : '▼'}</span>}
          </span>
          <span className="summary-card-value success">{formatAmount(metrics.paidTotalAmount)}</span>
        </div>
        {metrics.bouncedCount > 0 && (
          <>
            <div className="summary-card">
              <span className="summary-card-label">Arkası Yazılan Çek</span>
              <span className="summary-card-value error">{metrics.bouncedCount}</span>
            </div>
            <div className="summary-card">
              <span className="summary-card-label">Arkası Yazılan Toplam Tutar</span>
              <span className="summary-card-value error">{formatAmount(metrics.bouncedTotalAmount)}</span>
            </div>
          </>
        )}
      </div>

      {/* Ödenen çek detayları — tıklanınca açılır */}
      {showPaidDetails && metrics.paidCheques.length > 0 && (
        <div className="paid-details-panel" style={{
          marginTop: '1rem',
          padding: '1rem 1.25rem',
          background: 'var(--primary-light)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-main)', fontSize: '0.95rem' }}>Ödenen Çek Detayları</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase' }}>Çek ID</th>
                <th style={{ textAlign: 'right', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase' }}>Tutar</th>
                <th style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase' }}>Vade Tarihi</th>
                <th style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase' }}>Ödeme Tarihi</th>
              </tr>
            </thead>
            <tbody>
              {metrics.paidCheques.map(pc => (
                <tr key={pc.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.5rem', fontWeight: '600' }}>#{pc.id}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: '600', color: 'var(--primary-color)' }}>{formatAmount(pc.amount)}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center' }}>{formatDate(pc.dueDate)}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--success-text)' }}>{formatDate(pc.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="summary-hint">
        Bu özet, çeki oluşturan adresin blockchain üzerindeki demo çek geçmişinden hesaplanır. Gerçek finansal skor değildir.
      </p>
    </div>
  );
};

export default IssuerSummary;
