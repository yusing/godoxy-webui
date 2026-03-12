import { IconArrowDown, IconArrowUp } from '@tabler/icons-react'
import { type FieldPath, Render } from 'juststore'
import { formatBytes, formatDuration } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Progress } from '../ui/progress'
import { type Store, store } from './store'

export type SystemStatValueType = 'text' | 'progress' | 'duration' | 'upload' | 'download'

export default function SystemStatValue({
  valueKey,
  descriptionKey,
  type,
}: {
  valueKey: FieldPath<Store['systemInfo']>
  descriptionKey?: FieldPath<Store['systemInfo']>
  type: SystemStatValueType
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
  type: SystemStatValueType
}) {
  const displayValue = store.systemInfo[valueKey].useCompute(value => {
    switch (type) {
      case 'duration':
        return formatDuration(Number(value), { unit: 's' })
      case 'progress':
        return `${value}%`
      case 'upload':
        return (
          <>
            <IconArrowUp className="size-4 text-green-500" />{' '}
            {formatBytes(Number(value), { precision: 0, unit: '/s' })}
          </>
        )
      case 'download':
        return (
          <>
            <IconArrowDown className="size-4 text-red-500" />{' '}
            {formatBytes(Number(value), { precision: 0, unit: '/s' })}
          </>
        )
      default:
        return String(value)
    }
  })
  const isTextLike = type === 'text' || type === 'upload' || type === 'download'
  return (
    <div
      className={cn(
        'font-semibold tracking-tight tabular-nums',
        isTextLike
          ? 'text-base sm:text-lg leading-tight whitespace-nowrap'
          : 'text-base sm:text-xl leading-none',
        isTextLike && 'flex items-center gap-1'
      )}
    >
      {displayValue}
    </div>
  )
}

function Description({
  descriptionKey,
  type,
}: {
  descriptionKey?: FieldPath<Store['systemInfo']>
  type: SystemStatValueType
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
