import { MapInput } from '@/components/form/MapInput'
import { StoreInputField } from '@/components/store/Input'
import { json } from '@codemirror/lang-json'
import { FieldGroup, FieldLegend, FieldSet } from '../ui/field'
import { StoreCodeMirrorField } from '../ui/store/CodeMirror'
import { store } from './store'

// Convert Record<string, string[]> to Record<string, string> for UI
const toSimpleRecord = (record: Record<string, string[]>): Record<string, string> => {
  if (!record) return {}
  return Object.fromEntries(Object.entries(record).map(([k, v]) => [k, v[0] || '']))
}

// Convert Record<string, string> to Record<string, string[]> for API
const toArrayRecord = (record: Record<string, string>): Record<string, string[]> => {
  if (!record) return {}
  return Object.fromEntries(Object.entries(record).map(([k, v]) => [k, [v]]))
}

export default function MockResponseForm() {
  return (
    <FieldSet>
      <FieldLegend>Mock Response</FieldLegend>
      <FieldGroup>
        <StoreInputField state={store.mockResponse.statusCode} type="number" placeholder="200" />

        <store.mockResponse.headers.Render>
          {(value, update) => (
            <MapInput
              label="Headers"
              card={false}
              placeholder={{ key: 'Header name', value: 'Header value' }}
              value={toSimpleRecord(value)}
              onChange={v => update(toArrayRecord(v))}
            />
          )}
        </store.mockResponse.headers.Render>

        <StoreCodeMirrorField
          className="border rounded-md"
          readOnly={false}
          state={store.mockResponse.body}
          language="json"
          extensions={[json()]}
        />
      </FieldGroup>
    </FieldSet>
  )
}
