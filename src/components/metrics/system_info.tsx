import { useWebSocketApi } from "@/hooks/websocket";
import type { Agent, SensorsTemperatureStat, SystemInfo } from "@/lib/api";
import { formatPercent, providerName, toFahrenheit } from "@/lib/format";
import {
  Badge,
  Box,
  Center,
  HStack,
  Progress,
  Spinner,
  Stack,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import byteSize from "byte-size";
import { useRouter } from "next/navigation";
import path from "path";
import { useState } from "react";
import { FaTemperatureEmpty } from "react-icons/fa6";
import {
  LuArrowDown,
  LuArrowUp,
  LuCpu,
  LuHardDrive,
  LuMemoryStick,
  LuNetwork,
  LuServer,
  LuWifi,
} from "react-icons/lu";
import { Skeleton } from "../ui/skeleton";
import { useTemperatureUnit } from "./settings";

const columnHeaderIconSize = 18;
const tableRowIconSize = 14;

export default function SystemInfo() {
  const [agents, setAgents] = useState<Agent[]>([]);
  useWebSocketApi<Agent[]>({
    endpoint: "/agent/list",
    onMessage: setAgents,
  });

  if (!agents) {
    return (
      <Center h="300px">
        <VStack gap={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.500" fontSize="sm">
            Loading system information...
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box
      bg={"white"}
      _dark={{ bg: "gray.800", borderColor: "gray.600" }}
      borderRadius="xl"
      border="1px"
      borderColor={"gray.200"}
      shadow="lg"
      overflow="hidden"
    >
      <Table.ScrollArea>
        <Table.Root size="md" stickyHeader variant={"line"}>
          <Table.ColumnGroup>
            <Table.Column />
            <Table.Column htmlWidth="20%" />
            <Table.Column htmlWidth="20%" />
            <Table.Column htmlWidth="20%" />
            <Table.Column htmlWidth="18%" />
            <Table.Column htmlWidth="22%" />
          </Table.ColumnGroup>
          <Table.Header>
            <Table.Row>
              <StyledColumnHeader
                icon={<LuServer size={columnHeaderIconSize} />}
                label="System"
              />
              <StyledColumnHeader
                icon={<LuCpu size={columnHeaderIconSize} />}
                label="CPU"
              />
              <StyledColumnHeader
                icon={<LuMemoryStick size={columnHeaderIconSize} />}
                label="Memory"
              />
              <StyledColumnHeader
                icon={<LuHardDrive size={columnHeaderIconSize} />}
                label="Storage"
              />
              <StyledColumnHeader
                icon={<LuNetwork size={columnHeaderIconSize} />}
                label="Network"
              />
              <StyledColumnHeader
                icon={<FaTemperatureEmpty size={columnHeaderIconSize} />}
                label="Sensors"
              />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {[{ name: "Main", addr: "", version: "" }, ...agents].map(
              (agent) => (
                <SystemInfoRow key={agent.name} agent={agent} />
              ),
            )}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Box>
  );
}

function StyledColumnHeader({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Table.ColumnHeader
      fontSize="sm"
      fontWeight="bold"
      color="blue.700"
      _dark={{ color: "blue.200" }}
      py={4}
    >
      <HStack gap="3">
        <Box color="blue.500">{icon}</Box>
        {label}
      </HStack>
    </Table.ColumnHeader>
  );
}

const SystemInfoRow: React.FC<{ agent: Agent }> = ({ agent }) => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo>();
  useWebSocketApi<SystemInfo>({
    endpoint: "/metrics/system_info",
    query: {
      agent_addr: agent.addr,
    },
    onMessage: (data) => setSystemInfo(data),
  });
  const router = useRouter();

  if (!systemInfo) {
    return (
      <Table.Row>
        <Table.Cell py={4}>
          <Text
            fontWeight="medium"
            color="gray.700"
            _dark={{ color: "gray.200" }}
          >
            {providerName(agent.name)}
          </Text>
        </Table.Cell>
        {Array.from({ length: 5 }).map((_, i) => (
          <Table.Cell key={`skeleton-${i}`} py={4}>
            <Skeleton height="24px" borderRadius="md" />
          </Table.Cell>
        ))}
      </Table.Row>
    );
  }

  return (
    <Table.Row
      onClick={() => {
        router.push(`/metrics/system_info/${agent.name}/${agent.addr}`);
      }}
      cursor="pointer"
      _hover={{
        bg: "bg.emphasized",
        transform: "translateY(-1px)",
        shadow: "md",
        transition: "all 0.2s ease-in-out",
      }}
      transition="all 0.2s ease-in-out"
    >
      <Table.Cell>
        <Text
          fontWeight="medium"
          color="gray.700"
          _dark={{ color: "gray.200" }}
        >
          {providerName(agent.name)}
        </Text>
      </Table.Cell>
      <Table.Cell>
        <PercentageCell
          value={systemInfo.cpu_average}
          icon={<LuCpu size={tableRowIconSize} />}
        />
      </Table.Cell>
      <Table.Cell>
        <PercentageCell
          value={systemInfo.memory?.used_percent}
          icon={<LuMemoryStick size={tableRowIconSize} />}
        />
      </Table.Cell>
      <Table.Cell>
        {systemInfo.disks &&
          Object.values(systemInfo.disks)
            .sort((a, b) => a.path.localeCompare(b.path))
            .map((disk) => (
              <Stack key={disk.path} gap={1} mb={2}>
                {Object.keys(systemInfo.disks!).length > 1 && (
                  <HStack gap={2}>
                    <Badge size="sm" colorScheme="gray" variant="outline">
                      {disk.fstype}
                    </Badge>
                    <Text
                      fontSize="xs"
                      color="gray.600"
                      _dark={{ color: "gray.400" }}
                    >
                      {path.basename(disk.path) || disk.path}
                    </Text>
                  </HStack>
                )}
                <PercentageCell
                  value={disk.used_percent}
                  icon={<LuHardDrive size={tableRowIconSize} />}
                />
              </Stack>
            ))}
      </Table.Cell>
      {systemInfo.network ? (
        <Table.Cell>
          <VStack gap={2} align="stretch">
            <HStack gap={2}>
              <Box color="green.500">
                <LuArrowUp size={16} />
              </Box>
              <Text
                fontSize="sm"
                fontWeight="medium"
                color="green.600"
                _dark={{ color: "green.400" }}
              >
                {`${byteSize(systemInfo.network.upload_speed)}`}/s
              </Text>
            </HStack>
            <HStack gap={2}>
              <Box color="red.500">
                <LuArrowDown size={16} />
              </Box>
              <Text
                fontSize="sm"
                fontWeight="medium"
                color="red.600"
                _dark={{ color: "red.400" }}
              >
                {`${byteSize(systemInfo.network.download_speed)}`}/s
              </Text>
            </HStack>
          </VStack>
        </Table.Cell>
      ) : (
        <Table.Cell>
          <HStack gap={2} color="gray.400">
            <LuWifi size={16} />
            <Text fontSize="sm">No data</Text>
          </HStack>
        </Table.Cell>
      )}
      <Table.Cell>
        {systemInfo.sensors ? (
          <HStack gap={2} wrap="wrap" maxW="200px">
            {Object.values(systemInfo.sensors)
              .sort((a, b) => a.name?.localeCompare(b.name ?? ""))
              .map((sensor) => (
                <SensorCell key={sensor.name} sensor={sensor} />
              ))}
          </HStack>
        ) : (
          <Text fontSize="sm" color="gray.400">
            No sensors
          </Text>
        )}
      </Table.Cell>
    </Table.Row>
  );
};

export const sensorIcons: Record<string, React.ReactNode> = {
  coretemp_package_id_0: <LuCpu />,
  coretemp_package_id_1: <LuCpu />,
  coretemp_physical_id_0: <LuCpu />,
  coretemp_physical_id_1: <LuCpu />,
  cpu_thermal: <LuCpu />,
  nvme_composite: <LuHardDrive />,
};

const SensorCell: React.FC<{
  sensor?: SensorsTemperatureStat;
}> = ({ sensor }) => {
  const unit = useTemperatureUnit();
  if (!sensor) {
    return null;
  }
  const icon = sensorIcons[sensor.name];
  if (!icon) {
    return null;
  }
  const isHigh = sensor.high > 0 && sensor.temperature > sensor.high;
  const isCritical =
    sensor.critical > 0 && sensor.temperature > sensor.critical;
  const temperature =
    unit.val === "celsius"
      ? Math.round(sensor.temperature * 10) / 10
      : toFahrenheit(sensor.temperature);

  const getColorScheme = () => {
    if (isCritical) return "red";
    if (isHigh) return "orange";
    if (temperature > 60) return "yellow";
    return "green";
  };

  return (
    <Badge
      colorScheme={getColorScheme()}
      variant={isCritical ? "solid" : "subtle"}
      borderRadius="full"
      px={2}
      py={1}
      fontSize="xs"
      fontWeight="medium"
    >
      <HStack gap={1}>
        <Box>{icon}</Box>
        <Text>
          {temperature}°{unit.val[0]!.toUpperCase()}
        </Text>
      </HStack>
    </Badge>
  );
};

const PercentageCell: React.FC<{
  value?: number;
  startElement?: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ value, startElement, icon }) => {
  if (!value) {
    return (
      <HStack gap={2} color="gray.400">
        {icon}
        <Text fontSize="sm">No data</Text>
      </HStack>
    );
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "red";
    if (percentage >= 75) return "orange";
    if (percentage >= 50) return "yellow";
    return "green";
  };

  const colorScheme = getProgressColor(value);

  return (
    <Progress.Root
      value={value}
      maxW="full"
      size="md"
      colorScheme={colorScheme}
      borderRadius="full"
    >
      <HStack gap={3} w="full">
        {startElement}
        <Progress.Track flex="1" borderRadius="full">
          <Progress.Range borderRadius="full" />
        </Progress.Track>
        <HStack gap={1} minW="16">
          {icon && <Box color={`${colorScheme}.500`}>{icon}</Box>}
          <Text
            fontSize="sm"
            fontWeight="medium"
            color={`${colorScheme}.600`}
            _dark={{ color: `${colorScheme}.400` }}
          >
            {formatPercent(value / 100)}
          </Text>
        </HStack>
      </HStack>
    </Progress.Root>
  );
};
