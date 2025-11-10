import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HVAC Flow - HVAC Service Management',
  description: 'SaaS platform for HVAC service providers with AI-powered automation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
