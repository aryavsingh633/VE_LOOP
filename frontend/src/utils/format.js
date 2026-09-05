export const currencyLabel = (currency) =>
  ({ VE: 'VEs', SVE: 'SVEs', TOKEN: 'Tokens' })[currency] || currency;
export const formatEntry = (amount, currency) =>
  `${new Intl.NumberFormat('en-IN').format(amount)} ${currencyLabel(currency)}`;
export const formatNumber = (value) =>
  new Intl.NumberFormat('en-IN', {
    notation: value > 999 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value || 0);
export const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date);
};
