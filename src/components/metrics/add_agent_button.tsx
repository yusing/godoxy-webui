import { Button } from "@/components/ui/button";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  addAgent,
  AddAgentForm,
  AgentType,
  newAgent,
  NewAgentResponse,
} from "@/lib/api/agent";
import { toastError } from "@/types/api/endpoints";
import { Code, Group, HStack, Input, Stack, Text } from "@chakra-ui/react";
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

function Label({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Text fontWeight={"medium"} textAlign={"left"} minW={"70px"} mr="2">
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
  const [agent, setAgent] = useState<NewAgentResponse | null>(null);

  return (
    <DialogRoot
      size="sm"
      placement="center"
      motionPreset="scale"
      open={open}
      onOpenChange={({ open }) => setOpen(open)}
      lazyMount
      unmountOnExit
    >
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          <LuPlus />
          Add agent
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Agent</DialogTitle>
          <DialogCloseTrigger />
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
            Remember to add the agent to <Code>config.yml</Code> after adding
            it.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
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
                    When enabled, only routes with GoDoxy labels{" "}
                    <Code>proxy.*</Code> will be proxied by GoDoxy
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
                      onCheckedChange={({ checked }) => field.onChange(checked)}
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
        </DialogBody>
        <DialogFooter>
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
              addAgent({
                host: form.host,
                port: form.port,
                ca: agent.ca,
                client: agent.client,
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
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
