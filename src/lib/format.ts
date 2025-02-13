export function formatPercent(value: number) {
  return `${Math.round(value * 10000) / 100}%`;
}
