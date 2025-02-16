import { healthInfoUnknown, type HealthMap } from "@/types/api/health";
import { createContext, useContext } from "react";

export type HealthMapContext = {
  health: HealthMap;
};

export const HealthMapContext = createContext<HealthMapContext>({
  health: {},
});

export const useHealthInfo = (alias: string) => {
  const { health } = useContext(HealthMapContext);
  return health[alias] ?? healthInfoUnknown;
};
