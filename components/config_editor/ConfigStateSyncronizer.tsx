'use client'

import { api } from '@/lib/api-client'
import type { ConfigFile } from '@/types/file'
import type { Config } from '@/types/godoxy'
import { AxiosError } from 'axios'
import { useMount } from 'react-use'
import { parse as parseYAML, stringify as stringifyYAML } from 'yaml'
import type { GoDoxyError } from '../GoDoxyError'
import { configStore } from './store'

export default function ConfigStateSyncronizer() {
  useMount(() => {
    api.file
      .get({
        type: configStore.value('activeFile.type') ?? 'config',
        filename: configStore.value('activeFile.filename') ?? 'config.yml',
      })
      .then(r => configStore.set('content', r.data))
      .catch(err => configStore.set('error', err))
      .finally(() => configStore.set('isLoading', false))
  })

  configStore.subscribe('activeFile', activeFile => {
    configStore.set('isLoading', true)
    configStore.set('error', null)
    api.file
      .get({
        type: activeFile.type,
        filename: activeFile.filename,
      })
      .then(r => configStore.set('content', r.data))
      .catch(err => configStore.set('error', err))
      .finally(() => configStore.set('isLoading', false))
  })

  configStore.subscribe('configObject', config => {
    const yaml = stringifyYAML(config)
    configStore.set('content', yaml)
    validate(yaml, configStore.value('activeFile.type')!).then(err =>
      configStore.set('validateError', err)
    )
  })

  // when content changes, set the rootObject and validate
  configStore.subscribe('content', content => {
    if (!content) {
      configStore.resetValue('configObject')
      configStore.set('validateError', null)
      return
    }

    try {
      const config = parseYAML(content) as Config.Config
      configStore.set('configObject', config)
      validate(content, configStore.value('activeFile.type')!).then(err =>
        configStore.set('validateError', err)
      )
    } catch {
      configStore.set('validateError', 'invalid yaml')
    }
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
