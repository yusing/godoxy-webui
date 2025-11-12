import type { FieldPath, FieldPathValue, FieldValues } from '@/types/path'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import isEqual from 'react-fast-compare'
import { localStorageDelete, localStorageGet, localStorageSet } from './local_storage'

export {
  getNestedValue,
  getSnapshot,
  joinPath,
  notifyListeners,
  produce,
  setLeaf,
  useDebounce,
  useObject,
  useSubscribe,
}

const memoryStore = new Map<string, unknown>()

type KeyValueStore = {
  has: (key: string) => boolean
  get: (key: string) => unknown
  set: (key: string, value: unknown, memoryOnly?: boolean) => void
  delete: (key: string, memoryOnly?: boolean) => void
  readonly size: number
}

function joinPath(namespace: string, path?: string): string {
  if (!path) return namespace
  return namespace + '.' + path
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

function tryStructuredClone(obj: unknown): unknown {
  if (obj === null || obj === undefined) return null
  if (typeof obj !== 'object') return obj

  // Fast path for array type
  if (Array.isArray(obj)) {
    // Check if array needs deep cloning (contains objects/arrays)
    const needsDeepClone = obj.some(item => item !== null && typeof item === 'object')
    if (!needsDeepClone) {
      // Array of primitives - just return new array reference
      return [...obj]
    }
    return obj.map(item => tryStructuredClone(item))
  }

  // Fallback to structuredClone for complex objects
  try {
    return structuredClone(obj)
  } catch {
    return null
  }
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
  const result = tryStructuredClone(obj)
  let current = result ?? {}

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
  skipChildren = false
) {
  const rootKey = skipRoot ? null : key.split('.').slice(0, 2).join('.')
  const keyPrefix = skipChildren ? null : key + '.'

  // Single pass: collect listeners to notify
  const listenersToNotify = new Set<() => void>()

  for (const [listenerKey, listenerSet] of listeners.entries()) {
    if (listenerKey === key) {
      // Exact key match
      listenerSet.forEach(listener => listenersToNotify.add(listener))
    } else if (rootKey && listenerKey === rootKey) {
      // Root key match
      listenerSet.forEach(listener => listenersToNotify.add(listener))
    } else if (keyPrefix && listenerKey.startsWith(keyPrefix)) {
      // Child key match - check if value actually changed
      const childPath = listenerKey.substring(key.length + 1)
      const oldChildValue = getNestedValue(oldValue, childPath)
      const newChildValue = getNestedValue(newValue, childPath)

      if (!isEqual(oldChildValue, newChildValue)) {
        listenerSet.forEach(listener => listenersToNotify.add(listener))
      }
    }
  }

  // Notify all collected listeners
  listenersToNotify.forEach(listener => listener())
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

/** Snapshot getter used by React's useSyncExternalStore. */
function getSnapshot(key: string) {
  return store.get(key)
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
function subscribe(key: string, listener: () => void) {
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

/** Core mutation function that updates store and notifies listeners. */
function produce(key: string, value: unknown, skipUpdate = false, memoryOnly = false) {
  const current = store.get(key)

  if (value === undefined) {
    skipUpdate = current === undefined
    store.delete(key, memoryOnly)
  } else {
    if (isEqual(current, value)) return
    store.set(key, value, memoryOnly)
  }

  if (skipUpdate) return

  // Notify listeners hierarchically with old and new values
  notifyListeners(key, current, value)
}

/** React hook: subscribe to and read a namespaced path value. */
function useObject<T extends FieldValues, P extends FieldPath<T>>(key: string, path?: P) {
  const fullKey = joinPath(key, path)
  const value = useSyncExternalStore(
    listener => subscribe(fullKey, listener),
    () => getSnapshot(fullKey),
    () => getSnapshot(fullKey)
  )

  return value as FieldPathValue<T, P> | undefined
}

/** React hook: subscribe to and read a namespaced path debounced value. */
function useDebounce<T extends FieldValues, P extends FieldPath<T>>(
  key: string,
  path: P,
  delay: number
): FieldPathValue<T, P> | undefined {
  const fullKey = joinPath(key, path)
  const currentValue = useSyncExternalStore(
    listener => subscribe(fullKey, listener),
    () => getSnapshot(fullKey),
    () => getSnapshot(fullKey)
  ) as FieldPathValue<T, P> | undefined

  const [debouncedValue, setDebouncedValue] = useState<FieldPathValue<T, P> | undefined>(
    currentValue
  )
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (!isEqual(debouncedValue, currentValue)) {
        setDebouncedValue(currentValue)
      }
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [currentValue, delay, debouncedValue])

  return debouncedValue as FieldPathValue<T, P> | undefined
}

/** Effectful subscription helper that calls onChange with the latest value. */
function useSubscribe<T>(key: string, onChange: (value: T) => void) {
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const unsubscribe = subscribe(key, () => {
      const value = getSnapshot(key) as T
      onChangeRef.current(value)
    })

    return unsubscribe
  }, [key])
}

/** Set a leaf value under namespace.path, optionally skipping notifications. */
function setLeaf<T extends FieldValues, P extends FieldPath<T>>(
  key: string,
  path: P,
  value: FieldPathValue<T, P> | undefined,
  skipUpdate = false,
  memoryOnly = false
) {
  const fullKey = joinPath(key, path)
  produce(fullKey, value, skipUpdate, memoryOnly)
}

// Debug helpers (dev only)
/** Development-only debug helpers exposed on window.__pc_debug in development. */
const __pc_debug = {
  getStoreSize: () => store.size,
  getListenerSize: () => listeners.size,
  getStore: () => memoryStore,
  getStoreValue: (key: string) => memoryStore.get(key),
}

// Expose debug in browser for quick inspection during development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  ;(window as unknown as { __pc_debug: typeof __pc_debug }).__pc_debug = __pc_debug
}
