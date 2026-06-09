import type { ArrayState, ObjectState } from 'juststore'
import { useEffect, useId } from 'react'
import { FieldRemoveIconButton } from '@/components/form/delete-button'
import { FormContainer } from '@/components/form/FormContainer'
import { IndentedListBlock } from '@/components/form/IndentedListBlock'
import { StoreFieldInput } from '@/components/form/StoreFieldInput'
import { StoreMapInput, StoreObjectInput } from '@/components/form/StoreMapInput'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Autocert, AutocertSchema, ConfigSchema } from '@/types/godoxy'
import type { JSONSchema } from '@/types/schema'
import { configStore } from '../store'
import AutocertInfo from './AutocertInfo'

const autocertConfig = configStore.configObject.autocert.ensureObject()

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
}: {
  state: ObjectState<Autocert.AutocertConfig>
  onAddExtra?: (() => void) | undefined
}) {
  const base = state as unknown as ObjectState<Autocert.AutocertConfigBase>
  // remove email, domains, cert_path, key_path, resolvers when provider is local
  useEffect(() => {
    const unsubscribe = state.provider.subscribe(v => {
      if (v === undefined) return

      let next: Partial<Autocert.AutocertConfig> = {
        provider: v,
      }
      if (v !== 'local') {
        next = {
          ...next,
          email: base.email.value,
          domains: base.domains.value,
          cert_path: base.cert_path.value,
          key_path: base.key_path.value,
          resolvers: base.resolvers.value,
        }
      }
      state.set(next as Autocert.AutocertConfig)
    })
    return unsubscribe
  })

  return (
    <div className="flex flex-col gap-4">
      <StoreFieldInput
        state={state}
        fieldKey="provider"
        schema={AutocertSchema.definitions.AutocertConfigWithoutExtra}
        allowKeyChange={false}
        allowDelete={false}
      />
      <DnsProviderOptionsEditor state={state} />
      {onAddExtra && (
        <FormContainer
          label="Extra certificates"
          description={'extra'}
          card={false}
          canAdd
          onAdd={onAddExtra}
        >
          <AutocertConfigContentExtra state={state.extra.ensureArray()} />
        </FormContainer>
      )}
    </div>
  )
}

function AutocertConfigContentExtra({ state }: { state: ArrayState<Autocert.AutocertExtra> }) {
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
      <AutocertConfigForm state={state.at(index) as ObjectState<Autocert.AutocertConfig>} />
    </IndentedListBlock>
  ))
}

function useLabelAndSchema(provider: string): [string, JSONSchema | undefined] {
  if (provider === 'local') {
    return ['Local', AutocertSchema.definitions.LocalOptions]
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

function DnsProviderOptionsEditor({ state }: { state: ObjectState<Autocert.AutocertConfig> }) {
  const provider = state.useCompute(cfg => cfg?.provider ?? 'local')
  const [label, schema] = useLabelAndSchema(provider)

  if (schema) {
    return <StoreObjectInput label={label} card={false} schema={schema} state={state} hideUnknown />
  }

  if (provider === 'ovh') {
    return <OVHOptionsEditor state={state} />
  }

  return (
    <StoreMapInput
      label="Custom"
      card={false}
      schema={AutocertSchema.definitions.CustomOptions}
      state={state}
      hideUnknown
    />
  )
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
          schema={AutocertSchema.definitions.OVHOptionsWithAppKey}
          state={stateWithAppKey}
          hideUnknown
        />
      ) : (
        <StoreMapInput
          label="OVH With OAuth2"
          card={false}
          schema={AutocertSchema.definitions.OVHOptionsWithOAuth2Config}
          state={stateWithOAuth2}
          hideUnknown
        />
      )}
    </div>
  )
}
