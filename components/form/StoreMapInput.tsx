'use client'
'use memo'

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

export { StoreMapInput, StoreRecordInput, type StoreMapInputProps, type StoreRecordInputProps }

type StoreMapInputProps<T extends FieldValues> = {
  state: ObjectState<T>
} & Omit<MapInputProps<T>, 'value' | 'onChange'>

function StoreMapInput<T extends FieldValues>({ schema, ...props }: StoreMapInputProps<T>) {
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
}: Readonly<StoreRecordInputProps<T>>) {
  const numKeys = state.keys.useCompute(v => v.length)

  return (
    <FormContainer
      label={label}
      description={description}
      card={card}
      level={0}
      canAdd
      onAdd={() => state['']?.set(getDefaultValue(valueSchema) as T[string] | undefined)}
    >
      {Array.from({ length: numKeys }).map((_, index) => (
        <StoreRecordInputItem
          key={index}
          state={state}
          index={index}
          valueSchema={valueSchema}
          placeholder={placeholder}
        />
      ))}
    </FormContainer>
  )
}

function StoreRecordInputItem<T extends FieldValues>({
  index,
  state,
  valueSchema,
  placeholder,
}: {
  index: number
  state: ObjectState<T>
  valueSchema?: JSONSchema
  placeholder: { key?: string; value?: string } | undefined
}) {
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
    const isNew = fieldKey === ''
    return (
      <div
        className={`record-entry--complex ${isNew ? 'mt-2 rounded-md border border-dashed border-border p-2' : ''}`}
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
        />
        <StoreListInput
          card={false}
          label={undefined}
          placeholder={placeholder?.value}
          state={child.ensureArray()}
          schema={entrySchema}
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
            card={false}
            label={undefined}
            description={undefined}
            placeholder={placeholder}
            state={child.ensureObject()}
            valueSchema={apSchema}
          />
        </RecordComplexEntryFrame>
      )
    }

    return (
      <RecordComplexEntryFrame>
        <StoreMapInput
          card={false}
          label={undefined}
          description={getDescription(entrySchema, fieldKey)}
          placeholder={placeholder}
          state={child.ensureObject()}
          schema={entrySchema}
        />
      </RecordComplexEntryFrame>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <StoreFieldInput<T>
        state={state}
        fieldKey={fieldKey}
        schema={fieldSchema}
        placeholder={placeholder}
        allowKeyChange
        allowDelete
      />
    </div>
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
  level = 0,
  footer,
}: Readonly<StoreMapInputProps<T> & { schema: JSONSchema }>) {
  const keys = state.keys.useCompute(workingKeys =>
    getMergedKeys({
      schema,
      workingKeys,
      keyField: keyField ? String(keyField) : undefined,
      nameField: nameField ? String(nameField) : undefined,
    })
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
        state['']?.set(
          getDefaultValue(getAdditionalPropertiesSchema(schema)) as T[string] | undefined
        )
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
          level={level}
          k={k as FieldPath<T>}
          state={state}
          schema={schema}
          placeholder={placeholder}
          allowDelete={allowDelete}
        />
      ))}
    </FormContainer>
  )
}

function StoreMapInputItem<T extends FieldValues>({
  k: fieldKey,
  state,
  schema,
  placeholder,
  allowDelete,
  level,
}: {
  k: FieldPath<T>
  schema: JSONSchema
  allowDelete: boolean
  level: number
} & Pick<StoreMapInputProps<T>, 'state' | 'placeholder'>) {
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
    return (
      <div className="flex flex-col gap-2">
        <Activity mode={canRenameKey ? 'visible' : 'hidden'}>
          <ComplexEntryHeader
            displayKey={fieldKey}
            placeholderKey={placeholder?.key}
            isKeyTaken={candidate =>
              candidate in (state.value ?? {}) && candidate !== String(fieldKey)
            }
            onKeyChange={newK => state.rename(fieldKey, newK)}
            onDelete={child.reset}
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
          level={level + 1}
          label={childLabel}
          state={child.ensureArray()}
          schema={effectiveSchema}
          description={nestedDescription}
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
            level={level + 1}
            label={childLabel}
            description={nestedDescription}
            state={child.ensureObject()}
            valueSchema={apSchema}
          />
        </ComplexEntryFrame>
      )
    }
    return (
      <ComplexEntryFrame>
        <StoreMapInput
          card={false}
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
      allowKeyChange={canRenameKey}
      allowDelete={allowDelete}
      deleteType="reset"
    />
  )
}

function ComplexSeparator() {
  return (
    <Separator className="my-3 [.record-entry--complex:first-child_&]:hidden [.record-entry--complex~.record-entry--complex_&]:hidden" />
  )
}
