export { resolveThemeColors, resolveThemeColorsAsync };

function resolveThemeColors(): { background: string; foreground: string } {
  const root = document.documentElement
  const style = getComputedStyle(root)
  // Use CSS variables or fall back to Tailwind's muted foreground/background
  const foreground = style.getPropertyValue('--xterm-foreground').trim() || '#e2e8f0'
  const background = style.getPropertyValue('--xterm-background').trim() || '#0f172a'
  return { background, foreground }
}

async function resolveThemeColorsAsync(): Promise<{ background: string; foreground: string }> {
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