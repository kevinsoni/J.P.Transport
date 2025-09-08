'use client'

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { TableHead } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

interface SortableTableHeaderProps {
  children: React.ReactNode
  sortKey: string
  currentSort: { key: string; direction: 'asc' | 'desc' } | null
  onSort: (key: string) => void
  className?: string
}

export function SortableTableHeader({
  children,
  sortKey,
  currentSort,
  onSort,
  className = ''
}: SortableTableHeaderProps) {
  const isActive = currentSort?.key === sortKey
  const direction = isActive ? currentSort.direction : null

  const getSortIcon = () => {
    if (!isActive) return <ArrowUpDown className="w-4 h-4" />
    return direction === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
  }

  return (
    <TableHead className={className}>
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 font-medium hover:bg-transparent justify-start"
        onClick={() => onSort(sortKey)}
      >
        {children}
        {getSortIcon()}
      </Button>
    </TableHead>
  )
}