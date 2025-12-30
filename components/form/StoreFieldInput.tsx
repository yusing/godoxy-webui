'use client'

import { IconRefresh, IconTrash } from '@tabler/icons-react'
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
  getInputType,
  getRequired,
  getTitle,
  isInputType,
  isToggleType,
  type JSONSchema,
} from '@/types/schema'
import type { ValueState } from 'juststore'
import { Label } from '../ui/label'
import { stringify } from './utils'

type StoreFieldInputProps<T extends string | number | boolean | undefined> = {
  state: ValueState<T>
  schema: JSONSchema | undefined
  placeholder: { key?: string; value?: string } | undefined
  onKeyChange?: (newKey: string) => void
  allowDelete: boolean
  deleteType?: 'delete' | 'reset'
  readonly?: boolean
}

export function StoreFieldInput<T extends string | number | boolean | undefined>({
  state,
  schema,
  placeholder,
  onKeyChange,
  allowDelete = true,
  deleteType = 'delete',
  readonly = false,
}: Readonly<StoreFieldInputProps<T>>) {
  'use memo'

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
        {onKeyChange ? (
          <div className="max-w-[220px] w-full @container">
            <Input
              readOnly={readonly}
              value={fieldKey}
              placeholder={placeholder?.key ?? 'Key'}
              onChange={onKeyChange ? ({ target: { value } }) => onKeyChange(value) : undefined}
              className="text-xs"
              style={
                {
                  '--len': fieldKey.length || (placeholder?.key ?? 'Key').length,
                  fontSize: 'min(0.75rem, calc((100cqw - 24px) / (var(--len) * 0.5)))',
                } as React.CSSProperties
              }
            />
          </div>
        ) : title ? (
          <div className="min-w-[150px] select-none max-w-min">
            <div className="flex items-center gap-2">
              <Label className="block">
                {title}
                {required && <span className="text-destructive text-xs ml-1">*</span>}
              </Label>
            </div>
            <code className="text-xs text-muted-foreground">{fieldKey}</code>
          </div>
        ) : (
          <div className="min-w-[150px] max-w-min">
            <div className="flex items-center gap-2">
              <Label>{fieldKey}</Label>
              {required && <span className="text-destructive text-xs">*</span>}
            </div>
          </div>
        )}

        {allowedValues && allowedValues.length > 1 ? (
          <state.Render>
            {(value, update) => (
              <Select
                readOnly={readonly}
                value={stringify(value)}
                onValueChange={v => update(v as T)}
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
          </state.Render>
        ) : isInputType(vSchema) ? (
          <state.Render>
            {(value, update) => (
              <Input
                readOnly={readonly}
                value={stringify(value)}
                type={getInputType(vSchema?.type)}
                placeholder={placeholder?.value ?? 'Value'}
                onChange={({ target: { value } }) => update(value as T)}
              />
            )}
          </state.Render>
        ) : isToggleType(vSchema) ? (
          <div className="w-full flex items-center">
            <state.Render>
              {(value, update) => (
                <Checkbox
                  disabled={readonly}
                  checked={Boolean(value)}
                  onCheckedChange={checked => update(Boolean(checked) as T)}
                />
              )}
            </state.Render>
          </div>
        ) : null}

        {allowDelete && !required && !readonly && (
          <Button
            type={deleteType === 'delete' ? 'button' : 'reset'}
            variant="destructive"
            onClick={state.reset}
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
