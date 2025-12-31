'use client'

import { Suspense } from 'react'

import { StoreFieldInput } from '@/components/form/StoreFieldInput'
import { StoreMapInput, StoreObjectInput } from '@/components/form/StoreMapInput'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Autocert, AutocertSchema } from '@/types/godoxy'
import type { JSONSchema } from '@/types/schema'
import type { ObjectState } from 'juststore'
import { configStore } from '../store'
import AutocertInfo from './AutocertInfo'
import AutocertRenewDialogButton from './AutocertRenewDialogButton'

const autocertConfigBase = configStore.configObject
  .autocert as ObjectState<Autocert.AutocertConfigBase>

const autocertConfig = configStore.configObject.autocert.ensureObject()

export default function AutocertConfigContent() {
  // remove email, domains, cert_path, key_path, resolvers when provider is local
  autocertConfig.provider.subscribe(v => {
    let next: Partial<Autocert.AutocertConfig> = {
      provider: v,
    }
    if (v !== 'local') {
      next = {
        ...next,
        email: autocertConfigBase.email.value,
        domains: autocertConfigBase.domains.value,
        cert_path: autocertConfigBase.cert_path.value,
        key_path: autocertConfigBase.key_path.value,
        resolvers: autocertConfigBase.resolvers.value,
      }
    }
    autocertConfig.set(next as Autocert.AutocertConfig)
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Current certificate</CardTitle>
            <Suspense>
              <AutocertRenewDialogButton />
            </Suspense>
          </CardHeader>
          <CardContent>
            <AutocertInfo />
          </CardContent>
        </Card>
        <Card>
          <CardContent flex>
            <StoreFieldInput
              state={autocertConfig}
              fieldKey="provider"
              schema={AutocertSchema.definitions.AutocertConfig}
              allowKeyChange={false}
              allowDelete={false}
              readonly={false}
            />
            <DnsProviderOptionsEditor />
          </CardContent>
        </Card>
      </div>
    </div>
  )
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
  if (provider === 'duckdns') {
    return ['DuckDNS', AutocertSchema.definitions.DuckDNSOptions]
  }
  if (provider === 'porkbun') {
    return ['Porkbun', AutocertSchema.definitions.PorkbunOptions]
  }
  return ['', undefined]
}

function DnsProviderOptionsEditor() {
  const provider = autocertConfig.useCompute(cfg => cfg?.provider ?? 'local')
  const [label, schema] = useLabelAndSchema(provider)

  if (schema) {
    return (
      <StoreObjectInput label={label} card={false} schema={schema} state={autocertConfigBase} />
    )
  }

  function OVHOptionsEditor() {
    // derive auth mode
    const stateWithAppKey = autocertConfig as ObjectState<Autocert.OVHOptionsWithAppKey>
    const stateWithOAuth2 = autocertConfig as ObjectState<Autocert.OVHOptionsWithOAuth2Config>
    const authMode = autocertConfig.useCompute(opts =>
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
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Auth method</label>
          <Select
            value={authMode}
            onValueChange={v => setAuthMode(v as 'application_key' | 'oauth2')}
          >
            <SelectTrigger>
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
          />
        ) : (
          <StoreMapInput
            label="OVH With OAuth2"
            card={false}
            schema={AutocertSchema.definitions.OVHOptionsWithOAuth2Config}
            state={stateWithOAuth2}
          />
        )}
      </div>
    )
  }

  if (provider === 'ovh') {
    return <OVHOptionsEditor />
  }

  return (
    <StoreMapInput
      label="Custom"
      card={false}
      schema={AutocertSchema.definitions.CustomOptions}
      state={(
        configStore.configObject.autocert as ObjectState<Autocert.OtherOptions>
      ).ensureObject()}
    />
  )
}
