import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getReadOnlyContract, isConfigValid, normalizeCheque, CONTRACT_ADDRESS, INTERMEDIARY_ADDRESS, CHAIN_ID } from '../utils/contractConnection';
import { formatAddress } from '../utils/formatAddress';
import { formatAmount } from '../utils/formatters';

const UserSummary = ({ account, isDeployed }) => {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
          rejectedCount: 0,
          cancelledCount: 0,
          paidTotalAmount: BigInt(0),
          activeAmount: BigInt(0)
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
      let rejectedCount = 0;
      let cancelledCount = 0;
      let paidTotalAmount = BigInt(0);
      let activeAmount = BigInt(0);
      const nowUnix = Math.floor(Date.now() / 1000);

      unique.forEach(c => {
        const status = Number(c.status);
        const amount = BigInt(c.amount);
        const dueDate = Number(c.dueDate);
        const isCreator = c.creator.toLowerCase() === account.toLowerCase();

        if (isCreator) {
          asIssuer++;
        } else {
          asReceiver++;
        }

        if (status === 5) {
          paidCount++;
          paidTotalAmount += amount;
        } else if (status === 2) {
          rejectedCount++;
        } else if (status === 6) {
          cancelledCount++;
        } else if ([0, 1, 3, 4].includes(status)) {
          activeCount++;
          if (dueDate > nowUnix) {
            activeAmount += amount;
          }
        }
      });

      setMetrics({
        totalRelated: unique.length,
        asIssuer,
        asReceiver,
        paidCount,
        activeCount,
        rejectedCount,
        cancelledCount,
        paidTotalAmount,
        activeAmount
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
        <div className="summary-card">
          <span className="summary-card-label">Reddedilen</span>
          <span className="summary-card-value error">{metrics.rejectedCount}</span>
        </div>
        <div className="summary-card">
          <span className="summary-card-label">İptal Edilen</span>
          <span className="summary-card-value muted">{metrics.cancelledCount}</span>
        </div>
        <div className="summary-card">
          <span className="summary-card-label">Tahsil Edilen Toplam Tutar</span>
          <span className="summary-card-value success">{formatAmount(metrics.paidTotalAmount)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-card-label">Aktif Çek Tutarı (Vadesi Gelmemiş)</span>
          <span className="summary-card-value warning">{formatAmount(metrics.activeAmount)}</span>
        </div>
      </div>

      <p className="summary-hint" style={{ marginTop: '1rem' }}>
        Bu özet, bağlı cüzdanın blockchain üzerindeki demo çek geçmişinden hesaplanır. Gerçek finansal veri değildir.
      </p>
    </div>
  );
};

export default UserSummary;
