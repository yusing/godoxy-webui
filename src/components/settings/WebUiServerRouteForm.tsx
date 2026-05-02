import { useCallback, useMemo } from 'react'
import { NamedListInput } from '@/components/form/NamedListInput'
import { StoreListInput } from '@/components/form/StoreListInput'
import { StoreMapInput } from '@/components/form/StoreMapInput'
import { StoreSelectField } from '@/components/store/Select'
import { ConfigSchema, type Middlewares } from '@/types/godoxy'
import { MiddlewareComposeSchema } from '@/types/godoxy'
import type {
  MiddlewareComposeItem,
  MiddlewareFileRef,
} from '@/types/godoxy/middlewares/middlewares'
import { middlewareUseToSnakeCase } from '@/components/config_editor/middleware_compose/utils'
import { configStore } from '@/components/config_editor/store'

const webuiConfig = configStore.configObject.webui.ensureObject()

export default function WebUiServerRouteForm() {
  const profileNames = configStore.configObject.inbound_mtls_profiles.keys.use()

  return (
    <div className="flex flex-col gap-4">
      <StoreListInput
        card={false}
        label="Aliases"
        description="Subdomain or hostnames for the Web UI"
        placeholder="godoxy / godoxy.example.com"
        state={webuiConfig.aliases.ensureArray()}
      />
      <StoreSelectField
        state={webuiConfig.inbound_mtls_profile}
        title="Inbound mTLS profile"
        placeholder={
          profileNames.length > 0 ? 'Select a trust profile' : 'No mTLS profiles defined'
        }
        description="Optional named profile for this Web UI route. Only applies when no global entrypoint inbound mTLS profile is set."
        options={[undefined, ...profileNames]}
        className="w-full md:max-w-lg"
        capitalizeSelectItems={false}
      />
      <StoreMapInput
        card={false}
        label="Access log"
        schema={ConfigSchema.definitions.RequestLogConfig}
        state={webuiConfig.access_log.ensureObject()}
      />
      <WebUIMiddlewaresSection />
    </div>
  )
}

function WebUIMiddlewaresSection() {
  const middlewares = webuiConfig.middlewares.use()
  const workingValue = useMemo((): MiddlewareComposeItem[] => {
    if (!middlewares) return []
    return Object.entries(middlewares).map(([k, v]) => ({
      use: middlewareUseToSnakeCase(k) as MiddlewareFileRef,
      ...v,
    }))
  }, [middlewares])

  const onChange = useCallback((data: MiddlewareComposeItem[]) => {
    webuiConfig.middlewares.set(
      data.reduce((acc, { use, ...rest }) => {
        // @ts-expect-error intended — map key is dynamic `name@file`
        acc[use] = rest
        return acc
      }, {} as Middlewares.MiddlewaresMap)
    )
  }, [])

  return (
    <NamedListInput
      card={false}
      label="Middlewares"
      nameField="use"
      keyField="use"
      schema={MiddlewareComposeSchema.definitions.MiddlewareComposeItem}
      value={workingValue}
      onChange={onChange}
    />
  )
}
