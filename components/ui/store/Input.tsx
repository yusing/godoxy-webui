'use client'

import { Eye, EyeClosed } from 'lucide-react'
import { type ComponentProps, type HTMLInputTypeAttribute, useMemo, useState } from 'react'
import { Button } from '../button'
import { Field, FieldDescription } from '../field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../input-group'
import { StoreError } from './Error'
import { StoreLabel } from './Label'
import type { FormComponentProps, Prettify, StoreFieldPropsCommon, Stringable } from './types'

type InputFieldProps<T extends Stringable, Form = false> = Prettify<
  StoreFieldPropsCommon<T, Form> & {
    addons?: Partial<ComponentProps<typeof InputGroupAddon>>[]
  } & FormComponentProps<typeof InputGroupInput>
>

function StoreFormInputField<T extends Stringable>(props: InputFieldProps<T, true>) {
  return <StoreInputField {...props} error={props.state.useError} />
}

function convertInputValue<T>(value: T | undefined, type: HTMLInputTypeAttribute | undefined) {
  if (!value) return undefined
  if (type === 'number') {
    const n = Number(value)
    if (isNaN(n)) return undefined
    return n
  }
  return String(value)
}

function StoreInputField<T extends Stringable>({
  state,
  id,
  title,
  description,
  descriptionVariant = 'inline',
  orientation = 'vertical',
  labelProps,
  error,
  addons = [],
  ...props
}: InputFieldProps<T>) {
  const fieldId = useMemo(() => id ?? state.field, [id, state.field])
  return (
    <Field orientation={orientation}>
      <StoreLabel
        state={state}
        id={id}
        title={title}
        description={description}
        descriptionVariant={descriptionVariant}
        {...labelProps}
      />
      <InputGroup>
        <state.Render>
          {(value, update) => (
            <InputGroupInput
              id={fieldId}
              value={String(value ?? ('' as T))}
              onChange={e => update(convertInputValue(e.target.value, props.type) as T)}
              {...props}
            />
          )}
        </state.Render>
        {addons.map((props, index) => (
          <InputGroupAddon key={index} {...props} />
        ))}
      </InputGroup>
      {descriptionVariant === 'inline' && description && (
        <FieldDescription>{description}</FieldDescription>
      )}
      <StoreError error={error} />
    </Field>
  )
}

type PasswordFieldProps<T extends Stringable, Form = false> = StoreFieldPropsCommon<T, Form> &
  Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'type'>

function StoreFormPasswordField<T extends Stringable>(props: PasswordFieldProps<T, true>) {
  return <StorePasswordField {...props} error={props.state.useError} />
}

function StorePasswordField<T extends Stringable>({ ...props }: PasswordFieldProps<T>) {
  const [isVisible, setIsVisible] = useState(false)
  return (
    <StoreInputField<T>
      type={isVisible ? 'text' : 'password'}
      {...props}
      addons={[
        {
          align: 'inline-end',
          children: (
            <Button
              aria-hidden
              type="button"
              variant={'ghost'}
              size={'icon'}
              className="opacity-70 hover:opacity-100 size-8"
              onClick={() => setIsVisible(!isVisible)}
            >
              {isVisible ? <EyeClosed /> : <Eye />}
            </Button>
          ),
        },
      ]}
    />
  )
}

export {
  StoreFormInputField,
  StoreFormPasswordField,
  StoreInputField,
  StorePasswordField,
  type InputFieldProps,
  type PasswordFieldProps,
}
