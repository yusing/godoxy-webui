'use client'

import { memo, useCallback, useMemo, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { getDefaultValue, getPropertySchema, type JSONSchema } from '@/types/schema'

import { FieldInput } from '@/components/form/FieldInput'
import { ListInput } from '@/components/form/ListInput'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card'

type MapInputProps<T extends Record<string, unknown>> = {
  label?: ReactNode
  placeholder?: { key?: string; value?: string }
  value: T | undefined
  keyField?: keyof T
  nameField?: keyof T
  schema?: JSONSchema
  card?: boolean
  footer?: ReactNode
  allowDelete?: boolean
  onChange: (v: T) => void
}

function PureMapInput<T extends Record<string, unknown>>({
  label,
  placeholder,
  value,
  onChange,
  card = true,
}: Readonly<Omit<MapInputProps<T>, 'allowDelete' | 'schema' | 'footer'>>) {
  const keys = useMemo(() => Object.keys(value ?? {}), [value])

  const content = (
    <>
      {keys.map((k, index) => (
        <FieldInput
          key={index}
          fieldKey={k}
          fieldValue={value?.[k]}
          allowDelete
          schema={undefined}
          placeholder={placeholder}
          onKeyChange={(newK, newV) => {
            const newValue = { ...value, [newK]: newV }
            if (k !== newK) {
              delete newValue[k]
            }
            onChange(newValue as T)
          }}
          onChange={e => {
            if (e === undefined || e === null) {
              const newValue = { ...value }
              delete newValue[k]
              onChange(newValue as T)
              return
            }
            onChange({ ...value, [k]: e } as T)
          }}
        />
      ))}
    </>
  )

  if (!card) {
    return <div className="flex flex-col gap-3">{content}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3"></CardContent>
      <CardFooter>
        <Button
          type="button"
          size="sm"
          className="w-full"
          onClick={() => onChange({ ...value, ['' as keyof T]: '' } as T)}
        >
          New Item
        </Button>
      </CardFooter>
    </Card>
  )
}

function getTypePriority(type: string) {
  switch (type) {
    case 'string':
      return 0
    case 'number':
    case 'integer':
      return 1
    case 'boolean':
      return 2
    default:
      return 3
  }
}

function MapInput_<T extends Record<string, unknown>>({
  label,
  placeholder,
  value,
  keyField,
  nameField,
  schema,
  allowDelete = true,
  card = true,
  footer,
  onChange,
}: Readonly<MapInputProps<T> & { schema: JSONSchema }>) {
  const workingValue: Record<string, unknown> = useMemo(() => {
    let result: Record<string, unknown> = value ? { ...value } : {}

    if (keyField && Object.keys(result).length === 0) {
      result[keyField as string] = getDefaultValue(schema?.properties?.[keyField as string])
    }

    if (schema.required) {
      for (const k of schema.required) {
        if (result[k] === undefined) {
          result[k] = getDefaultValue(schema?.properties?.[k])
        }
      }
    }

    return result
  }, [value, keyField, schema])

  const isEmpty = useMemo(() => {
    if (!value) return true
    if (Object.keys(workingValue).length === 0) return true
    return false
  }, [value, workingValue])

  const defaultValues = useMemo(() => {
    if (!schema.properties) return {}
    return Object.keys(schema.properties)
      .filter(k => workingValue[k] === undefined)
      .reduce(
        (acc, k) => {
          if (k in workingValue && workingValue[k] !== undefined) return acc
          acc[k] = getDefaultValue(schema?.properties?.[k])
          return acc
        },
        {} as Record<string, unknown>
      )
  }, [schema, workingValue])

  const merged = useMemo(
    () => ({ ...workingValue, ...defaultValues }),
    [workingValue, defaultValues]
  )

  const entries = useMemo(
    () =>
      Object.entries(merged).sort(([key1], [key2]) => {
        // Priority 1: keyField and nameField come first
        if (key1 === (keyField as string) || key1 === (nameField as string)) return -1
        if (key2 === (keyField as string) || key2 === (nameField as string)) return 1

        // Get types for comparison
        const type1 = schema.properties?.[key1]?.type as string
        const type2 = schema.properties?.[key2]?.type as string

        const priority1 = getTypePriority(type1)
        const priority2 = getTypePriority(type2)

        // Priority 2: Sort by type priority
        if (priority1 !== priority2) {
          return priority1 - priority2
        }

        // Priority 3: Alphabetical sort within same type
        return key1.localeCompare(key2)
      }),
    [merged, keyField, nameField, schema]
  )

  const renderItem = useCallback(
    ([k, v]: [string, unknown], index: number) => {
      const vSchema = schema.properties?.[k]
      if (vSchema?.type === 'array' || Array.isArray(v)) {
        return (
          <ListInput
            key={`${index}_list`}
            label={`${String(label)}.${k}`}
            value={Array.isArray(v) ? v : []}
            description={vSchema?.description}
            onChange={e => {
              onChange({ ...workingValue, [k]: e } as T)
            }}
          />
        )
      }
      if (vSchema?.type === 'object' || typeof v === 'object') {
        return (
          <MapInput
            key={`${index}_map`}
            label={`${String(label)}.${k}`}
            value={(typeof v === 'object' ? v : {}) as Record<string, unknown>}
            schema={{
              ...vSchema,
              properties: getPropertySchema(schema, { keyField: k, key: String(v) }),
            }}
            onChange={e => {
              if (e === undefined || e === null) {
                const newValue = { ...workingValue }
                delete newValue[k]
                onChange(newValue as T)
                return
              }
              onChange({ ...workingValue, [k]: e } as T)
            }}
          />
        )
      }
      return (
        <FieldInput
          key={`${index}_field`}
          fieldKey={k}
          fieldValue={v ?? {}}
          schema={schema}
          placeholder={placeholder}
          allowDelete={allowDelete}
          deleteType="reset"
          onKeyChange={e => {
            const newValue: Record<string, unknown> = {
              ...workingValue,
              [e]: v ?? getDefaultValue(schema?.properties?.[e]),
            }
            if (k !== e) {
              delete newValue[k]
            }
            onChange(newValue as T)
          }}
          onChange={e => {
            if (e === undefined || e === null) {
              const newValue = { ...workingValue }
              delete newValue[k]
              onChange(newValue as T)
              return
            }
            onChange({ ...workingValue, [k]: e } as T)
          }}
        />
      )
    },
    [label, placeholder, workingValue, allowDelete, schema, onChange]
  )

  if (!card) {
    return <div className="flex flex-col gap-3">{entries.map(renderItem)}</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row gap-4 items-center">
        <CardTitle>{label}</CardTitle>
        {isEmpty && <Badge variant={'secondary'}>Not set</Badge>}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">{entries.map(renderItem)}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  )
}

export function MapInput<T extends Record<string, unknown>>({
  schema,
  ...props
}: MapInputProps<T>) {
  if (!schema) {
    return <PureMapInput {...props} />
  }
  return <MapInputMemo {...props} schema={schema} />
}

const MapInputMemo = memo(MapInput_) as typeof MapInput_
