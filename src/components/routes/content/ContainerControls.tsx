import { IconLoader2, IconPlayerPlay, IconRotate, IconSquare } from '@tabler/icons-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { type RouteKey, store } from '@/components/routes/store'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { cn } from '@/lib/utils'

const containerActions = [
  {
    label: 'Start',
    Icon: IconPlayerPlay,
    tone: 'start',
    enableIfDocker: (running: boolean) => !running,
    enableIfProxmox: (status: string) => status !== 'running',
  },
  {
    label: 'Stop',
    Icon: IconSquare,
    tone: 'stop',
    enableIfDocker: (running: boolean) => running,
    enableIfProxmox: (status: string) => status === 'running',
  },
  {
    label: 'Restart',
    Icon: IconRotate,
    tone: 'restart',
    enableIfDocker: (running: boolean) => running,
    enableIfProxmox: (status: string) => status === 'running',
  },
] as const

type ContainerAction = (typeof containerActions)[number]

export default function ContainerControls({ routeKey }: { routeKey: RouteKey }) {
  const containerId = store.routeDetails[routeKey]?.useCompute(
    details => details?.container?.container_id
  )
  const proxmoxConfig = store.routeDetails[routeKey]?.useCompute(details => details?.proxmox)
  const dockerRunning = store.dockerStats[routeKey]?.useCompute(stats => stats?.running ?? false)
  const proxmoxStatus = store.proxmoxStats[routeKey]?.useCompute(line => line?.split('|')[0] ?? '')
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const isDocker = containerId !== undefined
  const isProxmoxLXC = proxmoxConfig && proxmoxConfig.vmid

  if (!isDocker && !isProxmoxLXC) {
    return null
  }

  const handleAction = async (action: ContainerAction) => {
    if (isLoading) return

    setIsLoading(action.label)
    try {
      let promise: Promise<{ data: { message: string } }>

      if (isDocker && containerId) {
        switch (action.label) {
          case 'Start':
            promise = api.docker.start({ id: containerId })
            break
          case 'Stop':
            promise = api.docker.stop({ id: containerId })
            break
          case 'Restart':
            promise = api.docker.restart({ id: containerId })
            break
          default:
            return
        }
      } else if (isProxmoxLXC && proxmoxConfig) {
        const { node, vmid } = proxmoxConfig
        switch (action.label) {
          case 'Start':
            promise = api.proxmox.lxcStart(node, vmid)
            break
          case 'Stop':
            promise = api.proxmox.lxcStop(node, vmid)
            break
          case 'Restart':
            promise = api.proxmox.lxcRestart(node, vmid)
            break
          default:
            return
        }
      } else {
        return
      }

      const res = await promise
      toast.success(res.data.message)
    } catch (error) {
      toastError(error as Error)
    } finally {
      setIsLoading(null)
    }
  }

  const isActionEnabled = (action: ContainerAction) => {
    if (isLoading !== null) return false

    if (isDocker) {
      return action.enableIfDocker(dockerRunning ?? false)
    }
    if (isProxmoxLXC) {
      return action.enableIfProxmox(proxmoxStatus ?? '')
    }
    return false
  }

  const actionToneClass = (label: ContainerAction['label']) => {
    switch (label) {
      case 'Start':
        return 'text-emerald-500 hover:bg-emerald-500/10'
      case 'Stop':
        return 'text-rose-500 hover:bg-rose-500/10'
      default:
        return 'text-amber-500 hover:bg-amber-500/10'
    }
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
                  <IconLoader2 className="size-4 animate-spin text-inherit" />
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
