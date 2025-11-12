'use client'

import { cn } from '@/lib/utils'
import { useMemo } from 'react'
import { Field, FieldLabel } from '../field'
import { RadioGroup, RadioGroupItem } from '../radio-group'
import { StoreError } from './Error'
import { StoreFieldContent } from './FieldContent'
import { useResolveMultipleChoices } from './hooks'
import type {
  DefaultValue,
  FormComponentProps,
  Options,
  Prettify,
  StoreFieldPropsCommon,
  Stringable,
} from './types'

type RadioFieldProps<T, Form = false> = Prettify<
  StoreFieldPropsCommon<T, Form> & {
    options: Options
  } & FormComponentProps<typeof RadioGroup> &
    DefaultValue<T>
>

function StoreFormRadioField<T extends Stringable>(props: RadioFieldProps<T, true>) {
  return <StoreRadioField {...props} error={props.state.useError} />
}

function StoreRadioField<T extends Stringable>({
  state,
  id,
  title,
  description,
  descriptionVariant = 'tooltip',
  labelProps,
  error,
  options,
  defaultValue,
  orientation = 'horizontal',
  className,
  ...props
}: RadioFieldProps<T>) {
  const fieldId = useMemo(() => id ?? state.field, [id, state.field])

  const [value, setValue] = state.useState()

  const { resolvedOptions, stringValue } = useResolveMultipleChoices({
    options,
    value,
    defaultValue,
  })

  return (
    <Field orientation={orientation}>
      <StoreFieldContent
        state={state}
        id={id}
        title={title}
        description={description}
        descriptionVariant={descriptionVariant}
        {...labelProps}
      />
      <RadioGroup
        className={cn('flex', orientation === 'horizontal' ? 'flex-row' : 'flex-col', className)}
        value={stringValue}
        onValueChange={v => setValue(v as T)}
        {...props}
      >
        {resolvedOptions.map(option => (
          <Field key={option.value} orientation="horizontal" className="gap-2">
            <RadioGroupItem value={option.value} id={`${fieldId}-${option.value}`} />
            {option.icon && <option.icon className="size-4" />}
            <FieldLabel htmlFor={`${fieldId}-${option.value}`} className="font-medium">
              {option.label}
            </FieldLabel>
          </Field>
        ))}
      </RadioGroup>
      <StoreError error={error} />
    </Field>
  )
}

export { StoreFormRadioField, StoreRadioField, type RadioFieldProps }
