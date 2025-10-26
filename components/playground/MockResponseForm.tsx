'use client'

import { MapInput } from '@/components/form/MapInput'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { json } from '@codemirror/lang-json'
import { StoreCodeMirror, StoreInput } from '../StoreFields'
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
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Mock Response</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-4">
        <div className="space-y-2">
          <Label htmlFor="statusCode">Status Code</Label>
          <StoreInput state={store.mockResponse.statusCode} type="number" placeholder="200" />
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="responseBody">Body</Label>
          <StoreCodeMirror readOnly={false} state={store.mockResponse.body} extensions={[json()]} />
        </div>
      </CardContent>
    </Card>
  )
}
