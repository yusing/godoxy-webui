'use client'

import type { FieldValues } from '@/juststore/src/path'
import type { ObjectState } from '@/juststore/src/types'
import { MapInput, type MapInputProps } from './MapInput'

// import { Button } from '@/components/ui/button'
// import { getDefaultValue, getPropertySchema, type JSONSchema } from '@/types/schema'

// import type { FieldPath, FieldValues, ObjectState } from 'juststore'
// import { Plus } from 'lucide-react'
// import { Badge } from '../ui/badge'
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
// import { Label } from '../ui/label'
// import { StoreFieldInput } from './StoreFieldInput'
// import { StoreListInput } from './StoreListInput'

export { StoreMapInput, type StoreMapInputProps }

type StoreMapInputProps<T extends FieldValues> = {
  state: ObjectState<T | undefined>
} & Omit<MapInputProps<T>, 'value' | 'onChange'>

function StoreMapInput<T extends FieldValues>({
  state,
  ...props
}: Readonly<StoreMapInputProps<T>>) {
  const [value, setValue] = state.useState()
  return <MapInput value={value} onChange={setValue} {...props} />
}

// function RenderPureMapItem<T extends FieldValues>({
//   k,
//   state,
//   placeholder,
// }: {
//   k: FieldPath<T>
//   state: ObjectState<T | undefined>
//   placeholder?: { key?: string; value?: string }
// }) {
//   'use memo'
//   const [vState, setVState] = useState(state[k])

//   return (
//     <StoreFieldInput
//       state={vState}
//       allowDelete
//       schema={undefined}
//       placeholder={placeholder}
//       onKeyChange={newKey => {
//         state.rename(k, newKey, false)
//         setVState(state[newKey as FieldPath<T>])
//       }}
//     />
//   )
// }

// function PureMapContent<T extends FieldValues>({
//   state,
//   placeholder,
// }: {
//   state: ObjectState<T | undefined>
//   placeholder?: { key?: string; value?: string }
// }) {
//   'use memo'

//   const keys = state.useCompute(value => {
//     const current = Object.keys(value ?? {})
//     console.log('keys', current)
//     return current ?? []
//   })

//   return (
//     <>
//       {keys.map(k => (
//         <RenderPureMapItem key={k} k={k as FieldPath<T>} state={state} placeholder={placeholder} />
//       ))}
//     </>
//   )
// }

// function StorePureMapInput<T extends FieldValues>({
//   label,
//   description,
//   placeholder,
//   state,
//   card = false,
// }: Readonly<Omit<StoreMapInputProps<T>, 'allowDelete' | 'schema' | 'footer'>>) {
//   if (!card) {
//     return (
//       <div className="space-y-3">
//         <div className="flex items-center gap-2">
//           <Label>{label}</Label>
//           <Button
//             type="button"
//             variant="ghost"
//             size="icon"
//             onClick={() => state.set(prev => ({ ...prev, ['' as keyof T]: '' }) as T)}
//             className="size-4"
//           >
//             <Plus />
//           </Button>
//         </div>
//         {description && <Label className="text-muted-foreground text-xs">{description}</Label>}
//         <div className="flex flex-col gap-3">
//           <PureMapContent state={state} placeholder={placeholder} />
//         </div>
//       </div>
//     )
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>{label}</CardTitle>
//         {description && <CardDescription>{description}</CardDescription>}
//       </CardHeader>
//       <CardContent className="flex flex-col gap-3">
//         <PureMapContent state={state} placeholder={placeholder} />
//       </CardContent>
//       <CardFooter>
//         <Button
//           type="button"
//           size="sm"
//           className="w-full"
//           onClick={() => state.set(prev => ({ ...prev, ['' as keyof T]: '' }) as T)}
//         >
//           New Item
//         </Button>
//       </CardFooter>
//     </Card>
//   )
// }

// function getTypePriority(type: string) {
//   switch (type) {
//     case 'string':
//       return 0
//     case 'number':
//     case 'integer':
//       return 1
//     case 'boolean':
//       return 2
//     default:
//       return 3
//   }
// }

// function StoreMapInput_<T extends FieldValues>({
//   label,
//   description,
//   placeholder,
//   state,
//   keyField,
//   nameField,
//   schema,
//   allowDelete = true,
//   card = true,
//   footer,
// }: Readonly<StoreMapInputProps<T> & { schema: JSONSchema }>) {
//   'use memo'
//   const [workingValue, defaultValues, isEmpty] = state.useCompute(value => {
//     if (!value) return [{} as T, getDefaultValues(schema, {}), true]

//     const result: Record<string, unknown> = value ? { ...value } : {}

//     const isEmpty = Object.keys(result).length === 0

//     if (keyField && isEmpty) {
//       result[keyField as string] = getDefaultValue(schema?.properties?.[keyField as string])
//     }

//     if (schema.required) {
//       for (const k of schema.required) {
//         if (result[k] === undefined) {
//           result[k] = getDefaultValue(schema?.properties?.[k])
//         }
//       }
//     }

//     return [result as T, getDefaultValues(schema, result), isEmpty]
//   })

//   const entries = useMemo(
//     () =>
//       Object.entries({ ...defaultValues, ...workingValue }).sort(([key1], [key2]) => {
//         // Priority 1: keyField and nameField come first
//         if (key1 === (keyField as string) || key1 === (nameField as string)) return -1
//         if (key2 === (keyField as string) || key2 === (nameField as string)) return 1

//         // Get types for comparison
//         const type1 = schema.properties?.[key1]?.type as string
//         const type2 = schema.properties?.[key2]?.type as string

//         const priority1 = getTypePriority(type1)
//         const priority2 = getTypePriority(type2)

//         // Priority 2: Sort by type priority
//         if (priority1 !== priority2) {
//           return priority1 - priority2
//         }

//         // Priority 3: Alphabetical sort within same type
//         return key1.localeCompare(key2)
//       }),
//     [defaultValues, workingValue, keyField, nameField, schema]
//   )

//   if (!card) {
//     return (
//       <div className="space-y-3">
//         <div className="flex items-center gap-2">
//           <Label>{label}</Label>
//           <Button
//             type="button"
//             variant="ghost"
//             size="icon"
//             onClick={() => state['']?.set('' as T[string])}
//             className="size-4"
//           >
//             <Plus />
//           </Button>
//         </div>
//         {description && <Label className="text-muted-foreground text-xs">{description}</Label>}
//         <div className="flex flex-col gap-3">
//           {entries.map(([k], index) => (
//             <RenderItem
//               key={k}
//               k={k as FieldPath<T>}
//               index={index}
//               state={state}
//               schema={schema}
//               placeholder={placeholder}
//               allowDelete={allowDelete}
//             />
//           ))}
//         </div>
//       </div>
//     )
//   }

//   return (
//     <Card>
//       <CardHeader className="flex flex-row gap-4 items-center">
//         <CardTitle>{label}</CardTitle>
//         {isEmpty && <Badge variant={'secondary'}>Not set</Badge>}
//       </CardHeader>
//       {description && <CardDescription>{description}</CardDescription>}
//       <CardContent className="flex flex-col gap-3">
//         {entries.map(([k], index) => (
//           <RenderItem
//             key={k}
//             k={k as FieldPath<T>}
//             index={index}
//             state={state}
//             schema={schema}
//             placeholder={placeholder}
//             allowDelete={allowDelete}
//           />
//         ))}
//       </CardContent>
//       {footer && <CardFooter>{footer}</CardFooter>}
//     </Card>
//   )
// }

// export function StoreMapInput<T extends Record<string, unknown>>({
//   schema,
//   ...props
// }: StoreMapInputProps<T>) {
//   if (!schema) {
//     return <StorePureMapInput {...props} />
//   }
//   return <StoreMapInput_ {...props} schema={schema} />
// }

// function RenderItem<T extends FieldValues>({
//   k,
//   index,
//   state,
//   schema,
//   placeholder,
//   allowDelete,
// }: {
//   k: FieldPath<T>
//   index: number
//   schema: JSONSchema
//   allowDelete: boolean
// } & Pick<StoreMapInputProps<T>, 'state' | 'placeholder'>) {
//   'use memo'

//   const vSchema = schema.properties?.[k]
//   const valueType = state[k].useCompute(value => {
//     if (typeof value === 'object') {
//       if (Array.isArray(value)) return 'array'
//       return 'object'
//     }
//     return 'string'
//   })
//   if (vSchema?.type === 'array' || valueType === 'array') {
//     return (
//       <StoreListInput
//         card={false}
//         key={`${index}_list`}
//         label={k}
//         state={state[k].ensureArray<string>()}
//         schema={vSchema}
//         description={vSchema?.description}
//       />
//     )
//   }
//   if (vSchema?.type === 'object' || valueType === 'object') {
//     if (schema.additionalProperties || vSchema?.additionalProperties) {
//       return (
//         <StorePureMapInput
//           card={false}
//           key={`${index}_map`}
//           description={vSchema?.title || vSchema?.description}
//           label={k}
//           state={state[k].ensureObject()}
//           placeholder={placeholder}
//         />
//       )
//     }
//     return (
//       <StoreMapInput
//         card={false}
//         key={`${index}_map`}
//         label={k}
//         description={vSchema?.title || vSchema?.description}
//         state={state[k].ensureObject()}
//         schema={{
//           ...vSchema,
//           properties: getPropertySchema(schema, { keyField: k, key: String(state[k].value) }),
//         }}
//       />
//     )
//   }
//   return (
//     <StoreFieldInput
//       key={`${index}_field`}
//       state={state[k]}
//       schema={schema}
//       placeholder={placeholder}
//       allowDelete={allowDelete}
//       deleteType="reset"
//       onKeyChange={e => {
//         // const newValue = state[k].value ?? getDefaultValue(schema?.properties?.[e])
//         // state[k].reset()
//         // state[e]?.set(newValue as T[string])
//         state.rename(k, e)
//       }}
//     />
//   )
// }

// function getDefaultValues<T extends FieldValues>(schema: JSONSchema, workingValue: T) {
//   if (!schema.properties) return {}
//   return Object.keys(schema.properties)
//     .filter(k => workingValue[k] === undefined)
//     .reduce(
//       (acc, k) => {
//         acc[k] = getDefaultValue(schema?.properties?.[k])
//         return acc
//       },
//       {} as Record<string, unknown>
//     )
// }
