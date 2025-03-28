import useWebsocket from "@/hooks/ws";
import Endpoints from "@/types/api/endpoints";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";

export type Container = {
  server: string;
  name: string;
  id: string;
  state: "running" | "paused" | "restarting" | "exited" | "dead";
  image: string;
};

type ContainerContextType = {
  containers: Container[];
  container: Container | null;
  setContainer: (container: Container | null) => void;
};

const ContainerContext = createContext<ContainerContextType>({
  containers: [],
  container: null,
  setContainer: () => {},
});

export const useContainerContext = () => {
  return useContext(ContainerContext);
};

export const ContainerProvider: FC<PropsWithChildren> = ({ children }) => {
  const [container, setContainer] = useState<Container | null>(null);
  const { data: containers } = useWebsocket<Container[]>(
    Endpoints.DOCKER_CONTAINERS,
    {
      json: true,
    },
  );
  return (
    <ContainerContext.Provider
      value={useMemo(
        () => ({
          containers: containers ?? [],
          container,
          setContainer,
        }),
        [containers, container, setContainer],
      )}
    >
      {children}
    </ContainerContext.Provider>
  );
};
