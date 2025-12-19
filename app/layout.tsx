import ReactScan from '@/components/ReactScan'

import Titlebar from '@/components/layout/Titlebar'
import TitlebarController from '@/components/layout/TitlebarController'
import { siteConfig } from '@/site-config'
import { ThemeProvider } from 'next-themes'
import { Geist, Geist_Mono } from 'next/font/google'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata = siteConfig.metadata

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={geistSans.variable}>
      <ReactScan />
      <head>
        <meta name="apple-mobile-web-app-title" content="GoDoxy" />
      </head>
      <body className={`${geistMono.variable} antialiased`}>
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
