import { getUnionSchemas, isUnionType, type JSONSchema } from '@/types/schema'

export {
  canAddKey,
  compareKeys,
  getAdditionalPropertiesSchema,
  getDescription,
  getEffectiveValueSchema,
  getLabel,
  getTypePriority,
  stringify,
}

function stringify(value: unknown): string | undefined {
  if (value === undefined) return undefined
  if (value === null) return undefined
  return String(value)
}

function canAddKey(schema: JSONSchema) {
  if (schema.additionalProperties === undefined) return false
  switch (typeof schema.additionalProperties) {
    case 'boolean':
      return schema.additionalProperties
    case 'object':
      return true
    default:
      return false
  }
}

function getTypePriority(type: string) {
  switch (type) {
    case 'boolean':
      return 0
    case 'string':
      return 1
    case 'number':
    case 'integer':
      return 2
    case 'object':
      return 3
    default:
      return 4
  }
}

function getSchemaTypePriority(schema: JSONSchema | undefined, fallbackValue: unknown): number {
  if (!schema) return getTypePriority(typeof fallbackValue)

  const t = schema.type
  if (typeof t === 'string') return getTypePriority(t)
  if (Array.isArray(t) && t.length > 0) {
    return Math.min(...t.map(e => getTypePriority(e)))
  }

  if (isUnionType(schema)) {
    const unionSchemas = getUnionSchemas(schema)
    if (unionSchemas.length > 0) {
      return Math.min(...unionSchemas.map(s => getSchemaTypePriority(s, fallbackValue)))
    }
  }

  // Infer object if schema defines object-ish structure without explicit type
  if (schema.properties || schema.additionalProperties) {
    return getTypePriority('object')
  }

  return getTypePriority(typeof fallbackValue)
}

function getKeyValueSchema(
  schema: JSONSchema,
  key: string,
  value: unknown
): JSONSchema | undefined {
  const direct = schema.properties?.[key]
  if (direct) return direct
  const ap = getAdditionalPropertiesSchema(schema)
  if (!ap) return undefined
  return getEffectiveValueSchema(ap, value) ?? ap
}

function compareKeys(
  key1: string,
  key2: string,
  {
    keyField,
    nameField,
    schema,
    defaultValues,
  }: {
    keyField: string
    nameField: string
    schema: JSONSchema
    defaultValues: Record<string, unknown>
  }
) {
  // Priority 1: keyField and nameField come first
  if (key1 === keyField || key1 === nameField) return -1
  if (key2 === keyField || key2 === nameField) return 1

  const schema1 = getKeyValueSchema(schema, key1, defaultValues[key1])
  const schema2 = getKeyValueSchema(schema, key2, defaultValues[key2])

  const priority1 = getSchemaTypePriority(schema1, defaultValues[key1])
  const priority2 = getSchemaTypePriority(schema2, defaultValues[key2])

  // Priority 2: Sort by type priority, if same type, keep original order
  return priority1 - priority2
}

function getAdditionalPropertiesSchema(schema: JSONSchema): JSONSchema | undefined {
  const ap = schema.additionalProperties
  if (!ap || typeof ap === 'boolean') return undefined
  return ap
}

/**
 * Determines the effective schema for a value based on its type.
 * For union types (anyOf/oneOf), finds the matching schema variant.
 */
function getEffectiveValueSchema(
  vSchema: JSONSchema | undefined,
  value: unknown
): JSONSchema | undefined {
  if (!vSchema) return vSchema

  // Check if this is a union type schema
  if (isUnionType(vSchema)) {
    const unionSchemas = getUnionSchemas(vSchema)
    const valueType = typeof value

    // For string values, try to match a string schema
    if (valueType === 'string' && value !== null && value !== undefined) {
      // First, look for const or enum matches
      for (const unionSchema of unionSchemas) {
        if (unionSchema.const === value) return unionSchema
        if (unionSchema.enum && unionSchema.enum.includes(value as string)) return unionSchema
      }
      // Then, look for string type schemas (URL, etc.)
      for (const unionSchema of unionSchemas) {
        const schemaType = unionSchema.type
        if (schemaType === 'string') {
          return unionSchema
        }
      }
    }

    // For object values, look for object schema
    if (valueType === 'object' && value !== null && !Array.isArray(value)) {
      for (const unionSchema of unionSchemas) {
        if (unionSchema.type === 'object' || unionSchema.type === undefined) {
          // Check if this looks like an object with the expected properties
          if (unionSchema.properties) {
            return unionSchema
          }
        }
      }
    }

    // Fallback: return first matching type
    return vSchema
  }

  return vSchema
}

function getLabel(schema: JSONSchema | undefined, field: string): string {
  if (!schema) return field
  return !schema.title && schema.description ? schema.description : field
}

function getDescription(schema: JSONSchema | undefined, field: string): string | undefined {
  if (!schema) return undefined
  return !schema.title && schema.description ? field : schema.title || schema.description
}
