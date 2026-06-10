import { docs } from 'fumadocs-mdx:collections/server'
import { loader, multiple } from 'fumadocs-core/source'
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons'
import { openapiPlugin, openapiSource } from 'fumadocs-openapi/server'
import { openapi } from '@/lib/wiki/openapi'

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader(
  multiple({
    docs: docs.toFumadocsSource(),
    openapi: await openapiSource(openapi, {
      baseDir: 'openapi/(generated)',
    }),
  }),
  {
    baseUrl: '/docs',
    plugins: [lucideIconsPlugin(), openapiPlugin()],
  }
)

export async function getLLMText(page: (typeof source)['$inferPage']) {
  if (page.data.type === 'openapi') {
    return JSON.stringify(page.data.getSchema().bundled, null, 2)
  }

  return page.data.getText('processed')
}
