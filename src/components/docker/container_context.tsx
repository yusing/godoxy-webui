import { useFragment } from "@/hooks/fragment";
import useWebsocket from "@/hooks/ws";
import Endpoints from "@/types/api/endpoints";
import { useRouter } from "next/navigation";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
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
  // const [container, setContainer] = useState<Container | null>(null);
  const containerID = useFragment();
  const router = useRouter();
  const { data: containers } = useWebsocket<Container[]>(
    Endpoints.DOCKER_CONTAINERS,
    {
      json: true,
    },
  );
  const container = useMemo(() => {
    return containers?.find((c) => c.id === containerID) ?? null;
  }, [containers, containerID]);

  return (
    <ContainerContext.Provider
      value={useMemo(
        () => ({
          containers: containers ?? [],
          container,
          setContainer: (container) => {
            router.push(`#${container?.id}`);
          },
        }),
        [containers, container, containerID, router],
      )}
    >
      {children}
    </ContainerContext.Provider>
  );
};
