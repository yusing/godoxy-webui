import type { FormState } from '@/hooks/store'
import type { State } from '@/hooks/store/types'
import type React from 'react'
import type { ComponentProps } from 'react'
import type { FieldLabel } from '../field'

type Stringable = string | number | undefined

type Option = {
  label: React.ReactNode
  value: string
  icon?: React.ExoticComponent<React.ComponentProps<'svg'>>
}
type Options = Readonly<string[] | Option[]>

type DescriptionVariant = 'inline' | 'tooltip'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}
type DefaultValue<T> = { defaultValue?: T }

type AnyStringCompatible = string | number | undefined
type AnyBooleanCompatible = boolean | undefined

type FormComponentProps<
  Component extends keyof React.JSX.IntrinsicElements | React.JSXElementConstructor<any>,
> = Omit<
  ComponentProps<Component>,
  | 'id'
  | 'title'
  | 'description'
  | 'error'
  | 'value'
  | 'checked'
  | 'onChange'
  | 'onValueChange'
  | 'onCheckedChange'
  | 'setValue'
  | 'defaultValue'
  | 'defaultChecked'
>

type StoreFieldPropsCommon<T, Form = false> = {
  state: Form extends true
    ? FormState<T> | FormState<T | undefined>
    : State<T> | State<T | undefined>
  /** Field id
   * @default state.field
   */
  id?: string
  /** Field title
   * @default toTitleCase(state.field)
   */
  title?: string
  /** Field description
   * @default undefined
   */
  description?: React.ReactNode
  /** Field description variant
   * @default 'inline'
   */
  descriptionVariant?: DescriptionVariant
  /** Field orientation
   * @default 'vertical'
   * @default 'horizontal' // checkbox and radio only
   */
  orientation?: 'horizontal' | 'vertical'
  /** Field label props
   * @default undefined
   */
  labelProps?: React.ComponentProps<typeof FieldLabel>
  /** Field error
   * @default undefined
   * @default state.error // form state only
   */
  error?: Form extends true ? never : () => string | undefined
}

export type {
  DefaultValue,
  DescriptionVariant,
  FormComponentProps,
  Option,
  Options,
  Prettify,
  StoreFieldPropsCommon,
}

export type { AnyBooleanCompatible, AnyStringCompatible, Stringable }
