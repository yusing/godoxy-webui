import { Loader2, Play, RotateCw, Square } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { store } from '@/components/routes/store'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  getContainerControlTarget,
  isProxmoxActionEnabled,
  runContainerAction,
} from '@/lib/container-control'
import { toastError } from '@/lib/toast'
import { cn } from '@/lib/utils'

const containerActions = [
  {
    action: 'start',
    label: 'Start',
    Icon: Play,
    enableIfDocker: (running: boolean) => !running,
  },
  {
    action: 'stop',
    label: 'Stop',
    Icon: Square,
    enableIfDocker: (running: boolean) => running,
  },
  {
    action: 'restart',
    label: 'Restart',
    Icon: RotateCw,
    enableIfDocker: (running: boolean) => running,
  },
] as const

type ContainerAction = (typeof containerActions)[number]

function actionToneClass(label: ContainerAction['label']) {
  switch (label) {
    case 'Start':
      return 'text-emerald-500 hover:bg-emerald-500/10'
    case 'Stop':
      return 'text-rose-500 hover:bg-rose-500/10'
    default:
      return 'text-amber-500 hover:bg-amber-500/10'
  }
}

export default function ContainerControls({ routeKey }: { routeKey: string }) {
  const [containerId, dockerRunning] = store.useCompute(
    'routeDetails',
    data => [data[routeKey]?.container?.container_id, data[routeKey]?.container?.running],
    [routeKey]
  )
  const proxmoxConfig = store.useCompute('routeDetails', data => data[routeKey]?.proxmox, [
    routeKey,
  ])
  const proxmoxStatus = store.useCompute(
    'proxmoxStats',
    data => data[routeKey]?.split('|')[0] ?? '',
    [routeKey]
  )
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const control = getContainerControlTarget(containerId, proxmoxConfig)

  if (!control) {
    return null
  }

  const handleAction = async (action: ContainerAction) => {
    if (isLoading) return

    setIsLoading(action.label)
    try {
      const res = await runContainerAction(action.action, control)
      toast.success(res.data.message)
    } catch (error) {
      toastError(error as Error)
    } finally {
      setIsLoading(null)
    }
  }

  const isActionEnabled = (action: ContainerAction) => {
    if (isLoading !== null) return false

    if (control.type === 'docker') {
      return action.enableIfDocker(dockerRunning ?? false)
    }
    return isProxmoxActionEnabled(action.action, proxmoxStatus ?? '')
  }

  return (
    <div className="flex items-center gap-2">
      {containerActions.map(action => (
        <Button
          key={action.label}
          variant="ghost"
          size="icon-sm"
          disabled={!isActionEnabled(action)}
          onClick={() => handleAction(action)}
          className={cn(
            'border-0 bg-transparent p-0 shadow-none hover:bg-transparent disabled:opacity-80',
            actionToneClass(action.label),
            !isActionEnabled(action) && 'opacity-40'
          )}
        >
          <Tooltip>
            <TooltipTrigger
              render={() =>
                isLoading === action.label ? (
                  <Loader2 className="size-4 animate-spin text-inherit" />
                ) : (
                  <action.Icon className="size-4 text-inherit" />
                )
              }
            />
            <TooltipContent>{action.label}</TooltipContent>
          </Tooltip>
        </Button>
      ))}
    </div>
  )
}
