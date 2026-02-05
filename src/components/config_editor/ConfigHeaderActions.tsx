import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ConfigHeaderContextValue = {
  actionsTarget: HTMLElement | null
  titleTarget: HTMLElement | null
  setTitleOverride: ((active: boolean) => void) | null
}

const ConfigHeaderContext = createContext<ConfigHeaderContextValue>({
  actionsTarget: null,
  titleTarget: null,
  setTitleOverride: null,
})

export function ConfigHeaderProvider({
  actionsTarget,
  titleTarget,
  setTitleOverride,
  children,
}: {
  actionsTarget: HTMLElement | null
  titleTarget: HTMLElement | null
  setTitleOverride: (active: boolean) => void
  children: ReactNode
}) {
  return (
    <ConfigHeaderContext.Provider value={{ actionsTarget, titleTarget, setTitleOverride }}>
      {children}
    </ConfigHeaderContext.Provider>
  )
}

/**
 * Renders its children into the ConfigContent header action area (end of header).
 *
 * Usage (inside any section Content):
 *   <ConfigHeaderActions>
 *     <Button ... />
 *   </ConfigHeaderActions>
 */
export function ConfigHeaderActions({ children }: { children: ReactNode }) {
  const { actionsTarget } = useContext(ConfigHeaderContext)
  if (!actionsTarget) return null
  return createPortal(children, actionsTarget)
}

/**
 * Renders its children into the ConfigContent header title area (replaces the label).
 *
 * Usage (inside any section Content):
 *   <ConfigHeaderTitle>
 *     <span>Custom Title</span>
 *   </ConfigHeaderTitle>
 */
export function ConfigHeaderTitle({ children }: { children: ReactNode }) {
  const { titleTarget, setTitleOverride } = useContext(ConfigHeaderContext)
  const canRender = !!titleTarget
  useEffect(() => {
    if (!canRender) return
    setTitleOverride?.(true)
    return () => setTitleOverride?.(false)
  }, [setTitleOverride, canRender])
  if (!titleTarget) return null
  return createPortal(children, titleTarget)
}
