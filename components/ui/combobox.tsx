'use client'

import { cn } from '@/lib/utils'
import { CheckIcon, ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'
import { Button } from './button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

type OptionWithIcon = {
  label: string
  icon?: React.ReactNode
}

type ComboboxProps = {
  value?: string
  options: OptionWithIcon[]
  placeholder?: string
  emptyMessage?: string
  onValueChange?: (value: string) => void
}

export function Combobox({
  value,
  options,
  placeholder,
  emptyMessage,
  onValueChange,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="max-w-[200px] justify-between"
        >
          {value ? options.find(option => option.label === value)?.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage ?? 'No option available.'}</CommandEmpty>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option.label}
                  value={option.label}
                  onSelect={currentValue => {
                    setOpen(false)
                    onValueChange?.(currentValue)
                  }}
                >
                  {option.icon}
                  {option.label}

                  <CheckIcon
                    className={cn(
                      'mr-2 h-4 w-4 text-muted-foreground',
                      value === option.label ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
