import { createFileRoute } from '@tanstack/react-router'
import RoutePageContent from '@/components/routes/content/Content'
import RouteContentDialog from '@/components/routes/content/ContentDialog'
import RoutesSidebar from '@/components/routes/Sidebar'
import '@/components/routes/style.css'

export const Route = createFileRoute('/routes')({
  component: RoutesPage,
})

function RoutesPage() {
  return (
    <>
      <RoutesPageDesktop />
      <RoutesPageMobile />
    </>
  )
}

function RoutesPageDesktop() {
  return (
    <div className="hidden md:grid routes-desktop-layout">
      <RoutesSidebar className="w-full h-full routes-sidebar-shell" />
      <div className="routes-workspace-shell h-full min-h-0 overflow-hidden">
        <RoutePageContent />
      </div>
    </div>
  )
}

function RoutesPageMobile() {
  return (
    <div className="flex md:hidden">
      <RoutesSidebar className="flex-1 routes-sidebar-shell" />
      <RouteContentDialog />
    </div>
  )
}
