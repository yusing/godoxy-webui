import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export default function Code({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <code
      className={cn(
        'bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
        className
      )}
    >
      {children}
    </code>
  )
}
