export function formatPercent(value: number) {
  return `${Math.round(value * 10000) / 100}%`;
}

export function formatTimestamp(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleString();
}
