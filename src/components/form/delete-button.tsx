import { RefreshCw, Trash2 } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const rowRemoveClass =
  'h-auto min-h-0 shrink-0 border-0 bg-transparent p-0 text-sm font-medium text-muted-foreground shadow-none hover:bg-transparent hover:text-destructive focus-visible:ring-2'

const iconRemoveClass = 'shrink-0 text-muted-foreground hover:bg-transparent hover:text-destructive'

const iconResetClass =
  'shrink-0 text-muted-foreground hover:bg-transparent hover:text-muted-foreground dark:hover:text-muted-foreground active:translate-y-0'

const fieldRowIconActionOverlayClassName =
  'absolute right-1.5 top-1/2 z-10 -translate-y-1/2 max-md:opacity-100 md:pointer-events-none md:opacity-0 md:transition-opacity md:group-hover/field-row:pointer-events-auto md:group-hover/field-row:opacity-100 md:group-focus-within/field-row:pointer-events-auto md:group-focus-within/field-row:opacity-100'

const fieldRowIconActionValuePaddingClassName =
  'max-md:pr-12 md:pr-0 md:transition-[padding] md:duration-150 md:group-hover/field-row:pr-12 md:group-focus-within/field-row:pr-12'

type FormDeleteButtonProps = Omit<ComponentProps<typeof Button>, 'aria-label'>

type WithOptionalLabel = FormDeleteButtonProps & { label?: string }

/**
 * One field per row (flex): visible “Remove” label, destructive color on hover.
 * `aria-label` is set from `title ?? label` (with fallbacks; see body).
 */
function FieldRemoveTextButton({
  className,
  children = 'Remove',
  title,
  label,
  ...props
}: WithOptionalLabel) {
  const a11y = title ?? label ?? (typeof children === 'string' && children ? children : 'Remove')
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(rowRemoveClass, className)}
      title={title}
      aria-label={a11y}
      {...props}
    >
      {children}
    </Button>
  )
}

/**
 * Grid / header chrome: trash icon only, destructive color on hover.
 * `aria-label` is set from `title ?? label ?? 'Remove'`.
 */
function FieldRemoveIconButton({ className, title, label, ...props }: WithOptionalLabel) {
  const a11y = title ?? label ?? 'Remove'
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(iconRemoveClass, className)}
      title={title}
      aria-label={a11y}
      {...props}
    >
      <Trash2 />
    </Button>
  )
}

/**
 * Reset to store/schema default: refresh icon, no hover styling change.
 * `aria-label` is set from `title ?? label ?? 'Reset to default'`.
 */
function FieldResetButton({
  className,
  title = 'Reset to default',
  label,
  ...props
}: WithOptionalLabel) {
  const a11y = title ?? label ?? 'Reset to default'
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(iconResetClass, className)}
      title={title}
      aria-label={a11y}
      {...props}
    >
      <RefreshCw className="size-4" />
    </Button>
  )
}

/** Key–value value column + remove/reset: `grid` = icon, hover to show; else text remove in the row. */
function FieldValueSlot({
  grid,
  showDelete,
  showReset,
  onRemove,
  onReset,
  children,
}: {
  grid: boolean
  showDelete: boolean
  showReset: boolean
  onRemove: () => void
  onReset: () => void
  children: ReactNode
}) {
  const useIcon = grid && (showDelete || showReset)
  if (useIcon) {
    return (
      <div className="min-w-0 flex-1 relative group/field-row">
        <div className={cn('min-w-0', fieldRowIconActionValuePaddingClassName)}>{children}</div>
        {showDelete && (
          <FieldRemoveIconButton
            className={fieldRowIconActionOverlayClassName}
            title="Remove field"
            onClick={onRemove}
          />
        )}
        {showReset && (
          <FieldResetButton className={fieldRowIconActionOverlayClassName} onClick={onReset} />
        )}
      </div>
    )
  }
  return (
    <>
      <div className="min-w-0 flex-1">{children}</div>
      {showDelete && <FieldRemoveTextButton title="Remove field" onClick={onRemove} />}
      {showReset && <FieldResetButton onClick={onReset} />}
    </>
  )
}

export { FieldRemoveIconButton, FieldRemoveTextButton, FieldResetButton, FieldValueSlot }
