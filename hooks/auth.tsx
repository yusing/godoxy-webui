'use client'

import { api, callApi } from '@/lib/api-client'
import { HttpStatusCode } from 'axios'
import { useMount } from 'react-use'

// weird redirect behavior with fetch
// with 'manual' redirect, the status code will be 0 and headers will be empty
// We need to use 'follow' redirect to get the correct status code and redirect URL
// https://github.com/whatwg/fetch/issues/763
export function AuthProvider() {
  useMount(() => {
    callApi(api.auth.check).then(({ code, headers }) => {
      if (code == HttpStatusCode.Forbidden) {
        const redirectURL = headers['x-redirect-to']
        if (redirectURL && redirectURL !== window.location.pathname) {
          window.location.href = redirectURL
        }
      }
    })
  })
  return null
}
