import { NamedListInput } from '@/components/form/NamedListInput'
import { encodeRouteKey } from '@/components/routes/utils'
import { StoreFormCheckboxField } from '@/components/store/Checkbox'
import { StoreFormInputField } from '@/components/store/Input'
import { StoreFormSelectField } from '@/components/store/Select'
import { StoreFormTextAreaField } from '@/components/store/TextArea'
import { Button, type buttonVariants } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from '@/components/ui/field'
import type { Route as RouteResponse } from '@/lib/api'
import { api } from '@/lib/api-client'
import {
  MiddlewareComposeSchema,
  type MiddlewareCompose,
  type Middlewares,
  type Routes,
} from '@/types/godoxy'
import { STOP_METHODS, STOP_SIGNALS } from '@/types/godoxy/providers/idlewatcher'
import { LOAD_BALANCE_MODES, type LoadBalanceMode } from '@/types/godoxy/providers/loadbalance'
import type { StreamPort } from '@/types/godoxy/types'
import { IconCheck, IconChevronDown, IconX } from '@tabler/icons-react'
import type { VariantProps } from 'class-variance-authority'
import { useForm, type FormState, type FormStore } from 'juststore'
import { Activity, useCallback, useEffect, useMemo } from 'react'
import { useAsync } from 'react-use'
import { middlewareUseToSnakeCase } from '../middleware_compose/utils'
import { configStore } from '../store'
import * as utils from './utils'

type RouteEditFormProps = {
  route: Routes.Route
  alias: string
  onCancel: (form: FormStore<Routes.Route>) => void
  onUpdate?: (route: Routes.Route) => void
  onSave: (route: Routes.Route) => void
  headerText?: string
  saveButtonIcon?: React.ForwardRefExoticComponent<
    React.SVGProps<SVGSVGElement> & React.RefAttributes<SVGSVGElement>
  >
  saveButtonText?: string
  cancelButtonIcon?: React.ForwardRefExoticComponent<
    React.SVGProps<SVGSVGElement> & React.RefAttributes<SVGSVGElement>
  >
  cancelButtonText?: string
  cancelButtonVariant?: VariantProps<typeof buttonVariants>['variant']
  cancelButtonClassName?: string
}

function isStream(scheme: string | undefined) {
  if (scheme === undefined) return false // defaults to http
  return scheme === 'tcp' || scheme === 'udp'
}

function isHTTP(scheme: string | undefined) {
  if (scheme === undefined) return true // defaults to http
  return scheme === 'http' || scheme === 'https' || scheme === 'h2c'
}

export default function RouteEditForm({
  route,
  alias,
  onCancel,
  onUpdate,
  onSave,
  headerText = 'Edit Route',
  saveButtonIcon = IconCheck,
  saveButtonText = 'Done',
  cancelButtonIcon = IconX,
  cancelButtonText = 'Cancel',
  cancelButtonVariant = 'ghost',
  cancelButtonClassName,
}: RouteEditFormProps) {
  const details = configStore.routeDetails[encodeRouteKey(alias)]?.use()
  const scheme = route.scheme
  const host = 'host' in route ? route.host : undefined
  const port = 'port' in route ? route.port : undefined
  const form = useForm<Routes.Route>(
    {
      ...route,
      alias,
      scheme,
      host,
      port,
    } as Routes.Route,
    {
      alias: {
        validate: value => {
          if (!value) return 'Alias is required'
          return undefined
        },
      },
    }
  )

  useEffect(() => {
    if (onUpdate) {
      const unsubscribe = form.subscribe(onUpdate)
      return unsubscribe
    }
    return undefined
  })

  // const scheme = form.watch('scheme')
  // const isStream = scheme === 'tcp' || scheme === 'udp'
  const SaveButtonIcon = saveButtonIcon
  const CancelButtonIcon = cancelButtonIcon

  return (
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

      <div className="flex gap-4">
        {/* Route Type */}
        <StoreFormSelectField
          state={(form.scheme as FormState<string>).withDefault('http')}
          options={utils.routeSchemes}
        />

        {/* Alias */}
        <StoreFormInputField
          state={form.alias}
          title="Alias"
          required
          placeholder="app or app.example.com"
        />
      </div>

      {/* Host and Port */}
      <HostPortFields
        form={form as FormStore<Routes.ReverseProxyRoute | Routes.StreamRoute>}
        details={details}
      />

      {/* Root */}
      <form.scheme.Show on={scheme => scheme === 'fileserver'}>
        <FileServerFields form={form as FormStore<Routes.FileServerRoute>} />
      </form.scheme.Show>

      {/* Advanced Options */}
      <AdvancedOptions form={form} details={details} />
    </form>
  )
}

function HostPortFields({
  form,
  details,
}: {
  form: FormStore<Routes.ReverseProxyRoute | Routes.StreamRoute>
  details?: RouteResponse
}) {
  const mode = form.useCompute(form =>
    isHTTP(form.scheme) || isStream(form.scheme) ? 'visible' : 'hidden'
  )
  const stream = form.useCompute(form => isStream(form.scheme))

  return (
    <Activity mode={mode}>
      <FieldSet className="grid grid-cols-2 gap-4">
        <StoreFormInputField
          state={form.host}
          title="Host"
          placeholder={details?.host ?? 'localhost'}
        />

        {stream && (
          <StoreFormInputField
            state={(form as FormStore<Routes.StreamRoute>).bind?.withDefault('0.0.0.0')}
            title="Bind Host"
            placeholder={details?.bind ?? '0.0.0.0'}
            type="ip"
          />
        )}
        {/** Listening Port */}
        {stream && (
          <StoreFormInputField
            state={(form as FormStore<Routes.StreamRoute>).port.derived({
              from: v => utils.getListeningPort(v ?? 0),
              to: v => `${v}:${utils.getProxyPort(form.port.value ?? 0)}` as StreamPort,
            })}
            title="Listen Port"
            placeholder={details?.port.listening?.toString() ?? '53'}
            type="number"
            min={0} // 0 means random port
            max={65535}
          />
        )}
        {/** Proxy Port */}
        <StoreFormInputField
          state={(form as FormStore<Routes.StreamRoute>).port.derived({
            from: v => utils.getProxyPort(v ?? 0),
            to: v => {
              if (!stream) {
                return v as StreamPort
              }
              return `${utils.getListeningPort(form.port.value ?? 0)}:${v}` as StreamPort
            },
          })}
          title="Proxy Port"
          placeholder={details?.port.proxy?.toString() ?? '3000'}
          type="number"
          min={1} // proxy port cannot be 0
          max={65535}
        />
      </FieldSet>
    </Activity>
  )
}

function FileServerFields({ form }: { form: FormStore<Routes.FileServerRoute> }) {
  return (
    <>
      <StoreFormInputField state={form.root} title="Root" placeholder="/path/to/files" required />
      <StoreFormCheckboxField
        state={form.spa}
        title="SPA"
        description={
          <span>
            Serve Single Page Applications (SPA) mode.
            <br />
            <span>
              Similar to <code>nginx</code> <code>try_files</code> directive.
            </span>
          </span>
        }
      />
      <StoreFormInputField state={form.index} title="Index" placeholder="/index.html" />
    </>
  )
}

function AdvancedOptions({
  form,
  details,
}: {
  form: FormStore<Routes.Route>
  details?: RouteResponse
}) {
  const rpForm = form as unknown as FormStore<Routes.ReverseProxyRoute>

  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start text-muted-foreground"
          />
        }
      >
        <IconChevronDown className="size-4" />
        <span>Advanced Options</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 flex flex-col gap-4">
        <form.scheme.Show on={scheme => isHTTP(scheme) || isStream(scheme)}>
          <FieldSet>
            <FieldLegend variant="label">HTTP Config</FieldLegend>
            <FieldDescription>Configure HTTP-specific settings</FieldDescription>
            <FieldGroup className="gap-4">
              <AgentSelect state={rpForm.agent} />

              {/* No TLS Verify - for HTTPS proxy */}
              <form.scheme.Show on={scheme => scheme === 'https'}>
                <StoreFormCheckboxField
                  state={rpForm.no_tls_verify}
                  title="No TLS Verify"
                  description="Skip TLS certificate verification"
                />
              </form.scheme.Show>

              {/* Response Header Timeout - for HTTP/HTTPS proxy */}
              <StoreFormInputField
                state={rpForm.response_header_timeout}
                title="Response Header Timeout"
                placeholder="60s"
                description="Duration format: 30s, 5m, 1h, etc."
              />
            </FieldGroup>
          </FieldSet>
        </form.scheme.Show>

        {/* Healthcheck - for all route types */}
        <FieldSeparator />
        <FieldSet>
          <FieldLegend variant="label">Healthcheck</FieldLegend>
          <FieldDescription>Monitor the health of the route</FieldDescription>
          <FieldGroup className="gap-4">
            <StoreFormCheckboxField state={form.healthcheck.disable} title="Disable" />
            <StoreFormInputField state={form.healthcheck.path} title="Path" placeholder="/" />
            <StoreFormCheckboxField state={form.healthcheck.use_get} title="Use GET" />
            <div className="flex gap-2">
              <StoreFormInputField
                state={form.healthcheck.interval}
                title="Interval"
                placeholder="5s"
              />
              <StoreFormInputField
                state={form.healthcheck.timeout}
                title="Timeout"
                placeholder="5s"
              />
            </div>
          </FieldGroup>
        </FieldSet>

        {/* Load Balance - for HTTP/HTTPS proxy */}
        <form.scheme.Show on={scheme => isHTTP(scheme)}>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend variant="label">Load Balance</FieldLegend>
            <FieldDescription>Route requests to multiple upstreams</FieldDescription>
            <FieldGroup className="gap-4">
              <StoreFormSelectField
                state={rpForm.load_balance.mode as FormState<LoadBalanceMode>}
                title="Mode"
                defaultValue="round_robin"
                placeholder="Round Robin"
                options={LOAD_BALANCE_MODES.map(mode => ({
                  value: mode,
                  label: mode.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                }))}
              />
              <StoreFormInputField
                state={rpForm.load_balance.link}
                title="Route Link"
                placeholder="route-alias"
              />
            </FieldGroup>
          </FieldSet>
        </form.scheme.Show>

        {/* Proxmox - for reverse proxy and stream */}
        <form.scheme.Show on={scheme => isHTTP(scheme) || isStream(scheme)}>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend variant="label">Proxmox</FieldLegend>
            <FieldDescription>
              Stream logs from Proxmox nodes, idlewatcher integration
            </FieldDescription>
            <FieldGroup className="gap-4">
              <div className="flex gap-2">
                <StoreFormInputField
                  state={rpForm.proxmox.node}
                  title="Node"
                  placeholder={details?.proxmox?.node ?? 'pve'}
                  required
                />
                <StoreFormInputField
                  state={rpForm.proxmox.vmid}
                  title="VMID"
                  placeholder={details?.proxmox?.vmid?.toString() ?? '119'}
                  type="number"
                />
              </div>
              <StoreFormInputField
                state={rpForm.proxmox.services.derived({
                  from: v => v?.join(',') ?? '',
                  to: v => v.split(','),
                })}
                title="Services"
                placeholder="nginx"
                description="Service names (comma-separated)"
              />
              <StoreFormTextAreaField
                state={rpForm.proxmox.files.derived({
                  from: v => v?.join('\n') ?? '',
                  to: v => v.split('\n'),
                })}
                title="Log Files"
                placeholder="/var/log/nginx/access.log"
                description="Log file paths (newline-separated)"
              />
            </FieldGroup>
          </FieldSet>
        </form.scheme.Show>

        {/* Idlewatcher - for reverse proxy and stream */}
        <form.scheme.Show on={scheme => isHTTP(scheme) || isStream(scheme)}>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend variant="label">Idlewatcher</FieldLegend>
            <FieldDescription>Automatically stop and start resources when idle</FieldDescription>
            <FieldGroup className="gap-4">
              <div className="flex gap-2">
                <StoreFormInputField
                  state={rpForm.idlewatcher.idle_timeout}
                  title="Idle Timeout"
                  placeholder="5m"
                  description="Duration of inactivity before stopping"
                />
                <StoreFormInputField
                  state={rpForm.idlewatcher.wake_timeout}
                  title="Wake Timeout"
                  placeholder="30s"
                  description="Time to wait for start"
                />
              </div>
              <div className="flex gap-2">
                <StoreFormInputField
                  state={rpForm.idlewatcher.stop_timeout}
                  title="Stop Timeout"
                  placeholder="30s"
                  description="Time to wait for stop"
                />
                <StoreFormSelectField
                  state={rpForm.idlewatcher.stop_method}
                  title="Stop Method"
                  defaultValue="stop"
                  options={STOP_METHODS}
                />
                <StoreFormSelectField
                  state={rpForm.idlewatcher.stop_signal}
                  title="Stop Signal"
                  defaultValue="SIGTERM"
                  options={STOP_SIGNALS.filter(signal => signal.startsWith('SIG'))}
                />
              </div>
              <StoreFormInputField
                state={rpForm.idlewatcher.start_endpoint}
                title="Start Endpoint"
                placeholder="/wake"
                description="Path to wake the resource"
              />
            </FieldGroup>
          </FieldSet>
        </form.scheme.Show>

        {/* Middleware */}
        <form.scheme.Show on={scheme => isHTTP(scheme)}>
          <RouteMiddlewareEditor state={rpForm.middlewares} />
        </form.scheme.Show>
      </CollapsibleContent>
    </Collapsible>
  )
}

function RouteMiddlewareEditor({
  state,
}: {
  state: FormState<Middlewares.MiddlewaresMap | undefined>
}) {
  const [value, setValue] = state.useState()

  const workingValue: MiddlewareCompose.EntrypointMiddlewares = useMemo(() => {
    if (!value) return []
    return Object.entries(value).map(([key, value]) => ({
      use: middlewareUseToSnakeCase(key),
      ...value,
    }))
  }, [value])

  const onChangeMiddleware = useCallback(
    (data: MiddlewareCompose.EntrypointMiddlewares) => {
      setValue(
        data.reduce((acc, item) => {
          // @ts-expect-error intended
          acc[item.use] = item
          // remove the `use` field from the item (from the conversion above)
          delete (item as unknown as { use?: string }).use
          return acc
        }, {} as Middlewares.MiddlewaresMap)
      )
    },
    [setValue]
  )

  return (
    <Field>
      <FieldLabel>Middlewares</FieldLabel>
      <NamedListInput
        label=""
        card={false}
        nameField="use"
        keyField="use"
        schema={MiddlewareComposeSchema.definitions.MiddlewareComposeItem}
        value={workingValue}
        onChange={onChangeMiddleware}
      />
    </Field>
  )
}

function AgentSelect({ state }: { state: FormState<string | undefined> }) {
  const {
    value: agentList,
    error,
    loading,
  } = useAsync(async () => await api.agent.list().then(res => res.data))

  useEffect(() => {
    if (error) {
      state.setError(error.message)
    }
  }, [error, state])

  return (
    <div className="flex items-end gap-2">
      <StoreFormSelectField
        state={state}
        placeholder={loading ? 'Loading...' : 'Select Agent'}
        options={(agentList ?? []).map(agent => ({
          value: agent.addr,
          label: (
            <div className="flex flex-col">
              <span className="font-medium">
                {agent.name}@{agent.addr}
              </span>
              <div className="flex gap-1">
                <span className="text-xs text-muted-foreground">
                  <span className="font-semibold">Version:</span> {agent.version}
                </span>
                <span className="text-xs text-muted-foreground">
                  <span className="font-semibold">Runtime:</span> {agent.runtime}
                </span>
              </div>
            </div>
          ),
        }))}
      />
      <state.Render>
        {(value, setValue) => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setValue(undefined)}
            disabled={!value}
          >
            <IconX className="size-4" />
          </Button>
        )}
      </state.Render>
    </div>
  )
}
