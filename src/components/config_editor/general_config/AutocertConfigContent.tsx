import type { ArrayState, ObjectState } from 'juststore'
import { useEffect, useId, useMemo, useState } from 'react'
import { FieldRemoveIconButton } from '@/components/form/delete-button'
import { FormContainer } from '@/components/form/FormContainer'
import { IndentedListBlock } from '@/components/form/IndentedListBlock'
import { StoreMapInput, StoreObjectInput } from '@/components/form/StoreMapInput'
import { Card, CardContent } from '@/components/ui/card'
import { CustomCombobox } from '@/components/ui/custom-combobox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/lib/api-client'
import { type Autocert, AutocertSchema, ConfigSchema } from '@/types/godoxy'
import { AUTOCERT_PROVIDERS } from '@/types/godoxy/config/autocert'
import type { JSONSchema } from '@/types/schema'
import { configStore } from '../store'
import AutocertInfo from './AutocertInfo'

const autocertConfig = configStore.configObject.autocert.ensureObject()
let providersRequest: Promise<string[]> | undefined

function getAutocertProviders() {
  if (!providersRequest) {
    providersRequest = api.cert
      .providers()
      .then(({ data }) => data)
      .catch(() => {
        providersRequest = undefined
        return [...AUTOCERT_PROVIDERS]
      })
  }
  return providersRequest
}

export default function AutocertConfigContent() {
  return (
    <div className="flex flex-col gap-4">
      <AutocertInfo />
      <Card>
        <CardContent className="flex flex-col gap-2">
          <AutocertConfigForm
            state={autocertConfig}
            onAddExtra={() => autocertConfig.extra.push({ provider: 'local' })}
          />
        </CardContent>
      </Card>
      <StoreMapInput
        card
        label="Inbound mTLS Profiles"
        description="Named client-certificate trust profiles that can use the system CA store and additional PEM CA files."
        schema={ConfigSchema.definitions.InboundMTLSProfiles}
        state={configStore.configObject.inbound_mtls_profiles.ensureObject()}
      />
    </div>
  )
}

function AutocertConfigForm({
  state,
  onAddExtra = undefined,
  inheritedProvider,
}: {
  state: ObjectState<Autocert.AutocertConfig>
  onAddExtra?: (() => void) | undefined
  inheritedProvider?: string | undefined
}) {
  const configuredProvider = state.provider.use()
  const provider = configuredProvider ?? inheritedProvider ?? 'local'

  return (
    <div className="flex flex-col gap-4">
      <AutocertProviderPicker state={state} provider={provider} />
      <DnsProviderOptionsEditor state={state} provider={provider} />
      {onAddExtra && (
        <FormContainer
          label="Extra certificates"
          description={'extra'}
          card={false}
          canAdd
          onAdd={onAddExtra}
        >
          <AutocertConfigContentExtra
            state={state.extra.ensureArray()}
            inheritedProvider={provider}
          />
        </FormContainer>
      )}
    </div>
  )
}

function AutocertProviderPicker({
  state,
  provider,
}: {
  state: ObjectState<Autocert.AutocertConfig>
  provider: string
}) {
  const [providers, setProviders] = useState<string[]>([...AUTOCERT_PROVIDERS])
  const providerFieldId = useId()

  useEffect(() => {
    let active = true
    getAutocertProviders().then(value => {
      if (active) setProviders(value)
    })
    return () => {
      active = false
    }
  }, [])

  const options = useMemo(() => {
    const values = new Set(['local', 'custom', ...providers])
    values.add(provider)
    return [...values]
  }, [providers, provider])

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={providerFieldId}>DNS provider</Label>
      <CustomCombobox
        triggerClassName="w-full max-w-none"
        triggerProps={{ id: providerFieldId }}
        value={provider}
        items={options}
        placeholder="Select DNS provider"
        emptyMessage="No DNS provider found"
        onValueChange={value => {
          if (typeof value === 'string') setAutocertProvider(state, value, provider)
        }}
      />
    </div>
  )
}

function setAutocertProvider(
  state: ObjectState<Autocert.AutocertConfig>,
  provider: string,
  currentProvider: string
) {
  if (state.provider.value === provider) return

  const next = { ...state.value } as Record<string, unknown>
  if (currentProvider !== provider) delete next.options
  next.provider = provider
  state.set(next as unknown as Autocert.AutocertConfig)
}

function AutocertConfigContentExtra({
  state,
  inheritedProvider,
}: {
  state: ArrayState<Autocert.AutocertExtra>
  inheritedProvider: string
}) {
  const numItems = state.useCompute(value => value?.length ?? 0)

  return Array.from({ length: numItems }).map((_, index) => (
    <IndentedListBlock
      key={index}
      title={`Extra certificate ${index + 1}`}
      titleMono={false}
      headerEnd={
        <FieldRemoveIconButton
          className="shrink-0"
          title={`Remove extra certificate ${index + 1}`}
          onClick={() => state.splice(index, 1)}
        />
      }
    >
      <AutocertConfigForm
        state={state.at(index) as ObjectState<Autocert.AutocertConfig>}
        inheritedProvider={inheritedProvider}
      />
    </IndentedListBlock>
  ))
}

function useLabelAndSchema(provider: string): [string, JSONSchema | undefined] {
  if (provider === 'local') {
    return ['Local', AutocertSchema.definitions.LocalOptions]
  }
  if (provider === 'custom') {
    return ['Custom', AutocertSchema.definitions.CustomOptions]
  }
  if (provider === 'cloudflare') {
    return ['Cloudflare', AutocertSchema.definitions.CloudflareOptions]
  }
  if (provider === 'clouddns') {
    return ['CloudDNS', AutocertSchema.definitions.CloudDNSOptions]
  }
  if (provider === 'desec') {
    return ['deSEC', AutocertSchema.definitions.DeSECOptions]
  }
  if (provider === 'duckdns') {
    return ['DuckDNS', AutocertSchema.definitions.DuckDNSOptions]
  }
  if (provider === 'porkbun') {
    return ['Porkbun', AutocertSchema.definitions.PorkbunOptions]
  }
  return ['', undefined]
}

function DnsProviderOptionsEditor({
  state,
  provider,
}: {
  state: ObjectState<Autocert.AutocertConfig>
  provider: string
}) {
  const [label, schema] = useLabelAndSchema(provider)
  const formSchema = useMemo(
    () => withoutProviderField(schema ?? AutocertSchema.definitions.OtherOptions),
    [schema]
  )

  if (schema) {
    return (
      <StoreObjectInput label={label} card={false} schema={formSchema} state={state} hideUnknown />
    )
  }

  if (provider === 'ovh') {
    return <OVHOptionsEditor state={state} />
  }

  return (
    <StoreMapInput
      label="DNS provider options"
      card={false}
      schema={formSchema}
      state={state}
      hideUnknown
    />
  )
}

function withoutProviderField(schema: JSONSchema): JSONSchema {
  const properties = { ...schema.properties }
  delete properties.provider
  return {
    ...schema,
    properties,
    required: schema.required?.filter(key => key !== 'provider'),
  }
}

function OVHOptionsEditor({ state }: { state: ObjectState<Autocert.AutocertConfig> }) {
  const authMethodFieldId = useId()

  // derive auth mode
  const stateWithAppKey = state as ObjectState<Autocert.OVHOptionsWithAppKey>
  const stateWithOAuth2 = state as ObjectState<Autocert.OVHOptionsWithOAuth2Config>
  const authMode = state.useCompute(opts =>
    'options' in opts && opts.options && 'application_key' in opts.options
      ? 'application_key'
      : 'oauth2'
  )

  const setAuthMode = (mode: 'application_key' | 'oauth2') => {
    if (mode === 'application_key') {
      const value = stateWithAppKey.options.value
      const next = {
        application_secret: value.application_secret,
        consumer_key: value.consumer_key,
        application_key: value.application_key,
        api_endpoint: value.api_endpoint,
      }
      stateWithAppKey.options.set(next)
    } else {
      const value = stateWithOAuth2.options.value
      const next = {
        application_secret: value.application_secret,
        consumer_key: value.consumer_key,
        api_endpoint: value.api_endpoint,
        oauth2_config: {
          client_id: value.oauth2_config?.client_id,
          client_secret: value.oauth2_config?.client_secret,
        },
      }
      stateWithOAuth2.options.set(next)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor={authMethodFieldId}>Auth method</Label>
        <Select
          value={authMode}
          onValueChange={v => setAuthMode(v as 'application_key' | 'oauth2')}
        >
          <SelectTrigger id={authMethodFieldId}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="application_key">Application Key</SelectItem>
            <SelectItem value="oauth2">OAuth2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {authMode === 'application_key' ? (
        <StoreMapInput
          label="OVH With Application Key"
          card={false}
          schema={withoutProviderField(AutocertSchema.definitions.OVHOptionsWithAppKey)}
          state={stateWithAppKey}
          hideUnknown
        />
      ) : (
        <StoreMapInput
          label="OVH With OAuth2"
          card={false}
          schema={withoutProviderField(AutocertSchema.definitions.OVHOptionsWithOAuth2Config)}
          state={stateWithOAuth2}
          hideUnknown
        />
      )}
    </div>
  )
}
