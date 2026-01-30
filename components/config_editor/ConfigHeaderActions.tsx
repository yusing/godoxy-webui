'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const HeaderActionsTargetContext = createContext<HTMLElement | null>(null)

export function ConfigHeaderActionsProvider({
  target,
  children,
}: {
  target: HTMLElement | null
  children: ReactNode
}) {
  return (
    <HeaderActionsTargetContext.Provider value={target}>
      {children}
    </HeaderActionsTargetContext.Provider>
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
  const target = useContext(HeaderActionsTargetContext)
  if (!target) return null
  return createPortal(children, target)
}

