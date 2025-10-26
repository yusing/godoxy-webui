'use client'

import type { NodeMethods } from '@/hooks/store'
import { useEffect, useMemo, type ComponentProps } from 'react'
import { CodeMirror } from './ObjectDataList'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'

type Stringable = string | number

function StoreInput<T extends Stringable>({
  state,
  id,
  ...props
}: { state: NodeMethods<T> } & Omit<ComponentProps<'input'>, 'value' | 'onChange'>) {
  const [value, setValue] = state.useState()
  return (
    <Input
      id={id ?? state.field}
      value={String(value)}
      onChange={e => setValue(e.target.value as T)}
      {...props}
    />
  )
}

type SelectProps = Omit<ComponentProps<typeof Select>, 'value' | 'onChange'> & {
  id?: string
  options: Readonly<string[] | { label: string; value: string }[]>
  defaultValue?: string
}

function StoreSelect<T extends Stringable>({
  state,
  id,
  options,
  defaultValue,
  ...props
}: { state: NodeMethods<T> } & SelectProps) {
  const [value, setValue] = state.useState()

  const stringValue = useMemo(() => String(value), [value])

  const resolvedOptions = useMemo(() => {
    return options.map(option => {
      return typeof option === 'string' ? { label: option, value: option } : option
    })
  }, [options])

  // Ensure the value is one of the allowed values
  useEffect(() => {
    if (stringValue && !resolvedOptions.some(option => option.value === stringValue)) {
      setValue((defaultValue ?? resolvedOptions[0]?.value ?? '') as T)
    }
  }, [stringValue, defaultValue, resolvedOptions, setValue])

  return (
    <Select value={stringValue} onValueChange={v => setValue(v as T)} {...props}>
      <SelectTrigger id={id ?? state.field}>
        <SelectValue placeholder={defaultValue} />
      </SelectTrigger>
      <SelectContent>
        {resolvedOptions.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function StoreTextarea({
  state,
  id,
  ...props
}: { state: NodeMethods<string> } & Omit<ComponentProps<typeof Textarea>, 'value' | 'onChange'>) {
  const [value, setValue] = state.useState()
  return (
    <Textarea
      id={id ?? state.field}
      value={value}
      onChange={e => setValue(e.target.value)}
      {...props}
    />
  )
}

function StoreCodeMirror({
  state,
  ...props
}: { state: NodeMethods<string> } & Omit<ComponentProps<typeof CodeMirror>, 'value' | 'setValue'>) {
  const [value, setValue] = state.useState()
  return <CodeMirror value={value} setValue={setValue} {...props} />
}

export { StoreCodeMirror, StoreInput, StoreSelect, StoreTextarea }
