import { registerSW } from 'virtual:pwa-register'
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import Titlebar from '@/components/layout/Titlebar'
import TitlebarController from '@/components/layout/TitlebarController'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import { siteConfig } from '@/site-config'
import '@fontsource/geist'
import '@fontsource/geist-mono'
import appCss from '../styles.css?url'

if (import.meta.env.DEV) {
  import('react-scan').then(({ scan }) => scan())
}

export const Route = createRootRoute({
  head: () => ({
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
        href: appCss,
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
        href: '/manifest.webmanifest',
      },
    ],
  }),
  component: RootLayout,
})

registerSW({ immediate: true })

function RootLayout() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <Titlebar />
          <TitlebarController />
          <main id="main-content">
            <Outlet />
            <Toaster position="top-right" richColors closeButton theme="system" />
          </main>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
