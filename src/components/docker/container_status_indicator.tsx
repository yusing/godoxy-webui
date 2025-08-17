import type { ContainerState } from "@/lib/api";
import { Status } from "@chakra-ui/react";
import { Label } from "../ui/label";

const StatusMapping = {
  created: "gray",
  running: "green",
  paused: "yellow", // idlewatcher
  restarting: "orange",
  removing: "orange",
  exited: "yellow", // idlewatcher
  dead: "red",
};

export function ContainerStatusIndicator({
  status,
  withText,
}: {
  status: ContainerState;
  withText?: boolean;
}) {
  return (
    <Status.Root>
      <Status.Indicator colorPalette={StatusMapping[status]} />
      {withText ? <Label>{status}</Label> : null}
    </Status.Root>
  );
}
