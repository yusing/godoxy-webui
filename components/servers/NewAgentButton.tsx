import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { type AgentContainerRuntime, type NewAgentRequest, type NewAgentResponse } from '@/lib/api'
import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { cn } from '@/lib/utils'
import type { Config } from '@/types/godoxy'
import { Check, Info, Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { parse as parseYAML, stringify as stringifyYAML } from 'yaml'
import Docker from '../svg/docker'
import Linux from '../svg/linux'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
const agentTypes = [
  {
    type: 'docker',
    label: 'Docker',
    icon: <Docker />,
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
  const [copyLoading, setCopyLoading] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const form = useForm<NewAgentRequest>({
    defaultValues: {
      name: '',
      host: '',
      port: 8890,
      nightly: false,
      container_runtime: 'docker',
      type: 'docker',
    },
  })

  const agentType = form.watch('type')
  const [explicitOnly, setExplicitOnly] = useState(false)
  const [addToConfig, setAddToConfig] = useState(true)
  const [agent, setAgent] = useState<NewAgentResponse | null>(null)

  const handleCopyCompose = (form: NewAgentRequest) => {
    const req = { ...form }
    if (explicitOnly) {
      req.name += '!'
    }
    setCopyLoading(true)
    api.agent
      .create(req)
      .then(async res => {
        await navigator.clipboard.writeText(res.data.compose)
        toast.success('Copied to clipboard')
        setAgent(res.data)
      })
      .catch(toastError)
      .finally(() => setCopyLoading(false))
  }

  const handleAddAgent = (form: NewAgentRequest) => {
    if (!agent) return
    setAddLoading(true)
    api.agent
      .verify({
        host: `${form.host}:${form.port}`,
        ca: agent.ca,
        client: agent.client,
        container_runtime: form.container_runtime ?? 'docker',
      })
      .then(async e => {
        if (addToConfig) {
          await addAgentToConfig(form.host, form.port)
        }
        return e
      })
      .then(async res => {
        setAgent(null)
        setOpen(false)
        toast.success('Agent added', { description: res.data.message })
      })
      .catch(toastError)
      .finally(() => setAddLoading(false))
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
            <div className="grid grid-cols-2 mt-2 border rounded-md">
              {agentTypes.map(({ type, label, icon }) => (
                <button
                  key={type}
                  type="button"
                  className={cn('px-3 py-1.5 flex items-center justify-between', {
                    'bg-accent/50 text-accent-foreground ring-1 rounded-md': type === agentType,
                  })}
                  onClick={() => form.setValue('type', type as NewAgentRequest['type'])}
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
              <br /> Copy the {agentType === 'docker' ? (
                <Code>compose.yml</Code>
              ) : (
                'shell command'
              )}{' '}
              below to add the agent to the system.
            </DialogDescription>
          </div>
        </DialogHeader>
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormLabel className={minWidth}>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="host"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormLabel className={minWidth}>Host / IP</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormLabel className={minWidth}>Port</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={e => field.onChange(+e.target.value)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="container_runtime"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3">
                  <FormLabel className={minWidth}>Runtime</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value ?? 'docker'}
                      onValueChange={e => field.onChange(e as AgentContainerRuntime)}
                      className="grid-cols-3 w-full"
                    >
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <RadioGroupItem value="docker" />
                        </FormControl>
                        <FormLabel className={minWidth}>Docker</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <RadioGroupItem value="podman" />
                        </FormControl>
                        <FormLabel className={minWidth}>Podman</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center gap-3">
                        <FormControl>
                          <RadioGroupItem value="nerdctl" disabled={agentType !== 'system'} />
                        </FormControl>
                        <FormLabel className={minWidth}>Nerdctl</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex items-center gap-3">
              <FormLabel className={minWidth}>
                Add to Config
                <ToggleTip>
                  Add agent to <Code>config.yml</Code> under <Code>providers.agents</Code>
                  <br /> This will remove all comments from the config file
                </ToggleTip>
              </FormLabel>
              <FormControl>
                <Checkbox
                  checked={addToConfig}
                  onCheckedChange={checked => setAddToConfig(checked === true)}
                />
              </FormControl>
            </div>
            <div className="flex items-center gap-3">
              <FormLabel className={cn(minWidth)}>
                Explicit Only
                <ToggleTip>
                  When enabled, only containers with GoDoxy labels <Code>proxy.*</Code> will be
                  proxied
                </ToggleTip>
              </FormLabel>
              <FormControl>
                <Checkbox
                  checked={explicitOnly}
                  onCheckedChange={checked => setExplicitOnly(checked === true)}
                />
              </FormControl>
            </div>
            {agentType === 'docker' && (
              <FormField
                control={form.control}
                name="nightly"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormLabel className={minWidth}>
                      Nightly
                      <ToggleTip>Nightly builds are less stable and may contain bugs</ToggleTip>
                    </FormLabel>
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={checked => field.onChange(checked === true)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </div>
        </Form>
        <DialogFooter>
          <Button
            variant={'ghost'}
            disabled={copyLoading}
            onClick={form.handleSubmit(handleCopyCompose)}
          >
            {copyLoading
              ? 'Creating certificates…'
              : `Copy ${agentType === 'docker' ? 'docker compose' : 'shell command'}`}
          </Button>
          <Button disabled={!agent || addLoading} onClick={form.handleSubmit(handleAddAgent)}>
            {addLoading ? 'Adding…' : 'Add Agent'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ToggleTip({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className={cn('size-4 m-0.5 ml-auto', className)} />
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  )
}
