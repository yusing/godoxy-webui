import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { CheckCircle2Icon, Loader2, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { configStore } from './store'

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
        <Loader2 className="animate-spin" />
      ) : isSaved ? (
        <CheckCircle2Icon className="text-green-500 animate-in fade-in-0 duration-1000" />
      ) : (
        <>
          <Save />
        </>
      )}
    </Button>
  )
}
