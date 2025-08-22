// import { AuthProvider } from '@/hooks/auth'
import { siteConfig } from '@/site-config'

import Titlebar from '@/components/layout/Titlebar'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/hooks/auth'
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
    <html lang="en">
      {process.env.NODE_ENV === 'development' && (
        <head>
          <script
            crossOrigin="anonymous"
            src="https://unpkg.com/react-scan/dist/auto.global.js"
          ></script>
        </head>
      )}
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" storageKey="ui-theme" enableSystem>
          <main className="min-h-screen overflow-x-hidden">
            <AuthProvider />
            <Titlebar />
            <div className="container mx-auto px-4 py-16 space-y-6 flex-1">{children}</div>
            <Toaster position="top-right" richColors closeButton theme="system" />
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
