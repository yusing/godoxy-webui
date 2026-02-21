import { createFileRoute } from '@tanstack/react-router'
import AppEditDialog from '@/components/home/AppEditDialog'
import AppGrid from '@/components/home/AppsGrid'
import { EventsList, EventsWatcher } from '@/components/home/EventList'
import SystemStats from '@/components/home/SystemStats'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="h-screen fixed inset-0">
      <EventsWatcher />
      <div className="sm:mx-auto h-full min-h-0 p-2 sm:p-4 overflow-hidden">
        <div className="relative flex h-full min-h-0 flex-col gap-2 sm:gap-5 mt-(--titlebar-height)">
          <SystemStats />
          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-12 gap-2">
            <div className="min-h-0 md:col-span-9 lg:col-span-8 px-1 pb-28 lg:pb-0">
              <AppGrid />
            </div>
            <div className="min-h-0 hidden lg:block md:col-span-3 lg:col-span-4">
              <EventsList />
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-1/2 z-20 w-[calc(100%-1rem)] max-w-xl -translate-x-1/2 lg:hidden">
        <EventsList mobileDrawer />
      </div>
      <AppEditDialog />
    </div>
  )
}
