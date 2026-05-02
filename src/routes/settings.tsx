import { createFileRoute } from '@tanstack/react-router'
import { useLayoutEffect } from 'react'
import ConfigFilesListProvider from '@/components/config_editor/ConfigFilesListProvider'
import ConfigStateSyncronizer from '@/components/config_editor/ConfigStateSyncronizer'
import { configStore } from '@/components/config_editor/store'
import WebUiSettings from '@/components/settings/WebUiSettings'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  useLayoutEffect(() => {
    const cur = configStore.activeFile.value
    if (cur.type !== 'config' || cur.filename !== 'config.yml') {
      configStore.activeFile.set({ type: 'config', filename: 'config.yml' })
    }
  }, [])

  return (
    <>
      <ConfigFilesListProvider />
      <ConfigStateSyncronizer />
      <div className="h-full min-h-0 overflow-y-auto scrollbar-default">
        <WebUiSettings />
      </div>
    </>
  )
}
