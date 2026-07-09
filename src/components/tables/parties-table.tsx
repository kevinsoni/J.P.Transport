'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { SortableTableHeader } from '@/components/ui/sortable-table-header'
import { RowActions } from '@/components/tables/row-actions'
import { cn } from '@/lib/utils'
import { Party } from '@/types/db'
import { deleteParty } from '@/app/(dashboard)/parties/actions'

interface PartiesTableProps {
  parties: Party[]
}

const typeStyles: Record<string, { label: string; badge: string; dot: string }> = {
  consignor: { label: 'Consignor', badge: 'bg-blue-50 text-blue-700 ring-blue-600/20', dot: 'bg-blue-500' },
  consignee: { label: 'Consignee', badge: 'bg-purple-50 text-purple-700 ring-purple-600/20', dot: 'bg-purple-500' },
  owner: { label: 'Owner', badge: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-500' },
  transport: { label: 'Transport', badge: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20', dot: 'bg-indigo-500' },
}

export function PartiesTable({ parties }: PartiesTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' ? { key, direction: 'desc' } : null
      }
      return { key, direction: 'asc' }
    })
  }

  const sortedParties = useMemo(() => {
    if (!sortConfig) return parties

    return [...parties].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortConfig.key) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'type':
          aValue = a.type
          bValue = b.type
          break
        case 'phone':
          aValue = a.phone || ''
          bValue = b.phone || ''
          break
        case 'email':
          aValue = a.email || ''
          bValue = b.email || ''
          break
        case 'gstin':
          aValue = a.gstin || ''
          bValue = b.gstin || ''
          break
        case 'city':
          aValue = a.city || ''
          bValue = b.city || ''
          break
        default:
          return 0
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [parties, sortConfig])

  if (sortedParties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No parties found.</p>
        <Link href="/parties/new">
          <Button className="mt-4">Add First Party</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200 bg-gray-50/80 hover:bg-gray-50/80">
            <TableHead className="h-12 w-[64px] px-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">#</TableHead>
            <SortableTableHeader sortKey="name" currentSort={sortConfig} onSort={handleSort}>
              Name
            </SortableTableHeader>
            <SortableTableHeader sortKey="type" currentSort={sortConfig} onSort={handleSort}>
              Type
            </SortableTableHeader>
            <SortableTableHeader sortKey="phone" currentSort={sortConfig} onSort={handleSort}>
              Phone
            </SortableTableHeader>
            <SortableTableHeader sortKey="email" currentSort={sortConfig} onSort={handleSort}>
              Email
            </SortableTableHeader>
            <SortableTableHeader sortKey="gstin" currentSort={sortConfig} onSort={handleSort}>
              GSTIN
            </SortableTableHeader>
            <SortableTableHeader sortKey="city" currentSort={sortConfig} onSort={handleSort}>
              City
            </SortableTableHeader>
            <TableHead className="h-12 w-[120px] px-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedParties.map((party, index) => {
            const style = typeStyles[party.type] ?? { label: party.type, badge: 'bg-gray-100 text-gray-600 ring-gray-500/20', dot: 'bg-gray-400' }
            return (
              <TableRow key={party.id} className="group border-b border-gray-100 transition-colors hover:bg-blue-50/40">
                <TableCell className="px-4 py-3 text-center">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 transition-colors group-hover:bg-blue-100 group-hover:text-blue-700">
                    {index + 1}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 font-medium text-gray-900">{party.name}</TableCell>
                <TableCell className="px-4 py-3">
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset', style.badge)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
                    {style.label}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700">{party.phone || '-'}</TableCell>
                <TableCell className="px-4 py-3 text-gray-700">{party.email || '-'}</TableCell>
                <TableCell className="px-4 py-3 font-mono text-sm text-gray-600">{party.gstin || '-'}</TableCell>
                <TableCell className="px-4 py-3 text-gray-700">{party.city || '-'}</TableCell>
                <TableCell className="px-4 py-3">
                  <RowActions
                    viewHref={`/parties/${party.id}`}
                    editHref={`/parties/${party.id}/edit`}
                    itemName={party.name}
                    itemType="party"
                    onDelete={async () => {
                      try {
                        await deleteParty(party.id)
                      } catch (error) {
                        console.error('Error deleting party:', error)
                      }
                    }}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
