'use client'

import ConfigContent from '@/components/config_editor/ConfigContent'
import ConfigFilesListProvider from '@/components/config_editor/ConfigFilesListProvider'
import ConfigStateSyncronizer from '@/components/config_editor/ConfigStateSyncronizer'
import ConfigYAMLEditor from '@/components/config_editor/ConfigYAMLEditor'
import ConfigSidebar from '@/components/config_editor/Sidebar'
import { configStore } from '@/components/config_editor/store'
import { GoDoxyErrorText } from '@/components/GoDoxyError'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SidebarInset } from '@/components/ui/sidebar'
import { AlertCircleIcon, CheckCircle2Icon } from 'lucide-react'

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
            <CardHeader className="flex-shrink-0">
              <CardTitle>YAML Editor</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-hidden w-full h-full">
              <ConfigYAMLEditor className="min-w-[500px] border rounded-md w-full h-full" />
            </CardContent>
            <CardFooter className="flex-shrink-0">
              <ConfigValidationError />
            </CardFooter>
          </Card>
          {/* 2/5 */}
        </div>
      </SidebarInset>
    </>
  )
}

function ConfigValidationError() {
  const error = configStore.validateError.use()
  if (!error)
    return (
      <Alert variant="success">
        <CheckCircle2Icon />
        <AlertTitle>Valid</AlertTitle>
        <AlertDescription>The configuration is valid.</AlertDescription>
      </Alert>
    )
  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="-ml-12 max-h-[150px] overflow-y-auto overflow-x-hidden">
        {error && <GoDoxyErrorText err={error} />}
      </AlertDescription>
    </Alert>
  )
}
