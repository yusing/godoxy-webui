import { Check, Loader2, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import type { ConfigFile } from '@/types/file'
import { Button } from '../ui/button'
import { configStore, markConfigFileSaved } from './store'

function isSameConfigFile(left: ConfigFile, right: ConfigFile) {
  return left.type === right.type && left.filename === right.filename
}

export default function ConfigSaveButton(props: React.ComponentProps<typeof Button>) {
  const activeFile = configStore.activeFile.use()
  const content = configStore.content.use()

  const [savingFile, setSavingFile] = useState<ConfigFile>()
  const [savedFile, setSavedFile] = useState<ConfigFile>()

  const handleSave = async () => {
    if (!content) return

    const savedConfig = configStore.configObject.value
    setSavedFile(undefined)
    setSavingFile(activeFile)
    try {
      await api.file.set(activeFile, content)
      markConfigFileSaved(activeFile, savedConfig)
      setSavedFile(activeFile)
    } catch (error) {
      setSavedFile(undefined)
      toastError(error)
    } finally {
      setSavingFile(undefined)
    }
  }

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (savedFile) {
      timeout = setTimeout(() => setSavedFile(undefined), 2000)
    }
    return () => timeout && clearTimeout(timeout)
  }, [savedFile])

  const isSavingActiveFile = savingFile !== undefined && isSameConfigFile(savingFile, activeFile)
  const isActiveFileSaved = savedFile !== undefined && isSameConfigFile(savedFile, activeFile)

  return (
    <Button {...props} onClick={handleSave} disabled={savingFile !== undefined}>
      {isSavingActiveFile ? (
        <Loader2 className="animate-spin" />
      ) : isActiveFileSaved ? (
        <Check className="text-green-500 animate-in fade-in-0 duration-1000" />
      ) : (
        <Save />
      )}
    </Button>
  )
}
