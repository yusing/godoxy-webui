'use client'

import { IconRefresh, IconTrash } from '@tabler/icons-react'
import { useEffect, useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  getAllowedValues,
  getDefaultValue,
  getInputType,
  getRequired,
  getTitle,
  isInputType,
  isToggleType,
  type JSONSchema,
} from '@/types/schema'
import type { FieldPath, FieldValues, ObjectState, State } from 'juststore'
import { Label } from '../ui/label'
import { stringify } from './utils'

type StoreFieldInputProps<T extends FieldValues> = {
  state: ObjectState<T>
  fieldKey: FieldPath<T>
  schema: JSONSchema | undefined
  placeholder?: { key?: string; value?: string }
  allowKeyChange: boolean
  allowDelete: boolean
  deleteType?: 'delete' | 'reset'
  readonly?: boolean
  onKeyChange?: (newKey: string) => void
}

function childWithDefault<T>(child: State<T>, vSchema: JSONSchema | undefined) {
  const defaultValue = getDefaultValue(vSchema)
  if (defaultValue === undefined) return child
  return child.withDefault(defaultValue as NonNullable<T>)
}

export function StoreFieldInput<T extends FieldValues>({
  state,
  fieldKey,
  schema,
  placeholder,
  allowKeyChange = true,
  allowDelete = true,
  deleteType = 'delete',
  readonly = false,
  onKeyChange,
}: Readonly<StoreFieldInputProps<T>>) {
  'use memo'
  const vSchema = schema?.properties?.[fieldKey]
  const child = childWithDefault(state[fieldKey], vSchema)

  const allowedValues = useMemo(
    () => getAllowedValues(schema, fieldKey)?.filter(e => e !== ''),
    [schema, fieldKey]
  )
  const required = useMemo(() => getRequired(schema).includes(fieldKey), [schema, fieldKey])

  const title = useMemo(() => getTitle(schema, fieldKey), [schema, fieldKey])

  useEffect(() => {
    if (vSchema?.const === undefined) return
    if (child.value === vSchema.const) return
    child.set(vSchema.const as T[typeof fieldKey])
  }, [child, vSchema?.const])

  if (vSchema?.const !== undefined && !allowKeyChange && (required || !allowDelete)) return null

  return (
    <div
      className={cn(schema?.properties && !(fieldKey in schema.properties) && 'text-destructive')}
    >
      <div className="flex w-full items-center gap-2">
        {allowKeyChange ? (
          <div className="max-w-[220px] w-full @container">
            <Input
              readOnly={readonly}
              value={fieldKey}
              placeholder={placeholder?.key ?? 'Key'}
              onChange={({ target: { value } }) => {
                state.rename(fieldKey, value)
                onKeyChange?.(value)
              }}
              className="text-xs"
            />
          </div>
        ) : (
          <div className="min-w-[150px] select-none max-w-min">
            <div className="flex items-center gap-2">
              <Label className="block capitalize">
                {title ?? fieldKey}
                {required && <span className="text-destructive text-xs ml-1">*</span>}
              </Label>
            </div>
            <code className="text-xs text-muted-foreground">{fieldKey}</code>
          </div>
        )}

        {allowedValues && allowedValues.length > 1 ? (
          <child.Render>
            {(value, update) => (
              <Select
                readOnly={readonly}
                value={stringify(value) ?? ''}
                onValueChange={v => update(v as T[typeof fieldKey])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={placeholder?.value ?? 'Value'} />
                </SelectTrigger>
                <SelectContent>
                  {allowedValues.map(item => (
                    <SelectItem value={item} key={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </child.Render>
        ) : isInputType(vSchema) ? (
          <child.Render>
            {(value, update) => (
              <Input
                readOnly={readonly}
                value={stringify(value) ?? ''}
                type={getInputType(vSchema?.type)}
                placeholder={placeholder?.value ?? 'Value'}
                onChange={({ target: { value } }) => update(value as T[typeof fieldKey])}
              />
            )}
          </child.Render>
        ) : isToggleType(vSchema) ? (
          <div className="w-full flex items-center">
            <child.Render>
              {(value, update) => (
                <Checkbox
                  readOnly={readonly}
                  disabled={readonly}
                  checked={Boolean(value)}
                  onCheckedChange={checked => update(Boolean(checked) as T[typeof fieldKey])}
                />
              )}
            </child.Render>
          </div>
        ) : null}

        {allowDelete && !required && !readonly && (
          <Button
            type={deleteType === 'delete' ? 'button' : 'reset'}
            variant="destructive"
            onClick={child.reset}
          >
            {deleteType === 'delete' ? <IconTrash /> : <IconRefresh />}
            <span className="sr-only shrink-0 min-w-0">
              {deleteType === 'delete' ? 'Delete' : 'Reset'}
            </span>
          </Button>
        )}
      </div>
    </div>
  )
}
