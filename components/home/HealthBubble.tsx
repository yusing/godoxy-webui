import { cn } from '@/lib/utils'
import type { HealthStatusType } from '@/types/health'

export default function HealthBubble({ status }: { status: HealthStatusType }) {
  return <div className={cn(getClassName(status ?? 'unknown'), 'w-2 h-2 rounded-full')} />
}

function getClassName(status: HealthStatusType) {
  switch (status) {
    case 'healthy':
      return 'bg-green-500'
    case 'unhealthy':
      return 'bg-red-500'
    case 'napping':
      return 'bg-yellow-500'
    case 'starting':
      return 'bg-blue-500'
    case 'error':
      return 'bg-red-500'
    case 'unknown':
      return 'bg-gray-500'
    case 'stopped':
      return 'bg-gray-500'
  }
}
