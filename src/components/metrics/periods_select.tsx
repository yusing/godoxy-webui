import type { MetricsPeriod } from "@/lib/api";
import { SegmentedControl } from "../ui/segmented-control";

export function PeriodsSelect({
  period,
  setPeriod,
}: {
  period: MetricsPeriod;
  setPeriod: (period: MetricsPeriod) => void;
}) {
  return (
    <SegmentedControl
      value={period}
      onValueChange={({ value }) => setPeriod(value as MetricsPeriod)}
      items={["5m", "15m", "1h", "1d", "1mo"] as MetricsPeriod[]}
      fontWeight={"medium"}
    />
  );
}
