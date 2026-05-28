export const STATUS_LABELS = {
  0: 'Onay Bekliyor',
  1: 'Aktif',
  2: 'Reddedildi',
  3: 'Ciro Bekliyor',
  4: 'Tahsile Gönderildi',
  5: 'Ödendi',
  6: 'İptal Edildi'
};

export const STATUS_CLASSES = {
  0: 'status-pending',
  1: 'status-active',
  2: 'status-rejected',
  3: 'status-transfer',
  4: 'status-payment',
  5: 'status-paid',
  6: 'status-cancelled'
};

export function getStatusLabel(statusIndex) {
  return STATUS_LABELS[statusIndex] || 'Bilinmiyor';
}

export function getStatusClass(statusIndex) {
  return STATUS_CLASSES[statusIndex] || 'status-default';
}
