import { describe, expect, test } from 'bun:test'
import {
  createSessionProbe,
  createSessionRecovery,
  shouldProbeSessionAfterWebSocketClose,
} from './session-recovery'

describe('session recovery', () => {
  test('reloads the current document after the first unauthorized response', async () => {
    let reloadCount = 0
    const recovery = createSessionRecovery(() => ({
      pathname: '/config',
      reload: () => {
        reloadCount += 1
      },
    }))
    const sessionFetch = recovery.wrapFetch(async () => new Response(null, { status: 401 }))

    const first = await sessionFetch('/api/v1/config')
    const second = await sessionFetch('/api/v1/cert/info')

    expect(first.status).toBe(401)
    expect(second.status).toBe(401)
    expect(reloadCount).toBe(1)
  })

  test('does not reload for successful or non-authentication errors', async () => {
    let status = 200
    let reloadCount = 0
    const recovery = createSessionRecovery(() => ({
      pathname: '/config',
      reload: () => {
        reloadCount += 1
      },
    }))
    const sessionFetch = recovery.wrapFetch(async () => new Response(null, { status }))

    expect((await sessionFetch('/api/v1/config')).status).toBe(200)
    status = 403
    expect((await sessionFetch('/api/v1/config')).status).toBe(403)
    expect(reloadCount).toBe(0)
  })

  test('does not reload during server rendering or from the login page', async () => {
    let reloadCount = 0
    const serverFetch = createSessionRecovery(() => undefined).wrapFetch(
      async () => new Response(null, { status: 401 })
    )
    const loginFetch = createSessionRecovery(() => ({
      pathname: '/login',
      reload: () => {
        reloadCount += 1
      },
    })).wrapFetch(async () => new Response(null, { status: 401 }))

    expect((await serverFetch('/api/v1/config')).status).toBe(401)
    expect((await loginFetch('/api/v1/config')).status).toBe(401)
    expect(reloadCount).toBe(0)
  })

  test('rearms recovery when a reload is canceled by the current document', async () => {
    let reloadCount = 0
    let resetRecovery: (() => void) | undefined
    const recovery = createSessionRecovery(
      () => ({
        pathname: '/config',
        reload: () => {
          reloadCount += 1
        },
      }),
      callback => {
        resetRecovery = callback
      }
    )
    const sessionFetch = recovery.wrapFetch(async () => new Response(null, { status: 401 }))

    await Promise.all([sessionFetch('/api/v1/config'), sessionFetch('/api/v1/cert/info')])
    expect(reloadCount).toBe(1)

    resetRecovery?.()
    await sessionFetch('/api/v1/config')
    expect(reloadCount).toBe(2)
  })

  test('coalesces simultaneous WebSocket authentication probes', async () => {
    let fetchCount = 0
    let resolveFetch: ((response: Response) => void) | undefined
    const probe = createSessionProbe(() => {
      fetchCount += 1
      if (fetchCount > 1) {
        return Promise.resolve(new Response(null, { status: 200 }))
      }
      return new Promise<Response>(resolve => {
        resolveFetch = resolve
      })
    })

    const first = probe()
    const second = probe()
    expect(fetchCount).toBe(1)
    expect(first).toBe(second)

    resolveFetch?.(new Response(null, { status: 200 }))
    await Promise.all([first, second])
    await probe()
    expect(fetchCount).toBe(2)
  })

  test('probes only unexpected closes while the socket should remain connected', () => {
    expect(shouldProbeSessionAfterWebSocketClose(true, 1006)).toBe(true)
    expect(shouldProbeSessionAfterWebSocketClose(true, 1011)).toBe(true)
    expect(shouldProbeSessionAfterWebSocketClose(true, 1000)).toBe(false)
    expect(shouldProbeSessionAfterWebSocketClose(false, 1006)).toBe(false)
  })
})
