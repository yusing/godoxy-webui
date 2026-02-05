import { store, type RouteKey } from '@/components/routes/store'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { IconPlayerPlay, IconRotate, IconSquare } from '@tabler/icons-react'
import { useState } from 'react'
import { toast } from 'sonner'

const containerActions = [
  {
    label: 'Start',
    Icon: IconPlayerPlay,
    variant: 'default' as const,
    className: 'bg-info hover:bg-info/80 text-info-foreground',
    enableIfDocker: (running: boolean) => !running,
    enableIfProxmox: (status: string) => status !== 'running',
  },
  {
    label: 'Stop',
    Icon: IconSquare,
    variant: 'destructive' as const,
    enableIfDocker: (running: boolean) => running,
    enableIfProxmox: (status: string) => status === 'running',
  },
  {
    label: 'Restart',
    Icon: IconRotate,
    variant: 'secondary' as const,
    enableIfDocker: (running: boolean) => running,
    enableIfProxmox: (status: string) => status === 'running',
  },
]

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

  const handleAction = async (action: (typeof containerActions)[number]) => {
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

  const isActionEnabled = (action: (typeof containerActions)[number]) => {
    if (isLoading !== null) return false

    if (isDocker) {
      return action.enableIfDocker(dockerRunning ?? false)
    }
    if (isProxmoxLXC) {
      return action.enableIfProxmox(proxmoxStatus ?? '')
    }
    return false
  }

  return (
    <ButtonGroup orientation="horizontal">
      {containerActions.map(action => (
        <Button
          key={action.label}
          variant={action.variant}
          size="sm"
          disabled={!isActionEnabled(action)}
          isLoading={isLoading === action.label}
          data-slot="button"
          onClick={() => handleAction(action)}
          className={action.className}
        >
          <Tooltip>
            <TooltipTrigger render={() => <action.Icon className="size-3 text-inherit" />} />
            <TooltipContent>{action.label}</TooltipContent>
          </Tooltip>
        </Button>
      ))}
    </ButtonGroup>
  )
}
