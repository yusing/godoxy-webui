import type { FormStore } from 'juststore'
import { StoreFormCheckboxField } from '@/components/store/Checkbox'
import { StoreFormInputField } from '@/components/store/Input'
import { StoreFormMultiSelectField } from '@/components/store/MultiSelect'
import { FieldGroup } from '@/components/ui/field'
import type { Routes } from '@/types/godoxy'

type RouteSSLConfigSectionProps = {
  form: FormStore<Routes.ReverseProxyRoute>
}

const options = [
  {
    value: 'tlsv1.0',
    label: 'TLS 1.0',
  },
  {
    value: 'tlsv1.1',
    label: 'TLS 1.1',
  },
  {
    value: 'tlsv1.2',
    label: 'TLS 1.2',
  },
  {
    value: 'tlsv1.3',
    label: 'TLS 1.3',
  },
] as const

export default function RouteSSLConfigSection({ form }: RouteSSLConfigSectionProps) {
  return (
    <FieldGroup className="gap-4">
      <StoreFormCheckboxField
        state={form.no_tls_verify}
        title="No TLS Verify"
        description="Skip TLS certificate verification"
      />
      <form.no_tls_verify.Show on={noTLSVerify => noTLSVerify !== true}>
        <StoreFormInputField
          state={form.ssl_server_name}
          title="SSL Server Name"
          description="Server name to use for Server Name Indication (SNI)"
        />
        <StoreFormInputField
          state={form.ssl_trusted_certificate}
          title="SSL Trusted Certificate"
          description="Path to the trusted CA certificates bundle file"
        />
        <StoreFormInputField
          state={form.ssl_certificate}
          title="SSL Certificate"
          description="Path to the client certificate file"
        />
        <StoreFormInputField
          state={form.ssl_certificate_key}
          title="SSL Certificate Key"
          description="Path to the client key file"
        />
        <StoreFormMultiSelectField
          state={form.ssl_protocols.ensureArray()}
          title="SSL Protocols"
          options={options}
          placeholder="TLS 1.3"
        />
      </form.no_tls_verify.Show>
    </FieldGroup>
  )
}
