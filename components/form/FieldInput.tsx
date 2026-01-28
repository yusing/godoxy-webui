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
import { Label } from '../ui/label'
import { stringify } from './utils'

export { FieldInput, type FieldInputProps }

type FieldInputProps<T> = {
  fieldKey: string
  fieldValue: T
  schema: JSONSchema | undefined
  placeholder: { key?: string; value?: string } | undefined
  onKeyChange?: (key: string, value: unknown) => void
  onChange: (v: unknown) => void
  allowDelete: boolean
  deleteType?: 'delete' | 'reset'
  readonly?: boolean
}

function FieldInput<T>({
  fieldKey,
  fieldValue,
  schema,
  placeholder,
  onKeyChange,
  onChange,
  allowDelete = true,
  deleteType = 'delete',
  readonly = false,
}: Readonly<FieldInputProps<T>>) {
  'use memo'

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
              onChange={({ target: { value } }) => onKeyChange(value, fieldValue)}
              className="text-xs"
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
          <Select readOnly={readonly} value={stringify(fieldValue)} onValueChange={onChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={placeholder?.value ?? 'Value'} />
            </SelectTrigger>
            <SelectContent>
              {allowedValues.map(item => (
                <SelectItem value={stringify(item)} key={stringify(item)}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : isInputType(vSchema) ? (
          <Input
            readOnly={readonly}
            value={stringify(fieldValue)}
            type={getInputType(vSchema?.type)}
            placeholder={placeholder?.value ?? 'Value'}
            onChange={({ target: { value } }) => onChange(value)}
          />
        ) : isToggleType(vSchema) ? (
          <div className="w-full flex items-center">
            <Checkbox
              disabled={readonly}
              checked={Boolean(fieldValue)}
              onCheckedChange={checked => onChange(Boolean(checked))}
            />
          </div>
        ) : null}

        {allowDelete && !required && !readonly && (
          <Button
            type={deleteType === 'delete' ? 'button' : 'reset'}
            variant="destructive"
            onClick={() => onChange(undefined)}
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
