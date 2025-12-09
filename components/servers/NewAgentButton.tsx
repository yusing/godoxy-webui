import { Button } from '@/components/ui/button'
import Code from '@/components/ui/code'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { type NewAgentRequest, type NewAgentResponse } from '@/lib/api'
import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { cn } from '@/lib/utils'
import type { Config } from '@/types/godoxy'
import { createMixedState, useForm, useMemoryStore } from 'juststore'
import { Check, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { parse as parseYAML, stringify as stringifyYAML } from 'yaml'
import Docker from '../svg/docker'
import Linux from '../svg/linux'
import { FieldGroup } from '../ui/field'
import { StoreCheckboxField, StoreFormCheckboxField } from '../ui/store/Checkbox'
import { StoreFormInputField } from '../ui/store/Input'
import { StoreFormRadioField } from '../ui/store/Radio'
const agentTypes = [
  {
    type: 'docker',
    label: 'Docker',
    icon: <Docker colored />,
  },
  {
    type: 'system',
    label: 'System',
    icon: <Linux />,
  },
]

async function addAgentToConfig(host: string, port: number) {
  const data = await api.file.get({ filename: 'config.yml', type: 'config' }).then(res => res.data)
  const config = parseYAML(data) as Config.Config
  if (!config.providers) {
    config.providers = {
      agents: [],
    }
  }
  if (!config.providers.agents) {
    config.providers.agents = []
  }
  config.providers.agents.push(`${host}:${port}`)
  await api.file.set({ filename: 'config.yml', type: 'config' }, stringifyYAML(config))
}

const minWidth = 'min-w-[120px]'

export function AddAgentDialogButton() {
  const [open, setOpen] = useState(false)

  const form = useForm<NewAgentRequest>({
    name: '',
    host: '',
    port: 8890,
    nightly: false,
    container_runtime: 'docker',
    type: 'docker',
  })

  const states = useMemoryStore({
    explicitOnly: false,
    addToConfig: true,
    addLoading: false,
    copyLoading: false,
    agent: undefined as NewAgentResponse | undefined,
  })

  const buttonState = createMixedState(
    states.copyLoading,
    states.addLoading,
    states.agent,
    form.type
  )

  const handleCopyCompose = (form: NewAgentRequest) => {
    const req = { ...form }
    if (states.explicitOnly.value) {
      req.name += '!'
    }
    states.copyLoading.set(true)
    api.agent
      .create(req)
      .then(async res => {
        await navigator.clipboard.writeText(res.data.compose)
        toast.success('Copied to clipboard')
        states.agent.set(res.data)
      })
      .catch(toastError)
      .finally(() => states.copyLoading.set(false))
  }

  const handleAddAgent = (form: NewAgentRequest) => {
    const agent = states.agent.value
    if (!agent) return
    states.addLoading.set(true)
    api.agent
      .verify({
        host: `${form.host}:${form.port}`,
        ca: agent.ca,
        client: agent.client,
        container_runtime: form.container_runtime ?? 'docker',
      })
      .then(async e => {
        if (states.addToConfig.value) {
          await addAgentToConfig(form.host, form.port)
        }
        return e
      })
      .then(async res => {
        states.agent.set(undefined)
        setOpen(false)
        toast.success('Agent added', { description: res.data.message })
      })
      .catch(toastError)
      .finally(() => states.addLoading.set(false))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={'outline'} size="sm">
          <Plus />
          Add agent
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex flex-col gap-2">
            <DialogTitle>Add New Agent</DialogTitle>
            <form.type.Render>
              {(agentType, setAgentType) => (
                <>
                  <div className="grid grid-cols-2 mt-2 border rounded-md">
                    {agentTypes.map(({ type, label, icon }) => (
                      <button
                        key={type}
                        type="button"
                        className={cn('px-3 py-1.5 flex items-center justify-between', {
                          'bg-accent/50 text-accent-foreground ring-1 rounded-md':
                            type === agentType,
                        })}
                        onClick={() => setAgentType(type as NewAgentRequest['type'])}
                      >
                        <div className="flex items-center gap-2">
                          {icon}
                          {label}
                        </div>
                        {type === agentType && <Check className="size-4" />}
                      </button>
                    ))}
                  </div>
                  <DialogDescription>
                    The agent must be running on the system to connect.
                    <br /> Copy the{' '}
                    {agentType === 'docker' ? <Code>compose.yml</Code> : 'shell command'} below to
                    add the agent to the system.
                  </DialogDescription>
                </>
              )}
            </form.type.Render>
          </div>
        </DialogHeader>
        <FieldGroup className="gap-4">
          <StoreFormInputField
            state={form.name}
            orientation="horizontal"
            labelProps={{ className: minWidth }}
          />
          <StoreFormInputField
            state={form.host}
            title="Host / IP"
            orientation="horizontal"
            labelProps={{ className: minWidth }}
          />
          <StoreFormInputField
            state={form.port}
            type="number"
            orientation="horizontal"
            labelProps={{ className: minWidth }}
          />
          <StoreFormRadioField
            state={form.container_runtime}
            title="Runtime"
            orientation="horizontal"
            options={['docker', 'podman']}
            labelProps={{ className: minWidth }}
          />
          <StoreCheckboxField
            state={states.addToConfig}
            title="Add to Config"
            description={
              <>
                Add agent to <Code>config.yml</Code> under <Code>providers.agents</Code>
                <br /> This will remove all comments from the config file
              </>
            }
            labelProps={{ className: minWidth }}
          />
          <StoreCheckboxField
            state={states.explicitOnly}
            title="Explicit Only"
            description={
              <>
                Only containers with GoDoxy labels <Code>proxy.*</Code> will be proxied
              </>
            }
            labelProps={{ className: minWidth }}
          />
          <form.type.Show on={type => type === 'docker'}>
            <StoreFormCheckboxField
              state={form.nightly}
              title="Nightly"
              description="Nightly builds are less stable and may contain bugs"
              labelProps={{ className: minWidth }}
            />
          </form.type.Show>
        </FieldGroup>
        <DialogFooter>
          <buttonState.Render>
            {([copyLoading, addLoading, agent, type]) => (
              <>
                <Button
                  variant={'ghost'}
                  disabled={copyLoading}
                  onClick={form.handleSubmit(handleCopyCompose)}
                >
                  {copyLoading
                    ? 'Creating certificates…'
                    : `Copy ${type === 'docker' ? 'docker compose' : 'shell command'}`}
                </Button>
                <Button disabled={!agent || addLoading} onClick={form.handleSubmit(handleAddAgent)}>
                  {addLoading ? 'Adding…' : 'Add Agent'}
                </Button>
              </>
            )}
          </buttonState.Render>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
