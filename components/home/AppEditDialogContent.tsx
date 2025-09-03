import { type HomepageItem } from '@/lib/api'
import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { store } from './store'

export default function AppEditDialogContent({
  categoryIndex,
  appIndex,
}: {
  categoryIndex: number
  appIndex: number
}) {
  const app = store.useValue(`homepageCategories.${categoryIndex}.items.${appIndex}`)!
  const icon = useMemo(() => {
    if (app.icon) return app.icon
    return (app.name || app.alias)
      .split('.')[0]!
      .toLowerCase()
      .replaceAll(' ', '-')
      .replaceAll('_', '-')
  }, [app.icon, app.name, app.alias])

  const form = useForm<HomepageItem>({
    defaultValues: {
      ...app,
      name: app.name || app.alias,
      icon,
    },
  })

  const onSubmit = async (value: HomepageItem) => {
    const newItem: HomepageItem = { ...value }
    if (!newItem.icon) newItem.icon = app.icon

    await api.homepage
      .setItem({ which: newItem.alias, value: newItem })
      .then(async () => await api.homepage.setItemVisible({ which: [newItem.alias], value: true }))
      .then(() => store.set(`homepageCategories.${categoryIndex}.items.${appIndex}`, newItem))
      .catch(toastError)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit App</DialogTitle>
        <DialogDescription>Make change to the app here. Click save to apply.</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 py-2">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-full items-center shrink-0 border-2 p-2 rounded-xl">
              <AppIcon size={36} item={app} url={form.watch('icon')} />
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={'name'}
                rules={{ required: 'Name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App name</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={'category'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <FormField
            control={form.control}
            name={'description'}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={'icon'}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <FormControl>
                  <IconSearchField value={field.value ?? ''} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="submit">Save</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </Form>
    </>
  )
}
