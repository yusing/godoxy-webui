import { createFileRoute } from '@tanstack/react-router'
import ConfigContent from '@/components/config_editor/ConfigContent'
import ConfigFilesListProvider from '@/components/config_editor/ConfigFilesListProvider'
import ConfigStateSyncronizer from '@/components/config_editor/ConfigStateSyncronizer'
import ConfigValidationError from '@/components/config_editor/ConfigValidationError'
import ConfigYAMLEditor from '@/components/config_editor/ConfigYAMLEditor'
import ConfigSidebar from '@/components/config_editor/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export const Route = createFileRoute('/config')({
  component: ConfigPage,
})

function ConfigPage() {
  return (
    <SidebarProvider>
      <ConfigFilesListProvider />
      <ConfigStateSyncronizer />
      <ConfigSidebar />
      <SidebarInset>
        <div className="w-full h-full px-4 grid grid-cols-2 xl:grid-cols-[3fr_2fr] gap-1">
          <ConfigContent className="w-[3/5] h-full pb-4 pr-2 overflow-y-auto" />
          {/* 3/5 */}
          <Card className="w-[2/5] bg-transparent flex flex-col h-full overflow-hidden rounded-none border-0 border-l">
            <CardHeader className="shrink-0">
              <CardTitle>YAML Editor</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-hidden">
              <ConfigYAMLEditor className="ring-1 ring-inset ring-border" />
            </CardContent>
            <div data-slot="card-footer" className="border-t">
              <ConfigValidationError className="border-none rounded-none!" />
            </div>
          </Card>
          {/* 2/5 */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
