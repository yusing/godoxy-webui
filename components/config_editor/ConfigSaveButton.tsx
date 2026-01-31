import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { IconCheck, IconDeviceFloppy, IconLoader2 } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { configStore, resetDiffs } from './store'

export default function ConfigSaveButton(props: React.ComponentProps<typeof Button>) {
  const activeFile = configStore.activeFile.use()
  const content = configStore.content.use()

  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = () => {
    if (content) {
      setIsSaving(true)
      api.file
        .set(activeFile, content)
        .catch(toastError)
        .finally(() => {
          setIsSaving(false)
          setIsSaved(true)
          resetDiffs()
        })
    }
  }

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (isSaved) {
      timeout = setTimeout(() => setIsSaved(false), 2000)
    }
    return () => timeout && clearTimeout(timeout)
  }, [isSaved])

  return (
    <Button {...props} onClick={handleSave} disabled={isSaving}>
      {isSaving ? (
        <IconLoader2 className="animate-spin" />
      ) : isSaved ? (
        <IconCheck className="text-green-500 animate-in fade-in-0 duration-1000" />
      ) : (
        <>
          <IconDeviceFloppy />
        </>
      )}
    </Button>
  )
}
