import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { formatAddress } from '../utils/formatAddress';
import { formatAmount, formatDate } from '../utils/formatters';
import { getSignerContract, INTERMEDIARY_ADDRESS } from '../utils/contractConnection';
import { getActiveSigner } from '../utils/walletSession';
import StatusBadge from './StatusBadge';
import HistoryTimeline from './HistoryTimeline';
import IssuerSummary from './IssuerSummary';

const ChequeDetail = ({ cheque, account, onRefresh, isDeployed, demoHighlight = null, demoTransferTo = null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [txDetails, setTxDetails] = useState(null);

  // Transfer request specific state
  const [newReceiver, setNewReceiver] = useState('');

  // Otomatik tanıtım: ciro alıcısını önceden doldur
  useEffect(() => {
    if (demoTransferTo) setNewReceiver(demoTransferTo);
  }, [demoTransferTo]);

  if (!cheque) return null;

  const safeAccount = account ? account.toLowerCase() : '';
  const safeIntermediary = INTERMEDIARY_ADDRESS ? INTERMEDIARY_ADDRESS.toLowerCase() : '';
  const hasPendingReceiver = cheque.pendingReceiver && cheque.pendingReceiver !== ethers.ZeroAddress;
  
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
  const canMarkAsBounced = isPaymentRequested && isIntermediary;
  const isBounced = Number(cheque.status) === 7;

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

      const signer = await getActiveSigner(account);
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
      } else if (actionType === 'markAsBounced') {
        tx = await contract.markAsBounced(cheque.id);
      } else if (actionType === 'banCreator') {
        tx = await contract.banCreator(cheque.creator);
      }

      setLoadingMsg('Blockchain onayı bekleniyor... İşlem Hash: ' + tx.hash);

      const receipt = await tx.wait();
      const endTime = Date.now();
      const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);

      // Determine success message
      let successMsg = 'İşlem başarılı.';
      if (actionType === 'accept') successMsg = 'Çek kabul edildi.';
      if (actionType === 'reject') successMsg = 'Çek reddedildi.';
      if (actionType === 'requestTransfer') successMsg = 'Ciro talebi oluşturuldu.';
      if (actionType === 'acceptTransfer') {
        // Check if transferred back to creator
        if (safeAccount === cheque.creator.toLowerCase()) {
          successMsg = 'Çek iptal edildi.';
        } else {
          successMsg = 'Ciro kabul edildi.';
        }
      }
      if (actionType === 'rejectTransfer') successMsg = 'Ciro reddedildi.';
      if (actionType === 'requestPayment') successMsg = 'Tahsil talebi başlatıldı.';
      if (actionType === 'markAsPaid') successMsg = 'Çek tahsil edildi.';
      if (actionType === 'markAsBounced') successMsg = 'Çek ödenemedi olarak işaretlendi (arkası yazıldı).';
      if (actionType === 'banCreator') successMsg = 'Keşideci yasaklandı. Artık yeni çek düzenleyemez.';

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
          <button className={`btn btn-primary ${demoHighlight === 'accept' ? 'demo-pulse' : ''}`} onClick={() => handleAction('accept')} disabled={isActionDisabled}>Kabul Et</button>
          <button className="btn btn-danger" onClick={() => handleAction('reject')} disabled={isActionDisabled}>Reddet</button>
        </div>
      )}

      {/* Transfer Request Form & Request Payment */}
      {isActive && isCurrentOwner && !success && (
        <div className="action-form" style={{ flexDirection: 'column', alignItems: 'stretch', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h4 style={{ marginTop: 0, marginBottom: '0.75rem', color: 'var(--text-main)' }}>İşlemler</h4>
          
          <div className="form-group" style={{ flexDirection: 'row', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <input 
              type="text" 
              placeholder="Yeni Ciranta Wallet Adresi (0x...)" 
              value={newReceiver}
              onChange={(e) => setNewReceiver(e.target.value)}
              style={{ flex: 1 }}
              disabled={isActionDisabled}
            />
            <button className={`btn btn-primary ${demoHighlight === 'transfer-submit' ? 'demo-pulse' : ''}`} onClick={() => handleAction('requestTransfer')} disabled={isActionDisabled}>Ciro Et</button>
          </div>

          <div className="action-buttons">
            <button className={`btn btn-warning ${demoHighlight === 'request-payment' ? 'demo-pulse' : ''}`} style={{ width: '100%' }} onClick={() => handleAction('requestPayment')} disabled={isActionDisabled}>Tahsile Gönder</button>
          </div>
        </div>
      )}

      {/* Transfer Accept / Reject */}
      {canAcceptOrRejectTransfer && !success && (
        <div className="action-buttons" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <button className={`btn btn-primary ${demoHighlight === 'accept-transfer' ? 'demo-pulse' : ''}`} onClick={() => handleAction('acceptTransfer')} disabled={isActionDisabled}>Ciroyu Kabul Et</button>
          <button className="btn btn-danger" onClick={() => handleAction('rejectTransfer')} disabled={isActionDisabled}>Ciroyu Reddet</button>
        </div>
      )}

      {/* Intermediary Payment — Tahsil Edildi + Ödenemedi */}
      {canMarkAsPaid && !success && (
        <div className="action-buttons" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <button className={`btn btn-success ${demoHighlight === 'mark-paid' ? 'demo-pulse' : ''}`} style={{ flex: 1 }} onClick={() => handleAction('markAsPaid')} disabled={isActionDisabled}>Tahsil Edildi</button>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleAction('markAsBounced')} disabled={isActionDisabled}>Ödenemedi</button>
        </div>
      )}

      {/* Intermediary — Keşideciyi Yasakla (bounced çek sonrası) */}
      {isBounced && isIntermediary && !success && (
        <div className="action-buttons" style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <button className="btn btn-danger" style={{ width: '100%' }} onClick={() => handleAction('banCreator')} disabled={isActionDisabled}>Keşideciyi Yasakla</button>
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
          <span className="detail-label">Keşideci</span>
          <span className="detail-value monospace">{formatAddress(cheque.creator)}</span>
        </div>
        
        <div className="detail-item full-width">
          <span className="detail-label">Mevcut Sahip</span>
          <span className="detail-value monospace">{formatAddress(cheque.currentOwner)}</span>
        </div>

        {cheque.pendingReceiver !== ethers.ZeroAddress && (
          <div className="detail-item full-width highlight-row">
            <span className="detail-label">Bekleyen Ciranta (Ciro)</span>
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

