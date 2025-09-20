import { yamlSchemaHover } from 'codemirror-json-schema/yaml'

import type { JSONSchema } from '@/types/schema'
import { yaml } from '@codemirror/lang-yaml'
import { linter } from '@codemirror/lint'
import ReactCodeMirror, { hoverTooltip, type ReactCodeMirrorProps } from '@uiw/react-codemirror'
import { stateExtensions } from 'codemirror-json-schema'
import { yamlSchemaLinter } from 'codemirror-json-schema/yaml'
import { useTheme } from 'next-themes'
import { coolGlow, noctisLilac } from 'thememirror'

const css = `
.cm-gutters,
.cm-editor {
  background-color: transparent !important;
}
.cm-scroller {
  overflow: auto !important;
}
`
export type YAMLEditorProps = {
  schema?: JSONSchema
  onChange: (value: string) => void
} & ReactCodeMirrorProps

export default function YAMLEditor({
  schema,
  value,
  onChange,
  className,
  ...props
}: YAMLEditorProps) {
  const { theme: nextTheme } = useTheme()
  const theme = nextTheme === 'light' ? noctisLilac : coolGlow

  return (
    <>
      <style>{css}</style>
      <ReactCodeMirror
        extensions={[yaml(), ...yamlSchemaExtensions(schema)]}
        theme={theme}
        autoFocus
        basicSetup
        value={value}
        onChange={onChange}
        className={className}
        height="100%"
        {...props}
      />
    </>
  )
}

function yamlSchemaExtensions(schema: unknown) {
  return [
    linter(yamlSchemaLinter(), {
      delay: 200,
    }),
    hoverTooltip(yamlSchemaHover()),
    stateExtensions(schema as Parameters<typeof stateExtensions>[0]),
  ]
}
