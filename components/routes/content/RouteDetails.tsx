'use client'

import { useSelectedRoute } from '@/components/routes/store'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataList, DataListRow } from '@/components/ui/data-list'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api-client'
import { formatDuration } from '@/lib/format'
import { json } from '@codemirror/lang-json'
import { useQuery } from '@tanstack/react-query'
import ReactCodeMirror from '@uiw/react-codemirror'
import { ArrowRight } from 'lucide-react'
import { useTheme } from 'next-themes'
import ContainerLogs from './ContainerLogs'
import ContainerLogsHeader from './ContainerLogsHeader'

export default function RouteDetails() {
  const activeRoute = useSelectedRoute()

  const { data: routeDetails, error } = useQuery({
    queryKey: ['route', activeRoute],
    queryFn: () =>
      !activeRoute ? Promise.resolve(null) : api.route.route(activeRoute).then(res => res.data),
  })

  if (!activeRoute) {
    return <div className="p-4 text-muted-foreground">Select a route to view details.</div>
  }

  if (error) {
    return <div className="p-4 text-muted-foreground">Error: {error.message}</div>
  }

  if (!routeDetails) {
    return <div className="p-4 text-muted-foreground">No route details available.</div>
  }

  return (
    <div className="space-y-6 w-full">
      {routeDetails.container && (
        <Card>
          <CardHeader>
            <CardTitle>Container Logs</CardTitle>
            <CardDescription>
              <ContainerLogsHeader container={routeDetails.container} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContainerLogs containerId={routeDetails.container.container_id} />
          </CardContent>
        </Card>
      )}
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Title>Alias</Title>
              <div className="text-sm">{routeDetails.alias}</div>
            </div>
            <div>
              <Title>Agent</Title>
              <div className="text-sm">{routeDetails.agent}</div>
            </div>
            <div>
              <Title>Host</Title>
              <div className="text-sm font-mono">{routeDetails.host}</div>
            </div>
            <div>
              <Title>Scheme</Title>
              <Badge variant="outline">{routeDetails.scheme}</Badge>
            </div>
          </div>

          <div>
            <Title>Origin URL</Title>
            <div className="text-sm font-mono break-all">{routeDetails.purl}</div>
          </div>

          {routeDetails.lurl && (
            <div>
              <Title>Listening URL</Title>
              <div className="text-sm font-mono break-all">{routeDetails.lurl}</div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Ports */}
      <Card>
        <CardHeader>
          <CardTitle>Ports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Title>Listening Port</Title>
              <div className="text-lg font-mono">{routeDetails.port.listening}</div>
            </div>
            <div>
              <Title>Origin Port</Title>
              <div className="text-lg font-mono">{routeDetails.port.proxy}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex gap-2">
              <Title>Route Excluded</Title>
              <Badge variant={routeDetails.excluded ? 'destructive' : 'secondary'}>
                {routeDetails.excluded ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>

          {routeDetails.health && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routeDetails.excluded_reason && (
                <div>
                  <Title>Excluded reason</Title>
                  <div className="text-sm">{routeDetails.excluded_reason}</div>
                </div>
              )}
              <div>
                <Title>Status</Title>
                <div className="text-sm">{routeDetails.health.status}</div>
              </div>
              <div>
                <Title>Latency</Title>
                <div className="text-sm">{routeDetails.health.latencyStr}</div>
              </div>
              <div>
                <Title>Uptime</Title>
                <div className="text-sm">{routeDetails.health.uptimeStr}</div>
              </div>
              <div>
                <Title>Last Seen</Title>
                <div className="text-sm">{routeDetails.health.lastSeenStr}</div>
              </div>
              {routeDetails.health.detail && (
                <div className="md:col-span-2">
                  <Title>Details</Title>
                  <div className="text-sm">{routeDetails.health.detail}</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {routeDetails.response_header_timeout && (
              <div className="flex items-center gap-2">
                <Title>Response Header Timeout</Title>
                <div className="text-sm">{routeDetails.response_header_timeout} ms</div>
              </div>
            )}
            {(routeDetails.scheme === 'http' || routeDetails.scheme === 'https') && (
              <div className="flex items-center gap-2">
                <Title>Compression</Title>
                <Badge variant={routeDetails.disable_compression ? 'destructive' : 'default'}>
                  {routeDetails.disable_compression ? 'Disabled' : 'Enabled'}
                </Badge>
              </div>
            )}
            {routeDetails.scheme === 'https' && (
              <div className="flex items-center gap-2">
                <Title>TLS Verify</Title>
                <Badge variant={routeDetails.no_tls_verify ? 'destructive' : 'default'}>
                  {routeDetails.no_tls_verify ? 'Disabled' : 'Enabled'}
                </Badge>
              </div>
            )}
          </div>

          {routeDetails.provider && (
            <div>
              <Label className="text-muted-foreground">Provider</Label>
              <div className="text-sm">{routeDetails.provider}</div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Health Check */}
      <Card>
        <CardHeader>
          <CardTitle>Health Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Title>Enabled</Title>
              <Badge variant={routeDetails.healthcheck.disable ? 'destructive' : 'default'}>
                {routeDetails.healthcheck.disable ? 'No' : 'Yes'}
              </Badge>
            </div>
            <div>
              <Title>Interval</Title>
              <div className="text-sm">
                {formatDuration(routeDetails.healthcheck.interval / 1000, { unit: 'us' })}
              </div>
            </div>
            <div>
              <Title>Timeout</Title>
              <div className="text-sm">
                {formatDuration(routeDetails.healthcheck.timeout / 1000, { unit: 'us' })}
              </div>
            </div>
            <div>
              <Title>Retries</Title>
              <div className="text-sm">{routeDetails.healthcheck.retries}</div>
            </div>
            <div>
              <Title>Use GET</Title>
              <Badge variant="outline">{routeDetails.healthcheck.use_get ? 'Yes' : 'No'}</Badge>
            </div>
            <div>
              <Title>Path</Title>
              <div className="text-sm font-mono">{routeDetails.healthcheck.path || '/'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Homepage Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Homepage Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Title>Name</Title>
              <div className="text-sm">{routeDetails.homepage.name}</div>
            </div>
            <div>
              <Title>Category</Title>
              <div className="text-sm">{routeDetails.homepage.category}</div>
            </div>
          </div>

          <div>
            <Title>Description</Title>
            <div className="text-sm">{routeDetails.homepage.description}</div>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <Title>Favorite</Title>
              <Badge variant={routeDetails.homepage.favorite ? 'default' : 'secondary'}>
                {routeDetails.homepage.favorite ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Title>Show</Title>
              <Badge variant={routeDetails.homepage.show ? 'default' : 'secondary'}>
                {routeDetails.homepage.show ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>

          <div>
            <Title>Icon</Title>
            <div className="text-sm font-mono">{routeDetails.homepage.icon}</div>
          </div>

          <div>
            <Title>URL</Title>
            <div className="text-sm font-mono break-all">{routeDetails.homepage.url}</div>
          </div>
        </CardContent>
      </Card>
      {/* Rules */}
      {routeDetails.rules && routeDetails.rules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rules ({routeDetails.rules.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {routeDetails.rules.map((rule, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="font-medium text-sm">{rule.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">Action: {rule.do}</div>
                  <div className="text-sm text-muted-foreground mt-1">Condition: {rule.on}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Path Patterns */}
      {routeDetails.path_patterns && routeDetails.path_patterns.length > 0 && (
        <Card>
          <CardHeader>
            <Title>Path Patterns</Title>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {routeDetails.path_patterns.map((pattern, index) => (
                <Badge key={index} variant="outline" className="font-mono">
                  {pattern}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Container Information */}
      {routeDetails.container && (
        <Card>
          <CardHeader>
            <CardTitle>Docker Container</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Title>Name</Title>
                <div className="text-sm font-mono">{routeDetails.container.container_name}</div>
              </div>
              <div>
                <Title>Docker Host</Title>
                <div className="text-sm font-mono">{routeDetails.container.docker_host}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Title>Image</Title>
                <div className="text-sm font-mono">{routeDetails.container.image.name}</div>
              </div>
              <div>
                <Title>Container ID</Title>
                <div className="text-sm font-mono">
                  {routeDetails.container.container_id.slice(0, 12)}
                </div>
              </div>
              <Item title="Network" value={routeDetails.container.network} />
              <Item title="Public Hostname" value={routeDetails.container.public_hostname} />
              <Item title="Private Hostname" value={routeDetails.container.private_hostname} />
            </div>

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Title>Running</Title>
                <Badge variant={routeDetails.container.running ? 'default' : 'destructive'}>
                  {routeDetails.container.running ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Title>Container Excluded</Title>
                <Badge variant={routeDetails.container.is_excluded ? 'destructive' : 'secondary'}>
                  {routeDetails.container.is_excluded ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>

            <div>
              <Title>Public Ports</Title>
              <div className="text-sm font-mono">
                {Object.entries(routeDetails.container.public_ports || {}).map(([key, port]) => (
                  <div key={key}>
                    {port.IP}:{port.PublicPort} → {port.PrivatePort}/{port.Type}
                  </div>
                )) || 'No public ports exposed'}
              </div>
            </div>

            <div className="space-y-2">
              <Title>Labels</Title>
              {routeDetails.container.labels &&
              Object.keys(routeDetails.container.labels).length > 0 ? (
                <DataList labels={Object.keys(routeDetails.container.labels)}>
                  {Object.entries(routeDetails.container.labels).map(([key, value]) => (
                    <DataListRow key={key} label={key} value={value} />
                  ))}
                </DataList>
              ) : (
                <div className="text-sm text-muted-foreground mt-1">No labels</div>
              )}
            </div>
            <div className="space-y-2">
              <Title>Mounts</Title>
              {routeDetails.container.mounts &&
              Object.keys(routeDetails.container.mounts).length > 0 ? (
                <DataList labels={Object.keys(routeDetails.container.mounts)}>
                  {Object.entries(routeDetails.container.mounts).map(([source, destination]) => (
                    <DataListRow
                      key={source}
                      label={source}
                      value={destination}
                      seperator={<ArrowRight className="w-4 h-4" />}
                    />
                  ))}
                </DataList>
              ) : (
                <div className="text-sm text-muted-foreground mt-1">No mounts</div>
              )}
            </div>

            {routeDetails.container.errors && (
              <div>
                <Label className="text-muted-foreground">Errors</Label>
                <div className="text-sm text-error">{routeDetails.container.errors}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {/* Load Balancer */}
      {routeDetails.load_balance && (
        <Card>
          <CardHeader>
            <CardTitle>Load Balancer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                {JSON.stringify(routeDetails.load_balance, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Middlewares */}
      {routeDetails.middlewares && Object.keys(routeDetails.middlewares).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Middlewares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(routeDetails.middlewares).map(([key, value]) => (
                <div key={key} className="border rounded-lg p-2">
                  <div className="font-medium text-sm">{key}</div>
                  <JSONCodeMirror value={value} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Additional Configuration */}
      {(routeDetails.access_log || routeDetails.idlewatcher) && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {routeDetails.access_log && (
              <div>
                <Title>Access Log</Title>
                <div className="text-sm mt-1">
                  <JSONCodeMirror value={routeDetails.access_log} />
                </div>
              </div>
            )}

            {routeDetails.idlewatcher && (
              <div>
                <Title>Idle Watcher</Title>
                <div className="text-sm mt-1">
                  <JSONCodeMirror value={routeDetails.idlewatcher} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Title({ children }: { children: React.ReactNode }) {
  return <Label className="text-muted-foreground">{children}</Label>
}

function Item({ title, value }: { title: string; value: string | undefined | null }) {
  return (
    <div>
      <Title>{title}</Title>
      <div className="text-sm">{value || <span className="text-muted-foreground">None</span>}</div>
    </div>
  )
}

function JSONCodeMirror({ value }: { value: unknown }) {
  const { resolvedTheme } = useTheme()
  return (
    <ReactCodeMirror
      className="text-xs mt-2"
      readOnly
      value={JSON.stringify(value, null, 2)}
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      extensions={[json()]}
      basicSetup={false}
    />
  )
}
