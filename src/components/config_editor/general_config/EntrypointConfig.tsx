import { useMemo } from 'react'
import { NamedListInput } from '@/components/form/NamedListInput'
import { StoreMapInput } from '@/components/form/StoreMapInput'
import { StoreSelectField } from '@/components/store/Select'
import { StoreSwitchField } from '@/components/store/Switch'
import { Card, CardContent } from '@/components/ui/card'
import { ConfigSchema, MiddlewareComposeSchema } from '@/types/godoxy'
import type { MiddlewareFileRef } from '@/types/godoxy/middlewares/middlewares'
import { middlewareUseToSnakeCase } from '../middleware_compose/utils'
import { configStore } from '../store'

export default function EntrypointConfigContent() {
  return (
    <div className="flex flex-col gap-6">
      <EntrypointNetworkConfig />
      <EntrypointAccessLogConfig />
      <EntrypointMiddlewaresConfig />
    </div>
  )
}

function EntrypointNetworkConfig() {
  const profileNames = configStore.configObject.inbound_mtls_profiles.keys.use()

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <StoreSwitchField
          state={configStore.configObject.entrypoint.support_proxy_protocol}
          title="Support proxy protocol"
        />
        <div className="flex items-end gap-2">
          <StoreSelectField
            state={configStore.configObject.entrypoint.inbound_mtls_profile}
            title="Global Inbound mTLS Profile"
            placeholder={
              profileNames.length > 0 ? 'Select a trust profile' : 'No mTLS profiles defined'
            }
            description="Require client certificates for all HTTPS traffic on this entrypoint using a named profile."
            options={[undefined, ...profileNames]}
            className="w-full"
            captializeSelectItems={false}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function EntrypointAccessLogConfig() {
  return (
    <StoreMapInput
      label="Access log"
      schema={ConfigSchema.definitions.RequestLogConfig}
      state={configStore.configObject.entrypoint.access_log.ensureObject()}
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
