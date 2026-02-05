import { Combobox as BaseCombobox, type ComboboxRootProps } from '@base-ui/react/combobox'

import { cn } from '@/lib/utils'
import { CheckIcon, ChevronsUpDown, SearchIcon } from 'lucide-react'
import { buttonVariants } from './button'

type ComboboxProps<V, Multiple extends boolean | undefined = false> = {
  itemToIcon?: (item: V) => React.ReactNode
  itemToStringLabel?: (item: V) => string
  placeholder?: string
  emptyMessage?: string
} & ComboboxRootProps<V, Multiple>

export function CustomCombobox<V, Multiple extends boolean | undefined = false>({
  itemToIcon,
  itemToStringLabel = String,
  placeholder,
  emptyMessage,
  ...props
}: ComboboxProps<V, Multiple>) {
  return (
    <BaseCombobox.Root {...props}>
      <BaseCombobox.Trigger
        className={cn(
          buttonVariants({ variant: 'outline', size: 'default' }),
          'max-w-[200px] justify-between'
        )}
      >
        <div className="flex-1 text-left text-sm">
          <BaseCombobox.Value>
            {(selected?: V | null) =>
              selected ? (
                <span className="flex items-center gap-2 truncate">
                  {itemToIcon?.(selected)} {itemToStringLabel(selected)}
                </span>
              ) : (
                <span className="truncate text-muted-foreground">
                  {placeholder ?? 'Select option'}
                </span>
              )
            }
          </BaseCombobox.Value>
        </div>
        <BaseCombobox.Icon className="ml-2 flex items-center text-muted-foreground">
          <ChevronsUpDown className="h-4 w-4 shrink-0" />
        </BaseCombobox.Icon>
      </BaseCombobox.Trigger>
      <BaseCombobox.Portal>
        <BaseCombobox.Positioner sideOffset={4} align="start">
          <BaseCombobox.Popup className="rounded-md border border-border bg-popover text-popover-foreground shadow-lg shadow-gray-200 transition-[transform,scale,opacity] data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <div className="border-b px-3 flex items-center gap-2">
              <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
              <BaseCombobox.Input
                placeholder={placeholder ?? 'Search option...'}
                className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <BaseCombobox.Empty className="p-4 text-sm leading-4 text-muted-foreground empty:m-0 empty:p-0">
              {emptyMessage ?? 'No option available.'}
            </BaseCombobox.Empty>
            <BaseCombobox.List className="max-h-[min(23rem,var(--available-height))] overflow-y-auto py-2 outline-0 data-empty:p-0">
              {(option: V, index) => (
                <BaseCombobox.Item
                  key={index}
                  value={option}
                  className="cursor-default items-center gap-2 py-2 px-4 text-sm leading-4 outline-none data-selected:bg-accent data-selected:text-accent-foreground data-highlighted:relative data-highlighted:z-0 data-highlighted:bg-accent data-highlighted:text-accent-foreground data-highlighted:before:absolute data-highlighted:before:inset-x-2 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-accent"
                >
                  <div className="flex items-center gap-2 w-full">
                    {itemToIcon ? (
                      <span className="text-muted-foreground">{itemToIcon(option)}</span>
                    ) : null}
                    <span>{itemToStringLabel(option)}</span>
                    <BaseCombobox.ItemIndicator>
                      <CheckIcon className="h-3 w-3" />
                    </BaseCombobox.ItemIndicator>
                  </div>
                </BaseCombobox.Item>
              )}
            </BaseCombobox.List>
          </BaseCombobox.Popup>
        </BaseCombobox.Positioner>
      </BaseCombobox.Portal>
    </BaseCombobox.Root>
  )
}
