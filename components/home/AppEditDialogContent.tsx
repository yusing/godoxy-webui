import { StoreFormInputField } from '@/components/store/Input'
import { type HomepageItem } from '@/lib/api'
import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { useForm, type ObjectState } from 'juststore'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { AppIcon } from '../AppIcon'
import IconSearchField from '../IconSearchField'
import { Button } from '../ui/button'
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Field, FieldLabel } from '../ui/field'
import { store } from './store'

export default function AppEditDialogContent({ state }: { state: ObjectState<HomepageItem> }) {
  const app = state.use()
  const icon = state.icon.useCompute(icon => {
    if (icon) return icon
    return (app.name || app.alias)
      .split('.')[0]!
      .toLowerCase()
      .replaceAll(' ', '-')
      .replaceAll('_', '-')
  })

  const form = useForm<HomepageItem>({
    ...app,
    name: app.name || app.alias,
    icon,
  })

  const onSubmit = useCallback(
    async (value: HomepageItem) => {
      const newItem: HomepageItem = { ...value }
      if (!newItem.icon) newItem.icon = app.icon

      await api.homepage
        .setItem({ which: newItem.alias, value: newItem })
        .then(
          async () => await api.homepage.setItemVisible({ which: [newItem.alias], value: true })
        )
        .then(() => {
          state.set(newItem)
          store.openedDialog.set(null)
          toast.success('App saved successfully')
        })
        .catch(toastError)
    },
    [app.icon, state]
  )

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit App</DialogTitle>
        <DialogDescription>Make change to the app here. Click save to apply.</DialogDescription>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 py-2">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex h-full items-center shrink-0 border-2 p-2 rounded-xl">
            <form.icon.Render>
              {icon => <AppIcon size={36} alias={app.alias} url={icon} />}
            </form.icon.Render>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StoreFormInputField state={form.name} title="App name" />
            <StoreFormInputField state={form.category} title="Category" />
          </div>
        </div>
        <StoreFormInputField state={form.description} title="Description" />
        <Field>
          <FieldLabel>Icon</FieldLabel>
          <IconSearchField state={form.icon} />
        </Field>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </form>
    </>
  )
}
