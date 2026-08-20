import { beforeEach, describe, expect, test } from 'bun:test'
import type { Config } from '@/types/godoxy'
import { addConfigFile } from './AddFilePopoverButton'
import { configStore } from './store'

describe('addConfigFile', () => {
  const activeFile = { type: 'config' as const, filename: 'config.yml' }
  const originalConfig = { providers: {} } as Config.Config

  beforeEach(() => {
    configStore.files.set({ config: [activeFile], provider: [], middleware: [] })
    configStore.activeFile.set(activeFile)
    configStore.content.set('providers: [')
    configStore.originalConfig.set(originalConfig)
  })

  test('keeps the current draft and file list when discarding is canceled', () => {
    expect(addConfigFile({ type: 'provider', filename: 'routes' }, () => false)).toBe(false)
    expect(configStore.activeFile.value).toBe(activeFile)
    expect(configStore.content.value).toBe('providers: [')
    expect(configStore.originalConfig.value).toBe(originalConfig)
    expect(configStore.files.provider.value).toEqual([])
  })

  test('adds and selects the complete new-file record after confirmation', () => {
    expect(addConfigFile({ type: 'provider', filename: 'routes' }, () => true)).toBe(true)

    const newFile = { type: 'provider', filename: 'routes.yml', isNewFile: true }
    expect(configStore.files.provider.value).toEqual([newFile])
    expect(configStore.activeFile.value).toEqual(newFile)
  })
})
