import { Group, HStack, Stack, StackProps } from "@chakra-ui/react";

import { useSetting } from "@/hooks/settings";
import useWebsocket from "@/hooks/ws";
import Endpoints from "@/types/api/endpoints";
import { FC, useEffect, useRef, useState } from "react";
import { LogLine } from "../config_editor/logline";
import { Label } from "../ui/label";
import { SkeletonText } from "../ui/skeleton";
import { StepperInput } from "../ui/stepper-input";
import { Switch } from "../ui/switch";

export const GodoxyLogs: FC<StackProps> = ({ ...props }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const autoScroll = useSetting("logs_auto_scroll", true);
  const maxLines = useSetting("logs_max_lines", 100);
  const logRef = useRef<HTMLDivElement>(null);
  const { data } = useWebsocket<string>(Endpoints.LOGS);

  useEffect(() => {
    if (data) {
      setLogs((prev) => prev.concat(data.split("\n")).slice(-maxLines.val));
    }
  }, [data]);

  useEffect(() => {
    if (autoScroll.val) {
      logRef.current?.scrollTo(0, logRef.current.scrollHeight);
    }
  }, [autoScroll.val, data]);

  return (
    <>
      <Stack ref={logRef} overflow="auto" gap="0" w="full" h="full" {...props}>
        {data
          ? logs.map((l, i) => <LogLine key={i} line={l} />)
          : Array.from({ length: 10 }).map((_, index) => (
              <SkeletonText key={index} h="1rem" w="full" />
            ))}
      </Stack>
      <HStack gap="6">
        <Switch
          key="auto-scroll"
          checked={autoScroll.val}
          onCheckedChange={({ checked }) => autoScroll.set(checked)}
        >
          Auto Scroll
        </Switch>
        <Group attached>
          <Label>Max Lines</Label>
          <StepperInput
            value={maxLines.val.toString()}
            min={10}
            max={5000}
            step={10}
            onValueChange={({ valueAsNumber }) => maxLines.set(valueAsNumber)}
          ></StepperInput>
        </Group>
      </HStack>
    </>
  );
};
