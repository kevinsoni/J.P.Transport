'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Eye,
  Edit,
  CreditCard,
  Download,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  PackageOpen
} from 'lucide-react'

import { cn, formatCurrency, formatDate } from '@/lib/utils'
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
import { deleteTrip } from '@/app/(dashboard)/trips/actions'

interface TripsTableProps {
  trips: TripWithRelations[]
  loading?: boolean
  selectedTrip?: TripWithRelations | null
  setSelectedTrip?: (trip: TripWithRelations | null) => void
  isPaymentPopupOpen?: boolean
  setIsPaymentPopupOpen?: (open: boolean) => void
  showFilters?: boolean
  onToggleFilters?: () => void
  activeFilterCount?: number
}

const paymentStyles: Record<string, { badge: string; dot: string }> = {
  PAID: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500' },
  PARTIAL: { badge: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-500' },
  UNPAID: { badge: 'bg-red-50 text-red-700 ring-red-600/20', dot: 'bg-red-500' },
}

function PaymentBadge({ status }: { status: string }) {
  const style = paymentStyles[status] ?? { badge: 'bg-gray-100 text-gray-600 ring-gray-500/20', dot: 'bg-gray-400' }
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset', style.badge)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
      {status}
    </span>
  )
}

export function TripsTable({
  trips,
  loading = false,
  setSelectedTrip: externalSetSelectedTrip,
  setIsPaymentPopupOpen: externalSetIsPaymentPopupOpen,
  showFilters = false,
  onToggleFilters,
  activeFilterCount = 0,
}: TripsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  // Use external state if provided, otherwise use internal state
  const setSelectedTrip = externalSetSelectedTrip ?? (() => {})
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
    // Export what the user is actually looking at (filtered + sorted), not the raw list.
    exportTripsToCSV(sortedTrips)
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-100 border-t-blue-600" />
      </div>
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">
            Showing {sortedTrips.length === 0 ? 0 : startIndex + 1}&ndash;{Math.min(startIndex + itemsPerPage, sortedTrips.length)}
            <span className="ml-1 font-normal text-gray-400">of {sortedTrips.length} trips</span>
          </span>
          {totalPages > 1 && (
            <>
              <span className="h-4 w-px bg-gray-200" />
              <span className="text-xs text-gray-400">{totalPages} pages</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onToggleFilters && (
            <Button
              onClick={onToggleFilters}
              variant="outline"
              size="sm"
              className={cn(
                'border-gray-200 text-gray-600 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700',
                showFilters && 'border-blue-300 bg-blue-50 text-blue-700'
              )}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Filters'}
              {activeFilterCount > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          )}
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="border-gray-200 text-gray-600 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block space-y-3 p-4 md:hidden">
        {paginatedTrips.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <PackageOpen className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">No trips found</p>
            <Link href="/trips/new">
              <Button size="sm">Create your first trip</Button>
            </Link>
          </div>
        ) : (
          paginatedTrips.map((trip, index) => (
            <div key={trip.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                    {startIndex + index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{formatDate(trip.trip_date)}</div>
                    <div className="font-mono text-xs text-gray-500">{trip.truck?.truck_no || '-'}</div>
                  </div>
                </div>
                <PaymentBadge status={trip.payment_status} />
              </div>

              <div className="mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Center</span>
                  <span className="font-medium text-gray-800">{trip.center_city || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">L/R No</span>
                  <span className="font-mono font-medium text-blue-700">{trip.lr_no || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Consignee</span>
                  <span className="font-medium text-gray-800">{trip.consignee1?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Weight</span>
                  <span className="font-medium text-gray-800">{trip.payment_weight ? `${trip.payment_weight} MT` : '-'}</span>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-3">
                <div className="text-center">
                  <div className="text-[11px] uppercase tracking-wide text-gray-400">Bill</div>
                  <div className="mt-0.5 text-sm font-bold text-gray-900">{formatCurrency(trip.total_amount)}</div>
                </div>
                <div className="text-center">
                  <div className="text-[11px] uppercase tracking-wide text-gray-400">Received</div>
                  <div className="mt-0.5 text-sm font-bold text-emerald-600">{formatCurrency(trip.amount_received)}</div>
                </div>
                <div className="text-center">
                  <div className="text-[11px] uppercase tracking-wide text-gray-400">Balance</div>
                  <div className={cn('mt-0.5 text-sm font-bold', trip.balance_due > 0 ? 'text-red-600' : 'text-gray-400')}>
                    {formatCurrency(trip.balance_due)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700" aria-label="View trip">
                    <Link href={`/trips/${trip.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700" aria-label="Edit trip">
                    <Link href={`/trips/${trip.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700"
                    aria-label="Record payment"
                    onClick={() => {
                      setSelectedTrip(trip)
                      setIsPaymentPopupOpen(true)
                    }}
                  >
                    <CreditCard className="h-4 w-4" />
                  </Button>
                </div>
                <DeleteConfirmationDialog
                  itemName={`Trip ${trip.lr_no || trip.id}`}
                  itemType="trip"
                  className="h-8 w-8 rounded-lg bg-red-50 p-0 text-red-600 hover:bg-red-100 hover:text-red-700"
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
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200 bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead className="h-12 w-[64px] px-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                #
              </TableHead>
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
              <SortableTableHeader sortKey="total" align="right" currentSort={sortConfig} onSort={handleSort}>
                Bill Amount
              </SortableTableHeader>
              <SortableTableHeader sortKey="received" align="right" currentSort={sortConfig} onSort={handleSort}>
                Received
              </SortableTableHeader>
              <SortableTableHeader sortKey="balance" align="right" currentSort={sortConfig} onSort={handleSort}>
                Balance Due
              </SortableTableHeader>
              <SortableTableHeader sortKey="payment" currentSort={sortConfig} onSort={handleSort}>
                Payment
              </SortableTableHeader>
              <TableHead className="h-12 w-[132px] px-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTrips.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={12} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <PackageOpen className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">No trips found</p>
                    <Link href="/trips/new">
                      <Button size="sm">Create your first trip</Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTrips.map((trip, index) => (
                <TableRow
                  key={trip.id}
                  className="group border-b border-gray-100 transition-colors hover:bg-blue-50/40"
                >
                  <TableCell className="px-4 py-3 text-center">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 transition-colors group-hover:bg-blue-100 group-hover:text-blue-700">
                      {startIndex + index + 1}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900">
                    {formatDate(trip.trip_date)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="inline-block rounded-md bg-gray-100 px-2 py-1 font-mono text-xs font-medium text-gray-700">
                      {trip.truck?.truck_no || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[140px] truncate px-4 py-3 font-medium text-gray-700">
                    {trip.center_city || '-'}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {trip.lr_no ? (
                      <span className="inline-block rounded-md bg-blue-50 px-2 py-1 font-mono text-xs font-medium text-blue-700">
                        {trip.lr_no}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate px-4 py-3 font-medium text-gray-800">
                    {trip.consignee1?.name || '-'}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    {trip.payment_weight ? (
                      <span className="inline-block rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                        {trip.payment_weight} MT
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right font-bold tabular-nums text-gray-900">
                    {formatCurrency(trip.total_amount)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right font-semibold tabular-nums text-emerald-600">
                    {formatCurrency(trip.amount_received)}
                  </TableCell>
                  <TableCell className={cn('px-4 py-3 text-right font-semibold tabular-nums', trip.balance_due > 0 ? 'text-red-600' : 'text-gray-400')}>
                    {formatCurrency(trip.balance_due)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <PaymentBadge status={trip.payment_status} />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700" aria-label="View trip" title="View">
                        <Link href={`/trips/${trip.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100 hover:text-emerald-700" aria-label="Edit trip" title="Edit">
                        <Link href={`/trips/${trip.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 transition-colors hover:bg-purple-100 hover:text-purple-700"
                        aria-label="Record payment"
                        title="Record payment"
                        onClick={() => {
                          setSelectedTrip(trip)
                          setIsPaymentPopupOpen(true)
                        }}
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                      <DeleteConfirmationDialog
                        itemName={`Trip ${trip.lr_no || trip.invoice_no || trip.id}`}
                        itemType="trip"
                        className="h-8 w-8 rounded-lg bg-red-50 p-0 text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
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
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="border-gray-200 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Window the 5 page buttons around the current page so pages 6+ are reachable.
              const windowStart = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
              const page = windowStart + i
              if (page > totalPages) return null
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'h-8 w-8 rounded-lg text-xs font-semibold transition-all duration-200',
                    currentPage === page
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {page}
                </button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="border-gray-200 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
