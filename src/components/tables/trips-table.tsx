'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  CreditCard, 
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SortableTableHeader } from '@/components/ui/sortable-table-header'
import { DeleteConfirmationDialog } from '@/components/ui/delete-confirmation-dialog'
import type { TripWithRelations } from '@/types/db'
import { exportTripsToCSV } from '@/lib/csv'

interface TripsTableProps {
  trips: TripWithRelations[]
  loading?: boolean
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'bg-green-100 text-green-800'
    case 'IN': return 'bg-blue-100 text-blue-800'
    case 'OUT': return 'bg-orange-100 text-orange-800'
    case 'CANCELLED': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'PAID': return 'bg-green-100 text-green-800'
    case 'PARTIAL': return 'bg-yellow-100 text-yellow-800'
    case 'UNPAID': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export function TripsTable({ trips, loading = false }: TripsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const itemsPerPage = 20
  
  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' ? { key, direction: 'desc' } : null
      }
      return { key, direction: 'asc' }
    })
    setCurrentPage(1)
  }

  const sortedTrips = useMemo(() => {
    if (!sortConfig) return trips

    return [...trips].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortConfig.key) {
        case 'date':
          aValue = new Date(a.trip_date)
          bValue = new Date(b.trip_date)
          break
        case 'truck':
          aValue = a.truck?.truck_no || ''
          bValue = b.truck?.truck_no || ''
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'route':
          aValue = a.origin_city && a.destination_city 
            ? `${a.origin_city} → ${a.destination_city}`
            : a.center_city || ''
          bValue = b.origin_city && b.destination_city 
            ? `${b.origin_city} → ${b.destination_city}`
            : b.center_city || ''
          break
        case 'consignee':
          aValue = a.consignee1?.name || ''
          bValue = b.consignee1?.name || ''
          break
        case 'total':
          aValue = a.total_amount || 0
          bValue = b.total_amount || 0
          break
        case 'received':
          aValue = a.amount_received || 0
          bValue = b.amount_received || 0
          break
        case 'balance':
          aValue = a.balance_due || 0
          bValue = b.balance_due || 0
          break
        case 'payment':
          aValue = a.payment_status
          bValue = b.payment_status
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
  }, [trips, sortConfig])

  const totalPages = Math.ceil(sortedTrips.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTrips = sortedTrips.slice(startIndex, startIndex + itemsPerPage)

  const handleExport = () => {
    exportTripsToCSV(trips)
  }

  if (loading) {
    return (
      <div className="rounded-md border">
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedTrips.length)} of {sortedTrips.length} trips
          </span>
        </div>
        
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHeader sortKey="date" currentSort={sortConfig} onSort={handleSort}>
                Date
              </SortableTableHeader>
              <SortableTableHeader sortKey="truck" currentSort={sortConfig} onSort={handleSort}>
                Truck No.
              </SortableTableHeader>
              <SortableTableHeader sortKey="status" currentSort={sortConfig} onSort={handleSort}>
                Status
              </SortableTableHeader>
              <SortableTableHeader sortKey="route" currentSort={sortConfig} onSort={handleSort}>
                Route
              </SortableTableHeader>
              <SortableTableHeader sortKey="consignee" currentSort={sortConfig} onSort={handleSort}>
                Consignee
              </SortableTableHeader>
              <SortableTableHeader sortKey="total" currentSort={sortConfig} onSort={handleSort}>
                Total
              </SortableTableHeader>
              <SortableTableHeader sortKey="received" currentSort={sortConfig} onSort={handleSort}>
                Received
              </SortableTableHeader>
              <SortableTableHeader sortKey="balance" currentSort={sortConfig} onSort={handleSort}>
                Balance
              </SortableTableHeader>
              <SortableTableHeader sortKey="payment" currentSort={sortConfig} onSort={handleSort}>
                Payment
              </SortableTableHeader>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTrips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <p className="text-gray-500">No trips found</p>
                    <Link href="/trips/new">
                      <Button size="sm">Create your first trip</Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTrips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">
                    {formatDate(trip.trip_date)}
                  </TableCell>
                  <TableCell>{trip.truck?.truck_no || '-'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(trip.status)}>
                      {trip.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {trip.origin_city && trip.destination_city 
                      ? `${trip.origin_city} → ${trip.destination_city}`
                      : trip.center_city || '-'
                    }
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">
                    {trip.consignee1?.name || '-'}
                  </TableCell>
                  <TableCell>{formatCurrency(trip.total_amount)}</TableCell>
                  <TableCell>{formatCurrency(trip.amount_received)}</TableCell>
                  <TableCell>{formatCurrency(trip.balance_due)}</TableCell>
                  <TableCell>
                    <Badge className={getPaymentStatusColor(trip.payment_status)}>
                      {trip.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/trips/${trip.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/trips/${trip.id}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/payments/new?tripId=${trip.id}`}>
                          <CreditCard className="w-4 h-4" />
                        </Link>
                      </Button>
                      <DeleteConfirmationDialog 
                        itemName={`Trip ${trip.lr_no || trip.invoice_no || trip.id}`}
                        itemType="trip"
                        onConfirm={() => {
                          // TODO: Implement delete functionality
                          console.log('Delete trip:', trip.id)
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}