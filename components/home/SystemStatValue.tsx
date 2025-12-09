'use client'
import { formatDuration } from '@/lib/format'
import type { FieldPath } from 'juststore'
import { useMemo } from 'react'
import { Progress } from '../ui/progress'
import { store, type Store } from './store'

export default function SystemStatValue({
  valueKey,
  type,
  label,
}: {
  valueKey: FieldPath<Store['systemInfo']>
  type: 'text' | 'progress' | 'duration'
  label: string
}) {
  const value = store.systemInfo[valueKey].use()
  const displayValue = useMemo(() => {
    if (type === 'duration') {
      return formatDuration(value, { unit: 's' })
    }
    if (type === 'progress') {
      return `${value}%`
    }
    return String(value)
  }, [value, type])
  return (
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-muted-foreground hidden sm:block">{label}</p>
      {type === 'text' ? (
        <p className="text-sm sm:text-base font-semibold truncate">{displayValue}</p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm sm:text-base font-semibold">{displayValue}</p>
          {type === 'progress' && (
            <Progress value={value as number} className="h-2 hidden sm:block" />
          )}
        </div>
      )}
    </div>
  )
}
