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
import { PaymentPopup } from '@/components/forms/payment-popup'
import type { TripWithRelations } from '@/types/db'
import { exportTripsToCSV } from '@/lib/csv'
import { deleteTrip } from '@/app/(dashboard)/trips/actions'

interface TripsTableProps {
  trips: TripWithRelations[]
  loading?: boolean
  selectedTrip?: TripWithRelations | null
  setSelectedTrip?: (trip: TripWithRelations | null) => void
  isPaymentPopupOpen?: boolean
  setIsPaymentPopupOpen?: (open: boolean) => void
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

export function TripsTable({ 
  trips, 
  loading = false, 
  selectedTrip: externalSelectedTrip, 
  setSelectedTrip: externalSetSelectedTrip, 
  isPaymentPopupOpen: externalIsPaymentPopupOpen, 
  setIsPaymentPopupOpen: externalSetIsPaymentPopupOpen 
}: TripsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  
  // Use external state if provided, otherwise use internal state
  const selectedTrip = externalSelectedTrip ?? null
  const setSelectedTrip = externalSetSelectedTrip ?? (() => {})
  const isPaymentPopupOpen = externalIsPaymentPopupOpen ?? false
  const setIsPaymentPopupOpen = externalSetIsPaymentPopupOpen ?? (() => {})
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

        case 'center':
          aValue = a.center_city || ''
          bValue = b.center_city || ''
          break
        case 'lr':
          aValue = a.lr_no || ''
          bValue = b.lr_no || ''
          break
        case 'weight':
          aValue = a.payment_weight || 0
          bValue = b.payment_weight || 0
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
    <div className="space-y-6">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedTrips.length)} of {sortedTrips.length} trips
          </span>
          <div className="h-4 w-px bg-gray-300"></div>
          <span className="text-xs text-gray-500">
            {Math.ceil(sortedTrips.length / itemsPerPage)} pages total
          </span>
        </div>
        
        <Button onClick={handleExport} variant="outline" size="sm" className="border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4 px-4">
        {paginatedTrips.map((trip, index) => (
          <div key={trip.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">
                  {startIndex + index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{formatDate(trip.trip_date)}</div>
                  <div className="text-sm text-gray-500">{trip.truck?.truck_no}</div>
                </div>
              </div>
              <Badge className={`${getPaymentStatusColor(trip.payment_status)} px-3 py-1 text-xs font-semibold rounded-full`}>
                {trip.payment_status}
              </Badge>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Center:</span>
                <span className="font-medium">{trip.center_city || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">L/R No:</span>
                <span className="font-medium">{trip.lr_no || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Consignee:</span>
                <span className="font-medium">{trip.consignee1?.name || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Weight:</span>
                <span className="font-medium">{trip.payment_weight ? `${trip.payment_weight} MT` : '-'}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-xs text-gray-500">Bill Amount</div>
                <div className="font-bold text-gray-900">{formatCurrency(trip.total_amount)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Received</div>
                <div className="font-bold text-green-600">{formatCurrency(trip.amount_received)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Balance</div>
                <div className="font-bold text-red-600">{formatCurrency(trip.balance_due)}</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" asChild className="hover:bg-blue-50 hover:text-blue-600">
                  <Link href={`/trips/${trip.id}`}>
                    <Eye className="w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild className="hover:bg-green-50 hover:text-green-600">
                  <Link href={`/trips/${trip.id}/edit`}>
                    <Edit className="w-4 h-4" />
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hover:bg-purple-50 hover:text-purple-600"
                  onClick={() => {
                    setSelectedTrip(trip)
                    setIsPaymentPopupOpen(true)
                  }}
                >
                  <CreditCard className="w-4 h-4" />
                </Button>
              </div>
              <DeleteConfirmationDialog 
                itemName={`Trip ${trip.lr_no || trip.id}`}
                itemType="trip"
                onConfirm={async () => {
                  try {
                    await deleteTrip(trip.id)
                  } catch (error) {
                    console.error('Error deleting trip:', error)
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden">
        <Table>
          <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100/80 sticky top-0">
            <TableRow className="border-b-2 border-gray-200/60">
              <TableHead className="w-[60px] font-bold text-gray-800 text-center">Sr No.</TableHead>
              <SortableTableHeader sortKey="date" currentSort={sortConfig} onSort={handleSort}>
                Date
              </SortableTableHeader>
              <SortableTableHeader sortKey="truck" currentSort={sortConfig} onSort={handleSort}>
                Truck No.
              </SortableTableHeader>

              <SortableTableHeader sortKey="center" currentSort={sortConfig} onSort={handleSort}>
                Center
              </SortableTableHeader>
              <SortableTableHeader sortKey="lr" currentSort={sortConfig} onSort={handleSort}>
                L/R No.
              </SortableTableHeader>
              <SortableTableHeader sortKey="consignee" currentSort={sortConfig} onSort={handleSort}>
                Consignee
              </SortableTableHeader>
              <SortableTableHeader sortKey="weight" currentSort={sortConfig} onSort={handleSort}>
                Weight
              </SortableTableHeader>
              <SortableTableHeader sortKey="total" currentSort={sortConfig} onSort={handleSort}>
                Bill Amount
              </SortableTableHeader>
              <SortableTableHeader sortKey="received" currentSort={sortConfig} onSort={handleSort}>
                Received
              </SortableTableHeader>
              <SortableTableHeader sortKey="balance" currentSort={sortConfig} onSort={handleSort}>
                Balance Due
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
                <TableCell colSpan={11} className="h-24 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <p className="text-gray-500">No trips found</p>
                    <Link href="/trips/new">
                      <Button size="sm">Create your first trip</Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTrips.map((trip, index) => (
                <TableRow key={trip.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50/30 transition-all duration-200 border-b border-gray-100/50 group">
                  <TableCell className="text-center text-sm font-medium text-gray-700">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 shadow-sm group-hover:shadow-md transition-shadow duration-200">
                      {startIndex + index + 1}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {formatDate(trip.trip_date)}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono font-medium text-gray-800">
                    <span className="bg-gray-100 px-2 py-1 rounded-md text-sm">
                      {trip.truck?.truck_no || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate font-medium text-gray-700">
                    {trip.center_city || '-'}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                      {trip.lr_no || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate font-medium text-gray-700">
                    {trip.consignee1?.name || '-'}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-800">
                    {trip.payment_weight ? (
                      <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded-md text-sm">
                        {trip.payment_weight} MT
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="font-bold text-gray-900">{formatCurrency(trip.total_amount)}</TableCell>
                  <TableCell className="font-bold text-green-600">{formatCurrency(trip.amount_received)}</TableCell>
                  <TableCell className="font-bold text-red-600">{formatCurrency(trip.balance_due)}</TableCell>
                  <TableCell>
                    <Badge className={`${getPaymentStatusColor(trip.payment_status)} px-3 py-1 text-xs font-bold rounded-full shadow-sm border-0`}>
                      {trip.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" asChild className="hover:bg-blue-50 hover:text-blue-600 hover:shadow-md transition-all duration-200 rounded-lg">
                        <Link href={`/trips/${trip.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="hover:bg-green-50 hover:text-green-600 hover:shadow-md transition-all duration-200 rounded-lg">
                        <Link href={`/trips/${trip.id}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-purple-50 hover:text-purple-600 hover:shadow-md transition-all duration-200 rounded-lg"
                        onClick={() => {
                          setSelectedTrip(trip)
                          setIsPaymentPopupOpen(true)
                        }}
                      >
                        <CreditCard className="w-4 h-4" />
                      </Button>
                      <DeleteConfirmationDialog 
                        itemName={`Trip ${trip.lr_no || trip.invoice_no || trip.id}`}
                        itemType="trip"
                        onConfirm={async () => {
                          try {
                            await deleteTrip(trip.id)
                          } catch (error) {
                            console.error('Error deleting trip:', error)
                          }
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
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-200/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1 ml-4">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full text-xs font-semibold transition-all duration-200 ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 transition-all duration-200"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

    </div>
  )
}