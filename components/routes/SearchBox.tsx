import { useRef } from 'react'
import { Input } from '../ui/input'

export default function RoutesSidebarSearchBox() {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <Input
      className="rounded-none sidebar-search-box w-full"
      placeholder="Search routes"
      ref={ref}
      onChange={e => {
        if (!ref.current) return

        const searchQuery = e.target.value
        ref.current.value = searchQuery

        const items = document.querySelectorAll('.sidebar-item-list .route-item')
        // empty search query, show all items
        if (!searchQuery) {
          for (const item of items) {
            item.removeAttribute('data-filtered')
          }
          return
        }

        // filter items based on search query
        for (const item of items) {
          const displayName = item.querySelector('.route-display-name')?.textContent
          if (displayName?.toLowerCase().includes(searchQuery.toLowerCase())) {
            item.removeAttribute('data-filtered')
          } else {
            item.setAttribute('data-filtered', 'true')
          }
        }
      }}
    />
  )
}
