export { resolveThemeColors }

function resolveThemeColors() {
  const root = document.documentElement
  const foreground = getComputedStyle(root).getPropertyValue('--xterm-foreground')
  const background = getComputedStyle(root).getPropertyValue('--xterm-background')
  return { background, foreground }
}

export async function resolveThemeColorsAsync(): Promise<{ background: string; foreground: string }> {
  return new Promise(resolve => {
    const scheduleResolve = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve(resolveThemeColors())
        })
      })
    }
    scheduleResolve()
  })
}