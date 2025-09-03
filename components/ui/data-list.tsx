import { cn } from '@/lib/utils'
import { useMemo, type ReactNode } from 'react'

function DataList({
  labels,
  className,
  ...props
}: React.ComponentProps<'div'> & { labels?: string[] }) {
  const longestLabel = useMemo(() => {
    if (!labels) return 10
    return Math.max(...labels.map(l => l.length))
  }, [labels])
  return (
    <div
      className={cn('w-full text-sm space-y-2', className)}
      {...props}
      style={
        {
          '--data-list-label-width': `${longestLabel}ch`,
        } as React.CSSProperties
      }
    />
  )
}

function DataListRow({
  label,
  seperator,
  value,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  label: string
  value: ReactNode
  seperator?: ReactNode
}) {
  // On mobile: show label on top of value
  // On desktop: show label and value side by side, 1:2 ratio
  return (
    <div className={cn('flex flex-col sm:flex-row sm:gap-4 items-center', className)} {...props}>
      <span className="text-muted-foreground w-[var(--data-list-label-width)] font-medium">
        {label}
      </span>
      {seperator}
      <span className="min-w-0 w-full break-words">{value}</span>
    </div>
  )
}

export { DataList, DataListRow }
