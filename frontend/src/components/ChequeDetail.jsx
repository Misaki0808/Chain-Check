import React, { useState } from 'react';
import { ethers } from 'ethers';
import { formatAddress } from '../utils/formatAddress';
import { formatAmount, formatDate } from '../utils/formatters';
import { getContract } from '../utils/contractConnection';
import StatusBadge from './StatusBadge';

const ChequeDetail = ({ cheque, account, onRefresh }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [txDetails, setTxDetails] = useState(null);

  if (!cheque) return null;

  const hasPendingReceiver = cheque.pendingReceiver && cheque.pendingReceiver !== "0x0000000000000000000000000000000000000000";
  
  // Status 0 is PendingApproval
  const isPendingApproval = Number(cheque.status) === 0;
  const isFirstReceiver = account && cheque.firstReceiver.toLowerCase() === account.toLowerCase();
  
  const canAcceptOrReject = isPendingApproval && isFirstReceiver;

  const handleAction = async (actionType) => {
    try {
      setError('');
      setSuccess('');
      setTxDetails(null);
      setIsLoading(true);
      setLoadingMsg('MetaMask onayı bekleniyor...');

      if (!window.ethereum) throw new Error("MetaMask bulunamadı.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(account);
      const contract = getContract(signer);

      const startTime = Date.now();
      let tx;

      if (actionType === 'accept') {
        tx = await contract.acceptCheque(cheque.id);
      } else if (actionType === 'reject') {
        tx = await contract.rejectCheque(cheque.id);
      }

      setLoadingMsg('Blockchain onayı bekleniyor... İşlem Hash: ' + tx.hash);

      const receipt = await tx.wait();
      const endTime = Date.now();
      const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);

      setSuccess(actionType === 'accept' ? 'Çek kabul edildi.' : 'Çek reddedildi.');
      setTxDetails({
        hash: receipt.hash,
        duration: durationSeconds
      });

      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
        setError('Kullanıcı işlemi reddetti.');
      } else {
        setError('İşlem başarısız oldu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
      setLoadingMsg('');
    }
  };

  return (
    <div className="cheque-detail-card">
      
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}
      
      {txDetails && (
        <div className="tx-details" style={{ marginBottom: '1rem' }}>
          <p><strong>İşlem Hash:</strong> {txDetails.hash}</p>
          <p><strong>İşlem Süresi:</strong> {txDetails.duration} saniye</p>
        </div>
      )}

      {isLoading && <div className="loading-msg" style={{ marginBottom: '1rem' }}>{loadingMsg}</div>}

      {canAcceptOrReject && !isLoading && !success && (
        <div className="action-buttons" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <button className="btn btn-primary" onClick={() => handleAction('accept')}>Kabul Et</button>
          <button className="btn" style={{ backgroundColor: 'var(--error-bg)', color: 'var(--error-text)' }} onClick={() => handleAction('reject')}>Reddet</button>
        </div>
      )}

      <div className="cheque-detail-grid">
        <div className="detail-item">
          <span className="detail-label">Çek ID</span>
          <span className="detail-value">#{cheque.id.toString()}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Tutar</span>
          <span className="detail-value amount">{formatAmount(cheque.amount)}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Vade Tarihi</span>
          <span className="detail-value">{formatDate(cheque.dueDate)}</span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Durum</span>
          <div className="detail-value"><StatusBadge statusIndex={cheque.status} /></div>
        </div>

        <div className="detail-item full-width">
          <span className="detail-label">Çeki Oluşturan</span>
          <span className="detail-value monospace">{cheque.creator}</span>
        </div>
        
        <div className="detail-item full-width">
          <span className="detail-label">İlk Alıcı</span>
          <span className="detail-value monospace">{cheque.firstReceiver}</span>
        </div>

        <div className="detail-item full-width">
          <span className="detail-label">Mevcut Sahip</span>
          <span className="detail-value monospace">{cheque.currentOwner}</span>
        </div>

        {hasPendingReceiver && (
          <div className="detail-item full-width highlight-row">
            <span className="detail-label">Bekleyen Yeni Alıcı</span>
            <span className="detail-value monospace">{cheque.pendingReceiver}</span>
          </div>
        )}

        <div className="detail-item">
          <span className="detail-label">Maskeli Alıcı Adı</span>
          <span className="detail-value">{cheque.maskedReceiverName}</span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Kimlik Hash</span>
          <span className="detail-value monospace-small">{cheque.identityHash}</span>
        </div>
      </div>
    </div>
  );
};

export default ChequeDetail;

