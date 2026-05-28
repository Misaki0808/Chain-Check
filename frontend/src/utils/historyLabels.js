export const HISTORY_LABELS = {
  'CREATED': 'Çek düzenlendi',
  'ACCEPTED': 'Çek kabul edildi',
  'REJECTED': 'Çek reddedildi',
  'TRANSFER_REQUESTED': 'Ciro talebi oluşturuldu',
  'TRANSFER_ACCEPTED': 'Ciro kabul edildi',
  'TRANSFER_REJECTED': 'Ciro reddedildi',
  'PAYMENT_REQUESTED': 'Tahsil talebi başlatıldı',
  'PAID': 'Çek tahsil edildi',
  'CANCELLED': 'Çek iptal edildi'
};

export function getHistoryLabel(actionCode) {
  return HISTORY_LABELS[actionCode] || actionCode;
}
