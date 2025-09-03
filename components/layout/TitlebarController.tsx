'use client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function TitlebarController() {
  const pathname = usePathname()
  useEffect(() => {
    const titlebarItems = document.querySelectorAll('.titlebar-item')
    titlebarItems.forEach(item => {
      if (pathname === item.getAttribute('href')) {
        item.setAttribute('data-active', 'true')
      } else {
        item.removeAttribute('data-active')
      }
    })
  }, [pathname])

  useEffect(() => {
    const titlebar = document.getElementById('titlebar')
    if (!titlebar) return
    // hide titlebar on login page
    if (pathname === '/login') {
      titlebar.setAttribute('data-hidden', 'true')
    } else {
      titlebar.setAttribute('data-hidden', 'false')
    }
  }, [pathname])

  return null
}
