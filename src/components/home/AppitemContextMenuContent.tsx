import {
  SquarePen,
  Eye,
  EyeOff,
  Folder,
  Heart,
  Info,
  Play,
  Plus,
  RotateCw,
  Square,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { type ObjectState, Render } from 'juststore'
import { type KeyboardEvent, useState } from 'react'
import { toast } from 'sonner'
import { useWebSocketApi } from '@/hooks/websocket'
import type { HomepageItem } from '@/lib/api'
import { api } from '@/lib/api-client'
import {
  getContainerControlTarget,
  isProxmoxActionEnabled,
  runContainerAction,
} from '@/lib/container-control'
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
          <SquarePen className="size-4" />
          Edit
        </ContextMenuItem>
        <MoveToSubmenu
          state={state}
          isMoving={isMoving}
          moveToCategory={moveToCategory}
          onNewCategory={() => setNewCategoryDialogOpen(true)}
        />
        <Render state={state.show}>
          {visible => (
            <>
              {visible ? (
                <ContextMenuItem onClick={toggleVisibility}>
                  <EyeOff className="size-4" />
                  Hide
                </ContextMenuItem>
              ) : (
                <ContextMenuItem onClick={toggleVisibility}>
                  <Eye className="size-4" />
                  Unhide
                </ContextMenuItem>
              )}
              {/* Only visible items can be favorites */}
              {visible && (
                <Render state={state.favorite}>
                  {favorite => (
                    <ContextMenuItem
                      onClick={toggleFavorite}
                      className={cn(favorite && 'text-primary')}
                    >
                      <Heart className="size-4" />
                      {favorite ? 'Remove favorite' : 'Favorite'}
                    </ContextMenuItem>
                  )}
                </Render>
              )}
            </>
          )}
        </Render>
        <Link
          to="/routes"
          hash={routeKey}
          preload={false}
          onClick={() => setSelectedRoute(routeKey)}
        >
          <ContextMenuItem>
            <Info className="size-4" />
            Details
          </ContextMenuItem>
        </Link>
        <ContainerMenuItems state={state} />
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
        <Folder className="size-4" />
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
          <Plus className="size-4 mr-2" />
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
    action: 'start',
    label: 'Start',
    Icon: Play,
    className: 'text-success',
    enableIfDocker: (status: HealthStatusType) => status !== 'healthy',
  },
  {
    action: 'stop',
    label: 'Stop',
    Icon: Square,
    className: 'text-error',
    enableIfDocker: (status: HealthStatusType) => status !== 'napping',
  },
  {
    action: 'restart',
    label: 'Restart',
    Icon: RotateCw,
    className: 'text-warning',
    enableIfDocker: (status: HealthStatusType) => status !== 'napping',
  },
] as const

function ContainerMenuItems({ state }: { state: ObjectState<HomepageItem> }) {
  const [alias, containerID, proxmox] = state.useCompute(
    item => [item.alias, item.container_id, item.proxmox] as const
  )
  const health = store.health[alias]?.use()
  const [isLoading, setIsLoading] = useState(false)
  const [proxmoxStatus, setProxmoxStatus] = useState('')
  const control = getContainerControlTarget(containerID, proxmox)
  const isProxmox = control?.type === 'proxmox'

  useWebSocketApi<string>({
    endpoint: isProxmox ? `/proxmox/stats/${control.node}/${control.vmid}` : '',
    shouldConnect: isProxmox,
    json: false,
    onMessage: data => setProxmoxStatus(data.split('|')[0] ?? ''),
  })

  if (!control) {
    return null
  }

  const isActionEnabled = (item: (typeof containerItems)[number]) => {
    if (isLoading) return false
    if (control.type === 'docker') {
      return item.enableIfDocker(health?.status ?? 'unknown')
    }
    return isProxmoxActionEnabled(item.action, proxmoxStatus)
  }

  return (
    <>
      <Separator className="my-2" />
      {containerItems.map(item => (
        <ContextMenuItem
          key={item.label}
          className={item.className}
          disabled={!isActionEnabled(item)}
          onClick={() => {
            setIsLoading(true)
            runContainerAction(item.action, control)
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
