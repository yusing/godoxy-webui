import type { FieldPath } from 'juststore'
import { formatDuration } from '@/lib/format'
import { Progress } from '../ui/progress'
import { type Store, store } from './store'

export default function SystemStatValue({
  valueKey,
  type,
  label,
}: {
  valueKey: FieldPath<Store['systemInfo']>
  type: 'text' | 'progress' | 'duration'
  label: string
}) {
  const state = store.systemInfo[valueKey]
  const displayValue = state.useCompute(value => {
    if (type === 'duration') {
      return formatDuration(value, { unit: 's' })
    }
    if (type === 'progress') {
      return `${value}%`
    }
    return String(value)
  })
  return (
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-muted-foreground hidden sm:block">{label}</p>
      {type === 'text' ? (
        <p className="text-sm sm:text-base font-semibold truncate">{displayValue}</p>
      ) : (
        <div className="space-y-2">
          <p className="text-sm sm:text-base font-semibold">{displayValue}</p>
          {type === 'progress' && (
            <state.Render>
              {value => <Progress value={value} className="h-2 hidden sm:block" />}
            </state.Render>
          )}
        </div>
      )}
    </div>
  )
}
