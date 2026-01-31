import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export default function Code({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <code
      className={cn(
        'bg-current/10 relative rounded p-0.5 font-mono text-xs font-semibold',
        className
      )}
    >
      {children}
    </code>
  )
}
