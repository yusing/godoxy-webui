import { expect, test } from 'bun:test'
import { createOpenAPI, openapiSource } from 'fumadocs-openapi/server'
import { renderToReadableStream } from 'react-dom/server'
import { APIPage } from './APIPage'

test('renders an OpenAPI operation after its page props cross the server boundary', async () => {
  const server = createOpenAPI({
    input: {
      example: {
        openapi: '3.1.0',
        info: { title: 'Example API', version: '1.0.0' },
        paths: {
          '/example': {
            post: {
              summary: 'Create an example',
              requestBody: {
                content: {
                  'application/yaml': { schema: { type: 'string' }, example: 'name: example' },
                },
              },
              responses: { '200': { description: 'Example created' } },
            },
          },
        },
      },
    },
  })
  const source = await openapiSource(server)
  const page = source.files.find(file => file.type === 'page')
  if (!page || page.type !== 'page') throw new Error('OpenAPI operation page is missing')

  const props = JSON.parse(JSON.stringify(page.data.getOpenAPIPageProps()))
  const stream = await renderToReadableStream(<APIPage {...props} />)
  const html = await new Response(stream).text()

  expect(html).toContain('/example')
  expect(html).toContain('POST')
  expect(html).toContain('Send')
  expect(html).toContain('curl -X POST')
  expect(html).toContain('application/yaml')
})
