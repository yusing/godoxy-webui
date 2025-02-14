import { Button } from "@/components/ui/button";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
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
import { Group, HStack, Input, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaDocker, FaServer } from "react-icons/fa6";
import { LuPlus } from "react-icons/lu";
import { Checkbox } from "../ui/checkbox";
import { SegmentedControl } from "../ui/segmented-control";
import { toaster } from "../ui/toaster";

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

function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text fontWeight={"medium"} textAlign={"right"} w={"70px"} mr="2">
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
      type: "docker",
      name: "",
      host: "",
      port: 8890,
      nightly: false,
    },
  });
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
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <SegmentedControl
                mt={2}
                w="full"
                value={field.value}
                onValueChange={({ value }) =>
                  field.onChange(value as AgentType)
                }
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
            )}
          />
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
            </Group>
          </Stack>
        </DialogBody>
        <DialogFooter>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Button
                variant={"ghost"}
                loading={copyLoading}
                loadingText="Creating certificates"
                onClick={handleSubmit((form) => {
                  setCopyLoading(true);
                  newAgent(form)
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
                {field.value === "docker"
                  ? " docker compose"
                  : " shell command"}
              </Button>
            )}
          />
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
