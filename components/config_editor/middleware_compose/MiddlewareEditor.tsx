'use client'

import { NamedListInput } from '@/components/form/NamedListInput'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type MiddlewareCompose, MiddlewareComposeSchema } from '@/types/godoxy'
import type { MiddlewareFileRef } from '@/types/godoxy/middlewares/middlewares'
import { Plus, X } from 'lucide-react'
import React, { useMemo } from 'react'
import { middlewareUseToSnakeCase } from './utils'

export function MiddlewareEditor({
  label,
  data,
  onChange,
}: {
  label?: React.ReactNode
  data: MiddlewareCompose.EntrypointMiddlewares
  onChange: (v: MiddlewareCompose.EntrypointMiddlewares) => void
}) {
  const workingValue = useMemo(
    () =>
      data.map(item => ({
        ...item,
        use: middlewareUseToSnakeCase(item.use) as MiddlewareFileRef,
      })),
    [data]
  )
  return (
    <NamedListInput
      label={label}
      nameField="use"
      keyField="use"
      schema={MiddlewareComposeSchema.definitions.MiddlewareComposeItem}
      value={workingValue}
      onChange={onChange}
    />
  )
}

export function MiddlewareComposeEditor({
  data,
  onChange,
}: {
  data: MiddlewareCompose.MiddlewareCompose
  onChange: (v: MiddlewareCompose.MiddlewareCompose) => void
}) {
  const [selectedTab, setSelectedTab] = React.useState<string | undefined>(
    Object.keys(data).length > 0 ? Object.keys(data)[0] : undefined
  )

  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
      <TabsList className="flex w-full flex-wrap gap-1">
        {Object.keys(data).map((k, index) => (
          <TabsTrigger key={`${index}_tab`} value={k} asChild>
            <div className="relative flex items-center justify-between gap-2 pr-6">
              <span className="truncate">{k}</span>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={e => {
                  e.stopPropagation()
                  const newData = { ...data }
                  delete newData[k]
                  onChange(newData)
                  if (Object.keys(newData).length > 0) {
                    setSelectedTab(Object.keys(newData)[0]!)
                  } else {
                    setSelectedTab(undefined)
                  }
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </TabsTrigger>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center justify-center gap-1 px-3"
          onClick={() => onChange({ ...data, '': [] })}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </TabsList>
      {Object.entries(data).map(([k, v]) => (
        <TabsContent key={`${k}_content`} value={k} className="mt-4">
          <MiddlewareEditor
            label={k}
            data={Array.isArray(v) ? v : []}
            onChange={v => onChange({ ...data, [k]: v })}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}

export default function TabView() {
  return <div>TabView</div>
}
