import { Check, X } from 'lucide-react'
import { Render } from 'juststore'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { blockRulesHighlightShiki } from '@/lib/codemirror/rules-block-shiki'
import { cn } from '@/lib/utils'
import { CodeBlock } from '../CodeBlock'
import { type GoDoxyError, GoDoxyErrorAlert } from '../GoDoxyError'
import { Field, FieldLabel, FieldLegend, FieldSet } from '../ui/field'
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
      <CardContent className="flex-1 min-h-0">
        <div className="h-full overflow-y-auto overflow-x-hidden">
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
                      <Render state={store.lang}>
                        {lang => lang === 'yaml' && <TableHead>Name</TableHead>}
                      </Render>
                      <TableHead style={{ width: '35%' }}>On</TableHead>
                      <TableHead style={{ width: '75%' }}>Do</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {response.parsedRules.map((rule, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {rule.validationError ? (
                            <X className="size-4 text-error-foreground" />
                          ) : (
                            <Check className="size-4 text-success-foreground" />
                          )}
                        </TableCell>
                        <Render state={store.lang}>
                          {lang =>
                            lang === 'yaml' && (
                              <TableCell className="font-medium">{rule.name}</TableCell>
                            )
                          }
                        </Render>
                        <TableCell style={{ width: '35%' }}>
                          <RulesBlock value={unindent1(rule.on || '-')} />
                        </TableCell>
                        <TableCell style={{ width: '75%' }}>
                          <RulesBlock value={unindent1(rule.do || '-')} />
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
                      {name || `Rule ${index + 1}`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <FieldSet>
                <FieldLegend className="text-lg font-semibold">Final Request</FieldLegend>
                <Field>
                  <FieldLabel>Method</FieldLabel>
                  <CodeBlock value={response.finalRequest.method} lang="plaintext" />
                </Field>
                <Field>
                  <FieldLabel>Path</FieldLabel>
                  <CodeBlock value={response.finalRequest.path} lang="plaintext" />
                </Field>
                <Field>
                  <FieldLabel>Host</FieldLabel>
                  <CodeBlock value={response.finalRequest.host} lang="plaintext" />
                </Field>
                {Object.keys(response.finalRequest.headers).length > 0 && (
                  <Field>
                    <FieldLabel>Headers</FieldLabel>
                    <YAMLCodeBlock value={expandURLValues(response.finalRequest.headers)} />
                  </Field>
                )}
                {Object.keys(response.finalRequest.query).length > 0 && (
                  <Field>
                    <FieldLabel>Query</FieldLabel>
                    <YAMLCodeBlock value={expandURLValues(response.finalRequest.query)} />
                  </Field>
                )}
                {response.finalRequest.body && (
                  <Field>
                    <FieldLabel>Body</FieldLabel>
                    <JSONCodeBlock value={response.finalRequest.body} />
                  </Field>
                )}
              </FieldSet>

              <FieldSet>
                <FieldLegend className="text-lg font-semibold">Final Response</FieldLegend>
                <Field>
                  <FieldLabel>Status Code</FieldLabel>
                  <Badge
                    variant="outline"
                    className={cn(
                      'max-w-fit font-mono text-xs',

                      response.finalResponse.statusCode >= 200 &&
                        response.finalResponse.statusCode < 300
                        ? 'bg-success/50 text-success-foreground'
                        : 'bg-error/50 text-error-foreground'
                    )}
                  >
                    {response.finalResponse.statusCode}
                  </Badge>
                </Field>
                {Object.keys(response.finalResponse.headers).length > 0 && (
                  <Field>
                    <FieldLabel>Headers</FieldLabel>
                    <YAMLCodeBlock value={expandURLValues(response.finalResponse.headers)} />
                  </Field>
                )}
                {response.finalResponse.body && (
                  <Field>
                    <FieldLabel>Body</FieldLabel>
                    <JSONCodeBlock value={response.finalResponse.body} />
                  </Field>
                )}
              </FieldSet>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}

// shifts indent by 1 level
function unindent1(value: string) {
  return value.replace(/^ {2}/gm, '')
}

function RulesBlock({ value }: { value: string }) {
  const lang = store.lang.use()
  return (
    <CodeBlock
      value={value}
      lang="yaml"
      highlighter={lang === 'block' ? blockRulesHighlightShiki : undefined}
    />
  )
}

function YAMLCodeBlock({ value }: { value: unknown }) {
  return <CodeBlock value={value} lang="yaml" />
}

function JSONCodeBlock({ value }: { value: unknown }) {
  return <CodeBlock value={value} lang="json" />
}

function expandURLValues(values: Record<string, string[]>): Record<string, string> {
  return Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.join(',')]))
}
