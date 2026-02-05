import { json } from '@codemirror/lang-json'
import { MapInput } from '@/components/form/MapInput'
import { StoreInputField } from '@/components/store/Input'
import { StoreSelectField } from '@/components/store/Select'
import type { MockCookie } from '@/lib/api'
import { HTTP_METHODS } from '@/types/godoxy/types'
import { FieldGroup, FieldLegend, FieldSet } from '../ui/field'
import { StoreCodeMirrorField } from '../ui/store/CodeMirror'
import { store } from './store'

// Convert Record<string, string[]> to Record<string, string> for UI
const toSimpleRecord = (record: Record<string, string[]>): Record<string, string> => {
  return Object.fromEntries(Object.entries(record).map(([k, v]) => [k, v[0] || '']))
}

// Convert Record<string, string> to Record<string, string[]> for API
const toArrayRecord = (record: Record<string, string>): Record<string, string[]> => {
  return Object.fromEntries(Object.entries(record).map(([k, v]) => [k, [v]]))
}

const toSimpleCookies = (cookies: MockCookie[]): Record<string, string> => {
  return Object.fromEntries(cookies.map(cookie => [cookie.name, cookie.value]))
}

const toArrayCookies = (cookies: Record<string, string>): MockCookie[] => {
  return Object.entries(cookies).map(([name, value]) => ({ name, value }))
}

export default function MockRequestForm() {
  return (
    <FieldSet>
      <FieldLegend>Mock Request</FieldLegend>
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <StoreSelectField state={store.mockRequest.method} options={HTTP_METHODS} />
          <StoreInputField state={store.mockRequest.path} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StoreInputField state={store.mockRequest.host} />
          <StoreInputField state={store.mockRequest.remoteIP} />
        </div>

        <store.mockRequest.headers.Render>
          {(value, update) => (
            <MapInput
              label="Headers"
              card={false}
              placeholder={{ key: 'Header name', value: 'Header value' }}
              value={toSimpleRecord(value)}
              onChange={v => update(toArrayRecord(v))}
            />
          )}
        </store.mockRequest.headers.Render>

        <store.mockRequest.query.Render>
          {(value, update) => (
            <MapInput
              label="Query Parameters"
              card={false}
              placeholder={{ key: 'Parameter name', value: 'Parameter value' }}
              value={toSimpleRecord(value)}
              onChange={v => update(toArrayRecord(v))}
            />
          )}
        </store.mockRequest.query.Render>

        <store.mockRequest.cookies.Render>
          {(value, update) => (
            <MapInput
              label="Cookies"
              card={false}
              placeholder={{ key: 'Cookie name', value: 'Cookie value' }}
              value={toSimpleCookies(value)}
              onChange={v => update(toArrayCookies(v))}
            />
          )}
        </store.mockRequest.cookies.Render>

        <StoreCodeMirrorField
          className="border rounded-md"
          readOnly={false}
          state={store.mockRequest.body}
          language="json"
          extensions={[json()]}
        />
      </FieldGroup>
    </FieldSet>
  )
}
