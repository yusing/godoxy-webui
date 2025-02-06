import { HealthStatusType } from "@/types/api/health";
import type { ColorPalette } from "@chakra-ui/react";
import { Status as ChakraStatus } from "@chakra-ui/react";
import * as React from "react";

export interface HealthStatusProps extends ChakraStatus.RootProps {
  value?: HealthStatusType;
}

const statusMap: Record<HealthStatusType, ColorPalette> = {
  healthy: "green",
  napping: "yellow",
  unhealthy: "red",
  starting: "blue",
  error: "red",
  unknown: "gray",
} as const;

export const HealthStatus = React.forwardRef<HTMLDivElement, HealthStatusProps>(
  function Status(props, ref) {
    const { children, value = "unknown", ...rest } = props;
    const colorPalette = rest.colorPalette ?? statusMap[value];
    return (
      <ChakraStatus.Root ref={ref} {...rest} colorPalette={colorPalette}>
        <ChakraStatus.Indicator />
        {children}
      </ChakraStatus.Root>
    );
  },
);
