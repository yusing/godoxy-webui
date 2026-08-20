type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

type RecoveryLocation = Pick<Location, 'pathname' | 'reload'>
type ScheduleRecoveryReset = (callback: () => void) => void

export function createSessionRecovery(
  getLocation: () => RecoveryLocation | undefined,
  scheduleReset: ScheduleRecoveryReset = callback => {
    setTimeout(callback, 0)
  }
) {
  let recoveryStarted = false

  const start = () => {
    if (recoveryStarted) {
      return false
    }
    const location = getLocation()
    if (!location || location.pathname === '/login') {
      return false
    }
    recoveryStarted = true
    try {
      location.reload()
    } finally {
      scheduleReset(() => {
        recoveryStarted = false
      })
    }
    return true
  }

  const wrapFetch =
    (baseFetch: FetchLike): FetchLike =>
    async (input, init) => {
      const response = await baseFetch(input, init)
      if (response.status === 401) {
        start()
      }
      return response
    }

  return { start, wrapFetch }
}

export function createSessionProbe(baseFetch: FetchLike) {
  let inFlight: Promise<Response> | undefined

  return () => {
    inFlight ??= baseFetch('/api/v1/auth/check', {
      method: 'HEAD',
      credentials: 'include',
      redirect: 'manual',
    }).finally(() => {
      inFlight = undefined
    })
    return inFlight
  }
}

export function shouldProbeSessionAfterWebSocketClose(shouldConnect: boolean, closeCode: number) {
  return shouldConnect && closeCode !== 1000
}

const browserSessionRecovery = createSessionRecovery(() =>
  typeof window === 'undefined' ? undefined : window.location
)
const recoveryFetch = browserSessionRecovery.wrapFetch(fetch)

export const sessionFetch: typeof fetch = Object.assign(recoveryFetch, fetch)
export const probeSessionAfterConnectionFailure = createSessionProbe(sessionFetch)
