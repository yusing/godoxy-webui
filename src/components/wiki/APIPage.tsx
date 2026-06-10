import { createClientAPIPage } from 'fumadocs-openapi/ui/create-client'
import { mediaAdapters } from '@/lib/wiki/media-adapter'

export const APIPage = createClientAPIPage({
  shikiOptions: {
    themes: {
      dark: 'vesper',
      light: 'vitesse-light',
    },
  },
  mediaAdapters,
})
