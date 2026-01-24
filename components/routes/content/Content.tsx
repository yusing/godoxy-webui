import DockerStatsProvider from '@/components/routes/content/DockerStatsProvider'
import RoutePageHeader from './Header'
import RouteDetails from './RouteDetails'
import RoutesDetailProvider from './RoutesDetailProvider'

export default function RoutePageContent() {
  return (
    <div className="content p-4 space-y-4 flex-1">
      <DockerStatsProvider />
      <RoutesDetailProvider />
      <RoutePageHeader />
      <RouteDetails />
    </div>
  )
}
