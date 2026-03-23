type PageshowEventLike = Event & {
  persisted?: boolean
}

type PageshowTarget = Pick<Window, 'addEventListener' | 'removeEventListener'>

export function shouldReloadForBfcacheRestore(event: PageshowEventLike) {
  return event.persisted === true
}

export function registerBfcacheReload(
  target: PageshowTarget = window,
  reload: () => void = () => window.location.reload()
) {
  const handlePageShow = (event: Event) => {
    if (shouldReloadForBfcacheRestore(event as PageshowEventLike)) {
      reload()
    }
  }

  target.addEventListener('pageshow', handlePageShow)

  return () => {
    target.removeEventListener('pageshow', handlePageShow)
  }
}
