import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import AllSystemInfoProvider from '@/components/servers/AllSystemInfoProvider'
import ServerContent from '@/components/servers/content/Content'
import ServersSidebar from '@/components/servers/Sidebar'

export const Route = createFileRoute('/servers')({
  component: ServersPage,
})

function ServersPage() {
  return (
    <div className="flex h-full">
      <ServersSidebar />
      <ServerContent />
      <Suspense>
        <AllSystemInfoProvider />
      </Suspense>
    </div>
  )
}
