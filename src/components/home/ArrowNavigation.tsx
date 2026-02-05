import { api } from '@/lib/api-client'
import { useEffect } from 'react'
import { store } from './store'

function getGridCols() {
  const appCategory = document.getElementById('app-category')
  if (!appCategory) return 0
  const firstAppItem = document.querySelector('.app-item')
  if (!firstAppItem) return 0
  return Math.floor(appCategory.clientWidth / firstAppItem.clientWidth)
}

function setActiveItem(index: number) {
  store.navigation.activeItemIndex.set(index)
}

function handleUp() {
  const currentActiveIndex = store.navigation.activeItemIndex.value
  const prevRowIndex = Math.max(currentActiveIndex - getGridCols(), 0)
  setActiveItem(prevRowIndex)
}

function handleDown(visibleItemsLength: number) {
  const currentActiveIndex = store.navigation.activeItemIndex.value
  const nextRowIndex = Math.min(currentActiveIndex + getGridCols(), visibleItemsLength - 1)
  setActiveItem(nextRowIndex)
}

function handleLeft() {
  const currentActiveIndex = store.navigation.activeItemIndex.value
  const prevRowIndex = Math.max(currentActiveIndex - 1, 0)
  setActiveItem(prevRowIndex)
}

function handleRight(visibleItemsLength: number) {
  const currentActiveIndex = store.navigation.activeItemIndex.value
  const nextRowIndex = Math.min(currentActiveIndex + 1, visibleItemsLength - 1)
  setActiveItem(nextRowIndex)
}

function scrollItemIntoViewIfNeeded(element: Element | null) {
  if (!(element instanceof HTMLElement)) return
  const rect = element.getBoundingClientRect()
  const viewWidth = window.innerWidth || document.documentElement.clientWidth
  const viewHeight = window.innerHeight || document.documentElement.clientHeight
  const outOfView =
    rect.top < 0 || rect.left < 0 || rect.bottom > viewHeight || rect.right > viewWidth
  if (outOfView) {
    element.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
  }
}

async function handleOpenApp() {
  const activeItem = document.querySelector('.app-item[data-active="true"]')
  if (!activeItem) return

  const url = activeItem.getAttribute('data-url')
  const alias = activeItem.getAttribute('data-alias')

  if (alias) {
    try {
      await api.homepage.itemClick({ which: alias })
    } catch (error) {
      console.warn('Failed to track item click:', error)
    }
  }

  if (url) {
    window.open(url, '_blank')
  }
}

function handlePrevCategory() {
  const categories = store.homepageCategories.value ?? []
  if (!categories.length) return
  const currentCategory = store.navigation.activeCategory.value
  const currentCategoryIndex = Math.max(
    0,
    categories.findIndex(c => c.name === currentCategory)
  )
  const prevCategoryIndex = (currentCategoryIndex - 1 + categories.length) % categories.length
  store.navigation.activeCategory.set(categories[prevCategoryIndex]!.name)
  store.navigation.activeItemIndex.reset()
}

function handleNextCategory() {
  const categories = store.homepageCategories.value ?? []
  if (!categories.length) return
  const currentCategory = store.navigation.activeCategory.value
  const currentCategoryIndex = Math.max(
    0,
    categories.findIndex(c => c.name === currentCategory)
  )
  const nextCategoryIndex = (currentCategoryIndex + 1) % categories.length
  store.navigation.activeCategory.set(categories[nextCategoryIndex]!.name)
  store.navigation.activeItemIndex.reset()
}

function getVisibleItems() {
  return store.itemState.value
}

// Handle keyboard navigation
function handleKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case 'Tab': {
      // Disable focus navigation via Tab/Shift+Tab on the homepage
      e.preventDefault()
      break
    }
    case 'ArrowRight': {
      // Alt+Right switches category
      if (e.altKey) {
        e.preventDefault()
        handleNextCategory()
      } else {
        e.preventDefault()
        handleRight(getVisibleItems().length)
      }
      break
    }
    case 'ArrowLeft': {
      // Alt+Left switches category
      if (e.altKey) {
        e.preventDefault()
        handlePrevCategory()
      } else {
        e.preventDefault()
        handleLeft()
      }
      break
    }
    case 'ArrowDown': {
      e.preventDefault()
      handleDown(getVisibleItems().length)
      break
    }
    case 'ArrowUp': {
      e.preventDefault()
      handleUp()
      break
    }
    case 'Enter': {
      e.preventDefault()
      handleOpenApp()
      break
    }
    case 'Escape': {
      e.preventDefault()
      store.navigation.activeItemIndex.reset()
      break
    }
  }
}

export default function ArrowNavigation() {
  // reset active item index when component mounts
  useEffect(() => {
    store.navigation.activeItemIndex.set(-1)
  }, [])

  // Add/remove keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const unsubscribe = store.navigation.activeItemIndex.subscribe(index => {
      const numVisibleItems = getVisibleItems().length
      if (index < -1) {
        index = -1
      } else if (index >= numVisibleItems) {
        index = numVisibleItems - 1
      }

      // remove data-active from current active item
      const currentActiveItem = document.querySelector(`.app-item[data-active="true"]`)
      if (currentActiveItem) {
        currentActiveItem.removeAttribute('data-active')
      }
      // add data-active to new active item
      const newActiveItem = document.querySelector(`.app-item[data-index="${index}"]`)
      if (newActiveItem) {
        newActiveItem.setAttribute('data-active', 'true')
        scrollItemIntoViewIfNeeded(newActiveItem)
      }
    })
    return unsubscribe
  })

  // Reset navigation when category changes
  useEffect(() => {
    const unsubscribe = store.navigation.activeCategory.subscribe(() => {
      // reset active item
      setActiveItem(-1)
    })
    return unsubscribe
  })

  // Reset navigation when search query changes
  useEffect(() => {
    const unsubscribe = store.searchQuery.subscribe(v => {
      // set first visible item as active item (only while searching)
      if (v) {
        setActiveItem(0)
      } else {
        setActiveItem(-1)
      }
    })
    return unsubscribe
  })

  return null
}
