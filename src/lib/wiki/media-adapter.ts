import type { MediaAdapter } from 'fumadocs-openapi'
import { stringify as stringifyYAML } from 'yaml'

function encodeYAML({ body }: { body: unknown }): string {
  return typeof body === 'string' ? body : stringifyYAML(body)
}

export const mediaAdapters = {
  'application/yaml': {
    encode: encodeYAML,
    generateExample: (data, ctx) => {
      const body = JSON.stringify(encodeYAML(data))
      if (ctx.lang === 'js') return `const body = ${body}`
      if (ctx.lang === 'python') return `body = ${body}`
      if (ctx.lang === 'go' && 'addImport' in ctx) {
        ctx.addImport('strings')
        return `body := strings.NewReader(${body})`
      }
      return undefined
    },
  },
} satisfies Record<string, MediaAdapter>
