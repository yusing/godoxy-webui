import { TanStackDevtools } from '@tanstack/react-devtools'
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import Titlebar from '@/components/layout/Titlebar'
import TitlebarController from '@/components/layout/TitlebarController'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import { siteConfig } from '@/site-config'
import docsCss from '../docs.css?url'
import appCss from '../styles.css?url'

if (import.meta.env.DEV) {
  import('react-scan').then(({ scan }) => scan())
}

export const Route = createRootRoute({
  loader({ location }) {
    return { css: location.pathname.startsWith('/docs') ? docsCss : appCss }
  },
  head: ({ loaderData }) => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        name: 'apple-mobile-web-app-title',
        content: siteConfig.metadata.title,
      },
      { title: siteConfig.metadata.title },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: loaderData?.css ?? appCss,
      },
      {
        rel: 'apple-touch-icon',
        href: '/apple-icon.png',
      },
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <main>
            <Titlebar />
            <TitlebarController />
            <div id="main-content"> {children} </div>
            <Toaster position="top-right" richColors closeButton theme="system" />
          </main>
        </ThemeProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
