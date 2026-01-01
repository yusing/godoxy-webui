import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { cn } from '@/lib/utils'
import {
  IconEdit,
  IconEye,
  IconEyeOff,
  IconHeart,
  IconInfoCircle,
  IconPlayerPlay,
  IconRotate,
  IconSquare,
} from '@tabler/icons-react'
import { ContextMenuContent, ContextMenuItem } from '../ui/context-menu'
import { store } from './store'

import type { HealthInfo, HomepageItem } from '@/lib/api'
import type { ObjectState } from 'juststore'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { setSelectedRoute } from '../routes/store'
import { encodeRouteKey } from '../routes/utils'
import { Separator } from '../ui/separator'

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
        <Link href={`/routes#${routeKey}`} onClick={() => setSelectedRoute(routeKey)}>
          <ContextMenuItem>
            <IconInfoCircle className="size-4" />
            Details
          </ContextMenuItem>
        </Link>
        <DockerOnlyMenuItems state={state} />
      </ContextMenuContent>
    </>
  )
}

const containerItems = [
  {
    label: 'Start',
    Icon: IconPlayerPlay,
    api: api.docker.start,
    className: 'text-success',
    enableIf: (status: HealthInfo['status']) => status !== 'healthy',
  },
  {
    label: 'Stop',
    Icon: IconSquare,
    api: api.docker.stop,
    className: 'text-error',
    enableIf: (status: HealthInfo['status']) => status !== 'napping',
  },
  {
    label: 'Restart',
    Icon: IconRotate,
    api: api.docker.restart,
    className: 'text-warning',
    enableIf: (status: HealthInfo['status']) => status !== 'napping',
  },
] as const

function DockerOnlyMenuItems({ state }: { state: ObjectState<HomepageItem> }) {
  const alias = state.alias.use()
  const containerID = state.container_id?.use()
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
          <item.Icon className={cn('w-4 h-4', item.className)} />
          {item.label}
        </ContextMenuItem>
      ))}
    </>
  )
}
