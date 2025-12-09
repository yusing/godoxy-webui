import type { HomepageIconMetaSearch } from '@/lib/api'
import { api } from '@/lib/api-client'
import { useMemoryStore, type FormState, type MemoryStore } from 'juststore'
import { useEffect, useMemo } from 'react'
import { useAsync } from 'react-use'
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
  state: FormState<string>
  className?: string
}

type IconSearchFieldState = {
  searchValue: string
  currentIcon: HomepageIconMetaSearch | null
  variant: 'dark' | 'light' | null
}

function getDisplayValue(state: IconSearchFieldState) {
  if (!state.currentIcon) return state.searchValue
  if (!state.variant) return iconURL(state.currentIcon)
  return iconURLVariant(state.currentIcon, state.variant)
}

export default function IconSearchField({ state: iconState, className }: IconSearchFieldProps) {
  const state = useMemoryStore<IconSearchFieldState>({
    searchValue: asSearchValue(iconState.value),
    currentIcon: null,
    variant: null,
  })

  return (
    <Command shouldFilter={false}>
      <state.Render>
        {(value, setValue) => {
          const inputValue = getDisplayValue(value)
          return (
            <CommandInput
              placeholder="Search icons... or paste an image URL"
              value={inputValue}
              onValueChange={v => {
                setValue({
                  searchValue: v,
                  currentIcon: null,
                  variant: null,
                })
              }}
            />
          )
        }}
      </state.Render>
      <CommandList className={className}>
        <IconItems state={state} iconState={iconState} />
      </CommandList>
    </Command>
  )
}

function IconItems({
  state,
  iconState,
}: {
  state: MemoryStore<IconSearchFieldState>
  iconState: FormState<string>
}) {
  const debouncedSearchValue = state.searchValue.useDebounce(300)
  useEffect(() => {
    // Propagate only the debounced value to parent so external consumers
    // don't trigger requests on every keystroke.
    if (debouncedSearchValue !== undefined) {
      iconState.set(debouncedSearchValue)
    }
  }, [debouncedSearchValue, iconState])

  const {
    value: icons,
    error,
    loading,
  } = useAsync(
    async () => api.icons.icons({ keyword: debouncedSearchValue, limit: 5 }).then(res => res.data),
    [debouncedSearchValue]
  )

  return (
    <>
      <CommandEmpty>
        {loading ? (
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
              state.set({
                searchValue: icon.Ref,
                currentIcon: icon,
                variant: null,
              })
              iconState.set(iconURL(icon))
            }}
            className="text-left"
          >
            {icon.Ref}
          </button>
          <IconVariantIconButton icon={icon} variant={null} state={state} iconState={iconState} />
          {icon.Light && (
            <IconVariantIconButton
              icon={icon}
              variant="light"
              state={state}
              iconState={iconState}
            />
          )}
          {icon.Dark && (
            <IconVariantIconButton icon={icon} variant="dark" state={state} iconState={iconState} />
          )}
        </CommandItem>
      ))}
    </>
  )
}

function IconVariantIconButton({
  icon,
  variant,
  state,
  iconState,
}: {
  icon: HomepageIconMetaSearch
  variant: IconSearchFieldState['variant']
  state: MemoryStore<IconSearchFieldState>
  iconState: FormState<string>
}) {
  const url = useMemo(() => {
    if (!variant) return iconURL(icon)
    return iconURLVariant(icon, variant)
  }, [icon, variant])

  return (
    <button
      type="button"
      onClick={() => {
        state.set(prev => ({
          searchValue: prev.searchValue,
          currentIcon: icon,
          variant: variant,
        }))
        iconState.set(url)
      }}
    >
      <AppIcon size={28} url={url} />
    </button>
  )
}
