import { useFragment } from "@/hooks/fragment";
import { useWebSocketApi } from "@/hooks/websocket";
import type { ContainerResponse } from "@/lib/api";
import { useRouter } from "next/navigation";
import { createContext, useContext, useMemo, useState } from "react";

type ContainerContextType = {
  containers: ContainerResponse[];
  container: ContainerResponse | null;
  setContainer: (container: ContainerResponse | null) => void;
};

const ContainerContext = createContext<ContainerContextType>({
  containers: [],
  container: null,
  setContainer: () => {},
});

export const useContainerContext = () => {
  return useContext(ContainerContext);
};

export function ContainerProvider({ children }: { children: React.ReactNode }) {
  const containerID = useFragment();
  const router = useRouter();
  const [containers, setContainers] = useState<ContainerResponse[]>([]);

  useWebSocketApi<ContainerResponse[]>({
    endpoint: "/docker/containers",
    onMessage: setContainers,
  });

  const container = useMemo(() => {
    return containers?.find((c) => c.id === containerID) ?? null;
  }, [containers, containerID]);

  return (
    <ContainerContext.Provider
      value={useMemo(
        () => ({
          containers: containers,
          container,
          setContainer: (container) => {
            router.push(`#${container?.id}`);
          },
        }),
        [containers, container, router],
      )}
    >
      {children}
    </ContainerContext.Provider>
  );
}
