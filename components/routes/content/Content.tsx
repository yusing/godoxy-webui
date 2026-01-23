import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import DockerStatsProvider from '@/components/routes/DockerStatsProvider'
import RoutePageHeader from './Header'
import RouteResponseTimeChart from './ResponseTimeChart'
import RouteDetails from './RouteDetails'

export default function RoutePageContent() {
  return (
    <div className="content p-4 space-y-4 flex-1">
      <DockerStatsProvider />
      <RoutePageHeader />
      <Card>
        <CardHeader>
          <CardTitle>Response Time</CardTitle>
          <CardDescription>
            The average response time of the route over the last hour.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RouteResponseTimeChart />
        </CardContent>
      </Card>
      <RouteDetails />
    </div>
  )
}
