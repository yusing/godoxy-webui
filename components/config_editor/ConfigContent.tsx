import { api } from '@/lib/api-client'
import { toastError } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { CheckCircle2Icon, Loader2, RefreshCcw, Save } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import LoadingRing from '../LoadingRing'
import { Button } from '../ui/button'
import { SidebarTrigger } from '../ui/sidebar'
import { sectionsByFileType } from './sections'
import { configStore } from './store'

export default function ConfigContent({ className }: { className?: string }) {
  const activeFile = configStore.useValue('activeFile')!
  const activeSection = configStore.useValue('activeSection')
  const isLoading = configStore.useValue('isLoading')

  const section =
    sectionsByFileType[activeFile.type].sections.find(section => section.id === activeSection) ??
    sectionsByFileType[activeFile.type].sections[0]!
  const label = section.label

  const Content = section.Content

  return (
    <div className={cn('relative', className)}>
      <header className="py-2 pr-1 flex items-start justify-between sticky top-0">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="text-2xl font-bold">{label}</h1>
        </div>
        <div className="flex items-center gap-2">
          <ConfigReloadButton />
          <ConfigSaveButton />
        </div>
      </header>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeFile.type}-${activeFile.filename}-${activeSection}`}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 6 }}
          transition={{ duration: 0.25 }}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <LoadingRing />
            </div>
          ) : Content ? (
            <Content />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <span className="text-center text-muted-foreground">No content</span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function ConfigReloadButton() {
  const [activeFile, setActiveFile] = configStore.use('activeFile')

  const handleReload = () => {
    setActiveFile(activeFile)
  }

  return (
    <Button onClick={handleReload} variant={'outline'}>
      <RefreshCcw />
      Reload File
    </Button>
  )
}

function ConfigSaveButton() {
  const activeFile = configStore.useValue('activeFile')!
  const content = configStore.useValue('content')

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
    <Button onClick={handleSave} disabled={isSaving}>
      {isSaving ? (
        <Loader2 className="animate-spin" />
      ) : isSaved ? (
        <CheckCircle2Icon className="text-green-500 animate-in fade-in-0 duration-1000" />
      ) : (
        <>
          <Save />
          Save File
        </>
      )}
    </Button>
  )
}
