import { createFileRoute } from '@tanstack/react-router'
import RoutePageContent from '@/components/routes/content/Content'
import RouteContentDialog from '@/components/routes/content/ContentDialog'
import RoutesSidebar from '@/components/routes/Sidebar'

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
    <div className="hidden md:flex">
      <RoutesSidebar className="max-w-[35vw] min-w-[354px]" />
      <RoutePageContent />
    </div>
  )
}

function RoutesPageMobile() {
  return (
    <div className="flex md:hidden">
      <RoutesSidebar className="flex-1" />
      <RouteContentDialog />
    </div>
  )
}
