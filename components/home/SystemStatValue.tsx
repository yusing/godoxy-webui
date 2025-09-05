'use client'
import type { FieldPath } from 'react-hook-form'
import { Progress } from '../ui/progress'
import { store, type Store } from './store'

export default function SystemStatValue({
  valueKey,
  type,
  label,
}: {
  valueKey: FieldPath<Store['systemInfo']>
  type: 'text' | 'progress'
  label: string
}) {
  const value = store.systemInfo[valueKey].use()
  return (
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-muted-foreground hidden sm:block">{label}</p>
      {type === 'text' ? (
        <p className="text-sm sm:text-base font-semibold truncate">{String(value)}</p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm sm:text-base font-semibold">{String(value)}%</p>
          <Progress value={value as number} className="h-2 hidden sm:block" />
        </div>
      )}
    </div>
  )
}
