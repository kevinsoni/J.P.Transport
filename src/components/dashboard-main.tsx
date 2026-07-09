'use client'

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { useSidebar } from '@/components/sidebar-context'

export function DashboardMain({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <div
      className={cn(
        'transition-[padding] duration-300 ease-in-out',
        // Padding follows the pinned collapse state only — hover-expansion
        // overlays the content instead of pushing it around.
        collapsed ? 'lg:pl-20' : 'lg:pl-64'
      )}
    >
      <main className="p-4 lg:p-8">{children}</main>
    </div>
  )
}
