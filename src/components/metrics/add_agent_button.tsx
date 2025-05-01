import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";
import { useConfigFileState } from "@/hooks/config_file";
import {
  AddAgentForm,
  AgentType,
  newAgent,
  NewAgentResponse,
  verifyNewAgent,
} from "@/lib/api/agent";
import { toastError } from "@/types/api/endpoints";
import {
  Code,
  Dialog,
  Group,
  HStack,
  Input,
  Span,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaDocker, FaServer } from "react-icons/fa6";
import { LuInfo, LuPlus } from "react-icons/lu";
import { Checkbox } from "../ui/checkbox";
import { SegmentedControl } from "../ui/segmented-control";
import { toaster } from "../ui/toaster";
import { ToggleTip } from "../ui/toggle-tip";
const agentTypes = {
  docker: {
    label: "Docker",
    icon: <FaDocker />,
  },
  system: {
    label: "System",
    icon: <FaServer />,
  },
};

function Label({ children, ...rest }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Text fontWeight={"medium"} textAlign={"left"} minW={"92px"} {...rest}>
      {children}
    </Text>
  );
}

export function AddAgentDialogButton() {
  const [open, setOpen] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const { control, register, handleSubmit } = useForm<AddAgentForm>({
    defaultValues: {
      name: "",
      host: "",
      port: 8890,
      nightly: false,
    },
  });
  const [type, setType] = useState<AgentType>("docker");
  const [explicitOnly, setExplicitOnly] = useState(false);
  const [addToConfig, setAddToConfig] = useState(true);
  const [agent, setAgent] = useState<NewAgentResponse | null>(null);
  const { addAgent } = useConfigFileState();

  return (
    <Dialog.Root
      size="sm"
      placement="center"
      motionPreset="scale"
      open={open}
      onOpenChange={({ open }) => setOpen(open)}
      lazyMount
      unmountOnExit
    >
      <Dialog.Trigger asChild>
        <Button variant={"outline"}>
          <LuPlus />
          Add agent
        </Button>
      </Dialog.Trigger>
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Stack>
              <Dialog.Title>Add New Agent</Dialog.Title>
              <Dialog.CloseTrigger />
              <SegmentedControl
                mt={2}
                w="full"
                value={type}
                onValueChange={({ value }) => setType(value as AgentType)}
                items={Object.entries(agentTypes).map(([key, value]) => ({
                  label: (
                    <HStack gap="2">
                      {value.icon}
                      {value.label}
                    </HStack>
                  ),
                  value: key,
                }))}
              />
              <DialogDescription pt={2}>
                The agent must be running on the system to connect.
                <br /> Copy the{" "}
                {type === "docker" ? (
                  <Code>compose.yml</Code>
                ) : (
                  <Text>shell command</Text>
                )}{" "}
                below to add the agent to the system.
              </DialogDescription>
            </Stack>
          </Dialog.Header>
          <Dialog.Body>
            <Stack gap={3}>
              <Group>
                <Label>Name</Label>
                <Input {...register("name")} />
              </Group>
              <Group>
                <Label>Host / IP</Label>
                <Input {...register("host")} />
              </Group>
              <Group>
                <Label>Port</Label>
                <Input
                  {...register("port", { valueAsNumber: true })}
                  type="number"
                />
              </Group>
              <Group>
                <Label>Add to config</Label>
                <Checkbox
                  w="full"
                  checked={addToConfig}
                  onCheckedChange={({ checked }) =>
                    setAddToConfig(checked === true)
                  }
                />
                <ToggleTip
                  content={
                    <Text>
                      Add agent to <Code>config.yml</Code> under{" "}
                      <Code>providers.agents</Code>
                      <br />
                      <Span color={"fg.warning"}>
                        This will remove all comments from the config file
                      </Span>
                    </Text>
                  }
                >
                  <Button size="xs" variant="ghost">
                    <LuInfo />
                  </Button>
                </ToggleTip>
              </Group>
              <Group>
                <Label>Explicit Only</Label>
                <Checkbox
                  w="full"
                  checked={explicitOnly}
                  onCheckedChange={({ checked }) =>
                    setExplicitOnly(checked === true)
                  }
                />
                <ToggleTip
                  content={
                    <Text>
                      When enabled, only containers with GoDoxy labels{" "}
                      <Code>proxy.*</Code> will be proxied
                    </Text>
                  }
                >
                  <Button size="xs" variant="ghost">
                    <LuInfo />
                  </Button>
                </ToggleTip>
              </Group>

              {type === "docker" && (
                <Group>
                  <Label>Nightly</Label>
                  <Controller
                    control={control}
                    name="nightly"
                    render={({ field }) => (
                      <Checkbox
                        w="full"
                        checked={field.value}
                        onCheckedChange={({ checked }) =>
                          field.onChange(checked)
                        }
                      />
                    )}
                  />
                  <ToggleTip content="Nightly builds are less stable and may contain bugs">
                    <Button size="xs" variant="ghost">
                      <LuInfo />
                    </Button>
                  </ToggleTip>
                </Group>
              )}
            </Stack>
          </Dialog.Body>
          <Dialog.Footer>
            <Button
              variant={"ghost"}
              loading={copyLoading}
              loadingText="Creating certificates"
              onClick={handleSubmit((form) => {
                if (explicitOnly) {
                  form.name += "!";
                }
                setCopyLoading(true);
                newAgent({ ...form, type })
                  .then(async (e) => {
                    await navigator.clipboard.writeText(e.compose);
                    toaster.create({
                      title: "Copied to clipboard",
                    });
                    setAgent(e);
                  })
                  .catch(toastError)
                  .finally(() => setCopyLoading(false));
              })}
            >
              Copy
              {type === "docker" ? " docker compose" : " shell command"}
            </Button>
            <Button
              borderRadius={"lg"}
              disabled={!agent}
              loading={addLoading}
              onClick={handleSubmit((form) => {
                if (!agent) return;
                setAddLoading(true);
                verifyNewAgent({
                  host: form.host,
                  port: form.port,
                  ca: agent.ca,
                  client: agent.client,
                })
                  .then(async (e) => {
                    if (addToConfig) {
                      await addAgent(form.host, form.port);
                    }
                    return e;
                  })
                  .then(async (e) => {
                    setAgent(null);
                    setOpen(false);
                    toaster.create({
                      title: "Agent added",
                      description: await e?.text(),
                    });
                  })
                  .catch(toastError)
                  .finally(() => setAddLoading(false));
              })}
            >
              Add Agent
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
