import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getReadOnlyContract, isConfigValid, normalizeCheque, CONTRACT_ADDRESS, INTERMEDIARY_ADDRESS, CHAIN_ID } from '../utils/contractConnection';
import { formatAddress } from '../utils/formatAddress';
import { formatAmount, formatDate } from '../utils/formatters';

const UserSummary = ({ account, isDeployed }) => {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaidDetails, setShowPaidDetails] = useState(false);

  useEffect(() => {
    if (account && isConfigValid() && isDeployed) {
      fetchSummary();
    }
  }, [account, isDeployed]);

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (!window.ethereum) throw new Error("MetaMask bulunamadı.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = getReadOnlyContract(provider);

      const chequeIds = await contract.getUserCheques(account);

      if (chequeIds.length === 0) {
        setMetrics({
          totalRelated: 0,
          asIssuer: 0,
          asReceiver: 0,
          paidCount: 0,
          activeCount: 0,
          bouncedCount: 0,
          paidTotalAmount: BigInt(0),
          bouncedTotalAmount: BigInt(0),
          paidCheques: []
        });
        setIsLoading(false);
        return;
      }

      const chequePromises = chequeIds.map(id => contract.getCheque(id));
      const allCheques = await Promise.all(chequePromises);
      const normalized = allCheques.map(normalizeCheque);

      // Deduplicate by cheque ID
      const seen = new Set();
      const unique = normalized.filter(c => {
        const id = c.id.toString();
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      let asIssuer = 0;
      let asReceiver = 0;
      let paidCount = 0;
      let activeCount = 0;
      let bouncedCount = 0;
      let paidTotalAmount = BigInt(0);
      let bouncedTotalAmount = BigInt(0);
      const paidCheques = [];

      unique.forEach(c => {
        const status = Number(c.status);
        const amount = BigInt(c.amount);
        const isCreator = c.creator.toLowerCase() === account.toLowerCase();

        // Reddedilen (2) ve İptal Edilen (6) çekleri tamamen atla
        if (status === 2 || status === 6) return;

        if (isCreator) {
          asIssuer++;
        } else {
          asReceiver++;
        }

        if (status === 5) {
          paidCount++;
          paidTotalAmount += amount;
          paidCheques.push({
            id: c.id.toString(),
            amount: c.amount,
            dueDate: c.dueDate,
            updatedAt: c.updatedAt // ödeme tarihi olarak kullanılır
          });
        } else if (status === 7) {
          bouncedCount++;
          bouncedTotalAmount += amount;
        } else if ([0, 1, 3, 4].includes(status)) {
          activeCount++;
        }
      });

      // Ödenen çekleri tarihe göre sırala (en yeni önce)
      paidCheques.sort((a, b) => b.updatedAt - a.updatedAt);

      // totalRelated: reddedilen ve iptal edilenler zaten atlandı
      const totalRelated = unique.filter(c => {
        const s = Number(c.status);
        return s !== 2 && s !== 6;
      }).length;

      setMetrics({
        totalRelated,
        asIssuer,
        asReceiver,
        paidCount,
        activeCount,
        bouncedCount,
        paidTotalAmount,
        bouncedTotalAmount,
        paidCheques
      });
    } catch (err) {
      console.error("Error fetching user summary:", err);
      setError("Kullanıcı özeti yüklenirken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading-msg" style={{ padding: '2rem' }}>Özet yükleniyor...</div>;
  }

  if (error) {
    return <div className="alert alert-error" style={{ margin: '1.5rem' }}>{error}</div>;
  }

  if (!metrics) return null;

  return (
    <div style={{ padding: '1.5rem' }}>
      <h3 style={{ marginTop: 0, marginBottom: '0.25rem', color: 'var(--text-main)' }}>Hesap Özeti</h3>
      <div className="wallet-details" style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'var(--primary-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
        <div>
          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Kullanıcı Adresi</p>
          <p style={{ margin: 0, fontWeight: '600' }} className="monospace-small">{formatAddress(account)}</p>
        </div>
        <div>
          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rol</p>
          <p style={{ margin: 0, fontWeight: '600', color: 'var(--primary-color)' }}>{account.toLowerCase() === (INTERMEDIARY_ADDRESS || '').toLowerCase() ? 'Aracı Kurum' : 'Normal Kullanıcı'}</p>
        </div>
        <div>
          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ağ ID / Contract</p>
          <p style={{ margin: 0, fontWeight: '600' }}>{CHAIN_ID || 31337} <span style={{ color: 'var(--text-muted)', fontSize: '0.85em' }}>• {formatAddress(CONTRACT_ADDRESS)}</span></p>
        </div>
      </div>

      <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="summary-card">
          <span className="summary-card-label">Toplam İlişkili Çek</span>
          <span className="summary-card-value">{metrics.totalRelated}</span>
        </div>
        <div className="summary-card">
          <span className="summary-card-label">Keşideci Olarak</span>
          <span className="summary-card-value highlight">{metrics.asIssuer}</span>
        </div>
        <div className="summary-card">
          <span className="summary-card-label">Lehtar / Ciranta Olarak</span>
          <span className="summary-card-value highlight">{metrics.asReceiver}</span>
        </div>
        <div className="summary-card">
          <span className="summary-card-label">Tahsil Edilen</span>
          <span className="summary-card-value success">{metrics.paidCount}</span>
        </div>
        <div className="summary-card">
          <span className="summary-card-label">Devam Eden</span>
          <span className="summary-card-value warning">{metrics.activeCount}</span>
        </div>
        <div 
          className="summary-card clickable-card" 
          onClick={() => metrics.paidCheques.length > 0 && setShowPaidDetails(!showPaidDetails)}
          style={{ cursor: metrics.paidCheques.length > 0 ? 'pointer' : 'default' }}
          title={metrics.paidCheques.length > 0 ? 'Detayları görmek için tıklayın' : ''}
        >
          <span className="summary-card-label">
            Tahsil Edilen Toplam Tutar
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

      {/* Tahsil edilen çek detayları — tıklanınca açılır */}
      {showPaidDetails && metrics.paidCheques.length > 0 && (
        <div className="paid-details-panel" style={{
          marginTop: '1rem',
          padding: '1rem 1.25rem',
          background: 'var(--primary-light)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-main)', fontSize: '0.95rem' }}>Tahsil Edilen Çek Detayları</h4>
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

      <p className="summary-hint" style={{ marginTop: '1rem' }}>
        Bu özet, bağlı cüzdanın blockchain üzerindeki demo çek geçmişinden hesaplanır. Gerçek finansal veri değildir.
      </p>
    </div>
  );
};

export default UserSummary;
