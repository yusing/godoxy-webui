'use client'

import { CodeMirror } from '@/components/ObjectDataList'
import { useSelectedRoute } from '@/components/routes/store'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Code from '@/components/ui/code'
import { DataList, DataListRow } from '@/components/ui/data-list'
import { Label } from '@/components/ui/label'
import type { IdlewatcherConfig } from '@/lib/api'
import { api } from '@/lib/api-client'
import { formatDuration, formatGoDuration, formatRelTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { yaml } from '@codemirror/lang-yaml'
import { IconArrowRight } from '@tabler/icons-react'
import { useAsync } from 'react-use'
import { stringify as stringifyYAML } from 'yaml'
import { decodeRouteKey } from '../utils'
import ContainerLogs from './ContainerLogs'
import ContainerLogsHeader from './ContainerLogsHeader'
import RouteResponseTimeChart from './ResponseTimeChart'

export default function RouteDetails() {
  const activeRoute = decodeRouteKey(useSelectedRoute())
  const { value: routeDetails, error } = useAsync(
    async () =>
      activeRoute ? api.route.route(activeRoute).then(res => res.data) : Promise.resolve(null),
    [activeRoute]
  )

  const isStream = routeDetails?.scheme === 'tcp' || routeDetails?.scheme === 'udp'
  const isExcluded = routeDetails?.excluded
  const showHomepageConfiguration = !isStream && !isExcluded

  if (!activeRoute) {
    return <div className="p-4 text-muted-foreground">Select a route to view details.</div>
  }

  if (error) {
    return <div className="p-4 text-muted-foreground">Error: {error.message}</div>
  }

  if (!routeDetails) {
    return <div className="p-4 text-muted-foreground">No route details available.</div>
  }

  // load balancer routes do not have healthcheck
  routeDetails.healthcheck ??= {
    disable: false,
    interval: 0,
    timeout: 0,
    retries: 0,
    use_get: false,
    path: '/',
  }

  return (
    <div className="space-y-2 w-full">
      {routeDetails.container && (
        <Card size="sm" className="px-2">
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
      <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-3 md:divide-x w-full">
        <Card size="sm" className="md:rounded-r-none px-2">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <DataList>
              {routeDetails.provider && (
                <DataListRow label="Provider" value={routeDetails.provider} />
              )}
              <DataListRow label="Alias" value={routeDetails.alias} />
              <DataListRow label="Agent" value={routeDetails.agent} />
              <DataListRow label="Host" value={routeDetails.host} />
              <DataListRow label="Scheme" value={routeDetails.scheme} />
              <DataListRow label="Origin URL" value={routeDetails.purl} className="break-all" />
              {routeDetails.lurl && (
                <DataListRow
                  label="Listening URL"
                  value={routeDetails.lurl}
                  className="break-all"
                />
              )}
            </DataList>
          </CardContent>
        </Card>
        <Card size="sm" className="md:col-span-2 md:rounded-l-none px-2">
          <CardHeader>
            <CardTitle>Response Time</CardTitle>
          </CardHeader>
          <CardContent className="-ml-6">
            <RouteResponseTimeChart />
          </CardContent>
        </Card>
      </div>
      {/* Ports */}
      {/* <Card size="sm">
        <CardHeader>
          <CardTitle>Ports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Item title="Listening Port" value={routeDetails.port?.listening} />
            <Item title="Origin Port" value={routeDetails.port?.proxy} />
          </div>
        </CardContent>
      </Card> */}
      {/* Status & Configuration */}
      <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:divide-x w-full">
        <Card size="sm" className="md:rounded-r-none px-2">
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <DataList>
              <DataListRow label="Route Excluded" value={routeDetails.excluded ? 'Yes' : 'No'} />
              {routeDetails.health && (
                <>
                  {routeDetails.excluded_reason && (
                    <DataListRow label="Excluded reason" value={routeDetails.excluded_reason} />
                  )}
                  <DataListRow label="Status" value={routeDetails.health.status} />
                  <DataListRow
                    label="Latency"
                    value={formatDuration(routeDetails.health.latency, { unit: 'ms' })}
                  />
                  <DataListRow
                    label="Uptime"
                    value={formatDuration(routeDetails.health.uptime, { unit: 's' })}
                  />
                  <DataListRow
                    label="Last Seen"
                    value={formatRelTime(routeDetails.health.lastSeen)}
                  />
                </>
              )}
            </DataList>
            {routeDetails.health?.detail && (
              <div>
                <Label className="text-muted-foreground">Details</Label>
                <div className="text-sm">{routeDetails.health.detail}</div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card size="sm" className="md:rounded-l-none px-2">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <DataList>
              <DataListRow
                label="Response Header Timeout"
                value={formatGoDuration(routeDetails.response_header_timeout) || '60s'}
              />
              {!isStream && (
                <DataListRow
                  label="Compression"
                  value={routeDetails.disable_compression ? 'Disabled' : 'Enabled'}
                />
              )}
              {routeDetails.scheme === 'https' && (
                <DataListRow
                  label="TLS Verify"
                  value={routeDetails.no_tls_verify ? 'Disabled' : 'Enabled'}
                />
              )}
            </DataList>
          </CardContent>
        </Card>
      </div>
      {/* Health Check & Homepage Configuration */}
      <div
        className={cn(
          'space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:divide-x w-full',
          !showHomepageConfiguration && 'md:grid-cols-1'
        )}
      >
        <Card size="sm" className="md:rounded-r-none px-2">
          <CardHeader>
            <CardTitle>Health Check</CardTitle>
          </CardHeader>
          <CardContent>
            <DataList>
              <DataListRow
                label="Enabled"
                value={routeDetails.healthcheck.disable ? 'No' : 'Yes'}
              />
              <DataListRow label="Retries" value={routeDetails.healthcheck.retries} />
              <DataListRow
                label="Interval"
                value={formatDuration(routeDetails.healthcheck.interval / 1000, { unit: 'us' })}
              />
              <DataListRow
                label="Timeout"
                value={formatDuration(routeDetails.healthcheck.timeout / 1000, { unit: 'us' })}
              />
              <DataListRow
                label="Use GET"
                value={routeDetails.healthcheck.use_get ? 'Yes' : 'No'}
              />
              <DataListRow label="Path" value={routeDetails.healthcheck.path || '/'} />
            </DataList>
          </CardContent>
        </Card>
        {showHomepageConfiguration && (
          <Card size="sm" className="md:rounded-l-none px-2">
            <CardHeader>
              <CardTitle>Homepage Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <DataList>
                <DataListRow
                  label="Favorite"
                  value={routeDetails.homepage.favorite ? 'Yes' : 'No'}
                />
                <DataListRow label="Show" value={routeDetails.homepage.show ? 'Yes' : 'No'} />
                <DataListRow label="Name" value={routeDetails.homepage.name} />
                <DataListRow label="Category" value={routeDetails.homepage.category} />
                <DataListRow label="Description" value={routeDetails.homepage.description} />
                <DataListRow label="Icon" value={routeDetails.homepage.icon} />
                <DataListRow label="URL" value={routeDetails.homepage.url} className="break-all" />
              </DataList>
            </CardContent>
          </Card>
        )}
      </div>
      {/* Rules */}
      {routeDetails.rules && routeDetails.rules.length > 0 && (
        <Card size="sm" className="px-2">
          <CardHeader>
            <CardTitle>Rules ({routeDetails.rules.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {routeDetails.rules.map((rule, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="font-medium text-sm mb-2">{rule.name}</div>
                  <div className="grid grid-cols-[110px_1fr] gap-x-2 gap-y-1 items-center">
                    <div className="text-xs text-muted-foreground">Action</div>
                    <Code className="w-full">{rule.do}</Code>
                    <div className="text-xs text-muted-foreground">Condition</div>
                    <Code className="w-full">{rule.on}</Code>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Path Patterns */}
      {routeDetails.path_patterns && routeDetails.path_patterns.length > 0 && (
        <Card size="sm" className="px-2">
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
        <Card size="sm" className="px-2">
          <CardHeader>
            <CardTitle>Docker Container</CardTitle>
          </CardHeader>
          <CardContent>
            <DataList>
              <DataListRow label="Name" value={routeDetails.container.container_name} />
              <DataListRow label="Docker Host" value={routeDetails.container.docker_cfg.url} />
              <DataListRow label="Image" value={routeDetails.container.image.name} />
              <DataListRow
                label="Container ID"
                value={routeDetails.container.container_id.slice(0, 12)}
              />
              <DataListRow label="Network" value={routeDetails.container.network} />
              <DataListRow label="Public Hostname" value={routeDetails.container.public_hostname} />
              <DataListRow
                label="Private Hostname"
                value={routeDetails.container.private_hostname}
              />
              <DataListRow
                label="Container Excluded"
                value={routeDetails.container.is_excluded ? 'Yes' : 'No'}
              />
            </DataList>

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
                <DataList>
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
                <DataList>
                  {Object.entries(routeDetails.container.mounts).map(([source, destination]) => (
                    <DataListRow
                      key={source}
                      label={source}
                      value={destination}
                      seperator={<IconArrowRight className="size-4" />}
                    />
                  ))}
                </DataList>
              ) : (
                <div className="text-sm text-muted-foreground mt-1">No mounts</div>
              )}
            </div>

            {routeDetails.container.errors && (
              <div>
                <Title>Errors</Title>
                <div className="text-sm text-error">{routeDetails.container.errors}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {/* Load Balancer */}
      {routeDetails.load_balance && (
        <Card size="sm" className="px-2">
          <CardHeader>
            <CardTitle>Load Balancer</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeMirror
              className="mt-1"
              value={stringifyYAML(routeDetails.load_balance)}
              extensions={[yaml()]}
            />
          </CardContent>
        </Card>
      )}
      {/* Middlewares */}
      {routeDetails.middlewares && Object.keys(routeDetails.middlewares).length > 0 && (
        <Card size="sm" className="px-2">
          <CardHeader>
            <CardTitle>Middlewares</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeMirror value={stringifyYAML(routeDetails.middlewares)} extensions={[yaml()]} />
          </CardContent>
        </Card>
      )}
      {/* Additional Configuration */}
      {(routeDetails.access_log || routeDetails.idlewatcher) && (
        <Card size="sm" className="px-2">
          <CardHeader>
            <CardTitle>Additional Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            {routeDetails.access_log && (
              <div>
                <Title>Access Log</Title>
                <CodeMirror
                  className="mt-1"
                  value={stringifyYAML(routeDetails.access_log)}
                  extensions={[yaml()]}
                />
              </div>
            )}

            {routeDetails.idlewatcher && (
              <div>
                <Title>Idle Watcher</Title>
                <CodeMirror
                  className="mt-1"
                  value={stringifyYAML(formatIdlewatcher(routeDetails.idlewatcher))}
                  extensions={[yaml()]}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function formatIdlewatcher(idlewatcher: IdlewatcherConfig) {
  return {
    ...idlewatcher,
    idle_timeout: formatGoDuration(idlewatcher.idle_timeout),
    wake_timeout: formatGoDuration(idlewatcher.wake_timeout),
    stop_timeout: formatGoDuration(idlewatcher.stop_timeout),
  }
}

function Title({ children }: { children: React.ReactNode }) {
  return <Label className="text-muted-foreground">{children}</Label>
}
