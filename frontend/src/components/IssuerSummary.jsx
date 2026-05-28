import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getReadOnlyContract } from '../utils/contractConnection';
import { formatAddress } from '../utils/formatAddress';
import { formatAmount } from '../utils/formatters';

const IssuerSummary = ({ creatorAddress, account }) => {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
          rejectedCount: 0,
          cancelledCount: 0,
          successRate: "Veri yok",
          paidTotalAmount: BigInt(0),
          activeAmount: BigInt(0)
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
      let rejectedCount = 0;
      let cancelledCount = 0;
      let pendingCount = 0;
      let paidTotalAmount = BigInt(0);
      let activeAmount = BigInt(0);

      const nowUnix = Math.floor(Date.now() / 1000);

      createdCheques.forEach(c => {
        const status = Number(c.status);
        const amount = BigInt(c.amount);
        const dueDate = Number(c.dueDate);

        if (status === 5) {
          paidCount++;
          paidTotalAmount += amount;
        } else if (status === 2) {
          rejectedCount++;
        } else if (status === 6) {
          cancelledCount++;
        } else if ([0, 1, 3, 4].includes(status)) {
          pendingCount++;
          if (dueDate > nowUnix) {
            activeAmount += amount;
          }
        }
      });

      const totalCreated = createdCheques.length;
      // Reddedilen ve iptal edilen çekler başarı oranına dahil edilmez
      const relevantCount = totalCreated - rejectedCount - cancelledCount;
      let successRate = "Veri yok";
      if (relevantCount > 0) {
        successRate = ((paidCount / relevantCount) * 100).toFixed(1) + "%";
      }

      setMetrics({
        totalCreated,
        paidCount,
        pendingCount,
        rejectedCount,
        cancelledCount,
        successRate,
        paidTotalAmount,
        activeAmount
      });
    } catch (err) {
      console.error("Error fetching issuer summary:", err);
      setError("Özet yüklenirken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading-msg" style={{ marginTop: '1.5rem' }}>Oluşturan özeti yükleniyor...</div>;
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
          <span className="summary-card-value warning">{metrics.pendingCount}</span>
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
          <span className="summary-card-label">Ödenen Toplam Tutar</span>
          <span className="summary-card-value success">{formatAmount(metrics.paidTotalAmount)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-card-label">Aktif Çek Tutarı (Vadesi Gelmemiş)</span>
          <span className="summary-card-value warning">{formatAmount(metrics.activeAmount)}</span>
        </div>
      </div>

      <p className="summary-hint">
        Bu özet, çeki oluşturan adresin blockchain üzerindeki demo çek geçmişinden hesaplanır. Gerçek finansal skor değildir.
      </p>
    </div>
  );
};

export default IssuerSummary;
