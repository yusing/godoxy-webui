'use client'

import type { FileType } from '@/lib/api'
import { cn } from '@/lib/utils'
import { ChevronRight, File } from 'lucide-react'
import { useEffect } from 'react'
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
import { sectionsByFileType } from './sections'
import { configStore } from './store'
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
              <AddFilePopoverButton />
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
  const files = configStore.files.use()!
  const activeFile = configStore.activeFile.use()

  return (
    <>
      {Object.entries(files).map(([type, list]) => (
        <CommandGroup key={type} heading={fileTypeLabels[type as FileType].label}>
          {list.map(file => {
            const isActive = activeFile?.filename === file.filename && activeFile?.type === type
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
                className={cn(isActive && 'bg-sidebar-accent text-sidebar-accent-foreground')}
              >
                <File className="w-4 h-4 mr-2 flex-shrink-0" />
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
  const activeFile = configStore.activeFile.use()!
  const [activeSection, setActiveSection] = configStore.activeSection.useState()

  const { label, sections } = sectionsByFileType[activeFile.type]

  // if current section is not in sections, set it to the first section
  useEffect(() => {
    if (!sections.some(section => section.id === activeSection)) {
      setActiveSection(sections[0]!.id)
    }
  }, [activeSection, sections, setActiveSection])

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
                    isActive && 'bg-sidebar-accent text-sidebar-accent-foreground'
                  )}
                  onClick={() => setActiveSection(section.id)}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{section.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
