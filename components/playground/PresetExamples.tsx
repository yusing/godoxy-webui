'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { examples } from './examples'
import { store } from './store'

export default function PresetExamples() {
  const [selectedExample, setSelectedExample] = useState<string>('')

  const loadExample = (exampleName: string) => {
    const example = examples.find(e => e.name === exampleName)
    if (!example) return

    store.rules.set(example.rules)
    store.mockRequest.set(example.mockRequest)
    store.mockResponse.set(example.mockResponse)

    setSelectedExample(exampleName)
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedExample} onValueChange={loadExample}>
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Load an example..." />
        </SelectTrigger>
        <SelectContent>
          {examples.map(example => (
            <SelectItem key={example.name} value={example.name}>
              {example.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedExample && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedExample('')
            store.rules.set('')
            store.mockRequest.set({
              method: 'GET',
              path: '/',
              host: 'localhost',
              headers: {},
              query: {},
              cookies: [],
              body: '',
              remoteIP: '127.0.0.1',
            })
            store.mockResponse.set({
              statusCode: 200,
              headers: {},
              body: '',
            })
          }}
        >
          Clear
        </Button>
      )}
    </div>
  )
}
