import type { FieldPath, FieldPathValue, FieldValues } from '@/types/path'

export type {
  ArrayProxy,
  DeepProxy,
  DerivedStateProps,
  State,
  StoreRenderProps,
  StoreRoot,
  StoreSetStateAction,
  StoreShowProps,
  StoreUse,
}

/** Type for nested objects with proxy methods */
type DeepProxy<T> =
  NonNullable<T> extends readonly (infer U)[]
    ? ArrayProxy<U> & State<T>
    : NonNullable<T> extends FieldValues
      ? {
          [K in keyof NonNullable<T>]-?: NonNullable<NonNullable<T>[K]> extends object
            ? DeepProxy<NonNullable<T>[K]>
            : State<NonNullable<T>[K]>
        } & State<T>
      : State<T>

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

type ArrayMutationMethods<T> = Pick<
  Array<T>,
  'push' | 'pop' | 'shift' | 'unshift' | 'splice' | 'reverse' | 'sort' | 'fill' | 'copyWithin'
>

/** Type for array proxy with index access */
type ArrayProxy<T> = Prettify<ArrayMutationMethods<T>> & {
  /** Read without subscribing. Returns array or undefined for missing paths. */
  readonly value: T[] | undefined
  /**
   * Length of the underlying array. Runtime may return undefined when the
   * current value is not an array at the path. Prefer `Array.isArray(x) && x.length` when unsure.
   */
  readonly length: number
  /** Numeric index access never returns undefined at the type level because
   * the proxy always returns another proxy object, even if the underlying value doesn't exist.
   */
  [K: number]: T extends object ? DeepProxy<T> : State<T>
  /** Safe accessor that never returns undefined at the type level */
  at(index: number): T extends object ? DeepProxy<T> : State<T>
  /** Insert items into the array in sorted order using the provided comparison function. */
  sortedInsert(cmp: (a: T, b: T) => number, ...items: T[]): number
}

/** Tuple returned by Store.use(path). */
type StoreUse<T> = Readonly<[T | undefined, (value: T | undefined) => void]>

type StoreSetStateAction<T> = (
  value: T | undefined | ((prev: T) => T),
  skipUpdate?: boolean
) => void

/** Public API returned by createStore(namespace, defaultValue). */
type StoreRoot<T extends FieldValues> = {
  /** Subscribe and read the value at path. Re-renders when the value changes. */
  use: <P extends FieldPath<T>>(path: P) => FieldPathValue<T, P> | undefined
  /** Set value at path (creates intermediate nodes as needed). */
  set: <P extends FieldPath<T>>(
    path: P,
    value:
      | FieldPathValue<T, P>
      | ((prev: FieldPathValue<T, P> | undefined) => FieldPathValue<T, P>),
    skipUpdate?: boolean
  ) => void
  /** Read without subscribing. */
  value: <P extends FieldPath<T>>(path: P) => FieldPathValue<T, P> | undefined
  /** Delete value at path (for arrays, removes index; for objects, deletes key). */
  reset: <P extends FieldPath<T>>(path: P) => void
  /** Subscribe to changes at path and invoke listener with the new value. */
  subscribe: <P extends FieldPath<T>>(
    path: P,
    listener: (value: FieldPathValue<T, P>) => void
  ) => void
  /** Notify listeners at path. */
  notify: <P extends FieldPath<T>>(path: P) => void
  /** Convenience hook returning [value, setValue] for the path. */
  useState: <P extends FieldPath<T>>(path: P) => StoreUse<FieldPathValue<T, P>>
  /** Render-prop helper for inline usage. */
  Render: <P extends FieldPath<T>>(
    props: FieldPathValue<T, P> extends undefined ? never : StoreRenderProps<T, P>
  ) => React.ReactNode
  /** Show or hide children based on the value at the path. */
  Show: <P extends FieldPath<T>>(
    props: FieldPathValue<T, P> extends undefined ? never : StoreShowProps<T, P>
  ) => React.ReactNode
}

/** Common methods available on any deep proxy node */
type State<T> = {
  /** Read without subscribing. */
  readonly value: T
  /** The field name for the proxy. */
  readonly field: string
  /** Subscribe and read the value at path. Re-renders when the value changes. */
  use(): T
  /** Convenience hook returning [value, setValue] for the path. */
  useState(): readonly [T, (value: T | undefined) => void]
  /** Set value at path (creates intermediate nodes as needed). */
  set(value: T | undefined | ((prev: T) => T), skipUpdate?: boolean): void
  /** Delete value at path (for arrays, removes index; for objects, deletes key). */
  reset(): void
  /** Subscribe to changes at path and invoke listener with the new value. */
  subscribe(listener: (value: T) => void): void
  /** Compute a derived value from the current value, similar to useState + useMemo */
  compute: <R>(fn: (value: T) => R) => R
  /** Virtual state derived from the current value. */
  derived: <R>({
    from,
    to,
  }: {
    from: (value: T | undefined) => R
    to: (value: R) => T | undefined
  }) => State<R>
  /** Notify listener of current value. */
  notify(): void
  /** Render-prop helper for inline usage.
   *
   * @example
   * <store.a.b.c.Render>
   *   {(value, update) => <button onClick={() => update('new value')}>{value}</button>}
   * </store.a.b.c.Render>
   */
  Render: (props: {
    children: (value: T, update: (value: T | undefined) => void) => React.ReactNode
  }) => React.ReactNode
  /** Show or hide children based on the value at the path.
   *
   * @example
   * <store.a.b.c.Show on={value => value === 'show'}>
   *   <div>Show</div>
   * </store.a.b.c.Show>
   */
  Show: (props: { children: React.ReactNode; on: (value: T) => boolean }) => React.ReactNode
}

/** Props for Store.Render helper. */
type StoreRenderProps<T extends FieldValues, P extends FieldPath<T>> = {
  path: P
  children: (
    value: FieldPathValue<T, P> | undefined,
    update: (value: FieldPathValue<T, P> | undefined) => void
  ) => React.ReactNode
}

/** Props for Store.Show helper. */
type StoreShowProps<T extends FieldValues, P extends FieldPath<T>> = {
  path: P
  children: React.ReactNode
  on: (value: FieldPathValue<T, P> | undefined) => boolean
}

type DerivedStateProps<T, R> = {
  from: (value: T | undefined) => R
  to: (value: R) => T | undefined
}
