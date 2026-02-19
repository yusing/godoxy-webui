import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useIsMobile } from '@/hooks/use-mobile'
import type { Container, ContainerImage, ProxmoxNodeConfig } from '@/lib/api'
import { type RouteKey, store } from '../store'

function formatContainerName(container?: Container, proxmox?: ProxmoxNodeConfig): React.ReactNode {
  if (container) {
    return container.container_name
  }
  if (proxmox) {
    if (proxmox.vmid) {
      return (
        <>
          <span>
            {proxmox.vmname} ({proxmox.vmid})
          </span>
          <span>from {proxmox.node}</span>
        </>
      )
    } else {
      return `Node ${proxmox.node}`
    }
  }
  return 'Unknown'
}

export default function LogsHeader({ routeKey }: { routeKey: RouteKey }) {
  const container = store.routeDetails[routeKey]?.container.use()
  const proxmox = store.routeDetails[routeKey]?.proxmox.use()
  const proxmoxStatus = store.proxmoxStats[routeKey]?.useCompute(line =>
    line ? (line.slice(0, line.indexOf('|')) as 'stopped' | 'running' | 'suspended') : undefined
  )
  const isMobile = useIsMobile()

  if (!container && !proxmox) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Label className="flex-col items-start">{formatContainerName(container, proxmox)}</Label>
      <Badge variant={'secondary'}>
        {container
          ? formatContainerImage(container.image)
          : proxmox?.files
            ? proxmox.files.join(',')
            : proxmox?.services
              ? proxmox.services.join(',')
              : !isMobile
                ? 'Services or files not set'
                : null}
      </Badge>
      <div
        className={`w-2 h-2 rounded-full bg-${containerStatusColors[container?.state ?? proxmoxStatus ?? 'stopped']}-400`}
      />
      <div className="md:flex-1" />
      <div className="flex items-center gap-2 ml-4">
        <AutoScrollSwitch />
        <Label>Auto scroll</Label>
      </div>
    </div>
  )
}

function AutoScrollSwitch() {
  const [autoScroll, setAutoScroll] = store.logsAutoScroll.useState()

  return <Switch checked={autoScroll} onCheckedChange={value => setAutoScroll(value)} />
}

function formatContainerImage(image: ContainerImage) {
  if (image.tag) {
    return `${image.author}/${image.name}:${image.tag}`
  }
  return `${image.author}/${image.name}`
}

const containerStatusColors = {
  created: 'gray',
  running: 'green',
  paused: 'yellow', // idlewatcher
  suspended: 'yellow', // proxmox
  restarting: 'orange',
  removing: 'orange',
  exited: 'yellow', // idlewatcher
  stopped: 'red', // proxmox
  dead: 'red',
}
