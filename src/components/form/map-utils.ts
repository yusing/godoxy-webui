import { getDefaultValues, type JSONSchema } from '@/types/schema'

import { compareKeys, getAdditionalPropertiesSchema, getEffectiveValueSchema } from './utils'

export {
  getEntryValueSchema,
  getKindAndEffectiveSchema,
  getMergedKeys,
  getMergedValuesAndKeys,
  shouldSortMapKeys,
}

type ValueKind = 'array' | 'object' | 'scalar'

function shouldSortMapKeys(schema: JSONSchema) {
  return Boolean(
    (schema.properties && Object.keys(schema.properties).length > 0) || schema.additionalProperties
  )
}

function getMergedValuesAndKeys({
  schema,
  workingValue,
  keyField,
  nameField,
}: {
  schema: JSONSchema
  workingValue: Record<string, unknown>
  keyField: string | undefined
  nameField: string | undefined
}) {
  const defaultValues = getDefaultValues(schema) ?? {}
  const mergedValues =
    Object.keys(defaultValues).length > 0 ? { ...defaultValues, ...workingValue } : workingValue

  const merged = new Set<string>([...Object.keys(defaultValues), ...Object.keys(workingValue)])
  const keys = Array.from(merged)
  if (!shouldSortMapKeys(schema)) return { keys, mergedValues }

  return {
    keys: keys.sort((key1, key2) =>
      compareKeys(key1, key2, {
        keyField: String(keyField),
        nameField: String(nameField),
        schema,
        defaultValues: mergedValues,
      })
    ),
    mergedValues,
  }
}

function getMergedKeys({
  schema,
  workingKeys,
  keyField,
  nameField,
}: {
  schema: JSONSchema
  workingKeys: readonly string[]
  keyField: string | undefined
  nameField: string | undefined
}) {
  const defaultValues = getDefaultValues(schema) ?? {}

  const merged = new Set<string>([...Object.keys(defaultValues), ...workingKeys])
  const keys = Array.from(merged)
  if (!shouldSortMapKeys(schema)) return keys

  return keys.sort((key1, key2) =>
    compareKeys(key1, key2, {
      keyField: String(keyField),
      nameField: String(nameField),
      schema,
      defaultValues: defaultValues,
    })
  )
}

function getEntryValueSchema(schema: JSONSchema, key: string) {
  return schema.properties?.[key] ?? getAdditionalPropertiesSchema(schema)
}

function getKindAndEffectiveSchema(
  vSchema: JSONSchema | undefined,
  value: unknown
): {
  effectiveSchema: JSONSchema | undefined
  leafSchema: JSONSchema | undefined
  kind: ValueKind
} {
  const effectiveSchema = getEffectiveValueSchema(vSchema, value)
  const leafSchema = effectiveSchema ?? vSchema
  const isArray = Array.isArray(value) || leafSchema?.type === 'array'
  const isObject =
    !isArray &&
    ((typeof value === 'object' && value !== null) ||
      leafSchema?.type === 'object' ||
      Boolean(leafSchema?.properties || leafSchema?.additionalProperties))
  return { effectiveSchema, leafSchema, kind: isArray ? 'array' : isObject ? 'object' : 'scalar' }
}
