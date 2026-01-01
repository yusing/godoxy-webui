'use client'

import { useCallback, useMemo } from 'react'

import { getDefaultValue, getPropertySchema, type JSONSchema } from '@/types/schema'

import { MapInput } from '@/components/form/MapInput'
import { Button } from '@/components/ui/button'
import { FormContainer } from './FormContainer'
import { stringify } from './utils'

type NamedListInputProps<IndexType extends string, T extends Record<IndexType, unknown>> = {
  label?: string
  placeholder?: { key?: IndexType; value?: string }
  schema?: JSONSchema
  keyField?: keyof T
  nameField?: keyof T
  value: T[]
  onChange: (v: T[]) => void
  card?: boolean
  level?: number
  readonly?: boolean
}

function NamedListInputItem<IndexType extends string, T extends Record<IndexType, unknown>>({
  item,
  index,
  nameField,
  keyField,
  placeholder,
  schema,
  onDelete,
  onChange,
  level,
  readonly = false,
}: {
  item: T
  index: number
  nameField: keyof T
  keyField: keyof T
  placeholder?: { key?: IndexType; value?: string }
  schema?: JSONSchema
  onDelete: (index: number) => void
  onChange: (index: number, newValue: T) => void
  level: number
  readonly?: boolean
}) {
  'use memo'
  const name = item[nameField] as string
  return (
    <div className="flex w-full flex-col gap-3 col-span-full">
      <MapInput<T>
        label={name}
        readonly={readonly}
        placeholder={placeholder}
        level={level + 1}
        keyField={keyField}
        nameField={nameField}
        schema={
          schema && {
            ...schema,
            properties: getPropertySchema(schema, {
              keyField: stringify(keyField),
              key: stringify(item[keyField]),
            }),
          }
        }
        value={item}
        footer={
          !readonly && (
            <Button
              size="sm"
              className="w-full"
              variant="destructive"
              type="button"
              onClick={() => onDelete(index)}
            >
              {`Delete ${name?.length ? name : `Item ${index + 1}`}`}
            </Button>
          )
        }
        onChange={e => onChange(index, e)}
      />
    </div>
  )
}

export function NamedListInput<IndexType extends string, T extends Record<IndexType, unknown>>({
  label,
  placeholder,
  value,
  onChange,
  keyField = 'name' as IndexType,
  nameField = 'name' as IndexType,
  schema,
  card = true,
  level = 0,
  readonly = false,
}: Readonly<NamedListInputProps<IndexType, T>>) {
  'use memo'
  const listValue: T[] = useMemo(() => (Array.isArray(value) ? value : []), [value])

  const defaultValue = useMemo(
    () => getDefaultValue(schema?.properties?.[keyField as string]),
    [schema, keyField]
  )

  const handleItemChange = useCallback(
    (index: number, newValue: T) => {
      const newValues = [...listValue]
      newValues[index] = newValue
      onChange(newValues)
    },
    [listValue, onChange]
  )

  const handleDeleteItem = useCallback(
    (index: number) => {
      const newValues = [...listValue]
      newValues.splice(index, 1)
      onChange(newValues)
    },
    [listValue, onChange]
  )

  const handleAddItem = useCallback(() => {
    onChange([
      ...listValue,
      {
        [keyField]: defaultValue,
        [nameField]: '',
      } as T,
    ])
  }, [listValue, onChange, keyField, nameField, defaultValue])

  return (
    <FormContainer
      label={label}
      card={card}
      level={level}
      onAdd={handleAddItem}
      canAdd={!readonly}
      readonly={readonly}
    >
      {listValue.map((item, index) => (
        <NamedListInputItem
          key={`${index}_map`}
          item={item}
          index={index}
          nameField={nameField}
          keyField={keyField}
          placeholder={placeholder}
          schema={schema}
          onDelete={handleDeleteItem}
          onChange={handleItemChange}
          level={level}
          readonly={readonly}
        />
      ))}
    </FormContainer>
  )
}
