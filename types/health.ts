import type { RoutesHealthInfo } from '@/lib/api'

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

export const healthStatusColors = {
  healthy: 'green',
  napping: 'yellow',
  unhealthy: 'orange',
  starting: 'blue',
  error: 'red',
  unknown: 'gray',
  stopped: 'gray',
} as const

export type HealthMap = Record<string, RoutesHealthInfo>

export const healthInfoUnknown: RoutesHealthInfo = {
  status: 'unknown',
  uptime: -1,
  latency: -1,
  detail: '',
}
