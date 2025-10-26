'use client'

import { MapInput } from '@/components/form/MapInput'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { MockCookie } from '@/lib/api'
import { HTTP_METHODS } from '@/types/godoxy/types'
import { json } from '@codemirror/lang-json'
import { Plus, Trash2 } from 'lucide-react'
import { StoreCodeMirror, StoreInput, StoreSelect } from '../StoreFields'
import { Button } from '../ui/button'
import { store } from './store'

// Convert Record<string, string[]> to Record<string, string> for UI
const toSimpleRecord = (record: Record<string, string[]>): Record<string, string> => {
  return Object.fromEntries(Object.entries(record).map(([k, v]) => [k, v[0] || '']))
}

// Convert Record<string, string> to Record<string, string[]> for API
const toArrayRecord = (record: Record<string, string>): Record<string, string[]> => {
  return Object.fromEntries(Object.entries(record).map(([k, v]) => [k, [v]]))
}

export default function MockRequestForm() {
  const mockRequest = store.mockRequest.use()

  const addCookie = () => {
    const newCookies = [...mockRequest.cookies, { name: '', value: '' }]
    store.mockRequest.cookies.set(newCookies)
  }

  const removeCookie = (index: number) => {
    const newCookies = mockRequest.cookies.filter((_, i) => i !== index)
    store.mockRequest.cookies.set(newCookies)
  }

  const updateCookie = (index: number, field: 'name' | 'value', value: string) => {
    const newCookies = [...mockRequest.cookies]
    const updatedCookie: MockCookie = { ...newCookies[index]!, [field]: value }
    newCookies[index] = updatedCookie
    store.mockRequest.cookies.set(newCookies)
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Mock Request</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="method">Method</Label>
            <StoreSelect state={store.mockRequest.method} options={HTTP_METHODS} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="path">Path</Label>
            <StoreInput state={store.mockRequest.path} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="host">Host</Label>
            <StoreInput state={store.mockRequest.host} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="remoteIP">Remote IP</Label>
            <StoreInput state={store.mockRequest.remoteIP} />
          </div>
        </div>

        <MapInput
          label="Headers"
          card={false}
          placeholder={{ key: 'Header name', value: 'Header value' }}
          value={toSimpleRecord(mockRequest.headers)}
          onChange={v => store.mockRequest.headers.set(toArrayRecord(v))}
        />

        <MapInput
          label="Query Parameters"
          card={false}
          placeholder={{ key: 'Parameter name', value: 'Parameter value' }}
          value={toSimpleRecord(mockRequest.query)}
          onChange={v => store.mockRequest.query.set(toArrayRecord(v))}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Cookies</Label>
            <Button size="sm" variant="outline" onClick={addCookie}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {mockRequest.cookies.map((cookie, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={cookie.name}
                  onChange={e => updateCookie(index, 'name', e.target.value)}
                  placeholder="Cookie name"
                  className="flex-1"
                />
                <Input
                  value={cookie.value}
                  onChange={e => updateCookie(index, 'value', e.target.value)}
                  placeholder="Cookie value"
                  className="flex-1"
                />
                <Button size="icon" variant="ghost" onClick={() => removeCookie(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Body</Label>
          <StoreCodeMirror readOnly={false} state={store.mockRequest.body} extensions={[json()]} />
        </div>
      </CardContent>
    </Card>
  )
}
