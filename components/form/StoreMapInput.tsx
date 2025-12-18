'use client'

import { PureMapInput, type MapInputProps, type PureMapInputProps } from './MapInput'

import { Button } from '@/components/ui/button'
import { getDefaultValue, getPropertySchema, type JSONSchema } from '@/types/schema'

import type { FieldPath, FieldValues, ObjectState, ValueState } from 'juststore'
import { Plus } from 'lucide-react'
import { useMemo } from 'react'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { StoreFieldInput } from './StoreFieldInput'
import { StoreListInput } from './StoreListInput'
import { compareKeys } from './utils'

export { StoreMapInput, StorePureMapInput, type StoreMapInputProps, type StorePureMapInputProps }

type StoreMapInputProps<T extends FieldValues> = {
  state: ObjectState<T>
} & Omit<MapInputProps<T>, 'value' | 'onChange'>

type StorePureMapInputProps<T extends FieldValues> = {
  state: ObjectState<T>
} & Omit<PureMapInputProps<T>, 'value' | 'onChange'>

function StorePureMapInput<T extends FieldValues>({
  state,
  ...props
}: Readonly<StorePureMapInputProps<T>>) {
  const [value, setValue] = state.useState()
  return <PureMapInput value={value} onChange={setValue} {...props} />
}

function StoreMapInput<T extends FieldValues>({ schema, ...props }: StoreMapInputProps<T>) {
  if (!schema) {
    return <StorePureMapInput {...props} />
  }
  return <StoreMapInput_ {...props} schema={schema} />
}
function StoreMapInput_<T extends FieldValues>({
  label,
  description,
  placeholder,
  state,
  keyField,
  nameField,
  schema,
  allowDelete = true,
  card = true,
  footer,
}: Readonly<StoreMapInputProps<T> & { schema: JSONSchema }>) {
  'use memo'
  const defaultValues = useMemo(() => getDefaultValues(schema, {}), [schema])

  const entries = useMemo(
    () =>
      Object.entries(defaultValues).sort(([key1], [key2]) =>
        compareKeys(key1, key2, {
          keyField: String(keyField),
          nameField: String(nameField),
          schema,
          defaultValues,
        })
      ),
    [defaultValues, keyField, nameField, schema]
  )

  if (!card) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label>{label}</Label>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => state['']?.set('' as T[string])}
            className="size-4"
          >
            <Plus />
          </Button>
        </div>
        {description && <Label className="text-muted-foreground text-xs">{description}</Label>}
        <div className="flex flex-col gap-3">
          {entries.map(([k], index) => (
            <RenderItem
              key={k}
              k={k as FieldPath<T>}
              index={index}
              state={state}
              schema={schema}
              placeholder={placeholder}
              allowDelete={allowDelete}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row gap-4 items-center">
        <CardTitle>{label}</CardTitle>
        <state.Show on={value => !value || Object.keys(value).length === 0}>
          <Badge variant={'secondary'}>Not set</Badge>
        </state.Show>
      </CardHeader>
      {description && <CardDescription>{description}</CardDescription>}
      <CardContent className="flex flex-col gap-3">
        {entries.map(([k], index) => (
          <RenderItem
            key={k}
            k={k as FieldPath<T>}
            index={index}
            state={state}
            schema={schema}
            placeholder={placeholder}
            allowDelete={allowDelete}
          />
        ))}
      </CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  )
}

function RenderItem<T extends FieldValues>({
  k,
  index,
  state,
  schema,
  placeholder,
  allowDelete,
}: {
  k: FieldPath<T>
  index: number
  schema: JSONSchema
  allowDelete: boolean
} & Pick<StoreMapInputProps<T>, 'state' | 'placeholder'>) {
  'use memo'

  const vSchema = schema.properties?.[k]
  const valueType = state[k].useCompute(value => {
    if (typeof value === 'object') {
      if (Array.isArray(value)) return 'array'
      return 'object'
    }
    return 'string'
  })
  if (vSchema?.type === 'array' || valueType === 'array') {
    return (
      <StoreListInput
        card={false}
        key={`${index}_list`}
        label={k}
        state={state[k].ensureArray()}
        schema={vSchema}
        description={vSchema?.description}
      />
    )
  }
  if (vSchema?.type === 'object' || valueType === 'object') {
    if (schema.additionalProperties || vSchema?.additionalProperties) {
      return (
        <StorePureMapInput
          card={false}
          key={`${index}_map`}
          description={vSchema?.title || vSchema?.description}
          label={k}
          state={state[k].ensureObject()}
          placeholder={placeholder}
        />
      )
    }
    return (
      <StoreMapInput
        card={false}
        key={`${index}_map`}
        label={k}
        description={vSchema?.title || vSchema?.description}
        state={state[k].ensureObject()}
        schema={{
          ...vSchema,
          properties: getPropertySchema(schema, { keyField: k, key: String(state[k].value) }),
        }}
      />
    )
  }
  return (
    <StoreFieldInput
      key={`${index}_field`}
      state={state[k] as ValueState<T[typeof k]>}
      schema={schema}
      placeholder={placeholder}
      allowDelete={allowDelete}
      deleteType="reset"
      onKeyChange={e => state.rename(k, e)}
    />
  )
}

function getDefaultValues<T extends FieldValues>(schema: JSONSchema, workingValue: T) {
  if (!schema.properties) return {}
  return Object.keys(schema.properties)
    .filter(k => workingValue[k] === undefined)
    .reduce(
      (acc, k) => {
        acc[k] = getDefaultValue(schema?.properties?.[k])
        return acc
      },
      {} as Record<string, unknown>
    )
}
