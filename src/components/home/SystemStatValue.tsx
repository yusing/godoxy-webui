import { type FieldPath, Render } from 'juststore'
import { formatDuration } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Progress } from '../ui/progress'
import { type Store, store } from './store'

export default function SystemStatValue({
  valueKey,
  descriptionKey,
  type,
}: {
  valueKey: FieldPath<Store['systemInfo']>
  descriptionKey?: FieldPath<Store['systemInfo']>
  type: 'text' | 'progress' | 'duration'
}) {
  const state = store.systemInfo[valueKey]
  return (
    <>
      <DisplayValue valueKey={valueKey} type={type} />
      <div className="flex items-center justify-start">
        <Description descriptionKey={descriptionKey} type={type} />
      </div>
      {type === 'progress' && (
        <Render state={state}>{value => <Progress value={Number(value)} />}</Render>
      )}
      {type === 'duration' && (
        <span className="text-xs text-muted-foreground">since last restart</span>
      )}
    </>
  )
}

function DisplayValue({
  valueKey,
  type,
}: {
  valueKey: FieldPath<Store['systemInfo']>
  type: 'text' | 'progress' | 'duration'
}) {
  const displayValue = store.systemInfo[valueKey].useCompute(value => {
    if (type === 'duration') {
      return formatDuration(Number(value), { unit: 's' })
    }
    if (type === 'progress') {
      return `${value}%`
    }
    return String(value)
  })
  return <div className="text-xl font-semibold tracking-tight tabular-nums">{displayValue}</div>
}

function Description({
  descriptionKey,
  type,
}: {
  descriptionKey?: FieldPath<Store['systemInfo']>
  type: 'text' | 'progress' | 'duration'
}) {
  const value = store.systemInfo[descriptionKey ?? 'uptime'].use()
  return (
    <span
      className={cn(
        'text-xs text-muted-foreground tabular-nums',
        !descriptionKey && 'invisible',
        type !== 'progress' && 'hidden'
      )}
    >
      {value}
    </span>
  )
}
