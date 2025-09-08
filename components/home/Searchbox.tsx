import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'
import { useState } from 'react'
import DuckDuckGo from '../svg/duckduckgo'
import Google from '../svg/google'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Input } from '../ui/input'
import Kbd from '../ui/kbd'
import { store } from './store'

export default function Searchbox() {
  const [useSearchEngine, setUseSearchEngine] = useState(false)

  return (
    <div className="relative flex-1 min-w-0 w-full">
      <store.searchEngine.Render>
        {searchEngine => (
          <SearchIcon
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            searchEngine={searchEngine}
            enabled={useSearchEngine}
          />
        )}
      </store.searchEngine.Render>
      <store.searchQuery.Render>
        {(searchQuery, setSearchQuery) => (
          <>
            <Input
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
                  if (
                    searchQuery.length > 2 &&
                    Object.values(store.itemState.value ?? {}).every(item => item.show === false)
                  ) {
                    window.open(buildSearchUrl(searchQuery), '_blank')
                  }
                }
              }}
            />
            <div
              className={cn(
                'absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground flex items-center gap-2'
              )}
            >
              {searchQuery.length > 0 && (
                <button
                  type="button"
                  className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchQuery('')
                    setUseSearchEngine(false)
                  }}
                >
                  <X className="size-4" />
                </button>
              )}
              {useSearchEngine && <Kbd>Enter</Kbd>}
            </div>
          </>
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
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn('cursor-pointer', className)}
          aria-label="Select search engine"
        >
          <CurrentIcon className="size-4" />
        </button>
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
