import type { RoutesHealthInfo } from '@/lib/api'
import type { ComponentProps } from 'react'

export const healthStatuses: HealthStatusType[] = [
  'healthy',
  'error',
  'unhealthy',
  'napping',
  'starting',
  'unknown',
  'stopped',
] as const
export type HealthStatusType = RoutesHealthInfo['status'] | 'stopped'

export const healthStatusColorsBg: Record<HealthStatusType, ComponentProps<'span'>['className']> = {
  healthy: 'bg-green-500',
  napping: 'bg-yellow-500',
  unhealthy: 'bg-orange-500',
  starting: 'bg-blue-500',
  error: 'bg-red-500',
  unknown: 'bg-gray-500',
  stopped: 'bg-gray-500',
} as const

export const healthStatusColorsFg: Record<HealthStatusType, string> = {
  healthy: 'text-green-500',
  napping: 'text-yellow-500',
  unhealthy: 'text-orange-500',
  starting: 'text-blue-500',
  error: 'text-red-500',
  unknown: 'text-gray-500',
  stopped: 'text-gray-500',
} as const

export type HealthMap = Record<string, RoutesHealthInfo>

export const healthInfoUnknown: RoutesHealthInfo = {
  status: 'unknown',
  uptime: -1,
  latency: -1,
  detail: '',
}
