import type { ArrayState, ObjectState } from 'juststore'
import { useEffect, useMemo } from 'react'
import { FieldRemoveIconButton } from '@/components/form/delete-button'
import { FormContainer } from '@/components/form/FormContainer'
import { IndentedListBlock } from '@/components/form/IndentedListBlock'
import { StoreFieldInput } from '@/components/form/StoreFieldInput'
import { StoreMapInput, StoreObjectInput } from '@/components/form/StoreMapInput'
import { Card, CardContent } from '@/components/ui/card'
import { type Autocert, AutocertSchema, ConfigSchema } from '@/types/godoxy'
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

      let next: Partial<Autocert.AutocertConfigBase> & {
        provider: Autocert.AutocertProvider
        extra?: Autocert.AutocertExtra[]
      } = {
        provider: v,
        extra: state.extra.value,
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

function DnsProviderOptionsEditor({ state }: { state: ObjectState<Autocert.AutocertConfig> }) {
  const provider = state.useCompute(cfg => cfg?.provider ?? 'local')
  const schema = useMemo(() => {
    const branch = AutocertSchema.definitions.AutocertConfigWithoutExtra.anyOf.find(
      candidate => candidate.properties.provider.const === provider
    )
    if (!branch) return undefined
    const { provider: _provider, ...properties } = branch.properties
    return { ...branch, properties }
  }, [provider])
  if (!schema) return null

  return (
    <StoreObjectInput label={provider} card={false} schema={schema} state={state} hideUnknown />
  )
}
