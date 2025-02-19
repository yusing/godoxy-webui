import {
  healthStatusColorPalettes,
  HealthStatusType,
} from "@/types/api/health";
import { Status as ChakraStatus, HStack, Text } from "@chakra-ui/react";
import React from "react";
import { Tag } from "./ui/tag";

export interface HealthStatusProps extends ChakraStatus.RootProps {
  value?: HealthStatusType;
}

const HealthStatus_: React.FC<HealthStatusProps> = ({
  children,
  value = "unknown",
}) => {
  return (
    <ChakraStatus.Root colorPalette={healthStatusColorPalettes[value]}>
      <ChakraStatus.Indicator />
      {children}
    </ChakraStatus.Root>
  );
};
const HealthStatusTag_: React.FC<HealthStatusProps & { fontSize?: string }> = ({
  value = "unknown",
  fontSize = "md",
}) => {
  return (
    <Tag variant={"surface"} colorPalette={healthStatusColorPalettes[value]}>
      <HStack p="2" gap="2">
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

export const HealthStatus = React.memo(HealthStatus_, (prev, next) => {
  return prev.value === next.value;
});
export const HealthStatusTag = React.memo(HealthStatusTag_, (prev, next) => {
  return prev.value === next.value;
});
