import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { Container, ContainerImage } from '@/lib/api'
import { store } from '../store'

export default function ContainerLogsHeader({ container }: { container: Container }) {
  return (
    <div className="flex items-center gap-2">
      <Label>{container.container_name}</Label>
      <Badge variant={'secondary'}>{formatContainerImage(container.image)}</Badge>
      <div className={`w-2 h-2 rounded-full bg-${containerStatusColors[container.state]}-400`} />
      <div className="flex-1" />
      <div className="flex gap-2 ml-4">
        <AutoScrollSwitch />
        <Label>Auto scroll</Label>
      </div>
    </div>
  )
}

function AutoScrollSwitch() {
  const [autoScroll, setAutoScroll] = store.use('logsAutoScroll')

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
  restarting: 'orange',
  removing: 'orange',
  exited: 'yellow', // idlewatcher
  dead: 'red',
}
