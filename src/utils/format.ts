const decimalsFor = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1) return 2;
  if (abs >= 0.01) return 4;
  if (abs > 0) return 8;
  return 2;
};

export const formatPrice = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const digits = decimalsFor(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
};

export const formatCompactPrice = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  if (Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value);
  }
  return formatPrice(value);
};

export const formatPercent = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

/** Where the current price sits inside the 24h low–high range, as 0–100. */
export const rangePosition = (low?: number, high?: number, current?: number) => {
  if (!low || !high || !current || high <= low) return null;
  const pct = ((current - low) / (high - low)) * 100;
  return Math.min(100, Math.max(0, pct));
};
