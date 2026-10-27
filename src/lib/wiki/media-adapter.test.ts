import { expect, spyOn, test } from 'bun:test'
import { createBrowserFetcher } from 'fumadocs-openapi/playground'
import { encodeRequestData } from 'fumadocs-openapi/requests'
import { javascript } from 'fumadocs-openapi/requests/generators/javascript'
import { stringify as stringifyYAML } from 'yaml'
import { mediaAdapters as wikiAdapters } from '../../../wiki/src/lib/media-adapter'
import { mediaAdapters } from './media-adapter'

for (const [name, adapters] of Object.entries({ app: mediaAdapters, wiki: wikiAdapters })) {
  test(`${name} YAML playground and generated JavaScript preserve request bodies`, async () => {
    const fetchMock = spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok'))
    try {
      for (const body of [
        { alias: 'test`value', name: '${1 + 1}', host: 'example.com' },
        'demo:\n  host: example.com\n  quoted: \'"""`\\${1 + 1}\'\n',
      ]) {
        const expected = typeof body === 'string' ? body : stringifyYAML(body)
        const data = encodeRequestData(
          {
            method: 'post',
            body,
            bodyMediaType: 'application/yaml',
            path: {},
            query: {},
            header: {},
            cookie: {},
          },
          adapters
        )
        fetchMock.mockClear()
        fetchMock.mockResolvedValue(new Response('ok'))
        const result = await createBrowserFetcher(adapters).fetch('https://example.com/route', data)
        expect(result.type).toBe('response')
        expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(expected)
        expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get('Content-Type')).toBe(
          'application/yaml'
        )

        const source = javascript.generate(
          { ...data, url: 'https://example.com/route' },
          { mediaAdapters: adapters, custom: undefined }
        )
        let generatedBody: BodyInit | null | undefined
        new Function('fetch', source)((_url: string, init: RequestInit) => {
          generatedBody = init.body
        })
        expect(generatedBody).toBe(expected)
      }
    } finally {
      fetchMock.mockRestore()
    }
  })
}
