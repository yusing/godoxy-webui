/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import type { DerivedStateProps, StoreRoot } from './types'

export { createNode, createRootNode, type Extension }

/** Build a deep proxy for dynamic path access under a namespace. */
function createRootNode(storeApi: StoreRoot<any>, initialPath = '') {
  const proxyCache = new Map<string, any>()
  return createNode(storeApi, initialPath, proxyCache)
}

type Extension = {
  get?: () => any
  set?: (value: any) => boolean
}

function createNode(
  storeApi: StoreRoot<any>,
  path: string,
  cache: Map<string, any>,
  extensions?: Record<string | symbol, Extension>,
  from = unchanged,
  to = unchanged
) {
  const isDerived = from !== unchanged || to !== unchanged
  if (!isDerived && cache.has(path)) {
    return cache.get(path)
  }
  const proxy = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'field') {
          return path.split('.').pop()
        }
        if (prop === 'use') {
          return () => from(storeApi.use(path))
        }
        if (prop === 'useDebounce') {
          return (delay: number) => from(storeApi.useDebounce(path, delay))
        }
        if (prop === 'useState') {
          return () => [from(storeApi.use(path)), (value: any) => storeApi.set(path, to(value))]
        }
        if (prop === 'value') {
          return from(storeApi.value(path))
        }
        if (prop === 'set') {
          return (value: any, skipUpdate?: boolean) => storeApi.set(path, to(value), skipUpdate)
        }
        if (prop === 'reset') {
          return () => storeApi.reset(path)
        }
        if (prop === 'subscribe') {
          return (listener: (v: any) => void) =>
            storeApi.subscribe(path, value => listener(to(value)))
        }
        if (prop === 'Render') {
          return ({
            children,
          }: {
            children: (value: any, update: (value: any) => void) => React.ReactNode
          }) =>
            storeApi.Render({
              path,
              children: (value, update) => children(from(value), value => update(to(value))),
            })
        }
        if (prop === 'Show') {
          return ({ children, on }: { children: React.ReactNode; on: (value: any) => boolean }) =>
            storeApi.Show({ path, children, on: value => on(from(value)) })
        }
        if (prop === 'compute') {
          return <R>(fn: (value: any) => R) => {
            const initialValue = from(storeApi.value(path))
            const [computedValue, setComputedValue] = useState(() => fn(initialValue))
            storeApi.subscribe(path, value => setComputedValue(fn(from(value))))
            return computedValue
          }
        }
        if (prop === 'derived') {
          if (isDerived) {
            throw new Error('Derived method cannot be called on a derived node')
          }
          return ({ from, to }: DerivedStateProps<any, any>) =>
            createNode(storeApi, path, cache, extensions, from, to)
        }
        if (Array.isArray(storeApi.value(path))) {
          if (prop === 'at') {
            return (index: number) => {
              const nextPath = path ? `${path}.${index}` : String(index)
              return createNode(storeApi, nextPath, cache, extensions, from, to)
            }
          }
          if (prop === 'length') {
            const value = from(storeApi.value(path))
            return Array.isArray(value) ? value.length : undefined
          }

          // Array mutation methods
          if (prop === 'push') {
            return (...items: any[]) => {
              const currentArray = from(storeApi.value(path)) ?? []
              const transformedItems = isDerived ? items.map(to) : items
              const newArray = [...currentArray, ...transformedItems]
              storeApi.set(path as any, isDerived ? newArray.map(from) : newArray)
              return newArray.length
            }
          }
          if (prop === 'pop') {
            return () => {
              const currentArray = from(storeApi.value(path)) ?? []
              if (currentArray.length === 0) return undefined
              const newArray = currentArray.slice(0, -1)
              const poppedItem = currentArray[currentArray.length - 1]
              storeApi.set(path as any, isDerived ? newArray.map(from) : newArray)
              return poppedItem
            }
          }
          if (prop === 'shift') {
            return () => {
              const currentArray = from(storeApi.value(path)) ?? []
              if (currentArray.length === 0) return undefined
              const newArray = currentArray.slice(1)
              const shiftedItem = currentArray[0]
              storeApi.set(path as any, isDerived ? newArray.map(from) : newArray)
              return shiftedItem
            }
          }
          if (prop === 'unshift') {
            return (...items: any[]) => {
              const currentArray = from(storeApi.value(path)) ?? []
              const transformedItems = isDerived ? items.map(to) : items
              const newArray = [...transformedItems, ...currentArray]
              storeApi.set(path as any, isDerived ? newArray.map(from) : newArray)
              return newArray.length
            }
          }
          if (prop === 'splice') {
            return (start: number, deleteCount?: number, ...items: any[]) => {
              const currentArray = from(storeApi.value(path)) ?? []
              const newArray = [...currentArray]
              const transformedItems = isDerived ? items.map(to) : items
              const deletedItems = newArray.splice(start, deleteCount ?? 0, ...transformedItems)
              storeApi.set(path as any, isDerived ? newArray.map(from) : newArray)
              return deletedItems
            }
          }
          if (prop === 'reverse') {
            return () => {
              const currentArray = from(storeApi.value(path)) ?? []
              if (!Array.isArray(currentArray)) return []
              const newArray = [...currentArray].reverse()
              storeApi.set(path as any, isDerived ? newArray.map(from) : newArray)
              return newArray
            }
          }
          if (prop === 'sort') {
            return (compareFn?: (a: any, b: any) => number) => {
              const currentArray = from(storeApi.value(path)) ?? []
              const newArray = [...currentArray].sort(compareFn)
              storeApi.set(path as any, isDerived ? newArray.map(from) : newArray)
              return newArray
            }
          }
          if (prop === 'fill') {
            return (value: any[], start?: number, end?: number) => {
              const currentArray = from(storeApi.value(path)) ?? []
              const newArray = [...currentArray].fill(value, start, end)
              storeApi.set(path as any, isDerived ? newArray.map(from) : newArray)
              return newArray
            }
          }
          if (prop === 'copyWithin') {
            return (target: number, start: number, end?: number) => {
              const currentArray = from(storeApi.value(path)) ?? []
              const newArray = [...currentArray].copyWithin(target, start, end)
              storeApi.set(path as any, isDerived ? newArray.map(from) : newArray)
              return newArray
            }
          }
          if (prop === 'sortedInsert') {
            return (cmp: (a: any, b: any) => number, ...items: any[]) => {
              const currentArray = from(storeApi.value(path)) ?? []

              if (typeof cmp !== 'function')
                return isDerived ? currentArray.map(from).length : currentArray.length

              // Create a copy of the current array
              const newArray = isDerived ? currentArray.map(from) : [...currentArray]
              const transformedItems = isDerived ? items.map(to) : items

              // Insert each item in sorted order using binary search
              for (const item of transformedItems) {
                let left = 0
                let right = newArray.length

                // Binary search to find insertion point
                while (left < right) {
                  const mid = (left + right) >>> 1
                  if (cmp(newArray[mid], item) <= 0) {
                    left = mid + 1
                  } else {
                    right = mid
                  }
                }

                // Insert at the found position
                newArray.splice(left, 0, item)
              }

              storeApi.set(path, isDerived ? newArray.map(from) : newArray)
              return newArray.length
            }
          }
        }

        if (extensions?.[prop]?.get) {
          return extensions[prop]?.get()
        }

        if (typeof prop === 'string' || typeof prop === 'number') {
          const nextPath = path ? `${path}.${prop}` : String(prop)
          // Always return a proxy
          return createNode(storeApi, nextPath, cache, extensions, from, to)
        }
        return undefined
      },
      set(_target, prop, value) {
        if (extensions?.[prop]?.set) {
          return extensions[prop]?.set(value)
        }
        if (typeof prop === 'string' || typeof prop === 'number') {
          const nextPath = path ? `${path}.${prop}` : prop
          storeApi.set(nextPath, to(value))
          return true
        }
        return false
      },
    }
  )
  if (!isDerived) {
    cache.set(path, proxy)
  }
  return proxy
}

function unchanged(value: any) {
  return value
}
