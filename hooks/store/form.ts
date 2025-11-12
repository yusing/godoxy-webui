/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import type { FieldPath, FieldPathValue, FieldValues } from '@/types/path'
import { useId } from 'react'
import { getSnapshot, produce } from './impl'
import { createNode } from './node'
import { createStoreRoot } from './root'
import type { ArrayProxy, State, StoreRoot } from './types'
export {
  useForm,
  type CreateFormOptions,
  type DeepNonNullable,
  type FormArrayProxy,
  type FormDeepProxy,
  type FormState,
  type FormStore,
}

import { pascalCase } from 'change-case'

type FormCommon = {
  /** Subscribe and read the error at path. Re-renders when the error changes. */
  useError: () => string | undefined
  /** Read the error at path without subscribing. */
  readonly error: string | undefined
  /** Set the error at path. */
  setError: (error: string | undefined) => void
}

type FormArrayProxy<T> = ArrayProxy<T> & FormCommon

type FormState<T> = State<T> & FormCommon

/** Type for nested objects with proxy methods */
type FormDeepProxy<T> =
  NonNullable<T> extends readonly (infer U)[]
    ? FormArrayProxy<U> & FormState<T>
    : NonNullable<T> extends FieldValues
      ? {
          [K in keyof NonNullable<T>]-?: NonNullable<NonNullable<T>[K]> extends object
            ? FormDeepProxy<NonNullable<T>[K]>
            : FormState<NonNullable<T>[K]>
        } & FormState<T>
      : FormState<T>

/** Type for nested objects with proxy methods */
type DeepNonNullable<T> =
  NonNullable<T> extends readonly (infer U)[]
    ? U[]
    : NonNullable<T> extends FieldValues
      ? {
          [K in keyof NonNullable<T>]-?: DeepNonNullable<NonNullable<T>[K]>
        }
      : NonNullable<T>

type FormStore<T extends FieldValues> = FormDeepProxy<T> & {
  clearErrors(): void
  handleSubmit(onSubmit: (values: T) => void): (e: React.FormEvent) => void
}

type NoEmptyValidator = 'not-empty'
type RegexValidator = RegExp
type FunctionValidator<T extends FieldValues> = (
  value: FieldPathValue<T, FieldPath<T>> | undefined,
  state: FormStore<T>
) => string | undefined

type Validator<T extends FieldValues> = NoEmptyValidator | RegexValidator | FunctionValidator<T>

type FieldConfig<T extends FieldValues> = {
  validate?: Validator<T>
}

type CreateFormOptions<T extends FieldValues> = Partial<Record<FieldPath<T>, FieldConfig<T>>>

function useForm<T extends FieldValues>(
  defaultValue: T,
  fieldConfigs: CreateFormOptions<T> = {}
): FormStore<T> {
  const formId = useId()
  const namespace = `form:${formId}`
  const errorNamespace = `errors.${namespace}`

  const storeApi = createStoreRoot<T>(namespace, defaultValue, { memoryOnly: true })
  const errorStore = createStoreRoot<Record<string, string | undefined>>(errorNamespace, {})

  const formStore = {
    clearErrors: () => produce(errorNamespace, undefined, false, true),
    handleSubmit: (onSubmit: (value: T) => void) => (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit(getSnapshot(namespace) as T)
    },
  }

  const store = new Proxy(storeApi, {
    get(_target, prop) {
      if (prop in formStore) {
        return formStore[prop as keyof typeof formStore]
      }
      if (prop in storeApi) {
        return storeApi[prop as keyof typeof storeApi]
      }
      if (typeof prop === 'string') {
        return createFormProxy(storeApi, errorStore, prop)
      }
      return undefined
    },
  }) as unknown as FormStore<T>

  for (const entry of Object.entries(fieldConfigs)) {
    const [path, config] = entry as [FieldPath<T>, FieldConfig<T>]
    const validator = getValidator(path, config?.validate)

    if (validator) {
      storeApi.subscribe(path, (value: FieldPathValue<T, FieldPath<T>>) => {
        const error = validator(value, store)
        errorStore.set(path, error as any)
      })
    }
  }

  return store
}

const createFormProxy = (
  storeApi: StoreRoot<any>,
  errorStore: StoreRoot<Record<string, string | undefined>>,
  path: string
) => {
  const proxyCache = new Map<string, any>()

  const useError = () => errorStore.use(path)
  const getError = () => errorStore.value(path)
  const setError = (error: string | undefined) => {
    errorStore.set(path, error)
    return true
  }

  return createNode(storeApi, path, proxyCache, {
    useError: {
      get: () => useError,
    },
    error: {
      get: getError,
    },
    setError: {
      get: () => setError,
    },
  })
}

function getValidator<T extends FieldValues>(
  field: FieldPath<T>,
  validator: Validator<T> | undefined
): FunctionValidator<T> | undefined {
  if (!validator) {
    return undefined
  }
  if (validator === 'not-empty') {
    return (value: FieldPathValue<T, FieldPath<T>> | undefined) => validateNoEmpty<T>(field, value)
  }
  if (validator instanceof RegExp) {
    return (value: FieldPathValue<T, FieldPath<T>> | undefined) =>
      validateRegex<T>(field, value, validator)
  }
  return validator
}

function validateNoEmpty<T extends FieldValues>(
  field: FieldPath<T>,
  value: FieldPathValue<T, FieldPath<T>> | undefined
) {
  if (!stringValue(value)) {
    return `${pascalCase(field)} is required`
  }
  return undefined
}

function validateRegex<T extends FieldValues>(
  field: FieldPath<T>,
  value: FieldPathValue<T, FieldPath<T>> | undefined,
  regex: RegExp
) {
  if (!regex.test(stringValue(value))) {
    return `${pascalCase(field)} is invalid`
  }
  return undefined
}

function stringValue(v: any) {
  if (typeof v === 'string') {
    return v
  }
  if (typeof v === 'number') {
    return String(v)
  }
  if (typeof v === 'boolean') {
    return String(v)
  }
  return ''
}
