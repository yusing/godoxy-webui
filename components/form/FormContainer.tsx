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
import { IconChevronDown, IconPlus } from '@tabler/icons-react'
import { Children, type ReactNode } from 'react'

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

  const hasChildren = Children.count(children) > 0
  const collapsible = level > 1
  const defaultOpen = required && hasChildren

  const title = card ? (
    <div className="flex gap-4 items-center">
      <CardTitle>{label}</CardTitle>
      {badge}
    </div>
  ) : (
    <Label className={cn(level > 0 && 'capitalize text-xs')}>{label}</Label>
  )

  const header = (
    <div className="flex items-center gap-2">
      {collapsible ? (
        <CollapsibleTrigger className="flex w-full items-center gap-2 text-left cursor-pointer *:cursor-pointer">
          {title}
          <IconChevronDown className="ml-auto size-4 transition-transform group-data-open:rotate-180" />
        </CollapsibleTrigger>
      ) : (
        title
      )}
      {!hasChildren && canAdd && onAdd && (
        <Button type="button" variant="ghost" size="icon" onClick={onAdd}>
          <IconPlus />
        </Button>
      )}
    </div>
  )

  const desc = description ? (
    card ? (
      <CardDescription>{description}</CardDescription>
    ) : (
      <Label className="text-muted-foreground text-xs">{description}</Label>
    )
  ) : null

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

  const maybeCollapsible = (children: ReactNode) =>
    collapsible ? <CollapsibleContent>{children}</CollapsibleContent> : <>{children}</>

  const result = card ? (
    <Card aria-required={required || undefined} className={cn(readonly && 'opacity-60 grayscale')}>
      <CardHeader>
        {header}
        {desc}
      </CardHeader>
      {maybeCollapsible(
        <>
          {content}
          {foot}
        </>
      )}
    </Card>
  ) : (
    <div aria-required={required || undefined} className={cn(readonly && 'opacity-60 grayscale')}>
      {header}
      {maybeCollapsible(
        <>
          {desc}
          {content}
          {foot}
        </>
      )}
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
      <IconPlus /> {label}
    </Button>
  )
}
