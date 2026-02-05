import { useEffectOnce } from 'react-use'
import type { FileType } from '@/lib/api'
import { api } from '@/lib/api-client'
import type { ConfigFiles } from '@/types/file'
import { configStore } from './store'

export default function ConfigFileListProvider() {
  useEffectOnce(() => {
    api.file
      .list()
      .then(r =>
        Object.entries(r.data).reduce((acc, [type, filenames]) => {
          acc[type as FileType] = filenames.map((f: string) => ({
            type: type,
            filename: f,
          }))
          return acc
        }, {} as ConfigFiles)
      )
      .then(files => configStore.files.set(files))
  })

  return null
}
