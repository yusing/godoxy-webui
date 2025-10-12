'use client'

import { Plus, Trash } from 'lucide-react'
import React, { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'

type ListInputProps<T extends string> = {
  label?: React.ReactNode
  placeholder?: string
  value: T[]
  required?: boolean
  description?: string
  card?: boolean
  onChange: (v: T[]) => void
}

export function ListInput<T extends string>({
  label,
  placeholder,
  value,
  required = false,
  description,
  card = true,
  onChange,
}: ListInputProps<T>) {
  'use memo'
  const handleItemChange = useCallback(
    (index: number, newValue: T) => {
      const newValues = [...value]
      newValues[index] = newValue
      onChange(newValues)
    },
    [value, onChange]
  )

  const handleItemDelete = useCallback(
    (index: number) => {
      const newValues = [...value]
      newValues.splice(index, 1)
      onChange(newValues)
    },
    [value, onChange]
  )

  const handleAddItem = useCallback(() => {
    onChange([...value, '' as unknown as T])
  }, [value, onChange])

  const renderItem = useCallback(
    (item: T, index: number) => {
      return (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={item}
            placeholder={placeholder}
            onChange={e => handleItemChange(index, e.target.value as T)}
          />
          <Button
            type="button"
            variant="destructive"
            onClick={() => handleItemDelete(index)}
            title="Delete"
          >
            <Trash />
            Delete
          </Button>
        </div>
      )
    },
    [handleItemChange, handleItemDelete, placeholder]
  )

  if (!card) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label>{label}</Label>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleAddItem}
            className="size-4"
          >
            <Plus />
          </Button>
        </div>
        {description && <Label className="text-muted-foreground text-xs">{description}</Label>}
        <div className="flex flex-col gap-3">{value.map(renderItem)}</div>
      </div>
    )
  }

  return (
    <Card aria-required={required || undefined}>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {value.length > 0 && (
        <CardContent className="flex flex-col gap-3">{value.map(renderItem)}</CardContent>
      )}
      <CardFooter>
        <Button type="button" size="sm" onClick={handleAddItem} className="w-full">
          New item
        </Button>
      </CardFooter>
    </Card>
  )
}
