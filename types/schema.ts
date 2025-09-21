import type { ConfigSchema, MiddlewareComposeSchema, RoutesSchema } from '@/types/godoxy'

export type Schema = typeof ConfigSchema | typeof RoutesSchema | typeof MiddlewareComposeSchema

type PropertyType = 'string' | 'number' | 'boolean' | 'object' | 'array' | (string & {})

export type JSONSchema = {
  title?: string
  description?: string
  examples?: any[]
  type?: PropertyType | PropertyType[]
  const?: string
  enum?: string[]
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
  default?: string | number | boolean | null | object | []
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
}

export type PropertySchema = { [key: string]: JSONSchema | undefined }

function distinctSchema(schema: PropertySchema): PropertySchema {
  // select one for multiple fields with same description or title
  const distinctSchema: Record<string, JSONSchema & { key?: string }> = {}
  Object.entries(schema).forEach(([key, value]) => {
    if (!value) return
    const distinctKey = value.title ?? value.description
    if (!distinctKey) {
      console.error('No distinct key found for ' + key)
      return
    }
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
export function getPropertySchema(
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

function distinct(list: string[]): string[] {
  if (list.length < 2) return list
  return Array.from(new Set(list))
}

function getAllowedValuesFromProperty(schema: JSONSchema): string[] {
  const items: string[] = []
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

export function getAllowedValues(
  schema: JSONSchema | undefined,
  keyField: string
): string[] | undefined {
  if (!schema) return undefined
  if (schema.anyOf) {
    const items = distinct(
      schema.anyOf.reduce((acc, v) => {
        const field = v.properties?.[keyField]
        if (field) {
          acc.push(...getAllowedValuesFromProperty(field))
        }
        return acc
      }, [] as string[])
    )
    if (items.length === 0) {
      return undefined
    }
    return items
  }
  if (schema.properties?.[keyField]) {
    const field = schema.properties[keyField]
    const items: string[] = []
    items.push(...getAllowedValuesFromProperty(field))
    if (items.length === 0) {
      return undefined
    }
    return items
  }
  return undefined
}

export function getTitle(schema: JSONSchema | undefined, field: string): string | undefined {
  const vSchema = schema?.properties?.[field]
  if (!vSchema) return undefined
  if (vSchema.title) return vSchema.title
  if (vSchema.description) return vSchema.description
  return undefined
}

export function getRequired(schema: JSONSchema | undefined): string[] {
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

export function isInputType(schema?: JSONSchema): boolean {
  if (!schema || !schema.type) return true
  if (Array.isArray(schema.type)) {
    return schema.type.some(t => isInputType({ type: t }))
  }
  return schema.type === 'string' || schema.type === 'number'
}

export function isToggleType(schema?: JSONSchema): boolean {
  if (!schema || !schema.type) return false
  if (Array.isArray(schema.type)) {
    return schema.type.some(t => isToggleType({ type: t }))
  }
  return schema.type === 'boolean'
}

export function getInputType(
  type?: PropertyType | PropertyType[]
): 'string' | 'number' | undefined {
  if (!type) return 'string'
  if (Array.isArray(type)) {
    if (type.includes('number')) return 'number'
    return 'string'
  }
  switch (type) {
    case 'number':
      return 'number'
    default:
      return 'string'
  }
}

export function getDefaultValue(
  schema?: JSONSchema
): string | number | boolean | object | [] | undefined {
  if (!schema) return undefined
  if (schema.default) return schema.default
  // if (schema.const) return schema.const;
  // if (schema.enum) return schema.enum[0];
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
