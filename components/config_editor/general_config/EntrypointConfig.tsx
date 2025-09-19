import { MapInput } from '@/components/form/MapInput'
import { NamedListInput } from '@/components/form/NamedListInput'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ConfigSchema, MiddlewareComposeSchema } from '@/types/godoxy'
import type { MiddlewareFileRef } from '@/types/godoxy/middlewares/middlewares'
import { useMemo } from 'react'
import { middlewareUseToSnakeCase } from '../middleware_compose/MiddlewareEditor'
import { configStore } from '../store'

export default function EntrypointConfigContent() {
  return (
    <div className="flex flex-col gap-6">
      <EntrypointProxyProtocolConfig />
      <EntrypointAccessLogConfig />
      <EntrypointMiddlewaresConfig />
    </div>
  )
}

function EntrypointProxyProtocolConfig() {
  const supportProxyProtocol = configStore.configObject.entrypoint.support_proxy_protocol.use()
  return (
    <div className="flex gap-2 border rounded-md p-4">
      <Label>Support proxy protocol</Label>
      <Switch
        checked={supportProxyProtocol}
        onCheckedChange={configStore.configObject.entrypoint.support_proxy_protocol.set}
      />
    </div>
  )
}

// FIXME: these schema causes UI to freeze
const accessLogSchema = ConfigSchema.definitions.RequestLogConfig
// @ts-expect-error TODO: fix this
delete accessLogSchema.properties.filters
// @ts-expect-error TODO: fix this
delete accessLogSchema.properties.fields

function EntrypointAccessLogConfig() {
  const accessLog = configStore.configObject.entrypoint.access_log.use()
  return (
    <MapInput
      label="Access log"
      schema={accessLogSchema}
      value={accessLog}
      onChange={configStore.configObject.entrypoint.access_log.set}
    />
  )
}

function EntrypointMiddlewaresConfig() {
  const middlewares = configStore.configObject.entrypoint.middlewares.use()
  const workingValue = useMemo(() => {
    return (middlewares ?? []).map(item => ({
      ...item,
      use: middlewareUseToSnakeCase(item.use) as MiddlewareFileRef,
    }))
  }, [middlewares])

  return (
    <NamedListInput
      label="Middlewares"
      nameField="use"
      keyField="use"
      schema={MiddlewareComposeSchema.definitions.MiddlewareComposeItem}
      value={workingValue}
      onChange={configStore.configObject.entrypoint.middlewares.set}
    />
  )
}
