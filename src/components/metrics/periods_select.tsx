import {
  type MetricsPeriod,
  MetricsPeriods,
} from "@/types/api/metrics/metrics";
import { FC } from "react";
import { SegmentedControl } from "../ui/segmented-control";

export const PeriodsSelect: FC<{
  period: MetricsPeriod;
  setPeriod: (period: MetricsPeriod) => void;
}> = ({ period, setPeriod }) => {
  return (
    <SegmentedControl
      value={period}
      onValueChange={({ value }) => setPeriod(value as MetricsPeriod)}
      items={MetricsPeriods}
      fontWeight={"medium"}
    />
  );
};
