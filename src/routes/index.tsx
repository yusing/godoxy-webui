import { createFileRoute } from '@tanstack/react-router'
import AppEditDialog from '@/components/home/AppEditDialog'
import AppGrid from '@/components/home/AppsGrid'
import { EventsList } from '@/components/home/EventList'
import SystemStats from '@/components/home/SystemStats'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="h-screen absolute inset-0">
      <div className="mx-auto h-full min-h-0 px-4 py-2 sm:py-4 overflow-hidden bg-linear-to-br from-primary/10 via-card/50 to-secondary/10">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(closest-side,oklch(var(--primary)/0.18),transparent)] opacity-40" />
        <div className="relative flex h-full min-h-0 flex-col gap-5 mt-(--titlebar-height)">
          <SystemStats />
          <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-12 gap-2">
            <div className="min-h-0 xl:col-span-9 overflow-y-auto pr-1">
              <AppGrid />
            </div>
            <div className="min-h-0 xl:col-span-3">
              <EventsList />
            </div>
          </div>
        </div>
      </div>
      <AppEditDialog />
    </div>
  )
}
