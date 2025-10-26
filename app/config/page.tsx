import ConfigContent from '@/components/config_editor/ConfigContent'
import ConfigFilesListProvider from '@/components/config_editor/ConfigFilesListProvider'
import ConfigStateSyncronizer from '@/components/config_editor/ConfigStateSyncronizer'
import ConfigValidationError from '@/components/config_editor/ConfigValidationError'
import ConfigYAMLEditor from '@/components/config_editor/ConfigYAMLEditor'
import ConfigSidebar from '@/components/config_editor/Sidebar'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarInset } from '@/components/ui/sidebar'

export default function ConfigPage() {
  return (
    <>
      <ConfigFilesListProvider />
      <ConfigStateSyncronizer />
      <ConfigSidebar />
      <SidebarInset>
        <div className="w-full h-full px-4 grid grid-cols-2 xl:grid-cols-[3fr_2fr] gap-4 py-2">
          <div className="overflow-y-hidden">
            <ScrollArea className="h-full">
              <ConfigContent className="min-w-fit max-w-[50vw]" />
            </ScrollArea>
          </div>
          {/* 3/5 */}
          <Card className="flex flex-col h-full overflow-hidden">
            <CardHeader className="shrink-0">
              <CardTitle>YAML Editor</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-hidden">
              <ConfigYAMLEditor className="ring-1 ring-inset ring-border rounded-md" />
            </CardContent>
            <CardFooter className="shrink-0">
              <ConfigValidationError />
            </CardFooter>
          </Card>
          {/* 2/5 */}
        </div>
      </SidebarInset>
    </>
  )
}
