import type { GoDoxyError } from '@/components/GoDoxyError'
import type { Route } from '@/lib/api'
import { getDiffs } from '@/lib/diff'
import type { ConfigFile, ConfigFiles } from '@/types/file'
import type { Config, MiddlewareCompose, Routes } from '@/types/godoxy'
import { createMixedState, createStore, type Store } from 'juststore'
import type { RouteKey } from '../routes/store'

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
  routeDetails: Record<RouteKey, Route>
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

export function useDiffs() {
  return diffState.useCompute(([orig, current]) => getDiffs(orig, current))
}

export function resetDiffs() {
  configStore.originalConfig.set(configStore.configObject.value)
}
