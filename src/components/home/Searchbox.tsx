import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useMount } from 'react-use'
import { cn } from '@/lib/utils'
import DuckDuckGo from '../svg/duckduckgo'
import Google from '../svg/google'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from '../ui/input-group'
import { Kbd } from '../ui/kbd'
import { store } from './store'

function isAlphabetKey(key: string) {
  return /^[a-zA-Z]$/.test(key)
}

export default function Searchbox() {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [useSearchEngine, setUseSearchEngine] = useState(false)

  useMount(() => {
    store.searchQuery.set('')
  })

  // focus search input on Alt+S
  useEffect(() => {
    const onAltS = (e: KeyboardEvent) => {
      if (store.editingApp.value) return
      if (isAlphabetKey(e.key) && !searchInputRef.current?.contains(document.activeElement)) {
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onAltS)
    return () => window.removeEventListener('keydown', onAltS)
  })

  return (
    <div className="relative flex-1 min-w-0 w-full">
      <store.searchQuery.Render>
        {(searchQuery, setSearchQuery) => (
          <InputGroup>
            <InputGroupInput
              ref={searchInputRef}
              placeholder="Search apps or terms..."
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                if (e.target.value.length > 2) {
                  setUseSearchEngine(true)
                } else {
                  setUseSearchEngine(false)
                }
              }}
              className={cn(
                'pl-10',
                useSearchEngine ? 'pr-22' : searchQuery.length > 0 ? 'pr-12' : ''
              )}
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  e.stopPropagation()
                  // if no results, search it on configured search engine
                  if (searchQuery.length > 2 && store.itemState.length === 0) {
                    window.open(buildSearchUrl(searchQuery), '_blank')
                  }
                }
              }}
            />
            <store.searchEngine.Render>
              {searchEngine => (
                <InputGroupAddon align="inline-start">
                  <InputGroupButton size="icon-sm">
                    <SearchIcon
                      className="size-4 text-muted-foreground"
                      searchEngine={searchEngine}
                      enabled={useSearchEngine}
                    />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </store.searchEngine.Render>
            {searchQuery.length > 0 && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchQuery('')
                    setUseSearchEngine(false)
                  }}
                >
                  <X className="size-4" />
                </InputGroupButton>
              </InputGroupAddon>
            )}
            <InputGroupAddon align="inline-end">
              <InputGroupText>
                <Kbd>{useSearchEngine ? 'Enter' : 'A-Z'}</Kbd>
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        )}
      </store.searchQuery.Render>
    </div>
  )
}

function SearchIcon({
  searchEngine,
  className,
  enabled,
}: {
  searchEngine: 'google' | 'duckduckgo'
  className: string
  enabled: boolean
}) {
  if (!enabled) return <Search className={cn('size-4', className)} />

  const CurrentIcon = searchEngine === 'duckduckgo' ? DuckDuckGo : Google

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={cn('cursor-pointer', className)}
            aria-label="Select search engine"
          />
        }
      >
        <CurrentIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={6}>
        <DropdownMenuItem onClick={() => store.searchEngine.set('google')}>
          <Google className="size-4" /> Google
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => store.searchEngine.set('duckduckgo')}>
          <DuckDuckGo className="size-4" /> DuckDuckGo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function buildSearchUrl(searchQuery: string) {
  const searchEngine = store.searchEngine.value
  switch (searchEngine) {
    case 'duckduckgo':
      return `https://www.duckduckgo.com/search?q=${searchQuery}`
    default: // google
      return `https://www.google.com/search?q=${searchQuery}`
  }
}
