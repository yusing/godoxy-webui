'use client'

import { api, formatErrorString } from '@/lib/api-client'
import type { ConfigFile } from '@/types/file'
import type { Config } from '@/types/godoxy'
import { AxiosError } from 'axios'
import { useEffect } from 'react'
import isEqual from 'react-fast-compare'
import { useMount } from 'react-use'
import { parse as parseYAML, stringify as stringifyYAML } from 'yaml'
import type { GoDoxyError } from '../GoDoxyError'
import { configStore } from './store'

export default function ConfigStateSyncronizer() {
  useMount(() => {
    api.file
      .get({
        type: configStore.activeFile.type.value ?? 'config',
        filename: configStore.activeFile.filename.value ?? 'config.yml',
      })
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
      api.file
        .get({
          type: activeFile?.type ?? 'config',
          filename: activeFile?.filename ?? 'config.yml',
        })
        .then(r => configStore.content.set(r.data))
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
      if (!content) {
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
        configStore.validateError.set('invalid yaml')
      }
    })
    return unsubscribe
  })

  return <></>
}

async function validate(content: string, type: ConfigFile['type']) {
  return api.file
    .validate({ type }, content)
    .then(() => null)
    .catch(e => {
      if (e instanceof AxiosError) {
        return e.response?.data as GoDoxyError
      }
      return null
    })
}
