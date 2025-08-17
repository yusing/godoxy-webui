import {
  healthStatusColorPalettes,
  type HealthStatusType,
} from "@/types/api/health";
import {
  Badge,
  Status as ChakraStatus,
  HStack,
  Icon,
  type IconProps,
  type TagRootProps,
  Text,
} from "@chakra-ui/react";
import { AlertCircle, CheckCircle2, Pause, Play } from "lucide-react";
import React, { memo } from "react";
import { Tag } from "./ui/tag";

export interface HealthStatusProps extends ChakraStatus.RootProps {
  variant?: TagRootProps["variant"];
  value?: HealthStatusType;
  fontSize?: string;
}

const HealthStatus_: React.FC<HealthStatusProps> = ({
  children,
  value = "unknown",
}) => {
  return (
    <ChakraStatus.Root
      colorPalette={healthStatusColorPalettes[value]}
      opacity={value === "stopped" ? 0.3 : 1}
    >
      <ChakraStatus.Indicator />
      {children}
    </ChakraStatus.Root>
  );
};
const HealthStatusTag_: React.FC<HealthStatusProps> = ({
  value = "unknown",
  fontSize = "md",
  variant = "surface",
}) => {
  return (
    <Tag variant={variant} colorPalette={healthStatusColorPalettes[value]}>
      <HStack px="1" py="1.5" gap="1.5">
        <ChakraStatus.Root colorPalette={healthStatusColorPalettes[value]}>
          <ChakraStatus.Indicator />
        </ChakraStatus.Root>
        <Text fontSize={fontSize} fontWeight={"medium"}>
          {value}
        </Text>
      </HStack>
    </Tag>
  );
};

function StatusIcon({
  status,
  color,
}: {
  status: HealthStatusType;
  color: IconProps["color"];
}) {
  switch (status) {
    case "healthy":
      return <Icon as={CheckCircle2} h={4} w={4} color={color} />;
    case "napping":
      return <Icon as={Pause} h={4} w={4} color={color} />;
    case "unhealthy":
      return <Icon as={AlertCircle} h={4} w={4} color={color} />;
    case "starting":
      return <Icon as={Play} h={4} w={4} color={color} />;
    case "error":
      return <Icon as={AlertCircle} h={4} w={4} color={color} />;
    case "unknown":
      return <Icon as={AlertCircle} h={4} w={4} color={color} />;
    case "stopped":
      return <Icon as={Pause} h={4} w={4} color={color} />;
  }
}

export function HealthStatusBadge({ status }: { status: HealthStatusType }) {
  const variants: Record<
    HealthStatusType,
    { bg: string; text: string; border: string; icon: string }
  > = {
    // healthy: "bg-green-100 text-green-800 border-green-200",
    healthy: {
      bg: "green.100",
      text: "green.800",
      border: "green.200",
      icon: "green.500",
    },
    napping: {
      bg: "yellow.100",
      text: "yellow.800",
      border: "yellow.200",
      icon: "yellow.500",
    },
    unhealthy: {
      bg: "orange.100",
      text: "orange.800",
      border: "orange.200",
      icon: "orange.500",
    },
    starting: {
      bg: "blue.100",
      text: "blue.800",
      border: "blue.200",
      icon: "blue.500",
    },
    error: {
      bg: "red.100",
      text: "red.500",
      border: "red.200",
      icon: "red.500",
    },
    unknown: {
      bg: "gray.100",
      text: "gray.600",
      border: "gray.200",
      icon: "gray.500",
    },
    stopped: {
      bg: "gray.100",
      text: "gray.700",
      border: "gray.300",
      icon: "gray.500",
    },
  } as const;

  const style = variants[status];

  return (
    <Badge
      variant="outline"
      bg={style.bg}
      color={style.text}
      borderColor={style.border}
      borderRadius="md"
      w="min-content"
    >
      <StatusIcon status={status} color={style.icon} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export const HealthStatus = memo(HealthStatus_, (prev, next) => {
  return prev.value === next.value;
});
export const HealthStatusTag = memo(HealthStatusTag_, (prev, next) => {
  return prev.value === next.value;
});
