export const MetricsPeriods = ["5m", "15m", "1h", "1d", "1mo"] as const;
export type MetricsPeriod = (typeof MetricsPeriods)[number];
