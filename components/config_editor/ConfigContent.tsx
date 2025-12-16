'use client'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { Suspense } from 'react'
import LoadingRing from '../LoadingRing'
import { SidebarTrigger } from '../ui/sidebar'
import { sectionsByFileType } from './sections'
import { configStore } from './store'

export default function ConfigContent({ className }: { className?: string }) {
  const activeFile = configStore.activeFile.use()
  const activeSection = configStore.activeSection.use()
  const isLoading = configStore.isLoading.use()

  const section =
    sectionsByFileType[activeFile.type].sections.find(section => section.id === activeSection) ??
    sectionsByFileType[activeFile.type].sections[0]!
  const label = section.label

  const Content = section.Content

  return (
    <div className={cn('relative', className)}>
      <header className="py-2 pr-1 flex items-start sticky top-0 gap-1">
        <SidebarTrigger className="size-8" />
        <h1 className="text-xl font-bold">{label}</h1>
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
            <LoadingContent />
          ) : Content ? (
            <Suspense fallback={<LoadingContent />}>
              <Content />
            </Suspense>
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

function LoadingContent() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <LoadingRing />
    </div>
  )
}
