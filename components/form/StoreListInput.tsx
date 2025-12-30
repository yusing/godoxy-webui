'use client'

import { useCallback } from 'react'

import type { JSONSchema } from '@/types/schema'
import type { ArrayState } from 'juststore'
import { FormContainer } from './FormContainer'
import { ListInputItem } from './ListInput'

type StoreListInputProps<T extends string> = {
  label?: string
  placeholder?: string
  state: ArrayState<T>
  required?: boolean
  description?: string
  card?: boolean
  level?: number
  schema?: JSONSchema
}

export function StoreListInput<T extends string>({
  label,
  placeholder,
  state,
  required = false,
  description,
  card = true,
  level = 0,
  schema,
}: StoreListInputProps<T>) {
  const handleAddItem = useCallback(() => {
    state.push('' as T)
  }, [state])

  const numItems = state.useCompute(value => value?.length ?? 0)

  const items = Array.from({ length: numItems }, (_, index) => (
    <StoreListInputItem
      key={index}
      index={index}
      state={state}
      schema={schema}
      placeholder={placeholder}
    />
  ))

  return (
    <FormContainer
      label={label}
      description={description}
      card={card}
      level={level}
      required={required}
      onAdd={handleAddItem}
      canAdd
    >
      {items}
    </FormContainer>
  )
}

function StoreListInputItem<T extends string>({
  index,
  state,
  schema,
  placeholder,
}: {
  index: number
  state: ArrayState<T>
  schema?: JSONSchema
  placeholder?: string
}) {
  const [item, setItem] = state.at(index).useState()
  return (
    <ListInputItem
      item={item}
      onItemChange={setItem}
      onItemDelete={() => state.splice(index, 1)}
      schema={schema}
      placeholder={placeholder}
    />
  )
}
