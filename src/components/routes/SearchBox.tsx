import { IconSearch } from '@tabler/icons-react'
import { useCallback, useEffect, useRef } from 'react'
import { InputGroup, InputGroupAddon, InputGroupInput } from '../ui/input-group'

function isPrintableKey(key: string) {
  return key.length === 1
}

function isEditableElement(element: Element | null) {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement ||
    (element instanceof HTMLElement && element.isContentEditable)
  )
}

export default function RoutesSidebarSearchBox() {
  const ref = useRef<HTMLInputElement>(null)

  const applyFilter = useCallback((searchQuery: string) => {
    const items = Array.from(
      document.querySelectorAll<HTMLElement>('.sidebar-item-list .route-item')
    )
    // empty search query, show all items
    if (!searchQuery) {
      for (const item of items) {
        item.hidden = false
      }
      return
    }

    // filter items based on search query
    for (const item of items) {
      const displayName = item.querySelector('.route-display-name')?.textContent
      if (displayName?.toLowerCase().includes(searchQuery.toLowerCase())) {
        item.hidden = false
      } else {
        item.hidden = true
      }
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (!isPrintableKey(e.key)) return

      const input = ref.current
      if (!input) return

      const activeElement = document.activeElement
      if (activeElement && isEditableElement(activeElement) && !input.contains(activeElement)) {
        return
      }

      if (input.contains(activeElement)) return

      e.preventDefault()

      const nextValue = `${input.value}${e.key}`
      input.focus()
      input.value = nextValue
      input.setSelectionRange(nextValue.length, nextValue.length)
      applyFilter(nextValue)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [applyFilter])

  return (
    <div className="routes-sidebar-search-row px-1 py-1.5">
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <IconSearch className="text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          className="w-full"
          placeholder="Search routes"
          ref={ref}
          onChange={e => {
            if (!ref.current) return

            const searchQuery = e.target.value
            ref.current.value = searchQuery

            applyFilter(searchQuery)
          }}
        />
      </InputGroup>
    </div>
  )
}
