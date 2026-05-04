import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function IndentedListBody({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <div className={cn('border-l-3 border-foreground/85 pl-3', className)}>{children}</div>
}

type IndentedListBlockProps = {
  title: ReactNode
  /** Shown on the right of the title row (e.g. icon delete). */
  headerEnd?: ReactNode
  /** Use monospace title for config keys / identifiers. */
  titleMono?: boolean
  children: ReactNode
  className?: string
}

export function IndentedListBlock({
  title,
  headerEnd,
  titleMono = true,
  children,
  className,
}: IndentedListBlockProps) {
  return (
    <div className={cn('col-span-full flex min-w-0 flex-col gap-3', className)}>
      <div className="flex min-w-0 items-center justify-between gap-2">
        <div
          className={cn(
            'flex min-h-8 min-w-0 items-center text-sm font-medium tracking-tight text-foreground',
            titleMono && 'font-mono'
          )}
        >
          {title}
        </div>
        {headerEnd}
      </div>
      <IndentedListBody className="flex flex-col gap-4">{children}</IndentedListBody>
    </div>
  )
}
