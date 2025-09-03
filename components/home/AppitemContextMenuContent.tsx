import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { Edit, Eye, EyeOff, Heart, Info } from 'lucide-react'
import Link from 'next/link'
import { ContextMenuContent, ContextMenuItem } from '../ui/context-menu'
import { DialogContent, DialogOverlay, DialogTrigger } from '../ui/dialog'
import AppEditDialogContent from './AppEditDialogContent'
import { store } from './store'

import { store as routesStore } from '@/components/routes/store'

export default function AppItemContextMenuContent({
  categoryIndex,
  appIndex,
}: {
  categoryIndex: number
  appIndex: number
}) {
  const baseKey = `homepageCategories.${categoryIndex}.items.${appIndex}` as const
  const alias = store.useValue(`${baseKey}.alias`)!
  const visible = store.useValue(`${baseKey}.show`)!
  const favorite = store.useValue(`${baseKey}.favorite`)!

  const toggleVisibility = () =>
    api.homepage
      .setItemVisible({
        value: !visible,
        which: [alias],
      })
      .then(() => store.set(`${baseKey}.show`, !visible))
      .catch(toastError)

  const toggleFavorite = () => {
    const newFavorite = !favorite
    api.homepage
      .setItemFavorite({
        value: newFavorite,
        which: [alias],
      })
      .then(() => {
        store.set(`${baseKey}.favorite`, newFavorite)
        if (newFavorite) {
          store.set('pendingFavorites', true)
        }
      })
      .catch(toastError)
  }

  return (
    <>
      <ContextMenuContent>
        <DialogTrigger asChild onClick={() => store.set('openedDialog', 'edit')}>
          <ContextMenuItem>
            <Edit className="w-4 h-4" />
            Edit
          </ContextMenuItem>
        </DialogTrigger>
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
          <ContextMenuItem onClick={toggleFavorite} className={cn(favorite && 'text-primary')}>
            <Heart className="w-4 h-4" />
            {favorite ? 'Remove favorite' : 'Favorite'}
          </ContextMenuItem>
        )}
        <Link href={`/routes#${alias}`} onClick={() => routesStore.set('requestedRoute', alias)}>
          <ContextMenuItem>
            <Info className="w-4 h-4" />
            Details
          </ContextMenuItem>
        </Link>
      </ContextMenuContent>
      <DialogOverlay className="backdrop-blur-xs" />
      <DialogContent className="min-w-[40vw] overflow-x-hidden">
        <AppItemDialogContent categoryIndex={categoryIndex} appIndex={appIndex} />
      </DialogContent>
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
  const openedDialog = store.useValue('openedDialog')

  if (openedDialog === 'edit') {
    return <AppEditDialogContent categoryIndex={categoryIndex} appIndex={appIndex} />
  }
  // if (openedDialog === 'details') {
  //   return <AppDetailsDialogContent alias={alias} />
  // }
  return null
}
