import { useCallback, useMemo } from 'react'
import { MapInput } from '@/components/form/MapInput'
import { FieldRemoveIconButton, FieldRemoveTextButton } from '@/components/form/delete-button'
import { getDefaultValue, getPropertySchema, type JSONSchema } from '@/types/schema'
import { FormContainer } from './FormContainer'
import { IndentedListBlock } from './IndentedListBlock'
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
  grid?: boolean
  level?: number
  readonly?: boolean
  /** Label for the bottom add button (avoids repeating the list `label`). */
  addButtonLabel?: string
}

function NamedListInputItem<IndexType extends string, T extends Record<IndexType, unknown>>({
  grid = true,
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
  grid?: boolean
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
  const title = name?.length ? name : `Step ${index + 1}`
  return (
    <IndentedListBlock
      className="named-list-input-item"
      title={title}
      headerEnd={
        !readonly ? (
          grid ? (
            <FieldRemoveIconButton
              className="shrink-0"
              title={`Remove ${title}`}
              onClick={() => onDelete(index)}
            />
          ) : (
            <FieldRemoveTextButton
              className="shrink-0"
              label={`Remove ${title}`}
              onClick={() => onDelete(index)}
            />
          )
        ) : undefined
      }
    >
      <MapInput<T>
        label={undefined}
        readonly={readonly}
        card={false}
        grid={grid}
        placeholder={placeholder}
        level={level}
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
        onChange={e => onChange(index, e)}
      />
    </IndentedListBlock>
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
  grid = true,
  level = 0,
  readonly = false,
  addButtonLabel,
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
      grid={grid}
      level={level}
      onAdd={handleAddItem}
      canAdd={!readonly}
      readonly={readonly}
      addButtonLabel={addButtonLabel}
    >
      {listValue.map((item, index) => (
        <NamedListInputItem
          key={`${index}_map`}
          grid={grid}
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
