import { beforeEach, describe, expect, test } from 'bun:test'
import type { Config } from '@/types/godoxy'
import {
  configStore,
  hasUnsavedConfigChanges,
  isConfigFilePersistencePromotion,
  markConfigFileSaved,
  selectConfigFile,
  shouldBlockUnsavedNavigation,
} from './store'

describe('hasUnsavedConfigChanges', () => {
  const original = { api: { port: 8888 }, debug: false }

  test('ignores equivalent YAML formatting', () => {
    expect(hasUnsavedConfigChanges(original, 'debug: false\napi:\n  port: 8888\n')).toBe(false)
  })

  test('detects semantic edits', () => {
    expect(hasUnsavedConfigChanges(original, 'api:\n  port: 9999\ndebug: false\n')).toBe(true)
  })

  test('protects invalid in-progress YAML', () => {
    expect(hasUnsavedConfigChanges(original, 'api: [')).toBe(true)
  })

  test('does not block before the original configuration loads', () => {
    expect(hasUnsavedConfigChanges(undefined, 'api:\n  port: 9999\n')).toBe(false)
  })

  test('treats a new empty file as clean', () => {
    expect(hasUnsavedConfigChanges(undefined, '', true)).toBe(false)
    expect(hasUnsavedConfigChanges(undefined, '# draft\n', true)).toBe(false)
  })

  test('protects valid and invalid edits to a new file', () => {
    expect(hasUnsavedConfigChanges(undefined, 'provider: local\n', true)).toBe(true)
    expect(hasUnsavedConfigChanges(undefined, 'provider: [', true)).toBe(true)
  })

  test('uses the saved baseline after a new file is persisted', () => {
    expect(hasUnsavedConfigChanges({ provider: 'local' }, 'provider: local\n', true)).toBe(false)
  })
})

describe('shouldBlockUnsavedNavigation', () => {
  test('blocks when the user keeps unsaved changes', () => {
    expect(shouldBlockUnsavedNavigation(true, () => false)).toBe(true)
  })

  test('allows the user to discard changes and leave', () => {
    expect(shouldBlockUnsavedNavigation(true, () => true)).toBe(false)
  })

  test('does not prompt when there are no unsaved changes', () => {
    let prompted = false
    expect(
      shouldBlockUnsavedNavigation(false, () => {
        prompted = true
        return false
      })
    ).toBe(false)
    expect(prompted).toBe(false)
  })
})

describe('selectConfigFile', () => {
  const draftFile = { type: 'provider' as const, filename: 'draft.yml', isNewFile: true }
  const otherFile = { type: 'provider' as const, filename: 'other.yml' }

  beforeEach(() => {
    configStore.files.set({
      config: [{ type: 'config', filename: 'config.yml' }],
      provider: [draftFile, otherFile],
      middleware: [],
    })
    configStore.activeFile.set(draftFile)
    configStore.content.set('provider: local\n')
    configStore.configObject.reset()
    configStore.originalConfig.reset()
  })

  test('keeps a dirty draft active when discarding is canceled', () => {
    expect(selectConfigFile(otherFile, () => false)).toBe(false)
    expect(configStore.activeFile.value).toEqual(draftFile)
    expect(configStore.content.value).toBe('provider: local\n')
    expect(configStore.originalConfig.value).toBeUndefined()
  })

  test('selects the complete stored file when discarding is confirmed', () => {
    expect(selectConfigFile(otherFile, () => true)).toBe(true)
    expect(configStore.activeFile.value).toBe(otherFile)
  })

  test('preserves new-file metadata when selecting a clean draft', () => {
    configStore.activeFile.set(otherFile)
    configStore.content.set('{}\n')
    configStore.originalConfig.set({})

    expect(selectConfigFile(draftFile, () => false)).toBe(true)
    expect(configStore.activeFile.value).toBe(draftFile)
    expect(configStore.activeFile.value.isNewFile).toBe(true)
  })
})

describe('markConfigFileSaved', () => {
  const draftFile = { type: 'provider' as const, filename: 'draft.yml', isNewFile: true }

  test('promotes a new file in both the active state and file list', () => {
    const savedConfig = { providers: {} } as Config.Config
    configStore.files.set({
      config: [{ type: 'config', filename: 'config.yml' }],
      provider: [draftFile],
      middleware: [],
    })
    configStore.activeFile.set(draftFile)
    configStore.configObject.set(savedConfig)
    configStore.originalConfig.reset()

    markConfigFileSaved(draftFile, savedConfig)

    expect(configStore.activeFile.value).toEqual({ type: 'provider', filename: 'draft.yml' })
    expect(configStore.files.provider.value).toEqual([{ type: 'provider', filename: 'draft.yml' }])
    expect(configStore.originalConfig.value).toBe(savedConfig)
  })

  test('does not replace the baseline of a file selected while saving', () => {
    const otherFile = { type: 'provider' as const, filename: 'other.yml' }
    const otherConfig = { providers: { files: ['other.yml'] } } as Config.Config
    configStore.files.set({
      config: [{ type: 'config', filename: 'config.yml' }],
      provider: [draftFile, otherFile],
      middleware: [],
    })
    configStore.activeFile.set(otherFile)
    configStore.originalConfig.set(otherConfig)

    markConfigFileSaved(draftFile, { providers: {} } as Config.Config)

    expect(configStore.activeFile.value).toBe(otherFile)
    expect(configStore.originalConfig.value).toBe(otherConfig)
    expect(configStore.files.provider.value).toEqual([
      { type: 'provider', filename: 'draft.yml' },
      otherFile,
    ])
  })
})

describe('isConfigFilePersistencePromotion', () => {
  const newFile = { type: 'provider' as const, filename: 'draft.yml', isNewFile: true }
  const persistedFile = { type: 'provider' as const, filename: 'draft.yml' }

  test('recognizes only removal of the new-file marker for the same file', () => {
    expect(isConfigFilePersistencePromotion(newFile, persistedFile)).toBe(true)
    expect(isConfigFilePersistencePromotion(persistedFile, persistedFile)).toBe(false)
    expect(
      isConfigFilePersistencePromotion(newFile, {
        type: 'provider',
        filename: 'other.yml',
      })
    ).toBe(false)
  })
})
