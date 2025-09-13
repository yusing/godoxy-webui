import type { GoDoxyError } from '@/components/GoDoxyError'
import { createStore, type Store } from '@/hooks/store'
import type { ConfigFile, ConfigFiles } from '@/types/file'
import type { Config, Routes } from '@/types/godoxy'

type ConfigState<T extends Config.Config | Routes.Routes, Sections extends string = string> = {
  files: ConfigFiles
  activeFile: ConfigFile
  activeSection: Sections
  content: string
  isLoading: boolean
  error: string | undefined
  configObject: T | undefined
  validateError: GoDoxyError | undefined
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
})

export const routesConfigStore = configStore as unknown as Store<ConfigState<Routes.Routes>>
