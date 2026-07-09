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
import { Truck } from '@/types/db'
import { deleteTruck } from '@/app/(dashboard)/trucks/actions'

type TruckWithOwner = Truck & {
  owner: {
    name: string
  } | null
}

interface TrucksTableProps {
  trucks: TruckWithOwner[]
}

export function TrucksTable({ trucks }: TrucksTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' ? { key, direction: 'desc' } : null
      }
      return { key, direction: 'asc' }
    })
  }

  const sortedTrucks = useMemo(() => {
    if (!sortConfig) return trucks

    return [...trucks].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortConfig.key) {
        case 'truck_no':
          aValue = a.truck_no.toLowerCase()
          bValue = b.truck_no.toLowerCase()
          break
        case 'owner':
          aValue = a.owner?.name?.toLowerCase() || ''
          bValue = b.owner?.name?.toLowerCase() || ''
          break
        case 'capacity':
          aValue = a.capacity_tons || 0
          bValue = b.capacity_tons || 0
          break
        case 'status':
          aValue = a.active ? 'active' : 'inactive'
          bValue = b.active ? 'active' : 'inactive'
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
  }, [trucks, sortConfig])

  if (sortedTrucks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No trucks found.</p>
        <Link href="/trucks/new">
          <Button className="mt-4">Add First Truck</Button>
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
            <SortableTableHeader sortKey="truck_no" currentSort={sortConfig} onSort={handleSort}>
              Truck Number
            </SortableTableHeader>
            <SortableTableHeader sortKey="owner" currentSort={sortConfig} onSort={handleSort}>
              Owner
            </SortableTableHeader>
            <SortableTableHeader sortKey="capacity" currentSort={sortConfig} onSort={handleSort}>
              Capacity (Tons)
            </SortableTableHeader>
            <SortableTableHeader sortKey="status" currentSort={sortConfig} onSort={handleSort}>
              Status
            </SortableTableHeader>
            <TableHead className="h-12 w-[120px] px-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTrucks.map((truck, index) => (
            <TableRow key={truck.id} className="group border-b border-gray-100 transition-colors hover:bg-blue-50/40">
              <TableCell className="px-4 py-3 text-center">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 transition-colors group-hover:bg-blue-100 group-hover:text-blue-700">
                  {index + 1}
                </span>
              </TableCell>
              <TableCell className="px-4 py-3">
                <span className="inline-block rounded-md bg-gray-100 px-2 py-1 font-mono text-xs font-medium text-gray-700">
                  {truck.truck_no}
                </span>
              </TableCell>
              <TableCell className="px-4 py-3 font-medium text-gray-800">{truck.owner?.name || 'No Owner'}</TableCell>
              <TableCell className="px-4 py-3 text-gray-700">
                {truck.capacity_tons ? `${truck.capacity_tons} tons` : '-'}
              </TableCell>
              <TableCell className="px-4 py-3">
                <span className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset',
                  truck.active ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-gray-100 text-gray-500 ring-gray-500/20'
                )}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', truck.active ? 'bg-emerald-500' : 'bg-gray-400')} />
                  {truck.active ? 'Active' : 'Inactive'}
                </span>
              </TableCell>
              <TableCell className="px-4 py-3">
                <RowActions
                  viewHref={`/trucks/${truck.id}`}
                  editHref={`/trucks/${truck.id}/edit`}
                  itemName={truck.truck_no}
                  itemType="truck"
                  onDelete={async () => {
                    try {
                      await deleteTruck(truck.id)
                    } catch (error) {
                      console.error('Error deleting truck:', error)
                    }
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
