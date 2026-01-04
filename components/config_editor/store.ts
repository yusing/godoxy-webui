import type { GoDoxyError } from '@/components/GoDoxyError'
import type { ConfigFile, ConfigFiles } from '@/types/file'
import type { Config, MiddlewareCompose, Routes } from '@/types/godoxy'
import { createStore, type Store } from 'juststore'

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
  validateError: GoDoxyError | undefined
  unsavedChanges: Record<Sections, boolean>
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
  validateError: undefined,
  unsavedChanges: {} as Record<string, boolean>,
})

export const routesConfigStore = configStore as unknown as Store<ConfigState<Routes.Routes>>
export const middlewareComposeConfigStore = configStore as unknown as Store<
  ConfigState<MiddlewareCompose.MiddlewareCompose>
>
