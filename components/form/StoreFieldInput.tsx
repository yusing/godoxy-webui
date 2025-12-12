'use client'

import { RefreshCcw, Trash } from 'lucide-react'
import { useMemo } from 'react'

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
import type { State } from 'juststore'
import { Label } from '../ui/label'

type StoreFieldInputProps<T> = {
  state: State<T>
  schema: JSONSchema | undefined
  placeholder: { key?: string; value?: string } | undefined
  onKeyChange: (newKey: string) => void
  allowDelete: boolean
  deleteType?: 'delete' | 'reset'
  onReset?: () => void
}

export function StoreFieldInput<T>({
  state,
  schema,
  placeholder,
  onKeyChange,
  allowDelete = true,
  deleteType = 'delete',
  onReset,
}: Readonly<StoreFieldInputProps<T>>) {
  const fieldKey = state.field
  const allowedValues = useMemo(
    () => getAllowedValues(schema, fieldKey)?.filter(e => e !== ''),
    [schema, fieldKey]
  )
  const required = useMemo(() => getRequired(schema).includes(fieldKey), [schema, fieldKey])

  const vSchema = schema?.properties?.[fieldKey]
  const title = useMemo(() => getTitle(schema, fieldKey), [schema, fieldKey])

  return (
    <div
      className={cn(
        schema?.properties && !(fieldKey in (schema.properties ?? {})) && 'text-destructive'
      )}
    >
      <div className="flex w-full items-center gap-2">
        {!schema ? (
          <Input
            value={fieldKey}
            placeholder={placeholder?.key ?? 'Key'}
            onChange={({ target: { value } }) => onKeyChange(value)}
            className="max-w-[220px]"
          />
        ) : title ? (
          <div className="min-w-[150px] select-none">
            <div className="flex items-center gap-2">
              <Label>{title}</Label>
              {required && <span className="text-destructive text-xs">*</span>}
            </div>
            <code className="text-xs text-muted-foreground">{fieldKey}</code>
          </div>
        ) : (
          <div className="min-w-[150px]">
            <div className="flex items-center gap-2">
              <Label>{fieldKey}</Label>
              {required && <span className="text-destructive text-xs">*</span>}
            </div>
          </div>
        )}

        <state.Render>
          {(fieldValue, update) => {
            // if undefined, display the default value
            fieldValue ??= getDefaultValue(vSchema) as T
            if (allowedValues && allowedValues.length > 0)
              return (
                <Select
                  value={typeof fieldValue === 'string' ? fieldValue : String(fieldValue)}
                  onValueChange={value => update(value as T)}
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
              )
            if (isInputType(vSchema))
              return (
                <Input
                  value={typeof fieldValue === 'string' ? fieldValue : String(fieldValue)}
                  type={getInputType(vSchema?.type)}
                  placeholder={placeholder?.value ?? 'Value'}
                  onChange={({ target: { value } }) => update(value as T)}
                />
              )
            if (isToggleType(vSchema))
              return (
                <div className="w-full flex items-center">
                  <Checkbox
                    checked={Boolean(fieldValue)}
                    onCheckedChange={checked => update(Boolean(checked) as T)}
                  />
                </div>
              )
            return null
          }}
        </state.Render>

        {allowDelete && !required && (
          <Button
            type={deleteType === 'delete' ? 'button' : 'reset'}
            variant="destructive"
            onClick={() => {
              state.reset()
              onReset?.()
            }}
          >
            {deleteType === 'delete' ? <Trash /> : <RefreshCcw />}
            {deleteType === 'delete' ? 'Delete' : 'Reset'}
          </Button>
        )}
      </div>
    </div>
  )
}
