import { IconCopy } from '@tabler/icons-react'
import ReactCodeMirror, { type Extension, type ReactCodeMirrorProps } from '@uiw/react-codemirror'
import { memo, useCallback } from 'react'
import { toast } from 'sonner'
import { coolGlow, noctisLilac } from 'thememirror'
import { useTheme } from '@/components/ThemeProvider'
import { cn } from '@/lib/utils'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

export const CodeMirror = memo(
  ({
    className,
    value,
    setValue,
    readOnly = true,
    extensions,
    language,
    ...props
  }: {
    className?: string
    value: string
    setValue?: (value: string) => void
    readOnly?: boolean
    extensions?: Extension[]
    language?: string
  } & Omit<ReactCodeMirrorProps, 'value' | 'onChange'>) => {
    const { resolvedTheme } = useTheme()

    const handleCopy = useCallback(async () => {
      try {
        await navigator.clipboard.writeText(value)
        toast.success('Copied to clipboard')
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }, [value])

    return (
      <div
        className={cn(
          'block relative py-1 min-h-[100px]',
          className,
          'max-w-full max-h-full overflow-auto'
        )}
      >
        <style>
          {`
        .cm-gutters,
        .cm-editor {
          background-color: transparent !important;
        }
        .cm-scroller {
          overflow-x: unset !important;
        }
        `}
        </style>
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
          {language && <Badge variant="outline">{language.toUpperCase()}</Badge>}
          <Button
            size="icon"
            type="button"
            onClick={handleCopy}
            aria-label="Copy code"
            variant="ghost"
            className="size-6"
          >
            <IconCopy className="size-3" />
          </Button>
        </div>
        <ReactCodeMirror
          value={value}
          onChange={setValue}
          readOnly={readOnly}
          theme={resolvedTheme === 'light' ? noctisLilac : coolGlow}
          extensions={extensions}
          basicSetup={!readOnly}
          height="100%"
          style={{ fontWeight: '550' }}
          {...props}
        />
      </div>
    )
  }
)

CodeMirror.displayName = 'CodeMirror'
