export function formatPercent(value: number) {
  return `${Math.round(value * 10000) / 100}%`;
}

export function formatTimestamp(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleString();
}

function formatPrecision(value: number, precision: number) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

const units = ["B", "KB", "MB", "GB", "TB"];

export function formatByte(value: number, precision = 2) {
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index++;
  }
  return `${formatPrecision(value, precision)} ${units[index]}`;
}
