import { ChevronDown, Plus } from 'lucide-react'
import React, { Children, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type FormContainerProps = {
  label?: string
  description?: ReactNode
  badge?: ReactNode
  card?: boolean
  grid?: boolean
  level?: number
  footer?: ReactNode
  required?: boolean
  onAdd?: () => void
  canAdd?: boolean
  readonly?: boolean
  children: ReactNode
}

export function FormContainer({
  label,
  description,
  badge,
  card = true,
  grid = true,
  level = 0,
  footer,
  required,
  onAdd,
  canAdd,
  readonly = false,
  children,
}: FormContainerProps) {
  'use memo'

  const nChildren = Children.count(children)
  const hasChildren = nChildren > 0
  const collapsible = level > 1
  const defaultOpen = hasChildren && (required || nChildren === 1)

  const title = card ? (
    <div className="flex gap-4 items-center">
      <CardTitle>{label}</CardTitle>
      {badge}
    </div>
  ) : (
    <Label className={cn(level > 0 && 'block text-sm capitalize')}>{label}</Label>
  )

  const desc = description ? (
    card ? (
      <CardDescription>{description}</CardDescription>
    ) : (
      <code className="block text-left text-xs text-muted-foreground">{description}</code>
    )
  ) : null

  /** Non-card: stack under title like StoreFieldInput (label + key line). */
  const nonCardFieldLabelStack =
    !card && (label || description) ? (
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 items-start">
        {label ? title : null}
        {description ? desc : null}
      </div>
    ) : null

  const header = card ? (
    <div className="flex items-center gap-2">
      {collapsible ? (
        <CollapsibleTrigger className="flex w-full items-center gap-2 text-left cursor-pointer *:cursor-pointer">
          {title}
          <ChevronDown className="ml-auto size-4 shrink-0 transition-transform group-data-open:rotate-180" />
        </CollapsibleTrigger>
      ) : (
        title
      )}
      {!hasChildren && canAdd && onAdd && (
        <Button type="button" variant="ghost" size="icon" onClick={onAdd}>
          <Plus />
        </Button>
      )}
    </div>
  ) : collapsible ? (
    <div className="flex w-full items-start gap-2">
      <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-2 rounded-md text-left cursor-pointer outline-none *:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        {nonCardFieldLabelStack}
        <ChevronDown className="size-4 shrink-0 transition-transform group-data-open:rotate-180" />
      </CollapsibleTrigger>
      {!hasChildren && canAdd && onAdd && (
        <Button type="button" variant="ghost" size="icon" onClick={onAdd} className="shrink-0">
          <Plus />
        </Button>
      )}
    </div>
  ) : (
    <div className="flex items-center gap-2">
      {title}
      {!hasChildren && canAdd && onAdd && (
        <Button type="button" variant="ghost" size="icon" onClick={onAdd}>
          <Plus />
        </Button>
      )}
    </div>
  )

  const content =
    hasChildren &&
    (card ? (
      <CardContent
        className={cn(grid ? 'grid grid-cols-1 2xl:grid-cols-2 gap-3' : 'flex flex-col gap-3')}
      >
        {children}
      </CardContent>
    ) : (
      <div
        className={cn(
          grid
            ? 'grid grid-cols-1 2xl:grid-cols-2 gap-3 has-[&>input]:mt-4 has-[&>select]:mt-4 has-[&>label]:mt-4'
            : 'flex flex-col gap-3',
          level > 0 && hasChildren && 'p-2 border-l-3 border-border'
        )}
      >
        {children}
      </div>
    ))

  const foot = (
    <>
      {hasChildren &&
        canAdd &&
        onAdd &&
        (card ? (
          <CardFooter className="p-0">
            <FooterAddButton onAdd={onAdd} label={label} card={true} />
          </CardFooter>
        ) : (
          <div data-slot="card-footer" className="pt-4">
            <FooterAddButton onAdd={onAdd} label={label} />
          </div>
        ))}
      {footer &&
        (card ? (
          <CardFooter className="p-2">{footer}</CardFooter>
        ) : (
          <div data-slot="card-footer" className="pt-4">
            {footer}
          </div>
        ))}
    </>
  )

  function Content(props: React.PropsWithChildren) {
    if (collapsible) {
      return <CollapsibleContent>{props.children}</CollapsibleContent>
    }
    return props.children
  }

  const result = card ? (
    <Card aria-required={required || undefined} className={cn(readonly && 'opacity-60 grayscale')}>
      <CardHeader>
        {header}
        {desc}
      </CardHeader>
      <Content>
        {content}
        {foot}
      </Content>
    </Card>
  ) : (
    <div
      aria-required={required || undefined}
      className={cn('flex min-w-0 flex-col gap-2', readonly && 'opacity-60 grayscale')}
    >
      {header}
      <Content>
        {collapsible ? null : desc}
        {content}
        {foot}
      </Content>
    </div>
  )

  if (collapsible) {
    return (
      <Collapsible className="group" defaultOpen={defaultOpen}>
        {result}
      </Collapsible>
    )
  }

  return result
}

function FooterAddButton({
  onAdd,
  card = true,
  label,
}: {
  onAdd: () => void
  card?: boolean
  label?: string
}) {
  return (
    <Button
      type="button"
      size={card ? 'icon-sm' : 'icon'}
      className="w-full rounded-sm flex items-center gap-2 text-xs"
      variant="ghost"
      onClick={onAdd}
      title={`Add item to ${label}`}
    >
      <Plus /> {label}
    </Button>
  )
}
