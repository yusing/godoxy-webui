import { StoreFormInputField } from '@/components/store/Input'
import { StoreFormRadioField } from '@/components/store/Radio'
import type { FileType } from '@/lib/api'
import { IconPlus } from '@tabler/icons-react'
import { useForm, type FormStore } from 'juststore'
import { useState } from 'react'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Separator } from '../ui/separator'
import { sectionsByFileType } from './sections'
import { configStore } from './store'
import { fileTypeLabels } from './types'

type FormValues = {
  type: FileType
  filename: string
}

// Validation functions
function validateFilename(value: string | undefined, state: FormStore<FormValues>) {
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
  const existingFiles = configStore.files[state.type.value].value || []
  if (existingFiles.some(file => file.filename === fullFilename)) {
    return 'File already exists'
  }

  return undefined
}

export default function AddFilePopoverButton(props: React.ComponentProps<typeof Button>) {
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<FormValues>(
    {
      type: 'provider',
      filename: '',
    },
    {
      filename: {
        validate: validateFilename,
      },
    }
  )

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger render={<Button {...props} />}>
        <IconPlus />
      </PopoverTrigger>
      <PopoverContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(value => {
            handleAddFile(value)
            setIsOpen(false)
          })}
        >
          <StoreFormRadioField
            state={form.type}
            title="File Type"
            orientation="vertical"
            options={Object.values(fileTypeLabels).slice(1)} // exclude GoDoxy config type, config.yml is always created
            labelProps={{ className: 'text-xs' }}
          />
          <Separator />
          <StoreFormInputField
            autoFocus
            state={form.filename}
            title="File name"
            placeholder="my-provider"
            labelProps={{ className: 'text-xs' }}
            addons={[
              {
                align: 'inline-end',
                children: '.yml',
              },
            ]}
          />
        </form>
      </PopoverContent>
    </Popover>
  )
}

function handleAddFile({ type, filename }: FormValues) {
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
}
