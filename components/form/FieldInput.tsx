'use client'

import { RefreshCcw, Trash } from 'lucide-react'
import { memo, useMemo } from 'react'

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

type FieldInputProps<T> = {
  fieldKey: string
  fieldValue: T
  schema: JSONSchema | undefined
  placeholder: { key?: string; value?: string } | undefined
  onKeyChange: (key: string, value: unknown) => void
  onChange: (v: unknown) => void
  allowDelete: boolean
  deleteType?: 'delete' | 'reset'
}

function FieldInput_<T>({
  fieldKey,
  fieldValue,
  schema,
  placeholder,
  onKeyChange,
  onChange,
  allowDelete = true,
  deleteType = 'delete',
}: Readonly<FieldInputProps<T>>) {
  const allowedValues = useMemo(
    () => getAllowedValues(schema, fieldKey),
    [schema, fieldKey]
  )?.filter(e => e !== '')
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
            onChange={({ target: { value } }) => onKeyChange(value, fieldValue)}
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

        {allowedValues && allowedValues.length > 0 ? (
          <Select
            value={typeof fieldValue === 'string' ? fieldValue : String(fieldValue)}
            onValueChange={onChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={placeholder?.value ?? 'Value'} />
            </SelectTrigger>
            <SelectContent>
              {allowedValues.map(item => (
                <SelectItemMemo value={item} key={item}>
                  {item}
                </SelectItemMemo>
              ))}
            </SelectContent>
          </Select>
        ) : isInputType(vSchema) ? (
          <Input
            value={typeof fieldValue === 'string' ? fieldValue : String(fieldValue)}
            type={getInputType(vSchema?.type)}
            placeholder={placeholder?.value ?? 'Value'}
            onChange={({ target: { value } }) => onChange(value)}
          />
        ) : isToggleType(vSchema) ? (
          <div className="w-full flex items-center">
            <Checkbox
              checked={Boolean(fieldValue)}
              onCheckedChange={checked => onChange(Boolean(checked))}
            />
          </div>
        ) : null}

        {allowDelete && !required && (
          <Button
            type={deleteType === 'delete' ? 'button' : 'reset'}
            variant="destructive"
            onClick={() => onChange(undefined)}
          >
            {deleteType === 'delete' ? <Trash /> : <RefreshCcw />}
            {deleteType === 'delete' ? 'Delete' : 'Reset'}
          </Button>
        )}
      </div>
    </div>
  )
}

const SelectItemMemo = memo(SelectItem) as typeof SelectItem

export const FieldInput = memo(FieldInput_) as typeof FieldInput_
