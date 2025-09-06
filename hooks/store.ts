'use client'

import { useCallback, useEffect, useSyncExternalStore, type ReactNode } from 'react'
import isEqual from 'react-fast-compare'
import type { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form'

/**
 * A persistent, hierarchical, cross-tab synchronized key-value store with React bindings.
 *
 * - Dot-path addressing for nested values (e.g. "config.ui.theme").
 * - Immutable partial updates with automatic object/array creation.
 * - Persists root namespaces to localStorage with an in-memory mirror (no localStorage on SSR).
 * - Cross-tab synchronization via BroadcastChannel (no-ops on SSR).
 * - Fine-grained subscriptions built on useSyncExternalStore.
 * - Type-safe paths using react-hook-form FieldPath.
 * - Dynamic deep access via Proxy for ergonomic usage like `store.a.b.c.use()` and `store.a.b.c.set(v)`.
 */

/** Public API returned by createStore(namespace, defaultValue). */
export type StoreBase<T extends FieldValues> = {
  /** Subscribe and read the value at path. Re-renders when the value changes. */
  use: <P extends FieldPath<T>>(path: P) => FieldPathValue<T, P> | undefined
  /** Set value at path (creates intermediate nodes as needed). */
  set: <P extends FieldPath<T>>(path: P, value: FieldPathValue<T, P>) => void
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
  ) => ReactNode
}

/** Tuple returned by Store.use(path). */
export type StoreUse<T> = Readonly<[T | undefined, (value: T | undefined) => void]>

/** Props for Store.Render helper. */
export type StoreRenderProps<T extends FieldValues, P extends FieldPath<T>> = {
  path: P
  children: (
    value: FieldPathValue<T, P> | undefined,
    update: (value: FieldPathValue<T, P> | undefined) => void
  ) => ReactNode
}

/**
 * Store with dynamic deep property access via a Proxy.
 * Enables usage like `store.a.b.c` for reads and assignments for writes.
 * Also supports `store.a.b.c.use()` as a React hook.
 */
export type Store<T extends FieldValues> = StoreBase<T> & {
  [K in keyof T]: NonNullable<T[K]> extends object ? DeepProxy<T[K]> : LeafProxy<T[K]>
}

/** Common methods available on any deep proxy node */
type NodeMethods<T> = {
  /** Subscribe and read the value at path. Re-renders when the value changes. */
  use(): T | undefined
  /** Convenience hook returning [value, setValue] for the path. */
  useState(): readonly [T | undefined, (value: T | undefined) => void]
  /** Set value at path (creates intermediate nodes as needed). */
  set(value: T | undefined): void
  /** Delete value at path (for arrays, removes index; for objects, deletes key). */
  reset(): void
  /** Subscribe to changes at path and invoke listener with the new value. */
  subscribe(listener: (value: T | undefined) => void): void
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
    children: (value: T | undefined, update: (value: T | undefined) => void) => ReactNode
  }) => ReactNode
}

type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

/** Type for leaf values with hook methods */
type LeafProxy<T> = Prettify<
  {
    /** Read without subscribing. */
    readonly value: T | undefined
  } & NodeMethods<T>
>

/** Type for nested objects with proxy methods */
type DeepProxy<T> =
  NonNullable<T> extends readonly (infer U)[]
    ? ArrayProxy<U> & NodeMethods<NonNullable<T>>
    : NonNullable<T> extends FieldValues
      ? {
          [K in keyof NonNullable<T>]-?: NonNullable<NonNullable<T>[K]> extends object
            ? DeepProxy<NonNullable<T>[K]>
            : LeafProxy<NonNullable<T>[K]>
        } & NodeMethods<NonNullable<T>>
      : LeafProxy<NonNullable<T>>

/** Type for array proxy with index access */
type ArrayProxy<T> = {
  /**
   * Length of the underlying array. Runtime may return undefined when the
   * current value is not an array at the path. Prefer `Array.isArray(x) && x.length` when unsure.
   */
  readonly length: number
  /** Numeric index access never returns undefined at the type level because
   * the proxy always returns another proxy object, even if the underlying value doesn't exist.
   */
  [K: number]: T extends object ? DeepProxy<T> : LeafProxy<T>
  /** Safe accessor that never returns undefined at the type level */
  at(index: number): T extends object ? DeepProxy<T> : LeafProxy<T>
}

/** Build a deep proxy for dynamic path access under a namespace. */
function createValuesProxy(namespace: string, storeApi: StoreBase<any>, initialPath = '') {
  const build = (path: string): any =>
    new Proxy(
      {},
      {
        get(_target, prop) {
          if (prop === 'use') {
            return () => storeApi.use(path)
          }
          if (prop === 'useState') {
            return () => storeApi.useState(path)
          }
          if (prop === 'value') {
            return storeApi.value(path)
          }
          if (prop === 'set') {
            return (value: any) => storeApi.set(path, value)
          }
          if (prop === 'reset') {
            return () => storeApi.reset(path)
          }
          if (prop === 'subscribe') {
            return (listener: (v: any) => void) => storeApi.subscribe(path, listener)
          }
          if (prop === 'Render') {
            return ({
              children,
            }: {
              children: (value: any, update: (value: any) => void) => ReactNode
            }) => storeApi.Render({ path, children })
          }
          if (prop === 'at') {
            return (index: number) => {
              const nextPath = path ? `${path}.${index}` : String(index)
              return build(nextPath)
            }
          }
          if (prop === 'length') {
            const value = store.get(`${namespace}.${path}`)
            return Array.isArray(value) ? value.length : undefined
          }
          if (typeof prop === 'string' || typeof prop === 'number') {
            const nextPath = path ? `${path}.${prop}` : String(prop)
            // Always return a proxy
            return build(nextPath)
          }
          return undefined
        },
        set(_target, prop, value) {
          if (typeof prop === 'string') {
            const nextPath = path ? `${path}.${prop}` : prop
            storeApi.set(nextPath, value)
            return true
          }
          return false
        },
      }
    )

  return build(initialPath)
}

/**
 * Create or retrieve a namespaced store. The returned object is a Proxy that
 * exposes the base API (use/set/value/reset/...) and also allows deep, dynamic
 * access: e.g. `store.user.profile.name.use()` or `store.todos.at(0).title.set('x')`.
 */
export function createStore<T extends FieldValues>(namespace: string, defaultValue: T): Store<T> {
  produce(namespace, { ...defaultValue, ...(store.get(namespace) ?? {}) }, true, true)

  const storeApi: StoreBase<T> = {
    use: <P extends FieldPath<T>>(path: P) => useObject<T, P>(namespace, path),
    set: <P extends FieldPath<T>>(path: P, value: FieldPathValue<T, P>) =>
      setLeaf<T, P>(namespace, path, value),
    value: <P extends FieldPath<T>>(path: P) =>
      store.get(namespace + '.' + path) as FieldPathValue<T, P>,
    reset: <P extends FieldPath<T>>(path: P) => produce(namespace + '.' + path, undefined),
    subscribe: <P extends FieldPath<T>>(path: P, listener: (value: FieldPathValue<T, P>) => void) =>
      useSubscribe<FieldPathValue<T, P>>(namespace + '.' + path, listener),
    notify: <P extends FieldPath<T>>(path: P) => {
      const value = getNestedValue(store.get(namespace), path)
      return notifyListeners(namespace + '.' + path, value, value, true, true)
    },
    useState: <P extends FieldPath<T>>(path: P) =>
      [
        useObject<T, P>(namespace, path),
        useCallback(
          (value: FieldPathValue<T, P> | undefined) => setLeaf<T, P>(namespace, path, value),
          [path]
        ),
      ] as const,
    Render: <P extends FieldPath<T>>({ path, children }: StoreRenderProps<T, P>) => {
      const value = useObject<T, P>(namespace, path)
      const update = useCallback(
        (value: FieldPathValue<T, P> | undefined) => setLeaf(namespace, path, value),
        [path]
      )
      return children(value, update)
    },
  }

  // Return a proxy that intercepts property access at the root level
  return new Proxy(storeApi, {
    get(target, prop) {
      // If it's a known store method, return it
      if (prop in target) {
        return target[prop as keyof typeof target]
      }

      // Otherwise, treat it as a dynamic path access
      if (typeof prop === 'string') {
        return createValuesProxy(namespace, storeApi, prop)
      }

      return undefined
    },
  }) as Store<T>
}

const memoryStore = new Map<string, unknown>()

type KeyValueStore = {
  has: (key: string) => boolean
  get: (key: string) => unknown
  set: (key: string, value: unknown, memoryOnly?: boolean) => void
  delete: (key: string, memoryOnly?: boolean) => void
  readonly size: number
}

// localStorage operations
const STORAGE_PREFIX = 'godoxy:'

/** Read from localStorage (JSON.parse) with prefix; undefined on SSR or error. */
function localStorageGet(key: string): unknown {
  try {
    if (typeof window === 'undefined') return undefined
    const item = localStorage.getItem(STORAGE_PREFIX + key)
    return item ? JSON.parse(item) : undefined
  } catch (e) {
    console.error('Failed to get key from localStorage', key, e)
    return undefined
  }
}

/** Write to localStorage (JSON.stringify); remove key when value is undefined. */
function localStorageSet(key: string, value: unknown): void {
  try {
    if (typeof window === 'undefined') return
    if (value === undefined) {
      localStorage.removeItem(STORAGE_PREFIX + key)
    } else {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
    }
  } catch (e) {
    console.error('Failed to set key in localStorage', key, value, e)
  }
}

/** Delete from localStorage with prefix. */
function localStorageDelete(key: string): void {
  try {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_PREFIX + key)
  } catch (e) {
    console.error('Failed to delete key from localStorage', key, e)
  }
}

// Path traversal utilities
/** Get a nested value from an object/array using a dot-separated path. */
function getNestedValue(obj: unknown, path: string): unknown {
  if (!path) return obj
  const segments = path.split('.')
  let current = obj

  for (const segment of segments) {
    if (current === null || current === undefined) return undefined
    if (typeof current !== 'object') return undefined

    if (Array.isArray(current)) {
      const index = Number(segment)
      if (Number.isNaN(index)) return undefined
      current = current[index]
    } else {
      current = (current as Record<string, unknown>)[segment]
    }
  }

  return current
}

/**
 * Immutable set/delete of a nested value using a dot-separated path.
 * - Creates intermediate nodes (array if next segment is a numeric index).
 * - If value is undefined, deletes object key or removes array index.
 * - Returns a new root object/array; when path is empty, returns value.
 */
function setNestedValue(obj: unknown, path: string, value: unknown): unknown {
  if (!path) return value

  const segments = path.split('.')
  const result = obj === null || obj === undefined ? {} : structuredClone(obj)
  let current = result

  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i]!
    const nextSegment = segments[i + 1]!
    const isNextIndex = !Number.isNaN(Number(nextSegment))

    if (Array.isArray(current)) {
      const index = Number(segment)
      if (Number.isNaN(index)) break

      if (!current[index]) {
        current[index] = isNextIndex ? [] : {}
      }
      current = current[index] as Record<string, unknown> | unknown[]
    } else if (typeof current === 'object' && current !== null) {
      const currentObj = current as Record<string, unknown>
      if (!currentObj[segment]) {
        currentObj[segment] = isNextIndex ? [] : {}
      }
      current = currentObj[segment] as Record<string, unknown> | unknown[]
    }
  }

  const lastSegment = segments[segments.length - 1]!
  if (Array.isArray(current)) {
    const index = Number(lastSegment)
    if (!Number.isNaN(index)) {
      if (value === undefined) {
        current.splice(index, 1)
      } else {
        current[index] = value
      }
    }
  } else if (typeof current === 'object' && current !== null) {
    const currentObj = current as Record<string, unknown>
    if (value === undefined) {
      delete currentObj[lastSegment]
    } else {
      currentObj[lastSegment] = value
    }
  }

  return result
}

/** Extract the root namespace from a full key (e.g. "ns.a.b" => "ns"). */
function getRootKey(key: string): string {
  return key.split('.')[0]!
}

/** Extract the nested path from a full key (e.g. "ns.a.b" => "a.b"). */
function getPath(key: string): string {
  const segments = key.split('.')
  return segments.slice(1).join('.')
}

// Helper function to notify listeners hierarchically
/** Notify exact, root, and affected child listeners for a given key change. */
function notifyListeners(
  key: string,
  oldValue: unknown,
  newValue: unknown,
  skipRoot = false,
  skipCholdren = false
) {
  // Notify exact key listeners
  const keyListeners = listeners.get(key)
  keyListeners?.forEach(listener => listener())

  // Notify root listener
  if (!skipRoot) {
    // We need the root object (namespace.path root), i.e. `namespace.rootKey`.
    const rootKey = key.split('.').slice(0, 2).join('.')
    const rootListeners = listeners.get(rootKey)
    rootListeners?.forEach(listener => listener())
  }

  // Notify child listeners only if their specific values changed
  if (!skipCholdren) {
    for (const [listenerKey, listenerSet] of listeners.entries()) {
      if (listenerKey.startsWith(key + '.')) {
        const childPath = listenerKey.substring(key.length + 1)
        const oldChildValue = getNestedValue(oldValue, childPath)
        const newChildValue = getNestedValue(newValue, childPath)

        if (!isEqual(oldChildValue, newChildValue)) {
          listenerSet.forEach(listener => listener())
        }
      }
    }
  }
}

// BroadcastChannel for cross-tab synchronization
const broadcastChannel =
  typeof window !== 'undefined' ? new BroadcastChannel('godoxy-producer-consumer') : null

/**
 * Backing store providing in-memory data with localStorage persistence
 * and cross-tab synchronization. All operations are namespaced at the root key
 * (characters before the first dot).
 */
const store: KeyValueStore = {
  has(key: string) {
    const rootKey = getRootKey(key)
    return (
      memoryStore.has(rootKey) ||
      (typeof window !== 'undefined' && localStorageGet(rootKey) !== undefined)
    )
  },
  get(key: string) {
    const rootKey = getRootKey(key)
    const path = getPath(key)

    // Get root object from memory or localStorage
    let rootValue: unknown
    if (memoryStore.has(rootKey)) {
      rootValue = memoryStore.get(rootKey)
    } else if (typeof window !== 'undefined') {
      rootValue = localStorageGet(rootKey)
      if (rootValue !== undefined) {
        memoryStore.set(rootKey, rootValue)
      }
    }

    // If no path, return root value
    if (!path) return rootValue

    // Traverse to nested value
    return getNestedValue(rootValue, path)
  },
  set(key: string, value: unknown, memoryOnly = false) {
    const rootKey = getRootKey(key)
    const path = getPath(key)

    let rootValue: unknown

    if (!path) {
      // Setting root value directly
      rootValue = value
    } else {
      // Setting nested value
      const currentRoot = memoryStore.get(rootKey) ?? localStorageGet(rootKey) ?? {}
      rootValue = setNestedValue(currentRoot, path, value)
    }

    // Update memory
    if (rootValue === undefined) {
      memoryStore.delete(rootKey)
    } else {
      memoryStore.set(rootKey, rootValue)
    }

    // Persist to localStorage (unless memoryOnly)
    if (!memoryOnly && typeof window !== 'undefined') {
      localStorageSet(rootKey, rootValue)

      // Broadcast change to other tabs
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'set', key: rootKey, value: rootValue })
      }
    }
  },
  delete(key: string, memoryOnly = false) {
    const rootKey = getRootKey(key)
    const path = getPath(key)

    if (!path) {
      // Deleting root key
      memoryStore.delete(rootKey)
      if (!memoryOnly && typeof window !== 'undefined') {
        localStorageDelete(rootKey)
        if (broadcastChannel) {
          broadcastChannel.postMessage({ type: 'delete', key: rootKey })
        }
      }
    } else {
      // Deleting nested value
      const currentRoot = memoryStore.get(rootKey) ?? localStorageGet(rootKey)
      if (currentRoot !== undefined) {
        const updatedRoot = setNestedValue(currentRoot, path, undefined)
        memoryStore.set(rootKey, updatedRoot)

        if (!memoryOnly && typeof window !== 'undefined') {
          localStorageSet(rootKey, updatedRoot)
          if (broadcastChannel) {
            broadcastChannel.postMessage({ type: 'set', key: rootKey, value: updatedRoot })
          }
        }
      }
    }
  },
  get size() {
    return memoryStore.size
  },
}

// Cross-tab synchronization: keep memoryStore in sync with BroadcastChannel events
if (broadcastChannel) {
  broadcastChannel.addEventListener('message', event => {
    const { type, key, value } = event.data
    if (!key) return

    // Store old value before updating
    const oldRootValue = memoryStore.get(key)

    if (type === 'delete') {
      memoryStore.delete(key)
    } else if (type === 'set') {
      memoryStore.set(key, value)
    }

    // Notify all listeners that might be affected by this root key change
    const newRootValue = type === 'delete' ? undefined : value

    for (const listenerKey of listeners.keys()) {
      if (listenerKey === key) {
        // Direct key match - notify with old and new values
        notifyListeners(listenerKey, oldRootValue, newRootValue)
      } else if (listenerKey.startsWith(key + '.')) {
        // Child key - check if its value actually changed
        const childPath = listenerKey.substring(key.length + 1)
        const oldChildValue = getNestedValue(oldRootValue, childPath)
        const newChildValue = getNestedValue(newRootValue, childPath)

        if (!isEqual(oldChildValue, newChildValue)) {
          const childListeners = listeners.get(listenerKey)
          childListeners?.forEach(listener => listener())
        }
      }
    }
  })
}

const listeners = new Map<string, Set<() => void>>()

/** Subscribe to changes for a key; returns an unsubscribe function. */
const subscribe = (key: string, listener: () => void) => {
  if (!listeners.has(key)) {
    listeners.set(key, new Set())
  }
  listeners.get(key)!.add(listener)

  return () => {
    const keyListeners = listeners.get(key)
    if (keyListeners) {
      keyListeners.delete(listener)
      if (keyListeners.size === 0) {
        listeners.delete(key)
      }
    }
  }
}

/** Snapshot getter used by React's useSyncExternalStore. */
const getSnapshot = (key: string) => {
  return store.get(key)
}

/** Core mutation function that updates store and notifies listeners. */
const produce = (key: string, value: unknown, skipUpdate = false, memoryOnly = false) => {
  const current = store.get(key)
  if (isEqual(current, value)) return

  if (value === undefined) {
    store.delete(key, memoryOnly)
  } else {
    store.set(key, value, memoryOnly)
  }

  if (skipUpdate) return

  // Notify listeners hierarchically with old and new values
  notifyListeners(key, current, value)
}

/** React hook: subscribe to and read a namespaced path value. */
function useObject<T extends FieldValues, P extends FieldPath<T>>(key: string, path: P) {
  const fullKey = key + '.' + path
  const value = useSyncExternalStore(
    listener => subscribe(fullKey, listener),
    () => getSnapshot(fullKey),
    () => getSnapshot(fullKey)
  )

  return value as FieldPathValue<T, P> | undefined
}

/** Effectful subscription helper that calls onChange with the latest value. */
function useSubscribe<T>(key: string, onChange: (value: T) => void) {
  useEffect(() => {
    const unsubscribe = subscribe(key, () => {
      const value = getSnapshot(key) as T
      onChange(value)
    })

    return unsubscribe
  }, [key, onChange])
}

/** Set a leaf value under namespace.path, optionally skipping notifications. */
function setLeaf<T extends FieldValues, P extends FieldPath<T>>(
  key: string,
  path: P,
  value: FieldPathValue<T, P> | undefined,
  skipUpdate = false
) {
  const fullKey = key + '.' + path
  produce(fullKey, value, skipUpdate)
}

// Debug helpers (dev only)
/** Development-only debug helpers exposed on window.__pc_debug in development. */
const __pc_debug = {
  getStoreSize: () => store.size,
  getListenerSize: () => listeners.size,
  getStore: () => store,
  getStoreValue: (key: string) => store.get(key),
}

// Expose debug in browser for quick inspection during development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  ;(window as unknown as { __pc_debug: typeof __pc_debug }).__pc_debug = __pc_debug
}
