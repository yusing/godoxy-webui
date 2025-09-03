import ReactScan from '@/components/ReactScan'

import Titlebar from '@/components/layout/Titlebar'
import TitlebarController from '@/components/layout/TitlebarController'
import { siteConfig } from '@/site-config'
import '@fontsource/cascadia-code'
import { ThemeProvider } from 'next-themes'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata = siteConfig.metadata

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ReactScan />
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" storageKey="ui-theme" enableSystem>
          <Titlebar />
          <TitlebarController />
          <main id="main-content">
            {children}
            <Toaster position="top-right" richColors closeButton theme="system" />
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
