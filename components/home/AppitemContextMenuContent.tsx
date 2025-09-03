import type { HomepageItem } from '@/lib/api'
import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { Edit, Eye, EyeOff, Heart, Info } from 'lucide-react'
import Link from 'next/link'
import { ContextMenuContent, ContextMenuItem } from '../ui/context-menu'
import { DialogContent, DialogOverlay, DialogTrigger } from '../ui/dialog'
import AppDetailsDialogContent from './AppDetailsDialogContent'
import AppEditDialogContent from './AppEditDialogContent'
import { store } from './store'

export default function AppItemContextMenuContent({ app }: { app: HomepageItem }) {
  const visible = store.useValue(`visibility.${app.alias}`) ?? app.show
  const toggleVisibility = () =>
    api.homepage
      .setItemVisible({
        value: !visible,
        which: [app.alias],
      })
      .then(() => store.set(`visibility.${app.alias}`, !visible))
      .catch(toastError)

  const favorite = store.useValue(`favorite.${app.alias}`) ?? app.favorite

  const toggleFavorite = () => {
    const newFavorite = !favorite
    api.homepage
      .setItemFavorite({
        value: newFavorite,
        which: [app.alias],
      })
      .then(() => {
        store.set(`favorite.${app.alias}`, newFavorite)
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
        <Link href={`/routes?route=${app.alias}`}>
          <ContextMenuItem>
            <Info className="w-4 h-4" />
            Details
          </ContextMenuItem>
        </Link>
      </ContextMenuContent>
      <DialogOverlay className="backdrop-blur-xs" />
      <DialogContent className="min-w-[40vw] overflow-x-hidden">
        <AppItemDialogContent app={app} />
      </DialogContent>
    </>
  )
}

function AppItemDialogContent({ app }: { app: HomepageItem }) {
  const openedDialog = store.useValue('openedDialog')

  if (openedDialog === 'edit') {
    return <AppEditDialogContent app={app} />
  }
  if (openedDialog === 'details') {
    return <AppDetailsDialogContent alias={app.alias} />
  }
  return null
}
