import { IconX } from '@tabler/icons-react'
import type { FormState, FormStore } from 'juststore'
import { useEffect } from 'react'
import { useAsync } from 'react-use'
import { StoreFormInputField } from '@/components/store/Input'
import { StoreFormSelectField } from '@/components/store/Select'
import { Button } from '@/components/ui/button'
import { FieldSet } from '@/components/ui/field'
import type { Route as RouteResponse } from '@/lib/api'
import { api } from '@/lib/api-client'
import type { Routes } from '@/types/godoxy'
import type { FileServerBindPort } from '@/types/godoxy/types'
import * as utils from './utils'

type RouteGeneralSectionProps = {
  form: FormStore<Routes.Route>
  details?: RouteResponse
}

export function RouteGeneralSection({ form, details }: RouteGeneralSectionProps) {
  const isHTTPOrStream = form.scheme.useCompute(
    scheme => utils.isHTTP(scheme) || utils.isStream(scheme)
  )

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <StoreFormSelectField
          state={form.scheme as FormState<string | undefined>}
          title="Scheme"
          options={utils.routeSchemes}
        />
        <StoreFormInputField
          state={form.alias}
          title="Alias"
          required
          placeholder="app or app.example.com"
        />
      </div>

      {isHTTPOrStream ? (
        <HostPortFields
          form={form as FormStore<Routes.ReverseProxyRoute | Routes.StreamRoute>}
          details={details}
        />
      ) : (
        <FileServerBindAddrFields
          form={form as FormStore<Routes.FileServerRoute>}
          details={details}
        />
      )}

      {isHTTPOrStream && (
        <AgentSelect state={(form as FormStore<Routes.ReverseProxyRoute>).agent} />
      )}
    </>
  )
}

function HostPortFields({
  form,
  details,
}: {
  form: FormStore<Routes.ReverseProxyRoute | Routes.StreamRoute>
  details?: RouteResponse
}) {
  const stream = form.scheme.useCompute(isStream)

  return (
    <FieldSet className="grid grid-cols-2 gap-4">
      <StoreFormInputField
        state={(form as FormStore<Routes.ReverseProxyRoute>).host}
        title="Proxy Host"
        placeholder={details?.host ?? 'localhost'}
      />

      <StoreFormInputField
        state={form.bind}
        title="Bind Host"
        placeholder={details?.bind ?? '0.0.0.0'}
        type="ip"
      />
      <StoreFormInputField
        state={form.port.derived({
          from: v => utils.getListeningPort(v),
          to: v => utils.formatPort(v, utils.getProxyPort(form.port.value)),
        })}
        title="Listen Port"
        placeholder={String(details?.port.listening || (stream ? '53' : '443'))}
        type="number"
        min={0}
        max={65535}
      />
      <StoreFormInputField
        state={form.port.derived({
          from: v => utils.getProxyPort(v),
          to: v => utils.formatPort(utils.getListeningPort(form.port.value), v),
        })}
        title="Proxy Port"
        placeholder={String(details?.port.proxy || (stream ? '53' : '3000'))}
        type="number"
        min={0}
        max={65535}
      />
    </FieldSet>
  )
}

function FileServerBindAddrFields({
  form,
  details,
}: {
  form: FormStore<Routes.FileServerRoute>
  details?: RouteResponse
}) {
  return (
    <FieldSet className="grid grid-cols-2 gap-4">
      <StoreFormInputField
        state={form.bind}
        title="Bind Host"
        placeholder={details?.bind ?? '0.0.0.0'}
        type="ip"
      />
      <StoreFormInputField
        state={form.port.derived({
          from: v => utils.getListeningPort(v),
          to: v => utils.formatPort(v, undefined) as FileServerBindPort,
        })}
        title="Listen Port"
        placeholder={String(details?.port.listening || '443')}
        type="number"
        min={0}
        max={65535}
      />
    </FieldSet>
  )
}

function isStream(scheme: string | undefined) {
  if (scheme === undefined) return false
  return scheme === 'tcp' || scheme === 'udp'
}

function AgentSelect({ state }: { state: FormState<string | undefined> }) {
  const {
    value: agentList,
    error,
    loading,
  } = useAsync(async () => await api.agent.list().then(res => res.data))

  useEffect(() => {
    if (error) {
      state.setError(error.message)
    }
  }, [error, state])

  return (
    <div className="flex items-end gap-2">
      <StoreFormSelectField
        state={state}
        placeholder={
          loading ? 'Loading...' : (agentList?.length ?? 0) > 0 ? 'Select Agent' : 'No agents found'
        }
        options={(agentList ?? []).map(agent => ({
          value: agent.addr,
          label: (
            <div className="flex flex-col">
              <span className="font-medium">
                {agent.name}@{agent.addr}
              </span>
              <div className="flex gap-1">
                <span className="text-xs text-muted-foreground">
                  <span className="font-semibold">Version:</span> {agent.version}
                </span>
                <span className="text-xs text-muted-foreground">
                  <span className="font-semibold">Runtime:</span> {agent.runtime}
                </span>
              </div>
            </div>
          ),
        }))}
      />
      <state.Render>
        {(value, setValue) => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setValue(undefined)}
            disabled={!value}
          >
            <IconX className="size-4" />
          </Button>
        )}
      </state.Render>
    </div>
  )
}
