import React from 'react';
import { formatAddress } from '../utils/formatAddress';
import { formatAmount, formatDate } from '../utils/formatters';
import StatusBadge from './StatusBadge';

const ChequeDetail = ({ cheque }) => {
  if (!cheque) return null;

  const hasPendingReceiver = cheque.pendingReceiver && cheque.pendingReceiver !== "0x0000000000000000000000000000000000000000";

  return (
    <div className="cheque-detail-card">
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
