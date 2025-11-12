'use client'

import type { State } from '@/hooks/store/types'
import { useMemo } from 'react'
import type { Option, Options, Stringable } from './types'
import { toTitleCase } from './utils'

function useIdTitle<T>({
  state,
  id,
  title,
}: {
  state: State<T> | State<T | undefined>
  id?: string
  title?: string
}) {
  const fieldId = useMemo(() => id ?? state.field, [id, state.field])
  const fieldTitle = useMemo(() => (title ? title : toTitleCase(fieldId)), [title, fieldId])
  return { fieldId, fieldTitle }
}

function useResolveMultipleChoices({
  options,
  value,
  defaultValue,
}: {
  options: Options
  value: Stringable
  defaultValue?: Stringable
}) {
  const resolvedOptions: Readonly<Option[]> = useMemo(
    () =>
      options.map(option =>
        typeof option === 'string' ? { label: option, value: option, icon: undefined } : option
      ),
    [options]
  )

  // Ensure the value is one of the allowed values
  const stringValue = useMemo(() => {
    if (value && !resolvedOptions.some(option => option.value === String(value))) {
      const v = defaultValue ?? resolvedOptions[0]?.value
      if (v === undefined || v === null) {
        return undefined
      }
      return String(v)
    }
    if (value === undefined || value === null) {
      return undefined
    }
    return String(value)
  }, [value, defaultValue, resolvedOptions])

  return { resolvedOptions, stringValue }
}

export { useIdTitle, useResolveMultipleChoices }
