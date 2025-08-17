import {
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTrigger,
} from "@/components/ui/drawer";
import type { ContainerResponse } from "@/lib/api";
import { providerName } from "@/lib/format";
import {
  Collapsible,
  DrawerBackdrop,
  For,
  HStack,
  IconButton,
  Input,
  type InputProps,
  Stack,
  type StackProps,
  Text,
} from "@chakra-ui/react";
import {
  createContext,
  type FC,
  type RefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FaSearch } from "react-icons/fa";
import { FaBars } from "react-icons/fa6";
import { InputGroup } from "../ui/input-group";
import { Label } from "../ui/label";
import { SkeletonText } from "../ui/skeleton";
import { useContainerContext } from "./container_context";
import { ContainerStatusIndicator } from "./container_status_indicator";

const SearchInputContext = createContext<{
  keyword: string;
  setKeyword: (keyword: string) => void;
}>({
  keyword: "",
  setKeyword: () => {},
});

function useSearchInput() {
  return useContext(SearchInputContext);
}

interface SearchInputProps extends InputProps {
  ref?: RefObject<HTMLDivElement | null>;
}

export function SearchInput(props: Readonly<SearchInputProps>) {
  const { keyword, setKeyword } = useSearchInput();
  return (
    <InputGroup flex="1" startElement={<FaSearch />} {...props}>
      <Input
        placeholder="Search"
        value={keyword}
        onChange={({ target: { value } }) => setKeyword(value)}
      />
    </InputGroup>
  );
}

export function SearchInputProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [keyword, setKeyword] = useState("");
  return (
    <SearchInputContext.Provider
      value={useMemo(() => ({ keyword, setKeyword }), [keyword, setKeyword])}
    >
      {children}
    </SearchInputContext.Provider>
  );
}

export function ServerListDrawerButton() {
  const [open, setOpen] = useState(false);
  return (
    <DrawerRoot
      placement={"start"}
      open={open}
      onOpenChange={({ open }) => setOpen(open)}
    >
      <DrawerBackdrop />
      <DrawerTrigger asChild>
        <IconButton variant={"ghost"} size="sm">
          <FaBars />
        </IconButton>
      </DrawerTrigger>
      <SearchInputProvider>
        <DrawerContent>
          <DrawerHeader>
            <SearchInput />
          </DrawerHeader>
          <ServerList px="6" onItemClick={() => setOpen(false)} />
        </DrawerContent>
      </SearchInputProvider>
    </DrawerRoot>
  );
}

let scrollPosition = 0;

export function ServerList(
  props: Readonly<StackProps & { onItemClick: () => void }>,
) {
  const { keyword } = useSearchInput();
  const { containers, setContainer } = useContainerContext();
  const filteredContainers = useMemo(() => {
    return !keyword
      ? containers
      : containers.filter((container) =>
          container.name.toLowerCase().includes(keyword.toLowerCase()),
        );
  }, [containers, keyword]);
  const containerByServer = useMemo(
    () =>
      filteredContainers.reduce(
        (acc, container) => {
          acc[container.server] ??= [];
          acc[container.server]!.push(container);
          return acc;
        },
        {} as Record<string, ContainerResponse[]>,
      ),
    [filteredContainers],
  );
  // memoize the scroll position
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current && scrollPosition > 0) {
      ref.current.scrollTo(0, scrollPosition);
    }
    const handleScroll = () => {
      scrollPosition = ref.current?.scrollTop ?? 0;
    };
    ref.current?.addEventListener("scroll", handleScroll);
    return () => {
      ref.current?.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <Stack overflow="auto" ref={ref} minW="200px" {...props}>
      <Text
        key="overview"
        color={"fg.info"}
        fontWeight={"medium"}
        _hover={{ textDecoration: "underline" }}
        onClick={() => setContainer(null)}
      >
        Overview
      </Text>
      <For each={Object.entries(containerByServer)}>
        {([server, containers]) => (
          <ContainerList
            key={server}
            server={server}
            containers={containers}
            onItemClick={props.onItemClick}
          />
        )}
      </For>
    </Stack>
  );
}

function DummyContainerList() {
  return Array.from({ length: 20 }).map((_, index) => (
    <SkeletonText noOfLines={1} key={index} />
  ));
}

function ContainerList({
  server,
  containers,
  onItemClick,
}: {
  server: string;
  containers: ContainerResponse[];
  onItemClick: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Collapsible.Root
      open={!collapsed}
      onOpenChange={({ open }) => setCollapsed(!open)}
      lazyMount
      unmountOnExit
    >
      <Collapsible.Trigger _hover={{ bg: "var(--hover-bg)" }}>
        <Label>
          {providerName(server)} ({containers.length})
        </Label>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <For each={containers} fallback={<DummyContainerList />}>
          {(container) => (
            <ContainerItem
              key={container.id}
              container={container}
              pl={4}
              py="2"
              onItemClick={onItemClick}
            />
          )}
        </For>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

interface ContainerItemProps extends Omit<StackProps, "container"> {
  container: ContainerResponse;
  onItemClick: () => void;
}

export const ContainerItem: FC<ContainerItemProps> = ({
  container,
  onItemClick,
  ...props
}) => {
  const { container: current, setContainer } = useContainerContext();
  return (
    <HStack
      {...props}
      onClick={() => {
        setContainer(container);
        onItemClick();
      }}
      _hover={{
        bg: "var(--hover-bg)",
      }}
      gap="2"
      w="full"
    >
      <ContainerStatusIndicator status={container.state} />
      <Label color={current?.id === container.id ? "fg.success" : "unset"}>
        {container.name.slice(1)}
      </Label>
    </HStack>
  );
};
