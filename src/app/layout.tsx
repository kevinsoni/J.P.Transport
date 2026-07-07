import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NavigationProgress } from '@/components/ui/navigation-progress'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'J.P. Transport Management',
  description: 'Comprehensive transport management system for truck operations, trips, and payments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavigationProgress />
        {children}
      </body>
    </html>
  )
}