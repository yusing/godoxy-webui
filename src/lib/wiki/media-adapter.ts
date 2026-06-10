import type { MediaAdapter } from 'fumadocs-openapi'
import { stringify as stringifyYAML } from 'yaml'

export const mediaAdapters = {
  'application/yaml': {
    encode: data => stringifyYAML(data),
    generateExample: (data, ctx) => {
      if (ctx.lang === 'js') {
        return `const body = \`${stringifyYAML(data.body)}\``
      }
      if (ctx.lang === 'python') {
        return `body = """${stringifyYAML(data.body)}"""`
      }
      if (ctx.lang === 'go' && 'addImport' in ctx) {
        ctx.addImport('strings')
        return `body := strings.NewReader(\`${stringifyYAML(data.body)}\`)`
      }
      return undefined
    },
  },
} satisfies Record<string, MediaAdapter>
