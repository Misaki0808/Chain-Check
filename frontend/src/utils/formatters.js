/**
 * Format a Unix timestamp (seconds) into a localized Turkish date string.
 * @param {number|bigint} timestamp - Unix timestamp in seconds
 * @returns {string} Formatted date (e.g., "20.06.2026")
 */
export function formatDate(timestamp) {
  if (!timestamp) return "-";
  
  // Contract returns BigInt, so we convert it to Number safely
  const timeInMillis = Number(timestamp) * 1000;
  const date = new Date(timeInMillis);
  
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Format an amount value as currency.
 * Note: Since there is no real money/decimals, we just format it as an integer with thousand separators.
 * @param {number|bigint|string} amount 
 * @returns {string} Formatted amount (e.g., "₺50.000")
 */
export function formatAmount(amount) {
  if (amount === undefined || amount === null) return "-";
  
  const num = Number(amount);
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}
