'use client'

import { useMemo } from 'react'
import { Checkbox } from '../checkbox'
import { Field } from '../field'
import { StoreError } from './Error'
import { StoreFieldContent } from './FieldContent'
import type { DefaultValue, FormComponentProps, Prettify, StoreFieldPropsCommon } from './types'

type CheckboxFieldProps<T extends boolean | undefined, Form = false> = Prettify<
  StoreFieldPropsCommon<T, Form> & FormComponentProps<typeof Checkbox> & DefaultValue<boolean>
>

function StoreFormCheckboxField<T extends boolean | undefined>(props: CheckboxFieldProps<T, true>) {
  return <StoreCheckboxField {...props} error={props.state.useError} />
}

function StoreCheckboxField<T extends boolean | undefined>({
  state,
  defaultValue,
  id,
  title,
  description,
  descriptionVariant = 'tooltip',
  labelProps,
  error,
  ...props
}: CheckboxFieldProps<T>) {
  const fieldId = useMemo(() => id ?? state.field, [id, state.field])
  return (
    <Field orientation="horizontal">
      <StoreFieldContent
        state={state}
        id={id}
        title={title}
        description={description}
        descriptionVariant={descriptionVariant}
        {...labelProps}
      />
      <state.Render>
        {(value, update) => (
          <Checkbox
            id={fieldId}
            defaultChecked={defaultValue}
            checked={Boolean(value)}
            onCheckedChange={checked => update(checked === true ? (true as T) : (undefined as T))}
            {...props}
          />
        )}
      </state.Render>
      <StoreError error={error} />
    </Field>
  )
}

export { StoreCheckboxField, StoreFormCheckboxField, type CheckboxFieldProps }
