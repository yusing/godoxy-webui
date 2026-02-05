import { Suspense, useEffect, useRef } from 'react'

import { FormContainer } from '@/components/form/FormContainer'
import { StoreFieldInput } from '@/components/form/StoreFieldInput'
import { StoreMapInput, StoreObjectInput } from '@/components/form/StoreMapInput'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Carousel, CarouselNext, CarouselPrevious, useCarousel } from '@/components/ui/carousel'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Autocert, AutocertSchema } from '@/types/godoxy'
import type { JSONSchema } from '@/types/schema'
import { IconTrash } from '@tabler/icons-react'
import AutoHeight from 'embla-carousel-auto-height'
import type { ArrayState, ObjectState } from 'juststore'
import { configStore } from '../store'
import AutocertInfo from './AutocertInfo'
import AutocertRenewDialogButton from './AutocertRenewDialogButton'

const autocertConfig = configStore.configObject.autocert.ensureObject()

export default function AutocertConfigContent() {
  const navRef = useRef<HTMLDivElement>(null)
  return (
    <div className="flex flex-col gap-4">
      <Carousel opts={{ loop: false }} plugins={[AutoHeight()]}>
        <Card className="overflow-visible">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Current certificate</CardTitle>
            <CarouselNavigation ref={navRef} />
            <Suspense>
              <AutocertRenewDialogButton />
            </Suspense>
          </CardHeader>
          <CardContent>
            <AutocertInfo navRef={navRef} />
          </CardContent>
        </Card>
      </Carousel>
      <Card>
        <CardContent flex>
          <AutocertConfigForm
            state={autocertConfig}
            onAddExtra={() => autocertConfig.extra.push({ provider: 'local' })}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function CarouselNavigation({ ref }: { ref: React.RefObject<HTMLDivElement | null> }) {
  const { api } = useCarousel()
  if (!api) return null

  return (
    <div ref={ref} className="flex gap-2 items-center">
      <CarouselPrevious className="left-0 translate-y-0 top-0 relative" />
      <span className="text-sm text-muted-foreground">
        {api.selectedScrollSnap() + 1} of {api.slideNodes().length}
      </span>
      <CarouselNext className="right-0 translate-y-0 top-0 relative" />
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
    <div className="flex flex-col gap-3">
      <StoreFieldInput
        state={state}
        fieldKey="provider"
        schema={AutocertSchema.definitions.AutocertConfigWithoutExtra}
        allowKeyChange={false}
        allowDelete={false}
      />
      <DnsProviderOptionsEditor state={state} />
      {onAddExtra && (
        <FormContainer label="Extra certificates" card={false} canAdd onAdd={onAddExtra}>
          <AutocertConfigContentExtra state={state.extra.ensureArray()} />
        </FormContainer>
      )}
    </div>
  )
}

function AutocertConfigContentExtra({ state }: { state: ArrayState<Autocert.AutocertExtra> }) {
  const numItems = state.useCompute(value => value?.length ?? 0)

  return Array.from({ length: numItems }).map((_, index) => (
    <Card key={index} className="col-span-full border-2 border-border">
      <CardHeader className="flex items-center gap-4">
        <CardTitle>Extra certificate {index + 1}</CardTitle>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={() => state.splice(index, 1)}
        >
          <IconTrash />
        </Button>
      </CardHeader>
      <CardContent flex>
        <AutocertConfigForm state={state.at(index) as ObjectState<Autocert.AutocertConfig>} />
      </CardContent>
    </Card>
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

  function OVHOptionsEditor() {
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

  if (provider === 'ovh') {
    return <OVHOptionsEditor />
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
