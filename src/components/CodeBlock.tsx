import { createHighlighter } from 'shiki'
import { stringify as stringifyYAML } from 'yaml'
import { useTheme } from './ThemeProvider'
import '@/styles/shiki.css'

const blockRulesShikiHighlighter = await createHighlighter({
  themes: ['ayu-dark', 'ayu-light'],
  langs: ['yaml', 'html', 'json', 'plaintext'],
})

function highlightShiki(
  value: string,
  lang: 'yaml' | 'html' | 'json' | 'plaintext' | (string & {}),
  resolvedTheme: 'dark' | 'light'
) {
  return blockRulesShikiHighlighter.codeToHtml(value, {
    lang,
    theme: resolvedTheme === 'dark' ? 'ayu-dark' : 'ayu-light',
  })
}

type CodeBlockProps = {
  value: unknown
  lang: 'yaml' | 'html' | 'json' | 'plaintext' | (string & {})
  highlighter?: (value: string) => string
  textWrap?: boolean
}

export function CodeBlock({ value, lang, highlighter, textWrap = true }: CodeBlockProps) {
  const { resolvedTheme } = useTheme()

  const valueString =
    typeof value === 'string'
      ? value
      : lang === 'yaml'
        ? stringifyYAML(value)
        : lang === 'json'
          ? JSON.stringify(value, null, 2)
          : lang === 'plaintext'
            ? String(value)
            : undefined

  if (!valueString) {
    throw new Error('Invalid value or language')
  }

  return (
    <div
      style={{ '--shiki-white-space': textWrap ? 'pre-wrap' : 'pre' } as React.CSSProperties}
      className="max-w-full text-sm"
      dangerouslySetInnerHTML={{
        __html: highlighter
          ? highlighter(valueString)
          : highlightShiki(valueString, lang, resolvedTheme),
      }}
    />
  )
}
