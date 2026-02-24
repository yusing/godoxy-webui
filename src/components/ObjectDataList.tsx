import { memo, type ReactNode } from 'react'
import { CodeBlock } from './CodeBlock'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { DataListRow } from './ui/data-list'

function nonObjectFirst(a: [string, unknown], b: [string, unknown]) {
  const aIsObject = typeof a[1] === 'object' && a[1] !== null
  const bIsObject = typeof b[1] === 'object' && b[1] !== null
  if (!aIsObject && bIsObject) return -1
  if (aIsObject && !bIsObject) return 1
  return a[0].localeCompare(b[0])
}

const ObjectDataList = memo(function ObjectDataList({
  k,
  v,
  depth = 0,
}: {
  k?: string
  v: unknown
  depth?: number
}) {
  // Prevent infinite recursion for deeply nested objects
  if (depth > 5) {
    return (
      <DataListRow
        className="text-sm w-full"
        label={k ?? ''}
        value="[Too deeply nested to display]"
      />
    )
  }

  if (typeof v === 'object') {
    if (!v) {
      return <DataListRow className="text-sm" label={k ?? ''} value="null" />
    }

    if (!k) {
      return (
        <div className="flex flex-col gap-2">
          {Object.entries(v)
            .toSorted(nonObjectFirst)
            .map(
              ([key, value]) =>
                value !== undefined && (
                  <ObjectDataList key={key} k={key} v={value} depth={depth + 1} />
                )
            )}
        </div>
      )
    }

    // Check if object has only one item - if so, flatten it to key.subkey format
    const entries = Object.entries(v).filter(value => value !== undefined)
    if (entries.length === 1) {
      // biome-ignore lint/style/noNonNullAssertion: .length === 1
      const [subKey, subValue] = entries[0]!
      return <ObjectDataList k={`${k}.${subKey}`} v={subValue} depth={depth + 1} />
    }

    return (
      <Card>
        <CardHeader className="px-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">{k}</CardTitle>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-xs">
              {Array.isArray(v) ? 'Array' : 'Object'}
            </span>
          </div>
          <div className="h-px bg-border mt-1" />
        </CardHeader>
        <CardContent className="px-2">
          <ObjectDataList v={v} depth={depth + 1} />
        </CardContent>
      </Card>
    )
  }

  if (Array.isArray(v)) {
    return (
      <div className="flex flex-col gap-1">
        {v.map((item, index) => (
          <ObjectDataList
            key={index}
            k={`${k ? `${k}[${index}]` : `[${index}]`}`}
            v={item}
            depth={depth + 1}
          />
        ))}
      </div>
    )
  }

  return (
    <DataListRow
      label={k ?? ''}
      value={<Value v={v} />}
      className="w-full wrap-break-word text-sm"
    />
  )
})

function Value({ v }: { v: unknown }) {
  let stringify = true
  let processedValue: string | ReactNode = ''

  if (typeof v === 'string') {
    if (v.startsWith('<!DOCTYPE html>') || (v.startsWith('<') && v.endsWith('>'))) {
      processedValue = <CodeBlock value={v} lang="html" />
      stringify = false
    } else if (
      ((v.includes('{') && v.includes('}')) || (v.includes('[') && v.includes(']'))) &&
      v.includes('"')
    ) {
      processedValue = <CodeBlock value={v} lang="json" />
      stringify = false
    }
  }

  if (stringify) {
    processedValue = `${v}`
  }

  return processedValue
}

export default ObjectDataList
