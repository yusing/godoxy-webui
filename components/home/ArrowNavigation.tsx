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
  const currentActiveIndex = store.navigation.activeItemIndex.value ?? 0
  const prevRowIndex = Math.max(currentActiveIndex - getGridCols(), 0)
  setActiveItem(prevRowIndex)
}

function handleDown(visibleItemsLength: number) {
  const currentActiveIndex = store.navigation.activeItemIndex.value ?? 0
  const nextRowIndex = Math.min(currentActiveIndex + getGridCols(), visibleItemsLength - 1)
  setActiveItem(nextRowIndex)
}

function handleLeft() {
  const currentActiveIndex = store.navigation.activeItemIndex.value ?? 0
  const prevRowIndex = Math.max(currentActiveIndex - 1, 0)
  setActiveItem(prevRowIndex)
}

function handleRight(visibleItemsLength: number) {
  const currentActiveIndex = store.navigation.activeItemIndex.value ?? 0
  const nextRowIndex = Math.min(currentActiveIndex + 1, visibleItemsLength - 1)
  setActiveItem(nextRowIndex)
}

function handleOpenApp() {
  const url = document.querySelector('.app-item[data-active="true"]')?.getAttribute('data-url')
  if (url) {
    window.open(url, '_blank')
  }
}

function handlePrevCategory() {
  const categories = store.homepageCategories.value ?? []
  if (!categories.length) return
  const currentCategory = store.navigation.activeCategory.value!
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
  const currentCategory = store.navigation.activeCategory.value!
  const currentCategoryIndex = Math.max(
    0,
    categories.findIndex(c => c.name === currentCategory)
  )
  const nextCategoryIndex = (currentCategoryIndex + 1) % categories.length
  store.navigation.activeCategory.set(categories[nextCategoryIndex]!.name)
  store.navigation.activeItemIndex.reset()
}

function getVisibleItems() {
  const itemState = store.value('itemState') ?? {}
  if (!Object.values(itemState).length) return []
  return Object.values(itemState).filter(item => item.show)
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
  // Add/remove keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  store.navigation.activeItemIndex.subscribe(index => {
    const numVisibleItems = getVisibleItems().length
    if (!index || index < 0) {
      index = 0
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
    }
  })

  // Reset navigation when category changes
  store.navigation.activeCategory.subscribe(() => {
    // set first item as active
    setActiveItem(0)
  })

  // Reset navigation when search query changes
  store.searchQuery.subscribe(() => {
    // set first item as active
    setActiveItem(0)
  })

  return null
}
