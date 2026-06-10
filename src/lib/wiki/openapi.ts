import { resolve } from 'node:path'
import { createOpenAPI } from 'fumadocs-openapi/server'

export const openapi = createOpenAPI({
  input: [resolve('./wiki/public/api.json')],
})
