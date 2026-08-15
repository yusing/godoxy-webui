import { api } from '@/lib/api-client'
import { useEffect } from 'react'
import { store } from './store'
import { toastError } from '@/lib/toast'

export default function WebUIConfigProvider() {
  useEffect(() => {
    api.webui
      .config()
      .then(resp => store.config.set(resp.data))
      .catch(toastError)
  })
  return null
}
