import useWebsocket from "@/hooks/ws";
import { formatPercent, toFahrenheit } from "@/lib/format";
import { Agent } from "@/types/api/agent";
import Endpoints from "@/types/api/endpoints";
import type { SensorInfo, SystemInfo } from "@/types/api/metrics/system_info";
import {
  Center,
  HStack,
  Progress,
  Spinner,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import byteSize from "byte-size";
import { useRouter } from "next/navigation";
import path from "path";
import { FaTemperatureEmpty } from "react-icons/fa6";
import {
  LuArrowDown,
  LuArrowUp,
  LuCpu,
  LuHardDrive,
  LuMemoryStick,
  LuNetwork,
  LuServer,
} from "react-icons/lu";
import { Skeleton } from "../ui/skeleton";
import { useTemperatureUnit } from "./settings";

export default function SystemInfo() {
  const { data: agents } = useWebsocket<Agent[]>(Endpoints.LIST_AGENTS, {
    json: true,
  });
  if (!agents) {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  }
  return (
    <Table.ScrollArea borderRadius={"lg"}>
      <Table.Root size="md" stickyHeader>
        <Table.ColumnGroup>
          <Table.Column />
          <Table.Column htmlWidth="22%" />
          <Table.Column htmlWidth="22%" />
          <Table.Column htmlWidth="22%" />
          <Table.Column htmlWidth="15%" />
          <Table.Column />
        </Table.ColumnGroup>
        <Table.Header>
          <Table.Row bg="bg.emphasized">
            <Table.ColumnHeader>
              <HStack gap="2">
                <LuServer />
                System
              </HStack>
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              <HStack gap="2">
                <LuCpu />
                CPU
              </HStack>
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              <HStack gap="2">
                <LuMemoryStick />
                Memory
              </HStack>
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              <HStack gap="2">
                <LuHardDrive />
                Disk
              </HStack>
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              <HStack gap="2">
                <LuNetwork />
                Network
              </HStack>
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              <HStack gap="2">
                <FaTemperatureEmpty />
                Sensors
              </HStack>
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {[{ name: "Main" }, ...agents].map((agent) => (
            <SystemInfoRow key={agent.name} agent={agent} />
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
}

const SystemInfoRow: React.FC<{ agent: Agent }> = ({ agent }) => {
  const { data: systemInfo } = useWebsocket<SystemInfo>(
    Endpoints.metricsSystemInfo({ agent_addr: agent.addr, interval: "2s" }),
    { json: true },
  );
  const router = useRouter();
  if (!systemInfo) {
    return (
      <Table.Row>
        <Table.Cell>{agent.name}</Table.Cell>
        {Array.from({ length: 5 }).map((_, i) => (
          <Table.Cell key={`skeleton-${i}`}>
            <Skeleton height="20px" />
          </Table.Cell>
        ))}
      </Table.Row>
    );
  }
  return (
    <Table.Row
      onClick={() => {
        router.push(`/metrics/system_info/${agent.name}/${agent.addr ?? ""}`);
      }}
      cursor={"pointer"}
      _hover={{ bg: "var(--hover-bg)" }}
    >
      <Table.Cell>{agent.name}</Table.Cell>
      <Table.Cell>
        <PercentageCell value={systemInfo.cpu_average} />
      </Table.Cell>
      <Table.Cell>
        <PercentageCell value={systemInfo.memory?.used_percent} />
      </Table.Cell>
      <Table.Cell>
        {systemInfo.disks &&
          Object.values(systemInfo.disks)
            .sort((a, b) => a.path.localeCompare(b.path))
            .map((disk) => (
              <Stack key={disk.path} gap="0">
                {Object.keys(systemInfo.disks!).length > 1 && (
                  <Text fontSize={"xs"} fontWeight={"medium"}>
                    {disk.fstype}: {path.basename(disk.path) || disk.path}
                  </Text>
                )}
                <PercentageCell value={disk.used_percent} />
              </Stack>
            ))}
      </Table.Cell>
      {systemInfo.network ? (
        <Table.Cell>
          <HStack fontWeight={"medium"} fontSize={"sm"}>
            <LuArrowUp color="green" />{" "}
            {`${byteSize(systemInfo.network.upload_speed)}`}/s
          </HStack>
          <HStack fontWeight={"medium"} fontSize={"sm"}>
            <LuArrowDown color="red" />{" "}
            {`${byteSize(systemInfo.network.download_speed)}`}/s
          </HStack>
        </Table.Cell>
      ) : (
        <Table.Cell />
      )}
      <Table.Cell>
        {systemInfo.sensors && (
          <HStack gap="2" wrap={"wrap"}>
            {Object.values(systemInfo.sensors)
              .sort((a, b) => a.name?.localeCompare(b.name ?? ""))
              .map((sensor) => (
                <SensorCell key={sensor.name} sensor={sensor} />
              ))}
          </HStack>
        )}
      </Table.Cell>
    </Table.Row>
  );
};

export const sensorIcons: Record<string, React.ReactNode> = {
  coretemp_package_id_0: <LuCpu />,
  coretemp_package_id_1: <LuCpu />,
  nvme_composite: <LuHardDrive />,
};

const SensorCell: React.FC<{
  sensor?: SensorInfo;
  key?: string;
}> = ({ sensor, key }) => {
  const unit = useTemperatureUnit();
  if (!sensor) {
    return null;
  }
  const icon = sensorIcons[sensor.name];
  if (!icon) {
    return null;
  }
  const isHigh =
    sensor.sensorHigh > 0 && sensor.temperature > sensor.sensorHigh;
  const isCritical =
    sensor.sensorCritical > 0 && sensor.temperature > sensor.sensorCritical;
  const temperature =
    unit.val === "celsius"
      ? Math.round(sensor.temperature * 10) / 10
      : toFahrenheit(sensor.temperature);
  return (
    <HStack gap="2" key={key}>
      {icon}
      <Text
        fontSize={"sm"}
        fontWeight={"medium"}
        color={isCritical ? "red" : isHigh ? "orange" : "inherit"}
      >
        {temperature} °{unit.val[0]!.toUpperCase()}
      </Text>
    </HStack>
  );
};

const PercentageCell: React.FC<{
  value?: number;
  startElement?: React.ReactNode;
}> = ({ value, startElement }) => {
  if (!value) {
    return null;
  }
  return (
    <Progress.Root value={value} maxW="sm">
      <HStack gap="5">
        {startElement}
        <Progress.Track flex="1">
          <Progress.Range />
        </Progress.Track>
        <Text minW={"16"} fontSize="sm" fontWeight={"medium"}>
          {`${formatPercent(value / 100)}`}
        </Text>
      </HStack>
    </Progress.Root>
  );
};
