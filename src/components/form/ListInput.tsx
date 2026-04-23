import { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { JSONSchema } from '@/types/schema'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { FormContainer } from './FormContainer'

type ListInputProps<T extends string> = {
  label?: string
  placeholder?: string
  value: T[]
  required?: boolean
  description?: string
  card?: boolean
  grid?: boolean
  level?: number
  schema?: JSONSchema
  onChange: (v: T[]) => void
  readonly?: boolean
}

export function ListInput<T extends string>({
  label,
  placeholder,
  value,
  required = false,
  description,
  card = true,
  grid = true,
  level = 0,
  schema,
  onChange,
  readonly = false,
}: ListInputProps<T>) {
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

  return (
    <FormContainer
      label={label}
      description={description}
      card={card}
      grid={grid}
      level={level}
      onAdd={handleAddItem}
      required={required}
      canAdd={!readonly}
      readonly={readonly}
    >
      {value.map((item, index) => (
        <ListInputItem
          key={index}
          item={item}
          onItemChange={v => handleItemChange(index, v)}
          onItemDelete={() => handleItemDelete(index)}
          schema={schema}
          placeholder={placeholder}
          readonly={readonly}
        />
      ))}
    </FormContainer>
  )
}

export function ListInputItem<T extends string>({
  item,
  onItemChange,
  onItemDelete,
  schema,
  placeholder,
  readonly = false,
}: {
  item: T
  onItemChange: (item: T) => void
  onItemDelete: () => void
  schema?: JSONSchema
  placeholder?: string
  readonly?: boolean
}) {
  return (
    <div className="group/list-row col-span-full flex min-w-0 w-full items-center gap-2">
      <div className="min-w-0 flex-1">
        {schema?.items?.enum ? (
          <Select
            readOnly={readonly}
            value={item as string}
            onValueChange={e => onItemChange(e as T)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {schema.items.enum.map(selectItem => (
                <SelectItem value={selectItem} key={String(selectItem)}>
                  {selectItem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            readOnly={readonly}
            value={item}
            placeholder={placeholder}
            onChange={e => onItemChange(e.target.value as T)}
          />
        )}
      </div>
      {!readonly && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-muted-foreground hover:text-destructive md:opacity-0 md:transition-opacity md:group-hover/list-row:opacity-100 md:group-focus-within/list-row:opacity-100 max-md:opacity-100"
          onClick={onItemDelete}
          title="Remove from list"
        >
          Remove
        </Button>
      )}
    </div>
  )
}
