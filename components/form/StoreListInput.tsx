'use client'

import { IconPlus, IconTrash } from '@tabler/icons-react'
import React, { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { JSONSchema } from '@/types/schema'
import type { ArrayState } from 'juststore'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

type StoreListInputProps<T extends string> = {
  label?: React.ReactNode
  placeholder?: string
  state: ArrayState<T>
  required?: boolean
  description?: string
  card?: boolean
  schema?: JSONSchema
}

export function StoreListInput<T extends string>({
  label,
  placeholder,
  state,
  required = false,
  description,
  card = true,
  schema,
}: StoreListInputProps<T>) {
  const handleAddItem = useCallback(() => {
    state.push('' as T)
  }, [state])

  const numItems = state.useCompute(value => value?.length ?? 0)

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
            <IconPlus />
          </Button>
        </div>
        {description && <Label className="text-muted-foreground text-xs">{description}</Label>}
        <div className="flex flex-col gap-3">
          {Array.from({ length: numItems }, (_, index) => (
            <RenderItem
              key={index}
              index={index}
              state={state}
              schema={schema}
              placeholder={placeholder}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card aria-required={required || undefined}>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {Array.from({ length: numItems }, (_, index) => (
          <RenderItem
            key={index}
            index={index}
            state={state}
            schema={schema}
            placeholder={placeholder}
          />
        ))}
      </CardContent>
      <CardFooter>
        <Button type="button" size="sm" onClick={handleAddItem} className="w-full">
          New item
        </Button>
      </CardFooter>
    </Card>
  )
}

function RenderItem<T extends string>({
  state,
  index,
  schema,
  placeholder,
}: {
  state: ArrayState<T>
  index: number
  schema?: JSONSchema
  placeholder?: string
}) {
  const [item, setItem] = state.at(index).useState()
  return (
    <div key={index} className="flex items-center gap-2">
      {schema?.items?.enum ? (
        <Select value={item as string} onValueChange={e => setItem(e as T)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {schema.items.enum.map((item, index) => (
              <SelectItem value={item} key={index}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          value={item}
          placeholder={placeholder}
          onChange={e => setItem(e.target.value as T)}
        />
      )}
      <Button
        type="button"
        variant="destructive"
        onClick={() =>
          state.set((prev: T[] | undefined) => prev?.filter((_, i) => i !== index) ?? [])
        }
        title="Delete"
      >
        <IconTrash />
        Delete
      </Button>
    </div>
  )
}
