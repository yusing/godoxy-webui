import { Check, Plus } from 'lucide-react'
import {
  Conditional,
  createMixedState,
  Render,
  RenderWithUpdate,
  useForm,
  useMemoryStore,
} from 'juststore'
import { useState } from 'react'
import { toast } from 'sonner'
import { StoreCheckboxField, StoreFormCheckboxField } from '@/components/store/Checkbox'
import { StoreFormInputField } from '@/components/store/Input'
import { StoreFormRadioField } from '@/components/store/Radio'
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
import type { NewAgentRequest, NewAgentResponse } from '@/lib/api'
import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { applyAgentStore } from './AllSystemInfoProvider'
import { cn } from '@/lib/utils'
import Docker from '../svg/docker'
import Linux from '../svg/linux'
import { FieldGroup } from '../ui/field'

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

type VerifyAndStoreAgentParams = {
  request: Pick<NewAgentRequest, 'host' | 'port' | 'container_runtime'>
  agent: NewAgentResponse
  addToConfig: boolean
}

export async function verifyAndStoreAgent({
  request,
  agent,
  addToConfig,
}: VerifyAndStoreAgentParams) {
  const response = await api.agent.verify({
    host: `${request.host}:${request.port}`,
    ca: agent.ca,
    client: agent.client,
    container_runtime: request.container_runtime ?? 'docker',
    add_to_config: addToConfig,
  })

  applyAgentStore(response.data.agents)
  return response.data
}

const minWidth = 'min-w-[120px]'

export function AddAgentDialogButton({ className }: { className?: string }) {
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

  const handleCopyCompose = (request: NewAgentRequest) => {
    const req = { ...request }
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

  const handleAddAgent = (request: NewAgentRequest) => {
    const agent = states.agent.value
    if (!agent) return
    states.addLoading.set(true)
    verifyAndStoreAgent({
      request,
      agent,
      addToConfig: states.addToConfig.value,
    })
      .then(res => {
        setOpen(false)
        toast.success('Agent added', { description: res.message })
      })
      .catch(toastError)
      .finally(() => states.addLoading.set(false))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        setOpen(nextOpen)
        if (!nextOpen) {
          states.agent.reset()
        }
      }}
    >
      <DialogTrigger render={<Button variant={'outline'} size="sm" className={className} />}>
        <Plus />
        Add agent
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex flex-col gap-2">
            <DialogTitle>Add New Agent</DialogTitle>
            <RenderWithUpdate state={form.type}>
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
            </RenderWithUpdate>
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
            options={['docker', 'podman']}
            labelProps={{ className: minWidth }}
          />
          <StoreCheckboxField
            state={states.addToConfig}
            title="Add to Config"
            descriptionVariant="tooltip"
            description={
              <div className="flex flex-col gap-1 text-nowrap">
                <span>
                  Add agent to <Code>config.yml</Code> under <Code>providers.agents</Code>.
                </span>
                <span>This will remove all comments from the config file</span>
              </div>
            }
            labelProps={{ className: minWidth }}
          />
          <StoreCheckboxField
            state={states.explicitOnly}
            title="Explicit Only"
            descriptionVariant="tooltip"
            description={
              <>
                Only containers with GoDoxy labels <Code>proxy.*</Code> will be proxied
              </>
            }
            labelProps={{ className: minWidth }}
          />
          <Conditional state={form.type} on={type => type === 'docker'}>
            <StoreFormCheckboxField
              state={form.nightly}
              title="Nightly"
              descriptionVariant="tooltip"
              description="Nightly builds are less stable and may contain bugs"
              labelProps={{ className: minWidth }}
            />
          </Conditional>
        </FieldGroup>
        <DialogFooter>
          <Render state={buttonState}>
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
          </Render>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
