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
import { Party } from '@/types/db'
import { deleteParty } from '@/app/(dashboard)/parties/actions'

interface PartiesTableProps {
  parties: Party[]
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
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'consignor':
        return 'default' as const
      case 'consignee':
        return 'secondary' as const
      case 'owner':
        return 'outline' as const
      case 'transport':
        return 'destructive' as const
      default:
        return 'secondary' as const
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'consignor':
        return 'Consignor'
      case 'consignee':
        return 'Consignee'
      case 'owner':
        return 'Owner'
      case 'transport':
        return 'Transport'
      default:
        return type
    }
  }

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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">Sr No.</TableHead>
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
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedParties.map((party, index) => (
            <TableRow key={party.id}>
              <TableCell className="text-center text-sm text-gray-600">
                {index + 1}
              </TableCell>
              <TableCell className="font-medium">{party.name}</TableCell>
              <TableCell>
                <Badge variant={getTypeBadgeVariant(party.type)}>
                  {getTypeLabel(party.type)}
                </Badge>
              </TableCell>
              <TableCell>{party.phone || '-'}</TableCell>
              <TableCell>{party.email || '-'}</TableCell>
              <TableCell className="font-mono text-sm">{party.gstin || '-'}</TableCell>
              <TableCell>{party.city || '-'}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/parties/${party.id}`}>
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/parties/${party.id}/edit`}>
                      <Edit className="w-4 h-4" />
                    </Link>
                  </Button>
                  <DeleteConfirmationDialog 
                    itemName={party.name}
                    itemType="party"
                    onConfirm={async () => {
                      try {
                        await deleteParty(party.id)
                      } catch (error) {
                        console.error('Error deleting party:', error)
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