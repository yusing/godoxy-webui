'use client'
'use memo'

import { ComplexEntryHeader, type MapInputProps, type RecordInputProps } from './MapInput'

import { getDefaultValue, getPropertySchema, type JSONSchema } from '@/types/schema'

import type { FieldPath, FieldValues, ObjectState, ValueState } from 'juststore'
import { Activity, useMemo, useRef, type ReactNode } from 'react'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { FormContainer } from './FormContainer'
import { StoreFieldInput } from './StoreFieldInput'
import { StoreListInput } from './StoreListInput'
import { getEntryValueSchema, getKindAndEffectiveSchema, getMergedValuesAndKeys } from './map-utils'
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
  'use memo'

  const pureKeysRef = useRef<string[]>([])
  const { keys, firstComplexIndex } = useRecordMeta(state, valueSchema, pureKeysRef)

  return (
    <FormContainer
      label={label}
      description={description}
      card={card}
      level={0}
      canAdd
      onAdd={() => state['']?.set(getDefaultValue(valueSchema) as T[string] | undefined)}
    >
      {keys.map((k, index) => (
        <StoreRecordInputItem
          key={index}
          k={k}
          state={state}
          valueSchema={valueSchema}
          placeholder={placeholder}
          pureKeysRef={pureKeysRef}
          separator={
            index === firstComplexIndex &&
            firstComplexIndex > 0 && <Separator key="__separator__" className="my-3" />
          }
        />
      ))}
    </FormContainer>
  )
}

function useRecordMeta<T extends FieldValues>(
  state: ObjectState<T>,
  valueSchema: JSONSchema | undefined,
  pureKeysRef: React.RefObject<string[]>
) {
  return state.useCompute(v => {
    const value = v ?? {}
    const currentKeys = Object.keys(value)
    const currentSet = new Set(currentKeys)

    const ordered = pureKeysRef.current.filter(k => currentSet.has(k))
    for (const k of ordered) currentSet.delete(k)
    for (const k of currentSet) ordered.push(k)
    pureKeysRef.current = ordered

    let firstComplexIndex = -1
    for (let i = 0; i < ordered.length; i++) {
      const k = ordered[i]!
      const v = value[k]
      const { kind } = getKindAndEffectiveSchema(valueSchema, v)
      if (kind !== 'scalar') {
        firstComplexIndex = i
        break
      }
    }

    pureKeysRef.current = ordered
    return { keys: ordered, firstComplexIndex }
  })
}

function StoreRecordInputItem<T extends FieldValues>({
  k,
  state,
  valueSchema,
  placeholder,
  pureKeysRef,
  separator,
}: {
  k: string
  state: ObjectState<T>
  valueSchema?: JSONSchema
  placeholder: { key?: string; value?: string } | undefined
  pureKeysRef: React.RefObject<string[]>
  separator: ReactNode | false
}) {
  const child = state[k]!

  const { leafSchema, kind } = child.useCompute(v => getKindAndEffectiveSchema(valueSchema, v))
  const effSchema = leafSchema

  // Memoize the schema object to prevent StoreFieldInput re-renders
  const fieldSchema = useMemo(
    () => (effSchema ? { properties: { [k]: effSchema } } : undefined),
    [effSchema, k]
  )

  if (kind === 'array') {
    return (
      <div className="flex flex-col gap-2">
        {separator}
        <ComplexEntryHeader
          displayKey={k}
          placeholderKey={placeholder?.key}
          isKeyTaken={candidate => candidate in (state.value ?? {}) && candidate !== k}
          onKeyChange={newK => {
            const idx = pureKeysRef.current.indexOf(k)
            if (idx !== -1) pureKeysRef.current[idx] = newK
            state.rename(k, newK)
          }}
          onDelete={child.reset}
        />
        <StoreListInput
          card={false}
          label={undefined}
          placeholder={placeholder?.value}
          state={child.ensureArray()}
          schema={effSchema}
        />
      </div>
    )
  }

  if (kind === 'object') {
    const apSchema = effSchema ? getAdditionalPropertiesSchema(effSchema) : undefined
    if (apSchema) {
      return (
        <div className={k === '' ? 'mt-2 rounded-md border border-dashed border-border p-2' : ''}>
          {separator}
          {k === '' && <div className="mb-2 text-xs text-muted-foreground">New item</div>}
          <ComplexEntryHeader
            displayKey={k}
            placeholderKey={placeholder?.key}
            isKeyTaken={candidate => candidate in (state.value ?? {}) && candidate !== k}
            onKeyChange={newK => {
              const idx = pureKeysRef.current.indexOf(k)
              if (idx !== -1) pureKeysRef.current[idx] = newK
              state.rename(k, newK)
            }}
            onDelete={child.reset}
          />
          <StoreRecordInput
            card={false}
            label={undefined}
            description={undefined}
            placeholder={placeholder}
            state={child.ensureObject()}
            valueSchema={apSchema}
          />
        </div>
      )
    }

    return (
      <div className={k === '' ? 'mt-2 rounded-md border border-dashed border-border p-2' : ''}>
        {separator}
        {k === '' && <div className="mb-2 text-xs text-muted-foreground">New item</div>}
        <ComplexEntryHeader
          displayKey={k}
          placeholderKey={placeholder?.key}
          isKeyTaken={candidate => candidate in (state.value ?? {}) && candidate !== k}
          onKeyChange={newK => {
            const idx = pureKeysRef.current.indexOf(k)
            if (idx !== -1) pureKeysRef.current[idx] = newK
            state.rename(k, newK)
          }}
          onDelete={child.reset}
        />
        <StoreMapInput
          card={false}
          label={undefined}
          description={getDescription(effSchema, k)}
          placeholder={placeholder}
          state={child.ensureObject()}
          schema={effSchema}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {separator}
      <StoreFieldInput
        state={child as ValueState<T[string]>}
        schema={fieldSchema}
        placeholder={placeholder}
        allowDelete
        onKeyChange={newK => {
          const current = state.value ?? {}
          if (newK !== k && newK in current) return
          const idx = pureKeysRef.current.indexOf(k)
          if (idx !== -1) pureKeysRef.current[idx] = newK
          state.rename(k, newK)
        }}
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
  const keys = state.useCompute(v => {
    const workingValue = v ?? {}
    const { keys } = getMergedValuesAndKeys({
      schema,
      workingValue,
      keyField: keyField ? String(keyField) : undefined,
      nameField: nameField ? String(nameField) : undefined,
    })
    return keys
  })

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
  k,
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
  'use memo'

  const canRenameKey = !schema.properties || !(k in (schema.properties ?? {}))

  // Determine the effective schema based on the actual value type
  const { effectiveSchema, kind } = state[k].useCompute(currentValue =>
    getKindAndEffectiveSchema(getEntryValueSchema(schema, k), currentValue)
  )

  const nestedLabel = getLabel(effectiveSchema, k)
  const nestedDescription = getDescription(effectiveSchema, k)

  const header = (
    <Activity mode={canRenameKey ? 'visible' : 'hidden'}>
      <ComplexEntryHeader
        displayKey={k}
        placeholderKey={placeholder?.key}
        isKeyTaken={candidate => candidate in (state.value ?? {}) && candidate !== String(k)}
        onKeyChange={newK => state.rename(k, newK)}
        onDelete={state[k].reset}
      />
    </Activity>
  )

  // Handle array type
  if (kind === 'array') {
    const headerShown = canRenameKey
    const childLabel = headerShown ? undefined : nestedLabel
    return (
      <div className="flex flex-col gap-2">
        {header}
        <StoreListInput
          card={false}
          level={level + 1}
          label={childLabel}
          state={state[k].ensureArray()}
          schema={effectiveSchema}
          description={nestedDescription}
        />
      </div>
    )
  }

  // Handle object type
  if (kind === 'object') {
    const headerShown = canRenameKey
    const childLabel = headerShown ? undefined : nestedLabel
    const apSchema = effectiveSchema && getAdditionalPropertiesSchema(effectiveSchema)
    if (apSchema) {
      return (
        <div className="flex flex-col gap-2">
          {header}
          <StoreRecordInput
            card={false}
            level={level + 1}
            label={childLabel}
            description={nestedDescription}
            state={state[k].ensureObject()}
            valueSchema={apSchema}
          />
        </div>
      )
    }
    return (
      <div className="flex flex-col gap-2">
        {header}
        <StoreMapInput
          card={false}
          level={level + 1}
          label={childLabel}
          description={nestedDescription}
          state={state[k].ensureObject()}
          schema={
            effectiveSchema
              ? {
                  ...effectiveSchema,
                  properties: getPropertySchema(effectiveSchema, {
                    keyField: k,
                    key: state[k].value,
                  }),
                }
              : undefined
          }
        />
      </div>
    )
  }

  return (
    <StoreFieldInput
      state={state[k] as ValueState<T[typeof k]>}
      schema={effectiveSchema}
      placeholder={placeholder}
      allowDelete={allowDelete}
      deleteType="reset"
      onKeyChange={canRenameKey ? e => state.rename(k, e) : undefined}
    />
  )
}
