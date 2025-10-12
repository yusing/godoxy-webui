'use client'

import { useCallback, useMemo, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { getDefaultValue, getPropertySchema, type JSONSchema } from '@/types/schema'

import { MapInput } from '@/components/form/MapInput'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'

type NamedListInputProps<IndexType extends string, T extends Record<IndexType, unknown>> = {
  label: ReactNode
  placeholder?: { key?: IndexType; value?: string }
  schema?: JSONSchema
  keyField?: keyof T
  nameField?: keyof T
  value: T[]
  onChange: (v: T[]) => void
  card?: boolean
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

  const renderItem = useCallback(
    (item: T, index: number) => {
      const name = item[nameField] as string
      const key = item[keyField] as string
      return (
        <div className="flex w-full flex-col gap-3" key={`${index}_map`}>
          <MapInput
            label={name}
            placeholder={placeholder}
            keyField={keyField}
            nameField={nameField}
            schema={
              schema && {
                ...schema,
                properties: getPropertySchema(schema, {
                  keyField: keyField as string,
                  key: key,
                }),
              }
            }
            value={item}
            footer={
              <Button
                size="sm"
                className="w-full"
                variant="destructive"
                type="button"
                onClick={() => handleDeleteItem(index)}
              >
                {`Delete ${name?.length ? name : `Item ${index + 1}`}`}
              </Button>
            }
            onChange={e => handleItemChange(index, e)}
          />
        </div>
      )
    },
    [keyField, nameField, placeholder, schema, handleDeleteItem, handleItemChange]
  )

  if (!card) {
    return (
      <div className="flex flex-col gap-3">
        {listValue.map(renderItem)}
        <Button type="button" size="sm" onClick={handleAddItem} className="w-full">
          New item
        </Button>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">{listValue.map(renderItem)}</CardContent>
      <CardFooter>
        <Button type="button" size="sm" onClick={handleAddItem} className="w-full">
          New item
        </Button>
      </CardFooter>
    </Card>
  )
}
