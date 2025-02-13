import { formatPercent } from "@/lib/format";
import { Agent } from "@/types/api/agent";
import Endpoints from "@/types/api/endpoints";
import type { SystemInfo } from "@/types/api/metrics/system_info";
import useWebsocket from "@/types/api/ws";
import {
  Center,
  HStack,
  Progress,
  SimpleGrid,
  Spinner,
  Table,
  Text,
} from "@chakra-ui/react";
import byteSize from "byte-size";
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
    <Table.ScrollArea>
      <Table.Root variant={"line"} size="md" stickyHeader interactive>
        <Table.ColumnGroup>
          <Table.Column htmlWidth="10%" />
          <Table.Column htmlWidth="22%" />
          <Table.Column htmlWidth="22%" />
          <Table.Column htmlWidth="22%" />
          <Table.Column htmlWidth="10%" />
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
          {[undefined, ...agents].map((agent) => (
            <SystemInfoRow key={agent?.name ?? "main_server"} agent={agent} />
          ))}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
}

function SystemInfoRow({ agent }: { agent?: Agent }) {
  const { data: systemInfo } = useWebsocket<SystemInfo>(
    Endpoints.METRICS_SYSTEM_INFO_WS({ agent_addr: agent?.addr }),
    { json: true },
  );
  if (!systemInfo) {
    return (
      <Table.Row>
        <Table.Cell>{agent?.name ?? "Main"}</Table.Cell>
        {Array.from({ length: 4 }).map((_, i) => (
          <Table.Cell key={i}>
            <Skeleton height="20px" />
          </Table.Cell>
        ))}
      </Table.Row>
    );
  }
  return (
    <Table.Row>
      <Table.Cell>{agent?.name ?? "Main"}</Table.Cell>
      <PercentageCell value={systemInfo.cpu_average} />
      <PercentageCell value={systemInfo.memory.used_percent} />
      <PercentageCell value={systemInfo.disk.used_percent} />
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
      <Table.Cell>
        <SimpleGrid columns={2} gap="2">
          {systemInfo.sensors.map((sensor) => (
            <SensorCell sensor={sensor} />
          ))}
        </SimpleGrid>
      </Table.Cell>
    </Table.Row>
  );
}

export const sensorIcons: Record<string, React.ReactNode> = {
  coretemp_package_id_0: <LuCpu />,
  coretemp_package_id_1: <LuCpu />,
  nvme_composite: <LuHardDrive />,
};

function SensorCell({ sensor }: { sensor: SystemInfo["sensors"][number] }) {
  const icon = sensorIcons[sensor.sensorKey];
  if (!icon) {
    return null;
  }
  const isHigh =
    sensor.sensorHigh > 0 && sensor.temperature > sensor.sensorHigh;
  const isCritical =
    sensor.sensorCritical > 0 && sensor.temperature > sensor.sensorCritical;
  return (
    <HStack gap="2">
      {icon}
      <Text
        fontSize={"sm"}
        fontWeight={"medium"}
        color={isCritical ? "red" : isHigh ? "orange" : "inherit"}
      >
        {sensor.temperature} °C
      </Text>
    </HStack>
  );
}

function PercentageCell({
  value,
  startElement,
}: {
  value: number;
  startElement?: React.ReactNode;
}) {
  return (
    <Table.Cell>
      <Progress.Root value={value} maxW="sm">
        <HStack gap="5">
          {startElement}
          <Progress.Track flex="1">
            <Progress.Range />
          </Progress.Track>
          <Text
            minW={"16"}
            fontSize="sm"
            fontWeight={"medium"}
          >{`${formatPercent(value / 100)}`}</Text>
        </HStack>
      </Progress.Root>
    </Table.Cell>
  );
}
