import { isEqual } from 'juststore'
import { useEffect } from 'react'
import { useMount } from 'react-use'
import { parse as parseYAML, stringify as stringifyYAML } from 'yaml'
import { api, formatErrorString, isFetchApiError, useEndpoint } from '@/lib/api-client'
import type { ConfigFile } from '@/types/file'
import type { Config } from '@/types/godoxy'
import type { GoDoxyError } from '../GoDoxyError'
import { configStore } from './store'

export default function ConfigStateSyncronizer() {
  const endpoint = useEndpoint(api.file.get)

  useMount(() => {
    endpoint
      .get(
        {
          type: configStore.activeFile.type.value ?? 'config',
          filename: configStore.activeFile.filename.value ?? 'config.yml',
        },
        {
          format: 'text',
        }
      )
      .then(r => {
        configStore.content.set(r.data)
        configStore.originalConfig.set(parseYAML(r.data) as Config.Config)
        configStore.error.reset()
      })
      .catch(err => configStore.error.set(formatErrorString(err)))
      .finally(() => configStore.isLoading.set(false))
  })

  useEffect(() => {
    const unsubscribe = configStore.activeFile.subscribe(activeFile => {
      configStore.originalConfig.reset()
      if (activeFile.isNewFile) {
        configStore.content.set('')
        configStore.isLoading.set(false)
        configStore.error.reset()
        return
      }
      configStore.content.reset()
      configStore.isLoading.set(true)
      configStore.error.reset()
      endpoint
        .get(
          {
            type: activeFile?.type ?? 'config',
            filename: activeFile?.filename ?? 'config.yml',
          },
          {
            format: 'text',
          }
        )
        .then(r => {
          configStore.content.set(r.data)
          configStore.originalConfig.set(parseYAML(r.data) as Config.Config)
        })
        .catch(err => configStore.error.set(formatErrorString(err)))
        .finally(() => configStore.isLoading.set(false))
    })
    return unsubscribe
  })

  useEffect(() => {
    const unsubscribe = configStore.configObject.subscribe(config => {
      try {
        if (isEqual(config, parseYAML(configStore.content.value ?? ''))) {
          return
        }
      } catch {
        // content is temporarily invalid while user is editing, don't overwrite it
        configStore.validateError.set('invalid yaml')
        return
      }
      const yaml = stringifyYAML(config)
      configStore.content.set(yaml)
      validate(yaml, configStore.activeFile.type.value).then(err =>
        configStore.validateError.set(err as GoDoxyError)
      )
    })
    return unsubscribe
  })

  // when content changes, set the rootObject and validate
  useEffect(() => {
    const unsubscribe = configStore.content.subscribe(content => {
      if (typeof content !== 'string') {
        configStore.content.reset()
        configStore.configObject.reset()
        configStore.originalConfig.reset()
        configStore.validateError.reset()
        return
      }

      try {
        const config = parseYAML(content) as Config.Config
        configStore.configObject.set(config)
        validate(content, configStore.activeFile.type.value).then(err =>
          configStore.validateError.set(err as GoDoxyError)
        )
      } catch {
        // keep the user's input so they can fix it; don't update configObject
        configStore.validateError.set('invalid yaml')
      }
    })
    return unsubscribe
  })

  return null
}

async function validate(content: string, type: ConfigFile['type']) {
  return api.file
    .validate({ type }, content)
    .then(() => null)
    .catch(e => {
      if (isFetchApiError(e) && e.error != null) {
        return e.error as GoDoxyError
      }
      return null
    })
}
