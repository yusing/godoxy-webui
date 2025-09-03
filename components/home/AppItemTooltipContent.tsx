import type { RoutesHealthInfo } from '@/lib/api'
import { formatDuration } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  HelpCircle,
  Info,
  Pause,
  Play,
  XCircle,
  Zap,
} from 'lucide-react'
import { TooltipItem } from '../ui/tooltip'
import { store } from './store'

export default function AppItemTooltipContent({ alias }: { alias: string }) {
  const healthInfo = store.useValue(`health.${alias}`)

  if (!healthInfo) {
    return null
  }

  const StatusIcon = getStatusIcon(healthInfo.status)

  return (
    <div className="space-y-2 p-2">
      {/* Header with status */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
        <Activity className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">Service Health</span>
      </div>

      {/* Status */}
      <TooltipItem
        icon={<StatusIcon className={cn('w-4 h-4', getStatusColor(healthInfo.status))} />}
        label="Status"
        value={healthInfo.status}
        valueClassName={cn('capitalize font-medium', getStatusColor(healthInfo.status))}
      />

      {/* Uptime */}
      <TooltipItem
        icon={<Clock className="w-4 h-4 text-muted-foreground" />}
        label="Uptime"
        value={formatDuration(healthInfo.uptime, { unit: 'ms' })}
      />

      {/* Latency */}
      <TooltipItem
        icon={<Zap className="w-4 h-4 text-muted-foreground" />}
        label="Latency"
        value={formatDuration(healthInfo.latency, { unit: 'us' })}
      />

      {/* Detail */}
      {healthInfo.detail && (
        <TooltipItem
          icon={<Info className="w-4 h-4 text-muted-foreground" />}
          label="Info"
          value={healthInfo.detail}
          isLastItem
        />
      )}
    </div>
  )
}

const getStatusIcon = (status: RoutesHealthInfo['status']) => {
  switch (status) {
    case 'healthy':
      return CheckCircle
    case 'unhealthy':
      return XCircle
    case 'error':
      return AlertCircle
    case 'napping':
      return Pause
    case 'starting':
      return Play
    default:
      return HelpCircle
  }
}

const getStatusColor = (status: RoutesHealthInfo['status']) => {
  switch (status) {
    case 'healthy':
      return 'text-green-600 dark:text-green-400'
    case 'unhealthy':
      return 'text-red-600 dark:text-red-400'
    case 'error':
      return 'text-orange-600 dark:text-orange-400'
    case 'napping':
      return 'text-blue-600 dark:text-blue-400'
    case 'starting':
      return 'text-yellow-600 dark:text-yellow-400'
    default:
      return 'text-muted-foreground'
  }
}
