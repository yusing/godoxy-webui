import type { ComponentProps } from 'react'

export const healthStatuses = [
  'healthy',
  'error',
  'unhealthy',
  'napping',
  'starting',
  'unknown',
] as const

export type HealthStatusType = (typeof healthStatuses)[number]

export const healthStatusColorsBg: Record<HealthStatusType, ComponentProps<'span'>['className']> = {
  healthy: 'bg-green-500',
  napping: 'bg-yellow-500',
  unhealthy: 'bg-orange-500',
  starting: 'bg-blue-500',
  error: 'bg-red-500',
  unknown: 'bg-gray-500',
} as const

export const healthStatusColorsFg: Record<HealthStatusType, string> = {
  healthy: 'text-green-500',
  napping: 'text-yellow-500',
  unhealthy: 'text-orange-500',
  starting: 'text-blue-500',
  error: 'text-red-500',
  unknown: 'text-gray-500',
} as const
