import { cn } from '@/lib/utils'
import * as React from 'react'

export function Kbd({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium leading-4 text-muted-foreground shadow-sm',
        className
      )}
      {...props}
    />
  )
}

export default Kbd
