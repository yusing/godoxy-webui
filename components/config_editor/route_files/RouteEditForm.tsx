import { NamedListInput } from '@/components/form/NamedListInput'
import { Button, type buttonVariants } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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
import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { MiddlewareComposeSchema, type Routes } from '@/types/godoxy'
import type { EntrypointMiddlewares } from '@/types/godoxy/middlewares/middleware_compose'
import type { MiddlewaresMap } from '@/types/godoxy/middlewares/middlewares'
import { LOAD_BALANCE_MODES } from '@/types/godoxy/providers/loadbalance'
import type { SelectProps } from '@radix-ui/react-select'
import { useQuery } from '@tanstack/react-query'
import type { VariantProps } from 'class-variance-authority'
import { ChevronDown, Save, X, type LucideIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo } from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { middlewareUseToSnakeCase } from '../middleware_compose/MiddlewareEditor'
import * as utils from './utils'

type RouteEditFormProps = {
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
}

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
}: RouteEditFormProps) {
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
        <div className="flex items-center justify-between gap-4 px-0.5">
          <h3 className="text-lg font-semibold">{headerText}</h3>
          <div className="flex gap-2">
            <Button type="submit" size="sm">
              <SaveButtonIcon className="size-4" />
              {saveButtonText}
            </Button>
            <Button
              type="button"
              variant={cancelButtonVariant}
              size="sm"
              onClick={() => onCancel(form)}
              className={cancelButtonClassName}
            >
              <CancelButtonIcon className="size-4" />
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
          <FormLabel>
            Alias <span className="text-destructive">*</span>
          </FormLabel>
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
              <FormLabel>Host</FormLabel>
              <Input id="host" placeholder="localhost" {...form.register('host')} />
            </div>

            {isStream && (
              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listen Port</FormLabel>
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
                  <FormLabel>Proxy Port</FormLabel>
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
            <FormLabel>Root</FormLabel>
            <Input id="root" placeholder="/path/to/files" {...form.register('root')} />
          </div>
        )}

        {/* Advanced Options */}
        <AdvancedOptions form={form} />
      </form>
    </Form>
  )
}

function AdvancedOptions({ form }: { form: UseFormReturn<Routes.Route> }) {
  const scheme = form.watch('scheme')
  const isHTTP = scheme === 'http' || scheme === 'https'
  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-between p-2 h-auto text-muted-foreground"
        >
          <span>Advanced Options</span>
          <ChevronDown className="size-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-4">
        <FormField
          control={form.control}
          name="agent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent</FormLabel>
              <AgentSelect {...field} />
            </FormItem>
          )}
        />

        {/* No TLS Verify - for HTTPS proxy */}
        {scheme === 'https' && (
          <FormField
            control={form.control}
            name="no_tls_verify"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-medium">No TLS Verify</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Skip TLS certificate verification
                    </p>
                  </div>
                  <Checkbox
                    id="no_tls_verify"
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                    className="ml-4"
                  />
                </div>
              </FormItem>
            )}
          />
        )}

        {/* Response Header Timeout - for HTTP/HTTPS proxy */}
        {isHTTP && (
          <FormField
            control={form.control}
            name="response_header_timeout"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Response Header Timeout</FormLabel>
                <Input
                  id="response_header_timeout"
                  placeholder="60s"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
                <p className="text-xs text-muted-foreground">Duration format: 30s, 5m, 1h, etc.</p>
              </FormItem>
            )}
          />
        )}

        {/* Healthcheck - for all route types */}
        <FormField
          control={form.control}
          name="healthcheck"
          render={({ field }) => (
            <FormItem>
              <Label>Healthcheck</Label>
              <div className="space-y-2 border rounded-md p-3">
                <div className="flex items-center gap-2">
                  <FormLabel className="text-sm">Disable</FormLabel>
                  <Checkbox
                    id="healthcheck_disable"
                    checked={field.value?.disable ?? false}
                    onCheckedChange={checked =>
                      field.onChange({ ...field.value, disable: checked })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Input
                    placeholder="/"
                    value={field.value?.path ?? ''}
                    onChange={e => field.onChange({ ...field.value, path: e.target.value })}
                    disabled={field.value?.disable}
                  />
                  <p className="text-xs text-muted-foreground">Path</p>
                </div>
                <div className="flex items-center gap-2">
                  <FormLabel className="text-sm">Use GET</FormLabel>
                  <Checkbox
                    id="healthcheck_use_get"
                    checked={field.value?.use_get ?? false}
                    onCheckedChange={checked =>
                      field.onChange({ ...field.value, use_get: checked })
                    }
                    disabled={field.value?.disable}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Input
                      placeholder="5s"
                      value={field.value?.interval ?? ''}
                      onChange={e => field.onChange({ ...field.value, interval: e.target.value })}
                      disabled={field.value?.disable}
                    />
                    <p className="text-xs text-muted-foreground">Interval</p>
                  </div>
                  <div className="space-y-1">
                    <Input
                      placeholder="5s"
                      value={field.value?.timeout ?? ''}
                      onChange={e => field.onChange({ ...field.value, timeout: e.target.value })}
                      disabled={field.value?.disable}
                    />
                    <p className="text-xs text-muted-foreground">Timeout</p>
                  </div>
                </div>
              </div>
            </FormItem>
          )}
        />

        {/* Load Balance - for HTTP/HTTPS proxy */}
        {isHTTP && (
          <FormItem>
            <FormLabel>Load Balance</FormLabel>
            <div className="space-y-4 border rounded-md p-3">
              <FormField
                control={form.control}
                name="load_balance.mode"
                render={({ field: modeField }) => (
                  <FormItem>
                    <FormLabel>Mode</FormLabel>
                    <Select value={modeField.value ?? ''} onValueChange={modeField.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select load balance mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOAD_BALANCE_MODES.map(mode => (
                          <SelectItem key={mode} value={mode}>
                            {mode.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="load_balance.link"
                render={({ field: linkField }) => (
                  <FormItem>
                    <FormLabel>Route Link</FormLabel>
                    <FormControl>
                      <Input placeholder="route-alias" {...linkField} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </FormItem>
        )}

        {/* Middleware */}
        {isHTTP && (
          <FormField
            control={form.control}
            name="middlewares"
            render={({ field }) => (
              <RouteMiddlewareEditor
                onChange={field.onChange}
                value={field.value ?? ({} as MiddlewaresMap)}
              />
            )}
          />
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

function RouteMiddlewareEditor({
  onChange,
  value,
}: {
  onChange: (value: MiddlewaresMap) => void
  value: MiddlewaresMap
}) {
  const workingValue: EntrypointMiddlewares = useMemo(() => {
    if (!value) return []
    return Object.entries(value).map(([key, value]) => ({
      use: middlewareUseToSnakeCase(key),
      ...value,
    }))
  }, [value])

  const onChangeMiddleware = useCallback(
    (data: EntrypointMiddlewares) => {
      onChange(
        data.reduce((acc, item) => {
          // @ts-expect-error intended
          acc[item.use] = item
          // remove the `use` field from the item (from the conversion above)
          delete (item as unknown as { use?: string }).use
          return acc
        }, {} as MiddlewaresMap)
      )
    },
    [onChange]
  )

  return (
    <FormItem>
      <FormLabel>Middlewares</FormLabel>
      <NamedListInput
        label=""
        card={false}
        nameField="use"
        keyField="use"
        schema={MiddlewareComposeSchema.definitions.MiddlewareComposeItem}
        value={workingValue}
        onChange={onChangeMiddleware}
      />
    </FormItem>
  )
}

function AgentSelect({
  onChange,
  value,
  ...props
}: SelectProps & { onChange?: (value: string) => void; value?: string }) {
  const {
    data: agentList,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['agentList'],
    queryFn: () => api.agent.list().then(res => res.data),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  useEffect(() => {
    if (error) {
      toastError(error)
    }
  }, [error])

  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={onChange} value={value} {...props}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={isLoading ? 'Loading...' : 'Select Agent'} />
        </SelectTrigger>
        <SelectContent>
          {agentList?.map(agent => (
            <SelectItem
              key={agent.addr}
              value={agent.addr}
            >{`${agent.name} (${agent.addr})`}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={() => onChange?.('')}
        disabled={!value}
      >
        <X className="size-4" />
      </Button>
    </div>
  )
}
