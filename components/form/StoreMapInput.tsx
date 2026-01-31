'use client'

import { ComplexEntryHeader, type MapInputProps, type RecordInputProps } from './MapInput'

import { getDefaultValue, getPropertySchema, type JSONSchema } from '@/types/schema'

import type { FieldPath, FieldValues, ObjectState } from 'juststore'
import { Activity, useMemo } from 'react'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { FormContainer } from './FormContainer'
import { StoreFieldInput } from './StoreFieldInput'
import { StoreListInput } from './StoreListInput'
import { getEntryValueSchema, getKindAndEffectiveSchema, getMergedKeys } from './map-utils'
import { canAddKey, getAdditionalPropertiesSchema, getDescription, getLabel } from './utils'

export {
  StoreMapInput,
  StoreObjectInput,
  StoreRecordInput,
  type StoreMapInputProps,
  type StoreRecordInputProps,
}

type StoreMapInputProps<T extends FieldValues> = {
  state: ObjectState<T>
  hideUnknown?: boolean
} & Omit<MapInputProps<T>, 'value' | 'onChange'>

function StoreMapInput<T extends FieldValues>({ schema, ...props }: StoreMapInputProps<T>) {
  'use memo'
  if (!schema) {
    return <StoreRecordInput {...props} />
  }
  if (
    (!schema.properties || Object.keys(schema.properties).length === 0) &&
    schema.additionalProperties
  ) {
    return <StoreRecordInput {...props} valueSchema={getAdditionalPropertiesSchema(schema)} />
  }
  return <StoreObjectInput {...props} schema={schema} />
}

type StoreRecordInputProps<T extends FieldValues> = {
  state: ObjectState<T>
  valueSchema?: JSONSchema
} & Omit<RecordInputProps<T>, 'value' | 'onChange' | 'valueSchema'>

function StoreRecordInput<T extends FieldValues>({
  state,
  valueSchema,
  label,
  description,
  placeholder,
  card = false,
  grid = true,
  level = 0,
  readonly = false,
}: Readonly<StoreRecordInputProps<T>>) {
  'use memo'
  const numKeys = state.keys.useCompute(v => v.length)

  return (
    <FormContainer
      label={label}
      description={description}
      card={card}
      grid={grid}
      level={0}
      canAdd={!readonly}
      readonly={readonly}
      onAdd={() => state['']?.set((getDefaultValue(valueSchema) || '') as T[string])}
    >
      {Array.from({ length: numKeys }).map((_, index) => (
        <StoreRecordInputItem
          key={index}
          grid={grid}
          level={level}
          state={state}
          index={index}
          valueSchema={valueSchema}
          placeholder={placeholder}
          readonly={readonly}
        />
      ))}
    </FormContainer>
  )
}

function StoreRecordInputItem<T extends FieldValues>({
  grid = true,
  level,
  index,
  state,
  valueSchema,
  placeholder,
  readonly = false,
}: {
  level: number
  index: number
  state: ObjectState<T>
  valueSchema?: JSONSchema
  placeholder: { key?: string; value?: string } | undefined
  grid?: boolean
  readonly?: boolean
}) {
  'use memo'
  const fieldKey = state.keys.useCompute(v => v[index]!)
  const child = state[fieldKey]

  const { effectiveSchema, leafSchema, kind } = child.useCompute(v =>
    getKindAndEffectiveSchema(valueSchema, v)
  )
  const entrySchema = effectiveSchema ?? leafSchema

  const fieldSchema = useMemo(
    () => (entrySchema ? { properties: { [fieldKey]: entrySchema } } : undefined),
    [entrySchema, fieldKey]
  )

  function RecordComplexEntryFrame({ children }: React.PropsWithChildren) {
    'use memo'
    const isNew = fieldKey === ''
    return (
      <div
        className={`record-entry--complex col-span-full ${isNew ? 'mt-2 rounded-md border border-dashed border-border p-2' : ''}`}
      >
        <ComplexSeparator />
        {isNew && <div className="mb-2 text-xs text-muted-foreground">New item</div>}
        <ComplexEntryHeader
          displayKey={fieldKey}
          placeholderKey={placeholder?.key}
          isKeyTaken={candidate => candidate in (state.value ?? {}) && candidate !== fieldKey}
          onKeyChange={newK => {
            state.rename(fieldKey, newK)
          }}
          onDelete={child.reset}
          readonly={readonly}
        />
        {children}
      </div>
    )
  }

  if (kind === 'array') {
    return (
      <div className="record-entry--complex flex flex-col gap-2">
        <ComplexSeparator />
        <ComplexEntryHeader
          displayKey={fieldKey}
          placeholderKey={placeholder?.key}
          isKeyTaken={candidate => candidate in (state.value ?? {}) && candidate !== fieldKey}
          onKeyChange={newK => {
            state.rename(fieldKey, newK)
          }}
          onDelete={child.reset}
          readonly={readonly}
        />
        <StoreListInput
          level={level + 1}
          card={false}
          grid={grid}
          label={undefined}
          placeholder={placeholder?.value}
          state={child.ensureArray()}
          schema={entrySchema}
          readonly={readonly}
        />
      </div>
    )
  }

  if (kind === 'object') {
    const apSchema = entrySchema ? getAdditionalPropertiesSchema(entrySchema) : undefined
    if (apSchema) {
      return (
        <RecordComplexEntryFrame>
          <StoreRecordInput
            level={level + 1}
            card={false}
            grid={grid}
            label={undefined}
            description={undefined}
            placeholder={placeholder}
            state={child.ensureObject()}
            valueSchema={apSchema}
            readonly={readonly}
          />
        </RecordComplexEntryFrame>
      )
    }

    return (
      <RecordComplexEntryFrame>
        <StoreMapInput
          level={level + 1}
          card={false}
          grid={grid}
          label={undefined}
          description={getDescription(entrySchema, fieldKey)}
          placeholder={placeholder}
          state={child.ensureObject()}
          schema={entrySchema}
          readonly={readonly}
        />
      </RecordComplexEntryFrame>
    )
  }

  return (
    <StoreFieldInput<T>
      state={state}
      fieldKey={fieldKey}
      schema={fieldSchema}
      placeholder={placeholder}
      allowKeyChange={!readonly}
      allowDelete={!readonly}
      readonly={readonly}
    />
  )
}

function StoreObjectInput<T extends FieldValues>({
  label,
  description,
  placeholder,
  state,
  keyField,
  nameField,
  schema,
  allowDelete = true,
  card = true,
  grid = true,
  level = 0,
  footer,
  hideUnknown = false,
  readonly = false,
}: Readonly<StoreMapInputProps<T> & { schema: JSONSchema }>) {
  'use memo'

  const workingKeys = state.keys.use()
  const keys = useMemo(() => {
    let filteredKeys: readonly string[] = workingKeys
    if (hideUnknown && !canAddKey(schema) && schema.properties) {
      const allowed = new Set(Object.keys(schema.properties))
      filteredKeys = workingKeys.filter(k => allowed.has(k))
    }
    return getMergedKeys({
      schema,
      workingKeys: filteredKeys,
      keyField: keyField ? String(keyField) : undefined,
      nameField: nameField ? String(nameField) : undefined,
    })
  }, [workingKeys, keyField, nameField, schema, hideUnknown])

  return (
    <FormContainer
      label={label}
      description={description}
      card={card}
      grid={grid}
      level={level}
      footer={footer}
      canAdd={!readonly && canAddKey(schema)}
      readonly={readonly}
      onAdd={() =>
        state['']?.set(getDefaultValue(getAdditionalPropertiesSchema(schema)) as T[string])
      }
      badge={
        <state.Show on={value => !value || Object.keys(value).length === 0}>
          <Badge variant="secondary">Not set</Badge>
        </state.Show>
      }
    >
      {keys.map((k, index) => (
        <StoreMapInputItem
          key={index}
          grid={grid}
          level={level}
          k={k as FieldPath<T>}
          state={state}
          schema={schema}
          placeholder={placeholder}
          allowDelete={allowDelete}
          readonly={readonly}
        />
      ))}
    </FormContainer>
  )
}

function StoreMapInputItem<T extends FieldValues>({
  grid = true,
  k: fieldKey,
  state,
  schema,
  placeholder,
  allowDelete,
  level,
  readonly = false,
}: {
  k: FieldPath<T>
  schema: JSONSchema
  allowDelete: boolean
  level: number
  grid?: boolean
  readonly?: boolean
} & Pick<StoreMapInputProps<T>, 'state' | 'placeholder'>) {
  'use memo'
  const canRenameKey = !schema.properties || !(fieldKey in (schema.properties ?? {}))

  const child = state[fieldKey]

  // Determine the effective schema based on the actual value type
  const { effectiveSchema, kind } = child.useCompute(
    currentValue => getKindAndEffectiveSchema(getEntryValueSchema(schema, fieldKey), currentValue),
    [schema, fieldKey]
  )

  const nestedLabel = getLabel(effectiveSchema, fieldKey)
  const nestedDescription = getDescription(effectiveSchema, fieldKey)

  function ComplexEntryFrame({ children }: Readonly<{ children: React.ReactNode }>) {
    'use memo'
    return (
      <div className="flex flex-col gap-2 col-span-full">
        <Activity mode={canRenameKey ? 'visible' : 'hidden'}>
          <ComplexEntryHeader
            displayKey={fieldKey}
            placeholderKey={placeholder?.key}
            isKeyTaken={candidate =>
              candidate in (state.value ?? {}) && candidate !== String(fieldKey)
            }
            onKeyChange={newK => state.rename(fieldKey, newK)}
            onDelete={child.reset}
            readonly={readonly}
          />
        </Activity>
        {children}
      </div>
    )
  }

  // Handle array type
  if (kind === 'array') {
    const headerShown = canRenameKey
    const childLabel = headerShown ? undefined : nestedLabel
    return (
      <ComplexEntryFrame>
        <StoreListInput
          card={false}
          grid={grid}
          level={level + 1}
          label={childLabel}
          state={child.ensureArray()}
          schema={effectiveSchema}
          description={nestedDescription}
          readonly={readonly}
        />
      </ComplexEntryFrame>
    )
  }

  // Handle object type
  if (kind === 'object') {
    const headerShown = canRenameKey
    const childLabel = headerShown ? undefined : nestedLabel
    const apSchema = effectiveSchema && getAdditionalPropertiesSchema(effectiveSchema)
    if (apSchema) {
      return (
        <ComplexEntryFrame>
          <StoreRecordInput
            card={false}
            grid={grid}
            level={level + 1}
            label={childLabel}
            description={nestedDescription}
            state={child.ensureObject()}
            valueSchema={apSchema}
            readonly={readonly}
          />
        </ComplexEntryFrame>
      )
    }
    return (
      <ComplexEntryFrame>
        <StoreMapInput
          card={false}
          grid={grid}
          level={level + 1}
          label={childLabel}
          description={nestedDescription}
          state={child.ensureObject()}
          schema={
            effectiveSchema
              ? {
                  ...effectiveSchema,
                  properties: getPropertySchema(effectiveSchema, {
                    keyField: fieldKey,
                    key: child.value,
                  }),
                }
              : undefined
          }
          readonly={readonly}
        />
      </ComplexEntryFrame>
    )
  }

  return (
    <StoreFieldInput
      state={state}
      fieldKey={fieldKey}
      schema={
        effectiveSchema
          ? {
              ...schema,
              properties: { ...(schema.properties ?? {}), [fieldKey]: effectiveSchema },
            }
          : schema
      }
      placeholder={placeholder}
      allowKeyChange={!readonly && canRenameKey}
      allowDelete={!readonly && allowDelete}
      deleteType="reset"
      readonly={readonly}
    />
  )
}

function ComplexSeparator() {
  return (
    <Separator className="my-3 [.record-entry--complex:first-child_&]:hidden [.record-entry--complex~.record-entry--complex_&]:hidden" />
  )
}
