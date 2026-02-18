import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import AllSystemInfoProvider from '@/components/servers/AllSystemInfoProvider'
import ServerContent from '@/components/servers/content/Content'
import ServersSidebar from '@/components/servers/Sidebar'
import '@/stats_bar.css'

export const Route = createFileRoute('/servers')({
  component: ServersPage,
})

function ServersPage() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background dark:bg-[color-mix(in_oklab,var(--background)_78%,black)] xl:flex-row">
      <ServersSidebar />
      <ServerContent />
      <Suspense>
        <AllSystemInfoProvider />
      </Suspense>
    </div>
  )
}
