'use client'

import { FieldError } from '../field'
import type { Prettify, StoreFieldPropsCommon, Stringable } from './types'

type ErrorProps<T extends Stringable, Form = false> = Prettify<
  Pick<StoreFieldPropsCommon<T, Form>, 'error'>
>
function StoreError<T extends Stringable, Form = false>({ error }: ErrorProps<T, Form>) {
  if (error) {
    if (typeof error === 'function') {
      const errorMessage = error()
      if (errorMessage) {
        return <FieldError className="text-xs">{errorMessage}</FieldError>
      }
      return null
    }
    console.error(`error is not a function but a ${typeof error}`)
  }
  return null
}

export { StoreError, type ErrorProps }
