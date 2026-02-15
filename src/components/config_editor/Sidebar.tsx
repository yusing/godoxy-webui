import { IconChevronRight, IconFile } from '@tabler/icons-react'
import { useEffect, useMemo } from 'react'
import type { FileType } from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../ui/sidebar'
import AddFilePopoverButton from './AddFilePopoverButton'
import ConfigReloadButton from './ConfigReloadButton'
import ConfigSaveButton from './ConfigSaveButton'
import { sectionsByFileType } from './sections'
import { configStore, useDiffs } from './store'
import { fileTypeLabels } from './types'

export default function ConfigSidebar() {
  const sidebar = useSidebar()
  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col gap-2 justify-between">
        <Sections />
        {sidebar.state === 'expanded' && (
          <SidebarGroup className="flex-1 min-h-0">
            <div className="flex items-center gap-2 justify-between">
              <SidebarGroupLabel>Config Files</SidebarGroupLabel>
              <div className="flex items-center gap-2">
                <AddFilePopoverButton
                  aria-label="Add File"
                  title="Add File"
                  className="size-6"
                  variant="ghost"
                  size="icon"
                />
                <ConfigReloadButton
                  aria-label="Reload File"
                  title="Reload File"
                  className="size-6"
                  variant="ghost"
                  size="icon"
                />
                <ConfigSaveButton
                  aria-label="Save File"
                  title="Save File"
                  className="size-6 text-primary"
                  variant="ghost"
                  size="icon"
                />
              </div>
            </div>
            <SidebarGroupContent className="flex-1 min-h-0">
              <Command>
                <CommandInput placeholder="Search files..." />
                <CommandList className="max-h-none">
                  <CommandEmpty>No files found.</CommandEmpty>
                  <FileList />
                </CommandList>
              </Command>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}

function FileList() {
  const files = configStore.files.useCompute(files => Object.entries(files))
  const activeFile = configStore.activeFile.use()

  return (
    <>
      {files.map(([type, list]) => (
        <CommandGroup key={type} heading={fileTypeLabels[type as FileType].label}>
          {list.map(file => {
            const selected = activeFile?.filename === file.filename && activeFile?.type === type
            return (
              <CommandItem
                key={`${type}:${file.filename}`}
                value={`${type}:${file.filename}`}
                onSelect={() =>
                  configStore.activeFile.set({
                    type: type as FileType,
                    filename: file.filename,
                  })
                }
                className={cn('data-selected:bg-inherit', selected && 'text-info-foreground')}
                data-checked={selected ? 'true' : 'false'}
              >
                <IconFile className="size-4 shrink-0" />
                <span className="truncate">{file.filename}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>
      ))}
    </>
  )
}

function Sections() {
  const activeFile = configStore.activeFile.use()
  const activeSection = configStore.activeSection.use()

  const { label, sections } = sectionsByFileType[activeFile.type]

  // if current section is not in sections, set it to the first section
  useEffect(() => {
    if (!sections.some(section => section.id === activeSection)) {
      configStore.activeSection.set(sections[0]!.id)
    }
  }, [activeSection, sections])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent className="flex-1">
        <SidebarMenu>
          {sections.map(section => {
            const Icon = section.icon
            const isActive = activeSection === section.id

            return (
              <SidebarMenuItem key={section.id}>
                <SidebarMenuButton
                  className={cn(
                    'justify-between',
                    isActive && 'bg-sidebar-accent/90 text-sidebar-accent-foreground'
                  )}
                  onClick={() => configStore.activeSection.set(section.id)}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{section.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <UnsavedChangesIndicator isActive={isActive} diffPaths={section.diffPaths} />
                    {isActive && <IconChevronRight className="size-4 shrink-0" />}
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function UnsavedChangesIndicator({
  isActive,
  diffPaths,
}: {
  isActive: boolean
  diffPaths?: string[]
}) {
  const diffs = useDiffs()
  const hasDiff = useMemo(
    () => new Set(diffs).intersection(new Set(diffPaths)).size > 0,
    [diffs, diffPaths]
  )
  return hasDiff ? (
    <span
      className={cn('size-1.5 rounded-full bg-primary z-10', isActive && 'bg-info-foreground')}
    />
  ) : null
}
