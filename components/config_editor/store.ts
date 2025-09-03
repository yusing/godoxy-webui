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
  error: Error | null
  configObject: T | null
  validateError: GoDoxyError | null
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
  error: null,
  configObject: null,
  validateError: null,
})

export const routesConfigStore = configStore as unknown as Store<ConfigState<Routes.Routes>>
