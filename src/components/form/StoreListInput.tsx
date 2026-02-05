import type { ArrayState } from 'juststore'
import { useCallback } from 'react'
import type { JSONSchema } from '@/types/schema'
import { FormContainer } from './FormContainer'
import { ListInputItem } from './ListInput'

type StoreListInputProps<T extends string> = {
  label?: string
  placeholder?: string
  state: ArrayState<T>
  required?: boolean
  description?: string
  card?: boolean
  grid?: boolean
  level?: number
  schema?: JSONSchema
  readonly?: boolean
}

export function StoreListInput<T extends string>({
  label,
  placeholder,
  state,
  required = false,
  description,
  card = true,
  grid = true,
  level = 0,
  schema,
  readonly = false,
}: StoreListInputProps<T>) {
  'use memo'
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
      readonly={readonly}
    />
  ))

  return (
    <FormContainer
      label={label}
      description={description}
      card={card}
      grid={grid}
      level={level}
      required={required}
      onAdd={handleAddItem}
      canAdd={!readonly}
      readonly={readonly}
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
  readonly = false,
}: {
  index: number
  state: ArrayState<T>
  schema?: JSONSchema
  placeholder?: string
  readonly?: boolean
}) {
  'use memo'
  const [item, setItem] = state.at(index).useState()
  return (
    <ListInputItem
      item={item}
      onItemChange={setItem}
      onItemDelete={() => state.splice(index, 1)}
      schema={schema}
      placeholder={placeholder}
      readonly={readonly}
    />
  )
}
