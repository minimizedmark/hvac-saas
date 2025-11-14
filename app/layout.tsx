import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HVAC Flow - Service Management',
  description: 'SaaS platform for HVAC service providers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/fonts/local-google-fonts.css" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
