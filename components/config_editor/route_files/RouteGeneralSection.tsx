import { StoreFormInputField } from '@/components/store/Input'
import { StoreFormSelectField } from '@/components/store/Select'
import { Button } from '@/components/ui/button'
import { FieldSet } from '@/components/ui/field'
import type { Route as RouteResponse } from '@/lib/api'
import { api } from '@/lib/api-client'
import type { Routes } from '@/types/godoxy'
import type { StreamPort } from '@/types/godoxy/types'
import { IconX } from '@tabler/icons-react'
import type { FormState, FormStore } from 'juststore'
import { useEffect } from 'react'
import { useAsync } from 'react-use'
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

      {isHTTPOrStream && (
        <HostPortFields
          form={form as FormStore<Routes.ReverseProxyRoute | Routes.StreamRoute>}
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
        state={form.host}
        title="Host"
        placeholder={details?.host ?? 'localhost'}
      />

      {stream && (
        <StoreFormInputField
          state={(form as FormStore<Routes.StreamRoute>).bind?.withDefault('0.0.0.0')}
          title="Bind Host"
          placeholder={details?.bind ?? '0.0.0.0'}
          type="ip"
        />
      )}
      {stream && (
        <StoreFormInputField
          state={(form as FormStore<Routes.StreamRoute>).port.derived({
            from: v => (v ? utils.getListeningPort(v) : undefined),
            to: v => `${v}:${utils.getProxyPort(form.port.value ?? 0)}` as StreamPort,
          })}
          title="Listen Port"
          placeholder={details?.port.listening?.toString() ?? '53'}
          type="number"
          min={0}
          max={65535}
        />
      )}
      <StoreFormInputField
        state={(form as FormStore<Routes.StreamRoute>).port.derived({
          from: v => (v ? utils.getProxyPort(v) : undefined),
          to: v => {
            if (!stream) {
              return v as StreamPort
            }
            return `${utils.getListeningPort(form.port.value ?? 0)}:${v}` as StreamPort
          },
        })}
        title="Proxy Port"
        placeholder={details?.port.proxy?.toString() ?? '3000'}
        type="number"
        min={1}
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
