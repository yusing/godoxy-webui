import { Status } from "@chakra-ui/react";
import { FC } from "react";
import { Label } from "../ui/label";
import { Container } from "./container_context";

const StatusMapping = {
  running: "green",
  paused: "yellow", // idlewatcher
  exited: "yellow", // idlewatcher
  restarting: "orange",
  dead: "red",
};

export const ContainerStatusIndicator: FC<{
  status: Container["state"];
  withText?: boolean;
}> = ({ status, withText = false }) => {
  return (
    <Status.Root>
      <Status.Indicator colorPalette={StatusMapping[status]} />
      {withText ? <Label>{status}</Label> : null}
    </Status.Root>
  );
};
