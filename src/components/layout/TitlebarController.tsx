import { useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'

export default function TitlebarController() {
  const location = useLocation()
  useEffect(() => {
    const titlebarItems = document.querySelectorAll('.titlebar-item')
    titlebarItems.forEach(item => {
      if (location.pathname === item.getAttribute('href')) {
        item.setAttribute('data-active', 'true')
      } else {
        item.removeAttribute('data-active')
      }
    })
  }, [location.pathname])

  useEffect(() => {
    const titlebar = document.getElementById('titlebar')
    if (!titlebar) return
    // hide titlebar on login page
    if (location.pathname === '/login') {
      titlebar.setAttribute('data-hidden', 'true')
    } else {
      titlebar.setAttribute('data-hidden', 'false')
    }
  }, [location.pathname])

  return null
}
