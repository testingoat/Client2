const hasIntlSupport = typeof Intl !== 'undefined' && typeof Intl.NumberFormat === 'function';

const inrFormatter = hasIntlSupport
  ? new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  : null;

export const formatINRCurrency = (amount: number) => {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  if (inrFormatter) {
    return inrFormatter.format(safeAmount);
  }
  return `₹${safeAmount.toFixed(2)}`;
};
