import { StoreCheckboxField } from '@/components/store/Checkbox'
import { StoreFormInputField } from '@/components/store/Input'
import { StoreFormSelectField } from '@/components/store/Select'
import { FieldGroup } from '@/components/ui/field'
import type { Routes } from '@/types/godoxy'
import { LOAD_BALANCE_MODES, type LoadBalanceMode } from '@/types/godoxy/providers/loadbalance'
import type { FormState, FormStore } from 'juststore'

type RouteHTTPConfigSectionProps = {
  form: FormStore<Routes.ReverseProxyRoute>
}

export function RouteHTTPConfigSection({ form }: RouteHTTPConfigSectionProps) {
  return (
    <FieldGroup className="gap-4">
      <StoreFormInputField
        state={form.response_header_timeout}
        title="Response Header Timeout"
        placeholder="60s"
        description="Duration format: 30s, 5m, 1h, etc."
      />

      <StoreCheckboxField state={form.disable_compression} title="Disable Compression" />

      <StoreFormSelectField
        state={form.load_balance.mode as FormState<LoadBalanceMode>}
        title="Load Balance Mode"
        defaultValue="round_robin"
        placeholder="Round Robin"
        options={LOAD_BALANCE_MODES.map(mode => ({
          value: mode,
          label: mode.replaceAll('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        }))}
      />
      <StoreFormInputField
        state={form.load_balance.link}
        title="Route Group"
        description="Link to a route group for load balancing"
      />
    </FieldGroup>
  )
}
