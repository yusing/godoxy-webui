import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { Container, ContainerImage, ProxmoxNodeConfig } from '@/lib/api'
import { type RouteKey, store } from '../store'

function formatContainerName(
  container?: Container | null,
  proxmox?: ProxmoxNodeConfig | null
): React.ReactNode {
  if (container) {
    return container.container_name
  }
  if (proxmox) {
    if (proxmox.vmid) {
      return (
        <>
          <span className="md:whitespace-nowrap">
            {proxmox.vmname} ({proxmox.vmid})
          </span>
          <span className="md:whitespace-nowrap">from {proxmox.node}</span>
        </>
      )
    } else {
      return `Node ${proxmox.node}`
    }
  }
  return 'Unknown'
}

export function getLogSourceBadgeText(
  container?: Container | null,
  proxmox?: ProxmoxNodeConfig | null
): string {
  if (container) {
    return formatContainerImage(container.image)
  }
  if (proxmox?.files?.length) {
    return proxmox.files.join(',')
  }
  if (proxmox?.services?.length) {
    return proxmox.services.join(',')
  }
  return 'Services or files not set'
}

export default function LogsHeader({ routeKey }: { routeKey: RouteKey }) {
  const container = store.routeDetails[routeKey]?.container.use()
  const proxmox = store.routeDetails[routeKey]?.proxmox.use()
  const proxmoxStatus = store.proxmoxStats[routeKey]?.useCompute(line =>
    line ? (line.slice(0, line.indexOf('|')) as 'stopped' | 'running' | 'suspended') : undefined
  )

  if (!container && !proxmox) {
    return null
  }

  return (
    <div className="flex items-center justify-between gap-2 md:items-center md:gap-3">
      <Label className="flex flex-wrap md:flex-row md:items-center md:gap-1 md:whitespace-nowrap md:justify-start">
        {formatContainerName(container, proxmox)}
      </Label>
      <div className="flex shrink-0 items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full bg-${containerStatusColors[container?.state ?? proxmoxStatus ?? 'stopped']}-400`}
        />
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
