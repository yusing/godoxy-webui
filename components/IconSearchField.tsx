import type { HomepageIconMetaSearch } from '@/lib/api'
import { api } from '@/lib/api-client'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@uidotdev/usehooks'
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { AppIcon } from './AppIcon'
import LoadingRing from './LoadingRing'
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from './ui/command'

// Utilities to construct icon URLs similar to the old Chakra version
function iconURL(metadata: HomepageIconMetaSearch) {
  if (metadata.SVG) return `${metadata.Source}/${metadata.Ref}.svg`
  if (metadata.WebP) return `${metadata.Source}/${metadata.Ref}.webp`
  return `${metadata.Source}/${metadata.Ref}.png`
}

function iconURLVariant(metadata: HomepageIconMetaSearch, variant: 'light' | 'dark') {
  return `${metadata.Source}/${metadata.Ref}-${variant}.${metadata.SVG ? 'svg' : metadata.WebP ? 'webp' : 'png'}`
}

function asSearchValue(fullValue: string) {
  return fullValue.replace(/\.(svg|webp|png)$/, '').replace(/-light|-dark$/, '')
}

type IconSearchFieldProps = {
  className?: string
  value: string
  onChange: (value: string) => void
}

type IconSearchFieldState = {
  searchValue: string
  currentIcon: HomepageIconMetaSearch | null
  variant: 'dark' | 'light' | null
}

export default function IconSearchField({ value, onChange, className }: IconSearchFieldProps) {
  const [state, setState] = useState<IconSearchFieldState>({
    searchValue: asSearchValue(value),
    currentIcon: null,
    variant: null,
  })
  const { searchValue, currentIcon, variant } = state

  const debouncedSearchValue = useDebounce(searchValue, 300)
  useEffect(() => {
    // Propagate only the debounced value to parent so external consumers
    // don't trigger requests on every keystroke.
    if (debouncedSearchValue !== undefined) {
      onChange(debouncedSearchValue)
    }
  }, [debouncedSearchValue, onChange])

  const {
    data: icons,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['icon-search', debouncedSearchValue],
    queryFn: () =>
      api.icons.icons({ keyword: debouncedSearchValue, limit: 5 }).then(res => res.data),
    enabled: debouncedSearchValue.length > 2,
    staleTime: 5000,
  })

  const inputValue = useMemo(() => {
    if (!currentIcon) return searchValue
    if (!variant) return iconURL(currentIcon)
    return iconURLVariant(currentIcon, variant)
  }, [currentIcon, variant, searchValue])

  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search icons... or paste an image URL"
        value={inputValue}
        readOnly={isLoading}
        onValueChange={v => {
          setState({
            searchValue: v,
            currentIcon: null,
            variant: null,
          })
        }}
      />
      <CommandList className={className}>
        <CommandEmpty>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingRing />
            </div>
          ) : error ? (
            'Error loading icons'
          ) : (
            'No icons found'
          )}
        </CommandEmpty>
        {icons?.map(icon => (
          <CommandItem
            key={`${icon.Source}:${icon.Ref}`}
            value={`${icon.Source} ${icon.Ref}`}
            className="flex items-center"
          >
            <span className="text-xs text-muted-foreground shrink-0">{icon.Source}</span>
            <button
              onClick={() => {
                setState({
                  searchValue: icon.Ref,
                  currentIcon: icon,
                  variant: null,
                })
                onChange(iconURL(icon))
              }}
              className="text-left"
            >
              {icon.Ref}
            </button>
            <IconVariantIconButton
              icon={icon}
              variant={null}
              setState={setState}
              onChange={onChange}
            />
            {icon.Light && (
              <IconVariantIconButton
                icon={icon}
                variant="light"
                setState={setState}
                onChange={onChange}
              />
            )}
            {icon.Dark && (
              <IconVariantIconButton
                icon={icon}
                variant="dark"
                setState={setState}
                onChange={onChange}
              />
            )}
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  )
}

function IconVariantIconButton({
  icon,
  variant,
  setState,
  onChange,
}: {
  icon: HomepageIconMetaSearch
  variant: IconSearchFieldState['variant']
  setState: Dispatch<SetStateAction<IconSearchFieldState>>
  onChange: (value: string) => void
}) {
  const url = useMemo(() => {
    if (!variant) return iconURL(icon)
    return iconURLVariant(icon, variant)
  }, [icon, variant])

  return (
    <button
      type="button"
      onClick={() => {
        setState(prev => ({
          searchValue: prev.searchValue,
          currentIcon: icon,
          variant: variant,
        }))
        onChange(url)
      }}
    >
      <AppIcon size={28} url={url} />
    </button>
  )
}
