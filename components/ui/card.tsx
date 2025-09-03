import * as React from 'react'

import { cn } from '@/lib/utils'
import { cva } from 'class-variance-authority'

type CardProps = React.ComponentProps<'div'> & {
  shrink?: boolean
}

function Card({ className, shrink = false, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        'flex flex-col gap-4 rounded-md border shadow-sm',
        shrink ? 'py-2 sm:py-4' : 'py-4',
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-4',
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  )
}

const cardContentVariants = cva('px-4', {
  variants: {
    flex: {
      true: 'flex flex-col gap-4',
    },
  },
})

function CardContent({
  className,
  flex = false,
  ...props
}: React.ComponentProps<'div'> & { flex?: boolean }) {
  return (
    <div
      data-slot="card-content"
      className={cn(cardContentVariants({ flex }), className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-4 [.border-t]:pt-4', className)}
      {...props}
    />
  )
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
