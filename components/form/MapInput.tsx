'use client'

import { IconCheck, IconEdit, IconTrash } from '@tabler/icons-react'
import { useMemo, useRef, useState, type ReactNode } from 'react'

import { getDefaultValue, getPropertySchema, type JSONSchema } from '@/types/schema'

import { FieldInput } from '@/components/form/FieldInput'
import { ListInput } from '@/components/form/ListInput'
import { Button } from '@/components/ui/button'
import { InputGroup, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '../ui/badge'
import { FormContainer } from './FormContainer'
import { getEntryValueSchema, getKindAndEffectiveSchema, getMergedValuesAndKeys } from './map-utils'
import { canAddKey, getAdditionalPropertiesSchema, getDescription, getLabel } from './utils'

export { ComplexEntryHeader, MapInput, RecordInput, type MapInputProps, type RecordInputProps }

type MapInputProps<T extends Record<string, unknown>> = {
  label?: string
  description?: ReactNode
  placeholder?: { key?: string; value?: string }
  value: T | undefined
  keyField?: keyof T
  nameField?: keyof T
  schema?: JSONSchema
  card?: boolean
  footer?: ReactNode
  allowDelete?: boolean
  level?: number
  readonly?: boolean
  onChange: (v: T) => void
}

function MapInput<T extends Record<string, unknown>>({ schema, ...props }: MapInputProps<T>) {
  'use memo'
  if (!schema) {
    return <RecordInput {...props} />
  }
  if (
    (!schema.properties || Object.keys(schema.properties).length === 0) &&
    schema.additionalProperties
  ) {
    return <RecordInput {...props} valueSchema={getAdditionalPropertiesSchema(schema)} />
  }
  return <ObjectInput {...props} schema={schema} />
}

type RecordInputProps<T extends Record<string, unknown>> = Omit<
  MapInputProps<T>,
  'allowDelete' | 'schema' | 'footer'
> & {
  valueSchema?: JSONSchema
}

function RecordInput<T extends Record<string, unknown>>({
  label,
  description,
  placeholder,
  value,
  valueSchema,
  onChange,
  card = false,
}: Readonly<RecordInputProps<T>>) {
  'use memo'
  // Maintain stable order: keep existing order, append newly added keys at the end
  const pureKeysRef = useRef<string[]>([])
  const keys = useMemo(() => {
    const current = Object.keys(value ?? {})
    const currentSet = new Set(current)
    // eslint-disable-next-line react-hooks/refs
    const ordered: string[] = pureKeysRef.current.filter(k => currentSet.has(k))
    for (const k of ordered) currentSet.delete(k)
    for (const k of currentSet) ordered.push(k)
    const scalar: string[] = []
    const complex: string[] = []
    for (const k of ordered) {
      const v = value?.[k]
      const { kind } = getKindAndEffectiveSchema(valueSchema, v)
      if (kind === 'scalar') scalar.push(k)
      else complex.push(k)
    }
    const ranked = [...scalar, ...complex]
    // eslint-disable-next-line react-hooks/refs
    pureKeysRef.current = ranked
    return ranked
  }, [value, valueSchema])

  function deleteKey(actualKey: string) {
    const newValue = { ...(value ?? {}) } as Record<string, unknown>
    delete newValue[actualKey]
    onChange(newValue as T)
  }

  function renameKey(actualKey: string, newK: string, newV: unknown) {
    // Normal rename - update the pureKeysRef to replace old key with new key in place
    const idx = pureKeysRef.current.indexOf(actualKey)
    if (idx !== -1) {
      pureKeysRef.current[idx] = newK
    }
    const newValue = { ...value, [newK]: newV }
    if (actualKey !== newK) {
      delete newValue[actualKey]
    }
    onChange(newValue as T)
  }

  return (
    <FormContainer
      label={label}
      description={description}
      card={card}
      level={0}
      canAdd
      onAdd={() => onChange({ ...value, ['' as keyof T]: getDefaultValue(valueSchema) ?? '' } as T)}
    >
      {keys.map((k, index) => {
        const displayKey = k
        const actualKey = k
        const v = value?.[k]

        const { leafSchema, kind } = getKindAndEffectiveSchema(valueSchema, v)
        const effSchema = leafSchema
        const complexSeparator = (
          <Separator className="my-3 [.record-entry--complex:first-child_&]:hidden [.record-entry--complex~.record-entry--complex_&]:hidden" />
        )

        if (kind === 'array') {
          return (
            <div key={`${index}_list_wrap`} className="record-entry--complex flex flex-col gap-2 col-span-full">
              {complexSeparator}
              <ComplexEntryHeader
                displayKey={displayKey}
                placeholderKey={placeholder?.key}
                isKeyTaken={candidate => candidate in (value ?? {}) && candidate !== actualKey}
                onKeyChange={newK => renameKey(actualKey, newK, v)}
                onDelete={() => deleteKey(actualKey)}
              />
              <ListInput
                card={false}
                label={undefined}
                value={Array.isArray(v) ? v : []}
                schema={effSchema}
                onChange={e => onChange({ ...value, [actualKey]: e } as T)}
              />
            </div>
          )
        }

        if (kind === 'object') {
          const nextValue = (typeof v === 'object' && v !== null ? v : {}) as Record<
            string,
            unknown
          >
          const apSchema = effSchema ? getAdditionalPropertiesSchema(effSchema) : undefined
          if (apSchema) {
            return (
              <div
                key={`${index}_record_wrap`}
                className={`record-entry--complex col-span-full ${displayKey === '' ? 'mt-2 rounded-md border border-dashed border-border p-2' : ''}`}
              >
                {complexSeparator}
                {displayKey === '' && (
                  <div className="mb-2 text-xs text-muted-foreground">New item</div>
                )}
                <ComplexEntryHeader
                  displayKey={displayKey}
                  placeholderKey={placeholder?.key}
                  isKeyTaken={candidate => candidate in (value ?? {}) && candidate !== actualKey}
                  onKeyChange={newK => renameKey(actualKey, newK, v)}
                  onDelete={() => deleteKey(actualKey)}
                />
                <RecordInput
                  card={false}
                  label={undefined}
                  value={nextValue}
                  valueSchema={apSchema}
                  placeholder={placeholder}
                  onChange={e => onChange({ ...value, [actualKey]: e } as T)}
                />
              </div>
            )
          }
          return (
            <div
              key={`${index}_map_wrap`}
              className={`record-entry--complex col-span-full ${displayKey === '' ? 'mt-2 rounded-md border border-dashed border-border p-2' : ''}`}
            >
              {complexSeparator}
              {displayKey === '' && (
                <div className="mb-2 text-xs text-muted-foreground">New item</div>
              )}
              <ComplexEntryHeader
                displayKey={displayKey}
                placeholderKey={placeholder?.key}
                isKeyTaken={candidate => candidate in (value ?? {}) && candidate !== actualKey}
                onKeyChange={newK => renameKey(actualKey, newK, v)}
                onDelete={() => deleteKey(actualKey)}
              />
              <MapInput
                card={false}
                label={undefined}
                description={getDescription(effSchema, displayKey)}
                value={nextValue}
                schema={effSchema}
                placeholder={placeholder}
                onChange={e => onChange({ ...value, [actualKey]: e } as T)}
              />
            </div>
          )
        }

        return (
          <div key={`${index}_field_wrap`} className="flex flex-col gap-2">
            <FieldInput
              fieldKey={displayKey}
              fieldValue={v}
              allowDelete
              schema={effSchema ? { properties: { [displayKey]: effSchema } } : undefined}
              placeholder={placeholder}
              onKeyChange={(newK, newV) => {
                if (newK !== displayKey && value && newK in value) return
                renameKey(actualKey, newK, newV)
              }}
              onChange={e => {
                if (e === undefined || e === null) {
                  const newValue = { ...value }
                  delete newValue[actualKey]
                  onChange(newValue as T)
                  return
                }
                onChange({ ...value, [actualKey]: e } as T)
              }}
            />
          </div>
        )
      })}
    </FormContainer>
  )
}

function ComplexEntryHeader({
  displayKey,
  placeholderKey,
  isKeyTaken,
  onKeyChange,
  onDelete,
}: {
  displayKey: string
  placeholderKey?: string
  isKeyTaken?: (key: string) => boolean
  onKeyChange: (key: string) => void
  onDelete: () => void
}) {
  'use memo'
  const isEmpty = displayKey === ''
  const [editing, setEditing] = useState(isEmpty)
  const [draft, setDraft] = useState(displayKey)

  const taken = Boolean(isKeyTaken && draft !== displayKey && isKeyTaken(draft))

  function commit() {
    if (draft === '' || taken) return
    onKeyChange(draft)
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-full @container">
        {editing ? (
          <InputGroup>
            <InputGroupInput
              value={draft}
              autoFocus
              aria-invalid={taken}
              placeholder={placeholderKey ?? 'Key'}
              onChange={({ target: { value } }) => setDraft(value)}
              onKeyDown={e => {
                if (e.key === 'Enter') commit()
                if (e.key === 'Escape') {
                  setDraft(displayKey)
                  setEditing(false)
                }
              }}
              className="text-xs"
            />
            <InputGroupButton
              size="icon-xs"
              onClick={commit}
              disabled={draft === '' || taken}
              aria-label="Confirm"
            >
              <IconCheck className="size-4" />
            </InputGroupButton>
          </InputGroup>
        ) : (
          <div className="flex items-center gap-1 w-fit">
            <div className="min-w-0 flex-1">
              <Label className="text-sm truncate">{displayKey}</Label>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => {
                setDraft(displayKey)
                setEditing(true)
              }}
            >
              <IconEdit className="size-4" />
            </Button>
          </div>
        )}
      </div>
      <Button type="button" variant="destructive" onClick={onDelete}>
        <IconTrash />
        Delete
      </Button>
    </div>
  )
}

function ObjectInput<T extends Record<string, unknown>>({
  label,
  description,
  placeholder,
  value,
  keyField,
  nameField,
  schema,
  allowDelete = true,
  card = true,
  footer,
  onChange,
  level = 0,
}: Readonly<MapInputProps<T> & { schema: JSONSchema }>) {
  'use memo'
  const workingValue: Record<string, unknown> = useMemo(() => {
    const result: Record<string, unknown> = value ? { ...value } : {}

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

  const { keys, mergedValues } = useMemo(
    () =>
      getMergedValuesAndKeys({
        schema,
        workingValue,
        keyField: keyField ? String(keyField) : undefined,
        nameField: nameField ? String(nameField) : undefined,
      }),
    [schema, workingValue, keyField, nameField]
  )

  return (
    <FormContainer
      label={label}
      description={description}
      card={card}
      level={level}
      footer={footer}
      canAdd={canAddKey(schema)}
      onAdd={() =>
        onChange({
          ...value,
          ['' as keyof T]: getDefaultValue(getAdditionalPropertiesSchema(schema)) ?? '',
        } as T)
      }
      badge={
        (!value || Object.keys(workingValue).length === 0) && (
          <Badge variant="secondary">Not set</Badge>
        )
      }
    >
      {keys.map((k, index) => (
        <MapInputItem
          key={k}
          entry={[k, mergedValues[k]]}
          index={index}
          schema={schema}
          workingValue={workingValue}
          level={level}
          placeholder={placeholder}
          allowDelete={allowDelete}
          onChange={onChange}
        />
      ))}
    </FormContainer>
  )
}

type MapInputItemProps<T extends Record<string, unknown>> = {
  entry: [string, unknown]
  index: number
  schema: JSONSchema
  workingValue: Record<string, unknown>
  level: number
  placeholder?: { key?: string; value?: string }
  allowDelete: boolean
  onChange: (v: T) => void
}

function MapInputItem<T extends Record<string, unknown>>({
  entry: [k, v],
  index,
  schema,
  workingValue,
  level,
  placeholder,
  allowDelete,
  onChange,
}: MapInputItemProps<T>) {
  'use memo'
  const canRenameKey = !(schema.properties && k in (schema.properties ?? {}))

  const vSchema = getEntryValueSchema(schema, k)

  const nestedLabel = getLabel(vSchema, k)
  const nestedDescription = getDescription(vSchema, k)

  const { kind } = getKindAndEffectiveSchema(vSchema, v)
  if (kind === 'array') {
    const headerShown = canRenameKey
    const childLabel = headerShown ? undefined : nestedLabel
    return (
      <div key={`${index}_list_wrap`} className="flex flex-col gap-2 col-span-full">
        {headerShown && (
          <ComplexEntryHeader
            displayKey={k}
            isKeyTaken={candidate => candidate in workingValue && candidate !== k}
            onKeyChange={newK => {
              const newValue: Record<string, unknown> = { ...workingValue, [newK]: v }
              if (k !== newK) delete newValue[k]
              onChange(newValue as T)
            }}
            onDelete={() => {
              const newValue = { ...workingValue }
              delete newValue[k]
              onChange(newValue as T)
            }}
          />
        )}
        <ListInput
          card={false}
          key={`${index}_list`}
          label={childLabel}
          value={Array.isArray(v) ? v : []}
          schema={vSchema}
          description={nestedDescription}
          onChange={e => {
            onChange({ ...workingValue, [k]: e } as T)
          }}
        />
      </div>
    )
  }
  if (kind === 'object') {
    const headerShown = canRenameKey
    const childLabel = headerShown ? undefined : nestedLabel
    if (
      ((!vSchema?.properties || Object.keys(vSchema.properties).length === 0) &&
        vSchema?.additionalProperties) ||
      schema.additionalProperties
    ) {
      return (
        <div key={`${index}_record_wrap`} className="flex flex-col gap-2 col-span-full">
          {headerShown && (
            <ComplexEntryHeader
              displayKey={k}
              isKeyTaken={candidate => candidate in workingValue && candidate !== k}
              onKeyChange={newK => {
                const newValue: Record<string, unknown> = { ...workingValue, [newK]: v }
                if (k !== newK) delete newValue[k]
                onChange(newValue as T)
              }}
              onDelete={() => {
                const newValue = { ...workingValue }
                delete newValue[k]
                onChange(newValue as T)
              }}
            />
          )}
          <RecordInput
            card={false}
            level={level + 1}
            key={`${index}_map`}
            description={nestedDescription}
            label={childLabel}
            value={(typeof v === 'object' ? v : {}) as Record<string, unknown>}
            valueSchema={vSchema ? getAdditionalPropertiesSchema(vSchema) : undefined}
            onChange={e => {
              onChange({ ...workingValue, [k]: e } as T)
            }}
            placeholder={placeholder}
          />
        </div>
      )
    }
    return (
      <div key={`${index}_map_wrap`} className="flex flex-col gap-2 col-span-full">
        {headerShown && (
          <ComplexEntryHeader
            displayKey={k}
            isKeyTaken={candidate => candidate in workingValue && candidate !== k}
            onKeyChange={newK => {
              const newValue: Record<string, unknown> = { ...workingValue, [newK]: v }
              if (k !== newK) delete newValue[k]
              onChange(newValue as T)
            }}
            onDelete={() => {
              const newValue = { ...workingValue }
              delete newValue[k]
              onChange(newValue as T)
            }}
          />
        )}
        <MapInput
          card={false}
          level={level + 1}
          key={`${index}_map`}
          label={childLabel}
          description={nestedDescription}
          value={(typeof v === 'object' ? v : {}) as Record<string, unknown>}
          schema={{
            ...vSchema,
            properties: getPropertySchema(vSchema ?? schema, { keyField: k, key: String(v) }),
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
      </div>
    )
  }
  return (
    <FieldInput
      key={`${index}_field`}
      fieldKey={k}
      fieldValue={v}
      schema={schema.properties?.[k] ? schema : { properties: { [k]: vSchema } }}
      placeholder={placeholder}
      allowDelete={allowDelete}
      deleteType="reset"
      onKeyChange={
        !(schema.properties && k in (schema.properties ?? {}))
          ? e => {
              const newValue: Record<string, unknown> = {
                ...workingValue,
                [e]: v ?? getDefaultValue(vSchema ?? schema?.properties?.[e]),
              }
              if (k !== e) {
                delete newValue[k]
              }
              onChange(newValue as T)
            }
          : undefined
      }
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
