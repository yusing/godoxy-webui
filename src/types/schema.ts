export {
  getAllowedValues,
  getDefaultValue,
  getDefaultValues,
  getInputType,
  getPropertySchema,
  getRequired,
  getTitle,
  getUnionSchemas,
  isInputType,
  isToggleType,
  isUnionType,
  type JSONSchema,
  type PropertySchema,
  type PropertyType,
}

type PropertyType = 'string' | 'number' | 'boolean' | 'object' | 'array' | (string & {})
type PrimitiveType = string | number | boolean

type JSONSchema = {
  title?: string
  description?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  examples?: any[]
  type?: PropertyType | PropertyType[]
  const?: PrimitiveType
  enum?: PrimitiveType[]
  properties?: PropertySchema
  items?: JSONSchema
  additionalProperties?: boolean | JSONSchema
  propertyNames?: JSONSchema
  patternProperties?: { [pattern: string]: JSONSchema }
  anyOf?: JSONSchema[]
  allOf?: JSONSchema[]
  oneOf?: JSONSchema[]
  not?: JSONSchema
  if?: JSONSchema
  then?: JSONSchema
  else?: JSONSchema
  required?: string[]
  dependentRequired?: { [property: string]: string[] }
  dependentSchemas?: { [property: string]: JSONSchema }
  pattern?: string
  format?: string
  default?: PrimitiveType | null | object | []
  minimum?: number
  maximum?: number
  exclusiveMinimum?: boolean | number
  exclusiveMaximum?: boolean | number
  multipleOf?: number
  maxLength?: number
  minLength?: number
  maxItems?: number
  minItems?: number
  maxProperties?: number
  minProperties?: number
  uniqueItems?: boolean
  contains?: JSONSchema
  maxContains?: number
  minContains?: number
  prefixItems?: JSONSchema[]
  contentEncoding?: string
  contentMediaType?: string
  contentSchema?: JSONSchema
  deprecated?: boolean
  readOnly?: boolean
  writeOnly?: boolean
  $ref?: string
  $schema?: string
  $id?: string
  $anchor?: string
  $defs?: { [key: string]: JSONSchema }
  $comment?: string
  definitions?: { [key: string]: JSONSchema }
}

type PropertySchema = { [key: string]: JSONSchema | undefined }

function distinctSchema(schema: PropertySchema): PropertySchema {
  // select one for multiple fields with same description or title
  const distinctSchema: Record<string, JSONSchema & { key?: string }> = {}
  Object.entries(schema).forEach(([key, value]) => {
    if (!value) return
    const distinctKey = value.title ?? value.description ?? key
    if (!distinctSchema[distinctKey]) {
      distinctSchema[distinctKey] = {
        ...value,
        key,
      }
    }
  })
  return Object.values(distinctSchema).reduce((acc, schema) => {
    const key = schema.key!
    delete schema['key']
    acc[key] = schema
    return acc
  }, {} as PropertySchema)
}

// TODO: resolve $ref
function getPropertySchema(
  definitions: JSONSchema,
  options?: {
    keyField?: string
    key?: string
  }
): PropertySchema {
  const { keyField, key } = options ?? {}
  if (definitions.anyOf) {
    if (keyField) {
      return distinctSchema(
        definitions.anyOf.find(v => {
          const field = v.properties?.[keyField]
          if (!key) {
            return field
          }
          return (
            field &&
            (field.const === key ||
              field.enum?.includes(key) ||
              field.title === key ||
              field.description === key)
          )
        })?.properties ?? {}
      )
    }
    return {}
  }
  if (definitions.properties) {
    return distinctSchema(definitions.properties)
  }
  if (definitions.items) {
    return getPropertySchema(definitions.items, {
      keyField: keyField,
      key: key,
    })
  }
  return {}
}

function distinct<T extends PrimitiveType>(list: T[]): T[] {
  if (list.length < 2) return list
  return Array.from(new Set(list))
}

function getAllowedValuesFromProperty(schema: JSONSchema): PrimitiveType[] {
  const items: PrimitiveType[] = []
  if (schema.const) {
    items.push(schema.const)
  }
  if (schema.enum) {
    items.push(...schema.enum)
  }
  if (schema.anyOf) {
    schema.anyOf.forEach(v => {
      items.push(...getAllowedValuesFromProperty(v))
    })
  }
  return distinct(items)
}

function getAllowedValues(
  schema: JSONSchema | undefined,
  keyField: string
): PrimitiveType[] | undefined {
  if (!schema) return undefined
  if (schema.items?.enum) {
    return schema.items.enum
  }
  if (schema.anyOf) {
    const items = distinct(
      schema.anyOf.reduce((acc, v) => {
        const field = v.properties?.[keyField]
        if (field) {
          acc.push(...getAllowedValuesFromProperty(field))
        }
        return acc
      }, [] as PrimitiveType[])
    )
    if (items.length === 0) {
      return undefined
    }
    return items
  }
  if (schema.properties?.[keyField]) {
    const field = schema.properties[keyField]
    const items: PrimitiveType[] = []
    items.push(...getAllowedValuesFromProperty(field))
    if (items.length === 0) {
      return undefined
    }
    return items
  }
  return undefined
}

function getTitle(schema: JSONSchema | undefined, field: string): string | undefined {
  const vSchema = schema?.properties?.[field]
  if (!vSchema) return undefined
  if (vSchema.title) return vSchema.title
  if (vSchema.description) return vSchema.description
  return undefined
}

function getRequired(schema: JSONSchema | undefined): string[] {
  if (!schema) return []
  if (schema.required) return schema.required
  if (schema.anyOf) {
    return distinct(
      schema.anyOf.reduce((acc, v) => {
        if (v.required && !v.default) {
          acc.push(...v.required)
        }
        return acc
      }, [] as string[])
    )
  }
  return []
}

function isInputType(schema?: JSONSchema): boolean {
  if (!schema || !schema.type) return true
  if (Array.isArray(schema.type)) {
    return schema.type.some(t => isInputType({ type: t }))
  }
  return schema.type === 'string' || schema.type === 'number'
}

function isToggleType(schema?: JSONSchema): boolean {
  if (!schema || !schema.type) return false
  if (Array.isArray(schema.type)) {
    return schema.type.some(t => isToggleType({ type: t }))
  }
  return schema.type === 'boolean'
}

/* Checks if a schema represents a union type (anyOf or oneOf) */
function isUnionType(schema: JSONSchema): boolean {
  return Boolean(schema.anyOf || schema.oneOf)
}

/* Gets all schemas from a union type (anyOf or oneOf) */
function getUnionSchemas(schema: JSONSchema): JSONSchema[] {
  if (schema.anyOf) return schema.anyOf
  if (schema.oneOf) return schema.oneOf
  return []
}

function getInputType(type?: PropertyType | PropertyType[]): 'string' | 'number' | undefined {
  if (!type) return 'string'

  const types = Array.isArray(type) ? type : [type]

  // Prefer string if allowed; a number input cannot display non-numeric strings.
  if (types.includes('string')) return 'string'

  // Treat integer as number-like for input purposes.
  if (types.includes('number') || types.includes('integer')) return 'number'

  return 'string'
}

function getDefaultValues(schema: JSONSchema) {
  if (!schema.properties && !schema.additionalProperties) return {}
  return Object.keys(schema.properties ?? {}).reduce(
    (acc, k) => {
      acc[k] = getDefaultValue(schema?.properties?.[k])
      return acc
    },
    {} as Record<string, unknown>
  )
}

function getDefaultValue(
  schema?: JSONSchema
): string | number | boolean | object | [] | null | undefined {
  if (!schema) return undefined
  if (schema.default !== undefined) return schema.default
  if (schema.const !== undefined) return schema.const
  if (schema.enum && schema.enum.length > 0) return schema.enum[0]

  function isSchemaType(inner: JSONSchema, type: string): boolean {
    if (inner.type === type) return true
    if (Array.isArray(inner.type)) return inner.type.includes(type)
    return false
  }

  function isObjectishSchema(inner: JSONSchema): boolean {
    return Boolean(
      isSchemaType(inner, 'object') ||
        inner.properties ||
        inner.additionalProperties ||
        inner.patternProperties
    )
  }

  function isArrayishSchema(inner: JSONSchema): boolean {
    return Boolean(isSchemaType(inner, 'array') || inner.items || inner.prefixItems)
  }

  if (isUnionType(schema)) {
    const unionSchemas = getUnionSchemas(schema)
    const picked =
      unionSchemas.find(isObjectishSchema) ?? unionSchemas.find(isArrayishSchema) ?? unionSchemas[0]
    return getDefaultValue(picked)
  }

  if (!schema.type) {
    if (isObjectishSchema(schema)) return {}
    if (isArrayishSchema(schema)) return []
  }

  if (schema.type) {
    if (Array.isArray(schema.type)) {
      if (schema.type.length > 0) {
        return getDefaultValue({ type: schema.type[0] })
      }
      return ''
    }
    switch (schema.type) {
      case 'string':
        return ''
      case 'number':
        return 0
      case 'boolean':
        return false
      case 'object':
        return {}
      case 'array':
        return []
      default:
        return undefined
    }
  }
  return ''
}
