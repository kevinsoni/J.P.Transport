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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SortableTableHeader } from '@/components/ui/sortable-table-header'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import { Eye, Edit } from 'lucide-react'
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

  const getStatusBadgeVariant = (active: boolean) => {
    return active ? 'default' : 'secondary'
  }

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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">Sr No.</TableHead>
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
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTrucks.map((truck, index) => (
            <TableRow key={truck.id}>
              <TableCell className="text-center text-sm text-gray-600">
                {index + 1}
              </TableCell>
              <TableCell className="font-medium">{truck.truck_no}</TableCell>
              <TableCell>{truck.owner?.name || 'No Owner'}</TableCell>
              <TableCell>
                {truck.capacity_tons ? `${truck.capacity_tons} tons` : '-'}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(truck.active)}>
                  {truck.active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/trucks/${truck.id}`}>
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/trucks/${truck.id}/edit`}>
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                  <DeleteConfirmationDialog 
                    itemName={truck.truck_no}
                    itemType="truck"
                    onConfirm={async () => {
                      try {
                        await deleteTruck(truck.id)
                      } catch (error) {
                        console.error('Error deleting truck:', error)
                      }
                    }}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}