import type { HealthInfoWithoutDetail } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function HealthBadge({
  status,
  compact,
}: {
  status: HealthInfoWithoutDetail['status'] | undefined
  compact?: boolean
}) {
  // Extract status string, default to 'unknown'
  const s = status ?? 'unknown'

  let label = 'Unknown'
  let className = 'bg-muted text-muted-foreground'

  // Map status to label and color
  switch (s) {
    case 'healthy':
      label = compact ? 'OK' : 'Healthy'
      className = 'bg-success/25 text-success-foreground'
      break
    case 'unhealthy':
    case 'error':
      label = compact ? 'ERR' : s === 'error' ? 'Error' : 'Unhealthy'
      className = 'bg-destructive/20 text-destructive'
      break
    case 'napping':
      label = compact ? 'NAP' : 'Napping'
      className = 'bg-yellow-500/25 text-yellow-500'
      break
    case 'starting':
      label = compact ? 'INIT' : 'Starting'
      className = 'bg-blue-500/25 text-blue-500'
      break
    case 'unknown':
    default:
      label = compact ? '??' : 'Unknown'
      className = 'bg-muted text-muted-foreground'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        compact && 'rounded-full px-1.5 py-0 text-[10px] leading-4',
        className
      )}
    >
      {label}
    </span>
  )
}
