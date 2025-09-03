import { html } from '@codemirror/lang-html'
import { json } from '@codemirror/lang-json'
import ReactCodeMirror, { EditorView, type Extension } from '@uiw/react-codemirror'
import { CopyIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { memo, useCallback, useMemo, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
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
    const entries = Object.entries(v).filter(([_, value]) => value !== undefined)
    if (entries.length === 1) {
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

  const renderedValue = useMemo(() => {
    let stringify = true
    let processedValue: string | ReactNode = ''

    if (typeof v === 'string') {
      if (v.startsWith('<!DOCTYPE html>') || (v.startsWith('<') && v.endsWith('>'))) {
        processedValue = (
          <ReadonlyCodeMirror
            value={v}
            extensions={[html(), EditorView.lineWrapping]}
            language="html"
          />
        )
        stringify = false
      } else if (
        ((v.includes('{') && v.includes('}')) || (v.includes('[') && v.includes(']'))) &&
        v.includes('"')
      ) {
        processedValue = (
          <ReadonlyCodeMirror
            value={v}
            extensions={[json(), EditorView.lineWrapping]}
            language="json"
          />
        )
        stringify = false
      }
    }

    if (stringify) {
      processedValue = `${v}`
    }

    return processedValue
  }, [v])

  return (
    <DataListRow label={k ?? ''} value={renderedValue} className="w-full break-words text-sm" />
  )
})

const ReadonlyCodeMirror = memo(function ReadonlyCodeMirror({
  value,
  extensions,
  language,
}: {
  value: string
  extensions: Extension[]
  language?: string
}) {
  const { resolvedTheme } = useTheme()

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success('Copied to clipboard')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [value])

  return (
    <div className="relative min-h-[100px]">
      <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
        {language && <Badge variant={'outline'}>{language.toUpperCase()}</Badge>}
        <Button
          size="icon"
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          variant="ghost"
          className="h-3 w-3"
        >
          <CopyIcon />
        </Button>
      </div>
      <ReactCodeMirror
        value={value}
        readOnly
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        extensions={extensions}
        basicSetup={false}
        style={{
          minHeight: '100px',
          height: '100%',
          width: '100%',
          fontSize: '12px',
        }}
      />
    </div>
  )
})

export default ObjectDataList
