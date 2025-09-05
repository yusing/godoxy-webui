import { Button, type buttonVariants } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { Routes } from '@/types/godoxy'
import type { VariantProps } from 'class-variance-authority'
import { ChevronDown, Save, X, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import * as utils from './utils'

export default function RouteEditForm({
  route,
  alias,
  onCancel,
  onSave,
  headerText = 'Edit Route',
  saveButtonIcon = Save,
  saveButtonText = 'Done',
  cancelButtonIcon = X,
  cancelButtonText = 'Cancel',
  cancelButtonVariant = 'ghost',
  cancelButtonClassName,
}: {
  route: Routes.Route
  alias: string
  onCancel: (form: UseFormReturn<Routes.Route>) => void
  onSave: (route: Routes.Route) => void
  headerText?: string
  saveButtonIcon?: LucideIcon
  saveButtonText?: string
  cancelButtonIcon?: LucideIcon
  cancelButtonText?: string
  cancelButtonVariant?: VariantProps<typeof buttonVariants>['variant']
  cancelButtonClassName?: string
}) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const form = useForm<Routes.Route>({
    defaultValues: {
      ...route,
      alias: alias,
      // @ts-expect-error intended
      scheme: 'scheme' in route ? route.scheme : 'http',
      host: 'host' in route ? route.host : 'localhost',
      port: 'port' in route ? route.port : 3000,
    },
  })

  const scheme = form.watch('scheme')
  const isStream = scheme === 'tcp' || scheme === 'udp'
  const Icon = utils.getRouteIcon(scheme)
  const SaveButtonIcon = saveButtonIcon
  const CancelButtonIcon = cancelButtonIcon

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(values => {
          onSave(values)
          form.reset()
        })}
        className="space-y-4"
      >
        {/* Header with save/cancel buttons */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{headerText}</h3>
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="bg-foreground">
              <SaveButtonIcon className="h-4 w-4 mr-1" />
              {saveButtonText}
            </Button>
            <Button
              type="button"
              variant={cancelButtonVariant}
              size="sm"
              onClick={() => onCancel(form)}
              className={cancelButtonClassName}
            >
              <CancelButtonIcon className="h-4 w-4 mr-1" />
              {cancelButtonText}
            </Button>
          </div>
        </div>

        {/* Route Type */}
        <FormField
          control={form.control}
          name="scheme"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Route Type</FormLabel>
              <Select value={field.value ?? 'http'} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {utils.routeSchemes.map(({ value, label, description }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div className="flex flex-col items-start">
                          <div className="font-medium">{label}</div>
                          <div className="text-xs text-muted-foreground">{description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Alias */}
        <div className="space-y-2">
          <Label htmlFor="alias">
            Alias <span className="text-destructive">*</span>
          </Label>
          <Input
            id="alias"
            placeholder="app or app.example.com"
            {...form.register('alias', { required: 'Alias is required' })}
          />
          {form.formState.errors.alias && (
            <p className="text-destructive text-sm">{form.formState.errors.alias.message}</p>
          )}
        </div>

        {/* Host and Port */}
        {scheme !== 'fileserver' && (
          <div className={cn('grid grid-cols-2 gap-4', isStream && 'grid-cols-3')}>
            <div className="space-y-2">
              <Label htmlFor="host">Host</Label>
              <Input id="host" placeholder="localhost" {...form.register('host')} />
            </div>

            {isStream && (
              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="listen_port">Listen Port</Label>
                    <Input
                      id="listen_port"
                      placeholder="tcp"
                      value={utils.getListeningPort(String(field.value))}
                      onChange={e => {
                        field.onChange(
                          `${e.target.value}:${utils.getProxyPort(String(field.value))}`
                        )
                      }}
                    />
                  </FormItem>
                )}
              ></FormField>
            )}
            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="proxy_port">Proxy Port</Label>
                  <Input
                    id="proxy_port"
                    placeholder="3000"
                    value={utils.getProxyPort(String(field.value))}
                    onChange={e => {
                      field.onChange(
                        `${utils.getListeningPort(String(field.value))}:${e.target.value}`
                      )
                    }}
                  />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Root */}
        {scheme === 'fileserver' && (
          <div className="space-y-2">
            <Label htmlFor="root">Root</Label>
            <Input id="root" placeholder="/path/to/files" {...form.register('root')} />
          </div>
        )}

        {/* Advanced Options */}
        <div className="space-y-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full justify-between p-2 h-auto"
          >
            <span className="text-muted-foreground">Advanced Options</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            />
          </Button>

          {showAdvanced && (
            <div className="border rounded-md p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Additional configuration options will be available here.
              </p>
            </div>
          )}
        </div>
      </form>
    </Form>
  )
}
