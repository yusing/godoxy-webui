import type { FieldPath, FieldPathValue, FieldValues } from '@/types/path'
import { useCallback, useRef } from 'react'
import {
  getNestedValue,
  getSnapshot,
  joinPath,
  notifyListeners,
  produce,
  setLeaf,
  useObject,
  useSubscribe,
} from './impl'
import type { StoreRenderProps, StoreRoot, StoreShowProps } from './types'

export { createStoreRoot, type StoreOptions }

type StoreOptions = {
  memoryOnly?: boolean
}

function createStoreRoot<T extends FieldValues>(
  namespace: string,
  defaultValue: T,
  options: StoreOptions = {}
) {
  const memoryOnly = options?.memoryOnly ?? false
  if (memoryOnly) {
    produce(namespace, undefined, true, false) // clear localStorage value
  }
  produce(namespace, { ...defaultValue, ...(getSnapshot(namespace) ?? {}) }, true, true)

  const storeApi: StoreRoot<T> = {
    use: <P extends FieldPath<T>>(path: P) => useObject<T, P>(namespace, path),
    set: <P extends FieldPath<T>>(
      path: P,
      value:
        | FieldPathValue<T, P>
        | ((prev: FieldPathValue<T, P> | undefined) => FieldPathValue<T, P>),
      skipUpdate = false
    ) => {
      const currentValue = storeApi.value(path)
      const newValue =
        typeof value === 'function'
          ? (value as (prev: FieldPathValue<T, P> | undefined) => FieldPathValue<T, P>)(
              currentValue
            )
          : value
      return setLeaf<T, P>(namespace, path, newValue, skipUpdate, memoryOnly)
    },
    value: <P extends FieldPath<T>>(path: P) =>
      getSnapshot(joinPath(namespace, path)) as FieldPathValue<T, P>,
    reset: <P extends FieldPath<T>>(path: P) =>
      produce(joinPath(namespace, path), undefined, false, memoryOnly),
    subscribe: <P extends FieldPath<T>>(path: P, listener: (value: FieldPathValue<T, P>) => void) =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useSubscribe<FieldPathValue<T, P>>(joinPath(namespace, path), listener),
    notify: <P extends FieldPath<T>>(path: P) => {
      const value = getNestedValue(getSnapshot(namespace), path)
      return notifyListeners(joinPath(namespace, path), value, value, true, true)
    },
    useState: <P extends FieldPath<T>>(path: P) => {
      const fullPathRef = useRef(joinPath(namespace, path))
      const setValue = useCallback(
        <V extends FieldPathValue<T, P> | undefined>(value: V | ((prev: V) => V)) => {
          if (typeof value === 'function') {
            const currentValue = getSnapshot(fullPathRef.current) as V
            const newValue = value(currentValue)
            return setLeaf<T, P>(namespace, path, newValue, false, memoryOnly)
          }
          return setLeaf<T, P>(namespace, path, value, false, memoryOnly)
        },
        [path]
      )
      return [useObject<T, P>(fullPathRef.current), setValue] as const
    },
    Render: <P extends FieldPath<T>>({ path, children }: StoreRenderProps<T, P>) => {
      const fullPathRef = useRef(joinPath(namespace, path))
      const value = useObject<T, P>(fullPathRef.current)
      const update = useCallback(
        (
          value:
            | FieldPathValue<T, P>
            | ((prev: FieldPathValue<T, P> | undefined) => FieldPathValue<T, P>)
            | undefined
        ) => {
          if (typeof value === 'function') {
            const currentValue = getSnapshot(fullPathRef.current) as
              | FieldPathValue<T, P>
              | undefined
            const newValue = value(currentValue)
            return setLeaf(namespace, path, newValue, false, memoryOnly)
          }
          return setLeaf(namespace, path, value, false, memoryOnly)
        },
        [path]
      )
      return children(value, update)
    },
    Show: <P extends FieldPath<T>>({ path, children, on }: StoreShowProps<T, P>) => {
      const value = useObject<T, P>(namespace, path)
      if (!on(value)) {
        return null
      }
      return children
    },
  }

  return storeApi
}
