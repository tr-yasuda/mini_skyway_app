'use client'

import './globals.css'

import React from 'react'
import { HomeHeader } from '@/app/HomeHeader'
import { MantineProvider } from '@mantine/core'

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <title>Mini Skyway App</title>
      </head>
      <body>
        <MantineProvider>
          <HomeHeader />
          {children}
        </MantineProvider>
      </body>
    </html>
  )
}
