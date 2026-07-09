'use client'

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { TableHead } from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface SortableTableHeaderProps {
  children: React.ReactNode
  sortKey: string
  currentSort: { key: string; direction: 'asc' | 'desc' } | null
  onSort: (key: string) => void
  className?: string
  align?: 'left' | 'right'
}

export function SortableTableHeader({
  children,
  sortKey,
  currentSort,
  onSort,
  className = '',
  align = 'left',
}: SortableTableHeaderProps) {
  const isActive = currentSort?.key === sortKey
  const direction = isActive ? currentSort.direction : null

  return (
    <TableHead className={cn('h-12 px-4', className)}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          'group inline-flex w-full cursor-pointer select-none items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors',
          align === 'right' ? 'justify-end' : 'justify-start',
          isActive ? 'text-blue-700' : 'text-gray-500 hover:text-gray-800'
        )}
      >
        <span>{children}</span>
        <span
          className={cn(
            'shrink-0 transition-opacity',
            isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'
          )}
        >
          {isActive ? (
            direction === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5" />
            )
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5" />
          )}
        </span>
      </button>
    </TableHead>
  )
}
