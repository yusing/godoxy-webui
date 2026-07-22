import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { JSDOM } from 'jsdom'
import type { Config } from '@/types/godoxy'
import { configStore } from './store'

const setMock = mock(async () => ({}))
const toastErrorMock = mock(() => undefined)

mock.module('@/lib/api-client', () => ({
  api: {
    file: {
      set: setMock,
    },
  },
}))

mock.module('@/lib/toast', () => ({
  toastError: toastErrorMock,
}))

const { default: ConfigSaveButton } = await import('./ConfigSaveButton')

describe('ConfigSaveButton', () => {
  let container: HTMLDivElement
  let root: Root
  const originalConfig = { providers: {} } as Config.Config
  const editedConfig = { providers: { files: ['routes.yml'] } } as Config.Config

  beforeEach(() => {
    const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
      url: 'http://localhost',
    })

    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    globalThis.window = dom.window as typeof globalThis.window
    globalThis.document = dom.window.document
    globalThis.HTMLElement = dom.window.HTMLElement
    globalThis.SVGElement = dom.window.SVGElement
    globalThis.Node = dom.window.Node
    globalThis.navigator = dom.window.navigator
    globalThis.localStorage = dom.window.localStorage

    setMock.mockClear()
    toastErrorMock.mockClear()
    configStore.activeFile.set({ type: 'config', filename: 'config.yml' })
    configStore.content.set('providers:\n  files: [routes.yml]\n')
    configStore.originalConfig.set(originalConfig)
    configStore.configObject.set(editedConfig)

    container = dom.window.document.getElementById('root') as HTMLDivElement
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
  })

  test('marks saved and resets the diff only after persistence succeeds', async () => {
    setMock.mockImplementation(async () => ({}))
    await act(async () => {
      root.render(<ConfigSaveButton />)
    })

    await act(async () => {
      container.querySelector('button')?.click()
    })

    expect(setMock).toHaveBeenCalledTimes(1)
    expect(configStore.originalConfig.value).toBe(editedConfig)
    expect(toastErrorMock).not.toHaveBeenCalled()
  })

  test('retains the unsaved diff and existing error feedback when persistence fails', async () => {
    const persistenceError = new Error('disk full')
    setMock.mockImplementation(async () => Promise.reject(persistenceError))
    await act(async () => {
      root.render(<ConfigSaveButton />)
    })

    await act(async () => {
      container.querySelector('button')?.click()
    })

    expect(setMock).toHaveBeenCalledTimes(1)
    expect(configStore.originalConfig.value).toBe(originalConfig)
    expect(toastErrorMock).toHaveBeenCalledWith(persistenceError)
  })

  test('clears a previous saved indicator when the next persistence attempt fails', async () => {
    const persistenceError = new Error('disk full')
    const nextEditedConfig = { providers: { files: ['other.yml'] } } as Config.Config
    setMock
      .mockImplementationOnce(async () => ({}))
      .mockImplementationOnce(async () => Promise.reject(persistenceError))
    await act(async () => {
      root.render(<ConfigSaveButton />)
    })

    await act(async () => {
      container.querySelector('button')?.click()
    })
    expect(container.querySelector('.text-green-500')).not.toBeNull()

    act(() => {
      configStore.content.set('providers:\n  files: [other.yml]\n')
      configStore.configObject.set(nextEditedConfig)
    })
    await act(async () => {
      container.querySelector('button')?.click()
    })

    expect(setMock).toHaveBeenCalledTimes(2)
    expect(configStore.originalConfig.value).toBe(editedConfig)
    expect(container.querySelector('.text-green-500')).toBeNull()
    expect(toastErrorMock).toHaveBeenCalledWith(persistenceError)
  })
})
