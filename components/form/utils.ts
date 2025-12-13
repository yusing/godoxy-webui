import type { JSONSchema } from '@/types/schema'

export { compareKeys, getTypePriority }

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

  // Get types for comparison
  const type1 = (schema.properties?.[key1]?.type as string) || typeof defaultValues[key1]
  const type2 = (schema.properties?.[key2]?.type as string) || typeof defaultValues[key2]

  const priority1 = getTypePriority(type1)
  const priority2 = getTypePriority(type2)

  // Priority 2: Sort by type priority
  if (priority1 !== priority2) {
    return priority1 - priority2
  }

  // Priority 3: Alphabetical sort within same type
  return key1.localeCompare(key2)
}
