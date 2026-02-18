import {
  IconEdit,
  IconEye,
  IconEyeOff,
  IconFolder,
  IconHeart,
  IconInfoCircle,
  IconPlayerPlay,
  IconPlus,
  IconRotate,
  IconSquare,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import type { ObjectState } from 'juststore'
import { type KeyboardEvent, useState } from 'react'
import { toast } from 'sonner'
import type { HomepageItem } from '@/lib/api'
import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { cn } from '@/lib/utils'
import type { HealthStatusType } from '@/types/health'
import { setSelectedRoute } from '../routes/store'
import { encodeRouteKey } from '../routes/utils'
import { Button } from '../ui/button'
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '../ui/context-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Separator } from '../ui/separator'
import { CategoryIcon } from './CategoryIcon'
import { store } from './store'

export default function AppItemContextMenuContent({
  state,
  categoryIndex,
  itemIndex,
}: {
  state: ObjectState<HomepageItem>
  categoryIndex: number
  itemIndex: number
}) {
  const alias = state.alias.use()
  const routeKey = encodeRouteKey(alias)
  const [newCategoryDialogOpen, setNewCategoryDialogOpen] = useState(false)
  const [isMoving, setIsMoving] = useState(false)

  const toggleVisibility = () => {
    const newVisible = !state.show.value
    api.homepage
      .setItemVisible({
        value: newVisible,
        which: [alias],
      })
      .then(() => state.show.set(newVisible))
      .catch(toastError)
  }

  const toggleFavorite = () => {
    const newFavorite = !state.favorite.value
    api.homepage
      .setItemFavorite({
        value: newFavorite,
        which: [alias],
      })
      .then(() => {
        state.favorite.set(newFavorite)
        if (newFavorite) {
          store.pendingFavorites.set(true)
        }
      })
      .catch(toastError)
  }

  const moveToCategory = (category: string) => {
    setIsMoving(true)
    const promise =
      category !== 'Hidden'
        ? api.homepage.setItem({
            which: state.alias.value,
            value: {
              ...state.value,
              category: category,
            },
          })
        : api.homepage.setItemVisible({
            which: [state.alias.value],
            value: false,
          })

    promise
      .then(() => {
        state.category.set(category)
        toast.success(`Moved to "${category}"`)
      })
      .catch(toastError)
      .finally(() => setIsMoving(false))
  }

  return (
    <>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() =>
            store.editingApp.set({ categoryIndex: categoryIndex, itemIndex: itemIndex })
          }
        >
          <IconEdit className="size-4" />
          Edit
        </ContextMenuItem>
        <MoveToSubmenu
          state={state}
          isMoving={isMoving}
          moveToCategory={moveToCategory}
          onNewCategory={() => setNewCategoryDialogOpen(true)}
        />
        <state.show.Render>
          {visible => (
            <>
              {visible ? (
                <ContextMenuItem onClick={toggleVisibility}>
                  <IconEyeOff className="size-4" />
                  Hide
                </ContextMenuItem>
              ) : (
                <ContextMenuItem onClick={toggleVisibility}>
                  <IconEye className="size-4" />
                  Unhide
                </ContextMenuItem>
              )}
              {/* Only visible items can be favorites */}
              {visible && (
                <state.favorite.Render>
                  {favorite => (
                    <ContextMenuItem
                      onClick={toggleFavorite}
                      className={cn(favorite && 'text-primary')}
                    >
                      <IconHeart className="size-4" />
                      {favorite ? 'Remove favorite' : 'Favorite'}
                    </ContextMenuItem>
                  )}
                </state.favorite.Render>
              )}
            </>
          )}
        </state.show.Render>
        <Link
          to="/routes"
          hash={routeKey}
          preload={false}
          onClick={() => setSelectedRoute(routeKey)}
        >
          <ContextMenuItem>
            <IconInfoCircle className="size-4" />
            Details
          </ContextMenuItem>
        </Link>
        <DockerOnlyMenuItems state={state} />
      </ContextMenuContent>
      <NewCategoryDialog
        open={newCategoryDialogOpen}
        onOpenChange={setNewCategoryDialogOpen}
        onSave={name => {
          moveToCategory(name)
          setNewCategoryDialogOpen(false)
        }}
      />
    </>
  )
}

// Separate component to prevent cascade re-renders
function MoveToSubmenu({
  state,
  isMoving,
  moveToCategory,
  onNewCategory,
}: {
  state: ObjectState<HomepageItem>
  isMoving: boolean
  moveToCategory: (category: string) => void
  onNewCategory: () => void
}) {
  // Get current item's category
  const currentCategory = state.category.use()

  // Get unique category names from store
  const categoryNames = store.homepageCategories.useCompute(categories =>
    categories.map(cat => cat.name).filter(name => name && name !== currentCategory)
  )

  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger>
        <IconFolder className="size-4" />
        Move to
      </ContextMenuSubTrigger>
      <ContextMenuSubContent>
        {categoryNames.map(category => (
          <ContextMenuItem
            key={category}
            disabled={isMoving}
            onClick={() => moveToCategory(category)}
          >
            <CategoryIcon category={category} className="size-4" />
            {category}
          </ContextMenuItem>
        ))}
        <ContextMenuItem onClick={onNewCategory}>
          <IconPlus className="size-4 mr-2" />
          New Category
        </ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
  )
}

// New Category Dialog
function NewCategoryDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (name: string) => void
}) {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = () => {
    if (!name.trim()) return
    setIsLoading(true)
    onSave(name.trim())
    setName('')
    setIsLoading(false)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isTrusted) {
      handleSave()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay className="backdrop-blur-xs" />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Category</DialogTitle>
          <DialogDescription>
            Enter a name for the new category. The item will be moved to this category.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Category name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || isLoading}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const containerItems = [
  {
    label: 'Start',
    Icon: IconPlayerPlay,
    api: api.docker.start,
    className: 'text-success',
    enableIf: (status: HealthStatusType) => status !== 'healthy',
  },
  {
    label: 'Stop',
    Icon: IconSquare,
    api: api.docker.stop,
    className: 'text-error',
    enableIf: (status: HealthStatusType) => status !== 'napping',
  },
  {
    label: 'Restart',
    Icon: IconRotate,
    api: api.docker.restart,
    className: 'text-warning',
    enableIf: (status: HealthStatusType) => status !== 'napping',
  },
] as const

function DockerOnlyMenuItems({ state }: { state: ObjectState<HomepageItem> }) {
  const alias = state.alias.use()
  const containerID = state.container_id?.use()
  const health = store.health[alias]?.use()
  const [isLoading, setIsLoading] = useState(false)

  if (!containerID) {
    return null
  }

  return (
    <>
      <Separator className="my-2" />
      {containerItems.map(item => (
        <ContextMenuItem
          key={item.label}
          className={item.className}
          disabled={isLoading || !item.enableIf(health?.status ?? 'unknown')}
          onClick={() => {
            setIsLoading(true)
            item
              .api({ id: containerID })
              .then(res => toast.success(res.data.message))
              .catch(toastError)
              .finally(() => setIsLoading(false))
          }}
        >
          <item.Icon className={cn('w-4 h-4', item.className)} />
          {item.label}
        </ContextMenuItem>
      ))}
    </>
  )
}
