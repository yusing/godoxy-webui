'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as React from 'react'

import { cn } from '@/lib/utils'

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          'bg-accent/70 text-accent-foreground border-accent/70 backdrop-blur-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance',
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-accent/70 fill-accent/70 z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

interface TooltipItemProps {
  icon: React.ReactNode
  label: string
  value: string
  valueClassName?: string
  isLastItem?: boolean
}

function TooltipItem({ icon, label, value, valueClassName, isLastItem }: TooltipItemProps) {
  return (
    <div
      className={cn('flex items-start gap-3 py-1.5', !isLastItem && 'border-b border-border/30')}
    >
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </div>
        <div
          className={cn(
            'text-sm font-medium break-words leading-tight',
            valueClassName || 'text-foreground'
          )}
        >
          {value}
        </div>
      </div>
    </div>
  )
}

export {
  Tooltip,
  TooltipContent,
  TooltipItem,
  TooltipProvider,
  TooltipTrigger,
  type TooltipItemProps,
}
