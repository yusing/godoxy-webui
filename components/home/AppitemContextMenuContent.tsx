import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { Edit, Eye, EyeOff, Heart, Info, Play, RotateCcw, Square } from 'lucide-react'
import Link from 'next/link'
import { ContextMenuContent, ContextMenuItem } from '../ui/context-menu'
import { DialogContent, DialogOverlay, DialogTrigger } from '../ui/dialog'
import AppEditDialogContent from './AppEditDialogContent'
import { store } from './store'

import { store as routesStore } from '@/components/routes/store'
import type { HealthInfo } from '@/lib/api'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Separator } from '../ui/separator'

export default function AppItemContextMenuContent({
  categoryIndex,
  appIndex,
}: {
  categoryIndex: number
  appIndex: number
}) {
  const item = useMemo(
    () => store.homepageCategories.at(categoryIndex).items.at(appIndex),
    [categoryIndex, appIndex]
  )
  const alias = item.alias.use()

  const toggleVisibility = () => {
    const newVisible = !item.show.value
    api.homepage
      .setItemVisible({
        value: newVisible,
        which: [alias],
      })
      .then(() => item.show.set(newVisible))
      .catch(toastError)
  }

  const toggleFavorite = () => {
    const newFavorite = !item.favorite.value
    api.homepage
      .setItemFavorite({
        value: newFavorite,
        which: [alias],
      })
      .then(() => {
        item.favorite.set(newFavorite)
        if (newFavorite) {
          store.pendingFavorites.set(true)
        }
      })
      .catch(toastError)
  }

  return (
    <>
      <ContextMenuContent>
        <DialogTrigger asChild onClick={() => store.openedDialog.set('edit')}>
          <ContextMenuItem>
            <Edit className="w-4 h-4" />
            Edit
          </ContextMenuItem>
        </DialogTrigger>
        <item.show.Render>
          {visible => (
            <>
              {visible ? (
                <ContextMenuItem onClick={toggleVisibility}>
                  <EyeOff className="w-4 h-4" />
                  Hide
                </ContextMenuItem>
              ) : (
                <ContextMenuItem onClick={toggleVisibility}>
                  <Eye className="w-4 h-4" />
                  Unhide
                </ContextMenuItem>
              )}
              {/* Only visible items can be favorites */}
              {visible && (
                <item.favorite.Render>
                  {favorite => (
                    <ContextMenuItem
                      onClick={toggleFavorite}
                      className={cn(favorite && 'text-primary')}
                    >
                      <Heart className="w-4 h-4" />
                      {favorite ? 'Remove favorite' : 'Favorite'}
                    </ContextMenuItem>
                  )}
                </item.favorite.Render>
              )}
            </>
          )}
        </item.show.Render>
        <Link href={`/routes#${alias}`} onClick={() => routesStore.requestedRoute.set(alias)}>
          <ContextMenuItem>
            <Info className="w-4 h-4" />
            Details
          </ContextMenuItem>
        </Link>
        <DockerOnlyMenuItems categoryIndex={categoryIndex} appIndex={appIndex} />
      </ContextMenuContent>
      <DialogOverlay className="backdrop-blur-xs" />
      <DialogContent className="min-w-[40vw] overflow-x-hidden">
        <AppItemDialogContent categoryIndex={categoryIndex} appIndex={appIndex} />
      </DialogContent>
    </>
  )
}

const containerItems = [
  {
    label: 'Start',
    icon: Play,
    api: api.docker.start,
    className: 'text-success',
    enableIf: (status: HealthInfo['status']) => status !== 'healthy',
  },
  {
    label: 'Stop',
    icon: Square,
    api: api.docker.stop,
    className: 'text-error',
    enableIf: (status: HealthInfo['status']) => status !== 'napping',
  },
  {
    label: 'Restart',
    icon: RotateCcw,
    api: api.docker.restart,
    className: 'text-warning',
    enableIf: (status: HealthInfo['status']) => status !== 'napping',
  },
] as const

function DockerOnlyMenuItems({
  categoryIndex,
  appIndex,
}: {
  categoryIndex: number
  appIndex: number
}) {
  const item = store.homepageCategories.at(categoryIndex).items.at(appIndex)
  const alias = item.alias.use()
  const containerID = item.container_id.use()!
  const status = store.health[alias]?.status.use() ?? 'unknown'
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
          disabled={isLoading || !item.enableIf(status)}
          onClick={() => {
            setIsLoading(true)
            item
              .api({ id: containerID })
              .then(res => toast.success(res.data.message))
              .catch(toastError)
              .finally(() => setIsLoading(false))
          }}
        >
          <item.icon className={cn('w-4 h-4', item.className)} />
          {item.label}
        </ContextMenuItem>
      ))}
    </>
  )
}

function AppItemDialogContent({
  categoryIndex,
  appIndex,
}: {
  categoryIndex: number
  appIndex: number
}) {
  const openedDialog = store.use('openedDialog')

  if (openedDialog === 'edit') {
    return <AppEditDialogContent categoryIndex={categoryIndex} appIndex={appIndex} />
  }
  // if (openedDialog === 'details') {
  //   return <AppDetailsDialogContent alias={alias} />
  // }
  return null
}
