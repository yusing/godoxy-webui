import DockerStatsProvider from '@/components/routes/content/DockerStatsProvider'
import RoutePageHeader from './Header'
import ProxmoxStatsProvider from './ProxmoxStatsProvider'
import RouteDetails from './RouteDetails'
import RoutesDetailProvider from './RoutesDetailProvider'

export default function RoutePageContent() {
  return (
    <div className="h-full overflow-y-auto scrollbar-hidden p-4 space-y-4 flex-1">
      <DockerStatsProvider />
      <ProxmoxStatsProvider />
      <RoutesDetailProvider />
      <RoutePageHeader />
      <RouteDetails />
    </div>
  )
}
