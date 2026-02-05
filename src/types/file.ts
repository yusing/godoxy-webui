import type { FileType } from '@/lib/api'

export type ConfigFile = {
  type: FileType
  filename: string
  isNewFile?: boolean
}

export type ConfigFiles = Record<FileType, ConfigFile[]>
