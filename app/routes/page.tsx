import RoutePageContent from '@/components/routes/content/Content'
import RoutesSidebar from '@/components/routes/Sidebar'

export default function RoutesPage() {
  return (
    <div className="flex">
      <RoutesSidebar />
      <RoutePageContent />
    </div>
  )
}
