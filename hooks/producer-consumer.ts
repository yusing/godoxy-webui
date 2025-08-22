import { create } from 'zustand'

type Store = Record<string, unknown> & {
  produce: (key: string, value: unknown) => void
}

const store = create<Store>(
  set =>
    ({
      produce: (key: string, value: unknown) =>
        set(state => ({
          ...state,
          [key]: value,
        })),
    }) as Store
)

export function useConsume<T>(key: string, initial?: T) {
  const value = store(state => state[key])
  if (value === undefined) {
    return initial
  }
  return value as T
}

export function useProduceFor<T>(key: string) {
  const produce = store(state => state.produce)
  const current = useConsume<T>(key)
  return (value: T) => {
    if (current === value) return
    produce(key, value)
  }
}

export function useProduce<T, Key extends string = string>() {
  const produce = store(state => state.produce)
  const state = store(state => state)
  return (key: Key, value: T) => {
    if (state[key] === value) return
    produce(key, value)
  }
}
