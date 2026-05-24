export const HISTORY_LABELS = {
  'CREATED': 'Çek oluşturuldu',
  'ACCEPTED': 'Çek kabul edildi',
  'REJECTED': 'Çek reddedildi',
  'TRANSFER_REQUESTED': 'Devir talebi oluşturuldu',
  'TRANSFER_ACCEPTED': 'Devir kabul edildi',
  'TRANSFER_REJECTED': 'Devir reddedildi',
  'PAYMENT_REQUESTED': 'Ödeme talebi başlatıldı',
  'PAID': 'Çek ödendi olarak işaretlendi',
  'CANCELLED': 'Çek iptal edildi'
};

export function getHistoryLabel(actionCode) {
  return HISTORY_LABELS[actionCode] || actionCode;
}
