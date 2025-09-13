import type { FileType } from '@/lib/api'
import { Plus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '../ui/button'
import { Input, InputAddon } from '../ui/input'
import { Label } from '../ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Separator } from '../ui/separator'
import { sectionsByFileType } from './sections'
import { configStore } from './store'
import { fileTypeLabels } from './types'

export default function AddFilePopoverButton() {
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<{ type: FileType; filename: string }>({
    defaultValues: {
      type: 'provider',
      filename: '',
    },
    mode: 'all',
  })

  const handleAddFile = useCallback(({ type, filename }: { type: FileType; filename: string }) => {
    configStore.files[type].sortedInsert((a, b) => a.filename.localeCompare(b.filename), {
      type,
      filename: `${filename}.yml`,
      isNewFile: true,
    })

    const hasTypeChanged = configStore.activeFile.value?.type !== type
    configStore.activeFile.set({
      type,
      filename: `${filename}.yml`,
      isNewFile: true,
    })

    // if the type has changed, set the active section to the first section of the new type
    if (hasTypeChanged) {
      configStore.activeSection.set(sectionsByFileType[type].sections[0]!.id)
    }

    setIsOpen(false)
  }, [])

  // Validation functions
  const validateFilename = useCallback((value: string, formValues: { type: FileType }) => {
    if (!value || value.trim().length === 0) {
      return 'Cannot be empty'
    }

    const trimmedValue = value.trim()
    const fullFilename = `${trimmedValue}.yml`

    // Check for invalid characters
    if (!/^[a-zA-Z0-9\-_]+$/.test(trimmedValue)) {
      return 'Can only contain letters, numbers, hyphens, and underscores'
    }

    // Check if filename already exists for this type
    const existingFiles = configStore.files.value?.[formValues.type] || []
    if (existingFiles.some(file => file.filename === fullFilename)) {
      return 'File already exists'
    }

    return true
  }, [])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Plus className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleAddFile)}>
          <div className="space-y-3">
            <Label className="text-xs">File Type</Label>
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <RadioGroup {...field}>
                  {Object.entries(fileTypeLabels)
                    .slice(1)
                    .map(([type, { label, icon: Icon }]) => (
                      <div key={type} className="flex items-center gap-2">
                        <RadioGroupItem value={type} id={type} />
                        <Icon className="size-4" />
                        <Label htmlFor={type}>{label}</Label>
                      </div>
                    ))}
                </RadioGroup>
              )}
            />
          </div>
          <Separator />
          <div className="space-y-3">
            <Label className="text-xs">File Name</Label>
            <div className="relative">
              <Input
                autoFocus
                className="pe-[5ch]"
                placeholder="File name"
                {...form.register('filename', {
                  required: 'File name is required',
                  validate: validateFilename,
                })}
              />
              <InputAddon>.yml</InputAddon>
            </div>
            {form.formState.errors.filename && (
              <p className="text-xs text-error">{form.formState.errors.filename.message}</p>
            )}
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
