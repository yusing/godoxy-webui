import { createMixedState, createStore, isEqual, type Store } from 'juststore'
import { parse as parseYAML } from 'yaml'
import type { GoDoxyError } from '@/components/GoDoxyError'
import type { Route } from '@/lib/api'
import { getDiffs } from '@/lib/diff'
import type { ConfigFile, ConfigFiles } from '@/types/file'
import type { Config, MiddlewareCompose, Routes } from '@/types/godoxy'

type ConfigState<
  T extends Config.Config | Routes.Routes | MiddlewareCompose.MiddlewareCompose,
  Sections extends string = string,
> = {
  files: ConfigFiles
  activeFile: ConfigFile
  activeSection: Sections
  content: string
  isLoading: boolean
  error: string | undefined
  configObject: T | undefined
  originalConfig: T | undefined
  validateError: GoDoxyError | undefined
  routeDetails: Record<string, Route>
}

const defaultConfig: ConfigFile = {
  type: 'config',
  filename: 'config.yml',
}

export const configStore = createStore<ConfigState<Config.Config>>('config', {
  files: { config: [defaultConfig], provider: [], middleware: [] },
  activeFile: defaultConfig,
  activeSection: 'autocert',
  content: '',
  isLoading: false,
  error: undefined,
  configObject: undefined,
  originalConfig: undefined,
  validateError: undefined,
  routeDetails: {},
})

export const routesConfigStore = configStore as unknown as Store<ConfigState<Routes.Routes>>
export const middlewareComposeConfigStore = configStore as unknown as Store<
  ConfigState<MiddlewareCompose.MiddlewareCompose>
>

const diffState = createMixedState(configStore.originalConfig, configStore.configObject)
const unsavedChangesState = createMixedState(
  configStore.originalConfig,
  configStore.content,
  configStore.activeFile
)

export function useDiffs() {
  return diffState.useCompute(([orig, current]) => getDiffs(orig, current))
}

export function hasUnsavedConfigChanges(
  originalConfig: unknown,
  content: string | undefined,
  isNewFile = false
) {
  if (content === undefined || (originalConfig === undefined && !isNewFile)) {
    return false
  }
  try {
    const baseline = isNewFile && originalConfig === undefined ? null : originalConfig
    return !isEqual(baseline, parseYAML(content))
  } catch {
    return true
  }
}

export function useHasUnsavedConfigChanges() {
  return unsavedChangesState.useCompute(([originalConfig, content, activeFile]) =>
    hasUnsavedConfigChanges(originalConfig, content, activeFile.isNewFile === true)
  )
}

export function shouldBlockUnsavedNavigation(
  hasUnsavedChanges: boolean,
  confirmDiscard: () => boolean
) {
  return hasUnsavedChanges && !confirmDiscard()
}

export function confirmDiscardActiveConfigChanges(confirmDiscard: () => boolean) {
  const activeFile = configStore.activeFile.value
  const hasUnsavedChanges = hasUnsavedConfigChanges(
    configStore.originalConfig.value,
    configStore.content.value,
    activeFile.isNewFile === true
  )
  return !shouldBlockUnsavedNavigation(hasUnsavedChanges, confirmDiscard)
}

export function selectConfigFile(nextFile: ConfigFile, confirmDiscard: () => boolean) {
  const activeFile = configStore.activeFile.value
  if (activeFile.type === nextFile.type && activeFile.filename === nextFile.filename) {
    return true
  }

  if (!confirmDiscardActiveConfigChanges(confirmDiscard)) {
    return false
  }

  configStore.activeFile.set(nextFile)
  return true
}

export function isConfigFilePersistencePromotion(previousFile: ConfigFile, nextFile: ConfigFile) {
  return (
    previousFile.type === nextFile.type &&
    previousFile.filename === nextFile.filename &&
    previousFile.isNewFile === true &&
    nextFile.isNewFile !== true
  )
}

export function markConfigFileSaved(savedFile: ConfigFile, savedConfig: Config.Config | undefined) {
  if (savedFile.isNewFile === true) {
    const persistedFile: ConfigFile = {
      type: savedFile.type,
      filename: savedFile.filename,
    }
    configStore.files[savedFile.type].set(
      configStore.files[savedFile.type].value.map(file =>
        file.filename === savedFile.filename ? persistedFile : file
      )
    )
    if (
      configStore.activeFile.value.type === savedFile.type &&
      configStore.activeFile.value.filename === savedFile.filename
    ) {
      configStore.activeFile.set(persistedFile)
    }
  }

  if (
    configStore.activeFile.value.type === savedFile.type &&
    configStore.activeFile.value.filename === savedFile.filename
  ) {
    configStore.originalConfig.set(savedConfig)
  }
}

export function resetDiffs() {
  configStore.originalConfig.set(configStore.configObject.value)
}
