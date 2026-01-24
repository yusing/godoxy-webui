import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

function DataList({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'w-full text-sm grid grid-cols-1 sm:grid-cols-[max-content_auto_1fr] gap-y-2 gap-x-4',
        className
      )}
      children={children}
      {...props}
    />
  )
}

function DataListRow({
  label,
  seperator,
  value,
  className,
  rowClassName,
  ...props
}: React.ComponentProps<'div'> & {
  label: string
  value: ReactNode
  seperator?: ReactNode
  rowClassName?: string
}) {
  // On mobile: show label on top of value
  // On desktop: show label and value side by side, 1:2 ratio
  return (
    <div className={cn('contents', rowClassName)} {...props}>
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className="hidden sm:inline-flex items-center">{seperator}</span>
      <span className={cn('min-w-0 w-full wrap-break-word', className)}>{value}</span>
    </div>
  )
}

export { DataList, DataListRow }
