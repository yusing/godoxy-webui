import type { FileType } from '@/lib/api'

export type ConfigFile = {
  type: FileType
  filename: string
  isNewFile?: boolean
}

export type ConfigFiles = Record<FileType, ConfigFile[]>

export const godoxyConfig: ConfigFile = {
  type: 'config',
  filename: 'config.yml',
}

export const placeholderFiles: ConfigFiles = {
  config: [],
  provider: [],
  middleware: [],
}
