import { json } from '@codemirror/lang-json'
import { yaml } from '@codemirror/lang-yaml'
import { IconCheck, IconX } from '@tabler/icons-react'
import { EditorView } from '@uiw/react-codemirror'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { stringify as stringifyYAML } from 'yaml'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { type GoDoxyError, GoDoxyErrorAlert } from '../GoDoxyError'
import { CodeMirror } from '../ObjectDataList'
import { store } from './store'

export default function ResultsDisplay() {
  const response = store.playgroundResponse.use()
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    const unsubscribe = store.playgroundResponse.subscribe(() => {
      setAnimKey(prev => prev + 1)
    })
    return unsubscribe
  })

  if (!response) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center text-muted-foreground">
          Run the playground to see results
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle>Results</CardTitle>
          <Badge variant={response.upstreamCalled ? 'default' : 'secondary'}>
            {response.upstreamCalled ? 'Upstream Called' : 'Upstream Not Called'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <motion.div
            key={animKey}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="space-y-6 pr-4"
          >
            {response.executionError && (
              <GoDoxyErrorAlert title="Execution Error" err={response.executionError} />
            )}

            <div>
              <h3 className="text-lg font-semibold mb-2">Parsed Rules</h3>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Valid</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>On</TableHead>
                      <TableHead>Do</TableHead>
                      <TableHead className="w-24">Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {response.parsedRules.map((rule, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {rule.validationError ? (
                            <IconX className="h-4 w-4 text-error-foreground" />
                          ) : (
                            <IconCheck className="h-4 w-4 text-success-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell className="font-mono text-sm">{rule.on || '-'}</TableCell>
                        <TableCell className="font-mono text-sm">{rule.do || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {rule.isResponseRule ? 'Response' : 'Request'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {response.parsedRules.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No rules parsed
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {response.parsedRules.some(r => r.validationError) && (
                <div className="mt-2">
                  <GoDoxyErrorAlert
                    title="Validation Errors"
                    err={{
                      extras: response.parsedRules
                        .filter(r => r.validationError)
                        .map(r => r.validationError as GoDoxyError),
                    }}
                  />
                </div>
              )}
            </div>

            {response.matchedRules.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Matched Rules</h3>
                <div className="flex flex-wrap gap-2">
                  {response.matchedRules.map((name, index) => (
                    <Badge key={index} variant="default">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Final Request</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Method:</span>{' '}
                    <code>{response.finalRequest.method}</code>
                  </div>
                  <div>
                    <span className="font-semibold">Path:</span>{' '}
                    <code>{response.finalRequest.path}</code>
                  </div>
                  <div>
                    <span className="font-semibold">Host:</span>{' '}
                    <code>{response.finalRequest.host}</code>
                  </div>
                  {Object.keys(response.finalRequest.headers).length > 0 && (
                    <div>
                      <span className="font-semibold">Headers:</span>
                      <YAMLCodeBlock value={expandURLValues(response.finalRequest.headers)} />
                    </div>
                  )}
                  {Object.keys(response.finalRequest.query).length > 0 && (
                    <div>
                      <span className="font-semibold">Query:</span>
                      <YAMLCodeBlock value={expandURLValues(response.finalRequest.query)} />
                    </div>
                  )}
                  {response.finalRequest.body && (
                    <div>
                      <span className="font-semibold">Body:</span>
                      <JSONCodeBlock value={response.finalRequest.body} />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Final Response</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Status Code:</span>{' '}
                    <div
                      className={cn(
                        'rounded-md p-1 flex items-center justify-center',
                        response.finalResponse.statusCode >= 200 &&
                          response.finalResponse.statusCode < 300
                          ? 'bg-success'
                          : 'bg-error'
                      )}
                    >
                      <code
                        className={cn(
                          'font-mono text-xs',
                          response.finalResponse.statusCode >= 200 &&
                            response.finalResponse.statusCode < 300
                            ? 'text-success-foreground'
                            : 'text-error-foreground'
                        )}
                      >
                        {response.finalResponse.statusCode}
                      </code>
                    </div>
                  </div>
                  {Object.keys(response.finalResponse.headers).length > 0 && (
                    <div>
                      <span className="font-semibold">Headers:</span>
                      <YAMLCodeBlock value={expandURLValues(response.finalResponse.headers)} />
                    </div>
                  )}
                  {response.finalResponse.body && (
                    <div>
                      <span className="font-semibold">Body:</span>
                      <JSONCodeBlock value={response.finalResponse.body} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function YAMLCodeBlock({ value, readOnly = true }: { value: unknown; readOnly?: boolean }) {
  return (
    <CodeMirror
      className="max-w-full ring-1 ring-inset ring-ring/70 rounded-md p-1 mt-2"
      value={typeof value === 'string' ? value : stringifyYAML(value)}
      extensions={[yaml(), EditorView.lineWrapping]}
      readOnly={readOnly}
    />
  )
}

function JSONCodeBlock({ value, readOnly = true }: { value: unknown; readOnly?: boolean }) {
  return (
    <CodeMirror
      className="max-w-full ring-1 ring-inset ring-ring/70 rounded-md p-1 mt-2"
      value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
      extensions={[json(), EditorView.lineWrapping]}
      readOnly={readOnly}
    />
  )
}

function expandURLValues(values: Record<string, string[]>): Record<string, string> {
  return Object.fromEntries(Object.entries(values).map(([key, values]) => [key, values.join(',')]))
}
