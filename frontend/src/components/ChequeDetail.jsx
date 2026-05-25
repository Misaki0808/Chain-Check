import React, { useState } from 'react';
import { ethers } from 'ethers';
import { formatAddress } from '../utils/formatAddress';
import { formatAmount, formatDate } from '../utils/formatters';
import { getSignerContract, INTERMEDIARY_ADDRESS } from '../utils/contractConnection';
import StatusBadge from './StatusBadge';
import HistoryTimeline from './HistoryTimeline';
import IssuerSummary from './IssuerSummary';

const ChequeDetail = ({ cheque, account, onRefresh, isDeployed }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [txDetails, setTxDetails] = useState(null);
  
  // Transfer request specific state
  const [newReceiver, setNewReceiver] = useState('');

  if (!cheque) return null;

  const safeAccount = account ? account.toLowerCase() : '';
  const safeIntermediary = INTERMEDIARY_ADDRESS ? INTERMEDIARY_ADDRESS.toLowerCase() : '';
  const hasPendingReceiver = cheque.pendingReceiver && cheque.pendingReceiver !== "0x0000000000000000000000000000000000000000";
  
  // Statuses
  const isPendingApproval = Number(cheque.status) === 0;
  const isActive = Number(cheque.status) === 1;
  const isTransferPending = Number(cheque.status) === 3;
  const isPaymentRequested = Number(cheque.status) === 4;
  
  // Roles
  const isFirstReceiver = safeAccount === cheque.firstReceiver.toLowerCase();
  const isCurrentOwner = safeAccount === cheque.currentOwner.toLowerCase();
  const isPendingReceiverUser = hasPendingReceiver && safeAccount === cheque.pendingReceiver.toLowerCase();
  const isIntermediary = safeAccount === safeIntermediary;
  
  // UI Conditions
  const canAcceptOrRejectInitial = isPendingApproval && isFirstReceiver;
  const canRequestTransfer = isActive && isCurrentOwner;
  const canAcceptOrRejectTransfer = isTransferPending && isPendingReceiverUser;
  const canRequestPayment = isActive && isCurrentOwner;
  const canMarkAsPaid = isPaymentRequested && isIntermediary;

  const isActionDisabled = isLoading || !isDeployed;

  const handleAction = async (actionType) => {
    if (!isDeployed) {
      setError("Contract deploy edilmediği için işlem yapılamaz.");
      return;
    }

    try {
      setError('');
      setSuccess('');
      setTxDetails(null);
      
      // Validation for transfer request
      if (actionType === 'requestTransfer') {
        if (!newReceiver.trim()) {
          setError('Lütfen yeni alıcı adresini girin.');
          return;
        }
        if (!ethers.isAddress(newReceiver)) {
          setError('Geçersiz cüzdan adresi.');
          return;
        }
        if (newReceiver.toLowerCase() === safeAccount) {
          setError('Kendinize devredemezsiniz.');
          return;
        }
      }

      setIsLoading(true);
      setLoadingMsg('MetaMask onayı bekleniyor...');

      if (!window.ethereum) throw new Error("MetaMask bulunamadı.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(account);
      const contract = getSignerContract(signer);

      const startTime = Date.now();
      let tx;

      if (actionType === 'accept') {
        tx = await contract.acceptCheque(cheque.id);
      } else if (actionType === 'reject') {
        tx = await contract.rejectCheque(cheque.id);
      } else if (actionType === 'requestTransfer') {
        tx = await contract.requestTransfer(cheque.id, newReceiver);
      } else if (actionType === 'acceptTransfer') {
        tx = await contract.acceptTransfer(cheque.id);
      } else if (actionType === 'rejectTransfer') {
        tx = await contract.rejectTransfer(cheque.id);
      } else if (actionType === 'requestPayment') {
        tx = await contract.requestPayment(cheque.id);
      } else if (actionType === 'markAsPaid') {
        tx = await contract.markAsPaid(cheque.id);
      }

      setLoadingMsg('Blockchain onayı bekleniyor... İşlem Hash: ' + tx.hash);

      const receipt = await tx.wait();
      const endTime = Date.now();
      const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);

      // Determine success message
      let successMsg = 'İşlem başarılı.';
      if (actionType === 'accept') successMsg = 'Çek kabul edildi.';
      if (actionType === 'reject') successMsg = 'Çek reddedildi.';
      if (actionType === 'requestTransfer') successMsg = 'Devir talebi oluşturuldu.';
      if (actionType === 'acceptTransfer') {
        // Check if transferred back to creator
        if (safeAccount === cheque.creator.toLowerCase()) {
          successMsg = 'Çek iptal edildi.';
        } else {
          successMsg = 'Devir kabul edildi.';
        }
      }
      if (actionType === 'rejectTransfer') successMsg = 'Devir reddedildi.';
      if (actionType === 'requestPayment') successMsg = 'Ödeme talebi başlatıldı.';
      if (actionType === 'markAsPaid') successMsg = 'Çek ödendi olarak işaretlendi.';

      setSuccess(successMsg);
      setTxDetails({
        hash: receipt.hash,
        duration: durationSeconds
      });
      
      setNewReceiver('');

      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
        setError('Kullanıcı işlemi reddetti.');
      } else {
        // Keep user-facing error short, no raw blockchain error dump
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

      {/* Initial Accept / Reject */}
      {canAcceptOrRejectInitial && !success && (
        <div className="action-buttons" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <button className="btn btn-primary" onClick={() => handleAction('accept')} disabled={isActionDisabled}>Kabul Et</button>
          <button className="btn btn-danger" onClick={() => handleAction('reject')} disabled={isActionDisabled}>Reddet</button>
        </div>
      )}

      {/* Transfer Request Form & Request Payment */}
      {isActive && isCurrentOwner && !success && (
        <div className="action-form" style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h4 style={{ marginTop: 0, marginBottom: '0.75rem', color: 'var(--text-main)' }}>İşlemler</h4>
          
          <div className="form-group" style={{ flexDirection: 'row', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <input 
              type="text" 
              placeholder="Yeni Alıcı Wallet Adresi (0x...)" 
              value={newReceiver}
              onChange={(e) => setNewReceiver(e.target.value)}
              style={{ flex: 1 }}
              disabled={isActionDisabled}
            />
            <button className="btn btn-primary" onClick={() => handleAction('requestTransfer')} disabled={isActionDisabled}>Devret</button>
          </div>

          <div className="action-buttons">
            <button className="btn btn-warning" style={{ width: '100%' }} onClick={() => handleAction('requestPayment')} disabled={isActionDisabled}>Ödemeye Gönder</button>
          </div>
        </div>
      )}

      {/* Transfer Accept / Reject */}
      {canAcceptOrRejectTransfer && !success && (
        <div className="action-buttons" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <button className="btn btn-primary" onClick={() => handleAction('acceptTransfer')} disabled={isActionDisabled}>Devri Kabul Et</button>
          <button className="btn btn-danger" onClick={() => handleAction('rejectTransfer')} disabled={isActionDisabled}>Devri Reddet</button>
        </div>
      )}

      {/* Intermediary Payment */}
      {canMarkAsPaid && !success && (
        <div className="action-buttons" style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <button className="btn btn-success" style={{ width: '100%' }} onClick={() => handleAction('markAsPaid')} disabled={isActionDisabled}>Ödendi Olarak İşaretle</button>
        </div>
      )}

      <div className="cheque-detail-grid">
        <div className="detail-item">
          <span className="detail-label">Çek ID</span>
          <span className="detail-value">#{cheque.id.toString()}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Tutar</span>
          <span className="detail-value" style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{formatAmount(cheque.amount)}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Vade Tarihi</span>
          <span className="detail-value">{formatDate(cheque.dueDate)}</span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Durum</span>
          <StatusBadge statusIndex={cheque.status} />
        </div>

        <div className="detail-item full-width">
          <span className="detail-label">Çeki Oluşturan</span>
          <span className="detail-value monospace">{formatAddress(cheque.creator)}</span>
        </div>
        
        <div className="detail-item full-width">
          <span className="detail-label">Mevcut Sahip</span>
          <span className="detail-value monospace">{formatAddress(cheque.currentOwner)}</span>
        </div>

        {cheque.pendingReceiver !== ethers.ZeroAddress && (
          <div className="detail-item full-width highlight-row">
            <span className="detail-label">Bekleyen Yeni Alıcı (Devir)</span>
            <span className="detail-value monospace">{formatAddress(cheque.pendingReceiver)}</span>
          </div>
        )}

        <div className="detail-item">
          <span className="detail-label">Maskeli Ad</span>
          <span className="detail-value">{cheque.maskedName}</span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Kimlik Hash</span>
          <span className="detail-value monospace-small">{formatAddress(cheque.identityHash)}</span>
        </div>
      </div>

      <IssuerSummary creatorAddress={cheque.creator} account={account} />

      <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <HistoryTimeline chequeId={cheque.id} updatedAt={cheque.updatedAt} />
      </div>
    </div>
  );
};

export default ChequeDetail;

