import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SidebarTrigger } from '../ui/sidebar'
import { ConfigHeaderProvider } from './ConfigHeaderActions'
import { sectionsByFileType } from './sections'
import { configStore } from './store'

export default function ConfigContent({ className }: { className?: string }) {
  const activeFile = configStore.activeFile.use()
  const activeSection = configStore.activeSection.use()

  const [headerActionsEl, setHeaderActionsEl] = useState<HTMLDivElement | null>(null)
  const [headerTitleEl, setHeaderTitleEl] = useState<HTMLSpanElement | null>(null)
  const [isTitleOverridden, setIsTitleOverridden] = useState(false)

  const section =
    sectionsByFileType[activeFile.type].sections.find(section => section.id === activeSection) ??
    sectionsByFileType[activeFile.type].sections[0]!
  const preloadedSections = sectionsByFileType[activeFile.type].sections.filter(
    section => 'preload' in section && section.preload
  )

  const label = section.label

  const Content = section.Content
  const shouldPreload = 'preload' in section && section.preload

  return (
    <div className={cn('relative px-1', className)}>
      <header className="py-2 pr-1 flex justify-between sticky top-0 gap-1">
        <div className="flex items-center gap-1">
          <SidebarTrigger className="size-8" />
          <h1 className="text-xl font-bold mr-auto flex items-center gap-2">
            <span ref={setHeaderTitleEl} className="inline-flex items-center gap-2" />
            {isTitleOverridden ? null : <span>{label}</span>}
          </h1>
        </div>
        <div ref={setHeaderActionsEl} className="flex items-center gap-1" />
      </header>

      <ConfigHeaderProvider
        actionsTarget={headerActionsEl}
        titleTarget={headerTitleEl}
        setTitleOverride={setIsTitleOverridden}
      >
        {preloadedSections.map(section => {
          return (
            <div key={section.id} hidden={section.id !== activeSection}>
              <section.Content isActive={section.id === activeSection} />
            </div>
          )
        })}
        {!shouldPreload && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeFile.type}-${activeFile.filename}-${activeSection}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.25 }}
            >
              <Content isActive={activeSection === section.id} />
            </motion.div>
          </AnimatePresence>
        )}
      </ConfigHeaderProvider>
    </div>
  )
}
