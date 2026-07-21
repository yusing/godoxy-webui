import { useMemo } from 'react'
import { NamedListInput } from '@/components/form/NamedListInput'
import { StoreListInput } from '@/components/form/StoreListInput'
import { StoreMapInput } from '@/components/form/StoreMapInput'
import { StoreSelectField } from '@/components/store/Select'
import { StoreSwitchField } from '@/components/store/Switch'
import { Card, CardContent } from '@/components/ui/card'
import { ConfigSchema, MiddlewareComposeSchema } from '@/types/godoxy'
import type { MiddlewareFileRef } from '@/types/godoxy/middlewares/middlewares'
import { middlewareUseToSnakeCase } from '../middleware_compose/utils'
import { configStore } from '../store'
import { Conditional } from 'juststore'

const config = configStore.configObject
const proxyProtocolConfig = config.entrypoint.proxy_protocol.ensureObject()
const legacySupportProxyProtocol = config.entrypoint.support_proxy_protocol.derived({
  from: v => v,
  to: v => (v ? v : undefined), // deprecated field: remove completely when it's toggled off
})

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

  proxyProtocolConfig.mode.subscribe(mode => {
    if (mode == 'disabled') {
      proxyProtocolConfig.trusted_proxies.reset()
    }
  })

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <Conditional
          state={legacySupportProxyProtocol}
          /* Only show it when set */
          on={value => value != null}
        >
          <StoreSwitchField
            state={legacySupportProxyProtocol}
            title="Support proxy protocol (deprecated)"
            description="Legacy compatibility mode trusts optional Proxy Protocol headers from any peer. Configure Proxy Protocol Mode and Trusted Proxies instead."
          />
        </Conditional>
        <StoreSelectField
          state={proxyProtocolConfig.mode}
          title="Proxy Protocol Mode"
          placeholder="Select a mode"
          description="Required accepts only trusted proxies; mixed also permits direct clients; disabled does not parse Proxy Protocol."
          options={['disabled', 'mixed', 'required']}
          capitalizeSelectItems={false}
          defaultValue="disabled"
        />
        <Conditional
          state={proxyProtocolConfig.mode}
          on={mode => mode != null && mode !== 'disabled'}
        >
          <StoreListInput
            card={false}
            grid={false}
            label="Trusted Proxies"
            placeholder="IP address or CIDR range"
            description="At least one IP address or CIDR range is required when Proxy Protocol is enabled."
            state={proxyProtocolConfig.trusted_proxies.ensureArray()}
          />
        </Conditional>
        <div className="flex items-end gap-2">
          <StoreSelectField
            state={config.entrypoint.inbound_mtls_profile}
            title="Global Inbound mTLS Profile"
            placeholder={
              profileNames.length > 0 ? 'Select a trust profile' : 'No mTLS profiles defined'
            }
            description="Require client certificates for all HTTPS traffic on this entrypoint using a named profile."
            options={[undefined, ...profileNames]}
            className="w-full"
            capitalizeSelectItems={false}
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
      state={config.entrypoint.access_log.ensureObject()}
    />
  )
}

function EntrypointMiddlewaresConfig() {
  const middlewares = config.entrypoint.middlewares.ensureObject().use()
  const workingValue = useMemo(() => {
    return Object.values(middlewares).map(item => ({
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
      onChange={config.entrypoint.middlewares.set}
    />
  )
}
