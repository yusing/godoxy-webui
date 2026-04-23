import { useMemo } from 'react'

import { FieldValueSlot } from '@/components/form/delete-button'
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
import { isNullishOrEmptyFieldValue, stringify } from './utils'

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
  /** Grid form section: icon remove, show on row hover. */
  grid?: boolean
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
  grid = false,
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

  const canAct = allowDelete && !required && !readonly
  const showDelete = canAct && deleteType === 'delete'
  const showReset = canAct && deleteType === 'reset' && !isNullishOrEmptyFieldValue(fieldValue)

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

        <FieldValueSlot
          grid={grid}
          showDelete={showDelete}
          showReset={showReset}
          onRemove={() => onChange(undefined)}
          onReset={() => onChange(undefined)}
        >
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
        </FieldValueSlot>
      </div>
    </div>
  )
}
