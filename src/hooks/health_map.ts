import type { HealthMap } from "@/lib/api";
import { healthInfoUnknown } from "@/types/api/health";
import { createContext, useContext } from "react";

export const HealthMapContext = createContext<HealthMap>({});

export const useHealthInfo = (alias: string) => {
  const health = useContext(HealthMapContext);
  return health[alias] ?? healthInfoUnknown;
};
