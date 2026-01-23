import DockerStatsProvider from '@/components/routes/DockerStatsProvider'
import RoutePageHeader from './Header'
import RouteDetails from './RouteDetails'

export default function RoutePageContent() {
  return (
    <div className="content p-4 space-y-4 flex-1">
      <DockerStatsProvider />
      <RoutePageHeader />
      <RouteDetails />
    </div>
  )
}
