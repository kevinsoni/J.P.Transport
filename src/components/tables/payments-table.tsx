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
import { Payment } from '@/types/db'
import { deletePayment } from '@/app/(dashboard)/payments/actions'

type PaymentWithTrip = Payment & {
  trip: {
    lr_no: string | null
    trip_date: string
    center_city: string | null
    consignor: { name: string } | null
    consignee1: { name: string } | null
    truck: { truck_no: string } | null
  } | null
}

interface PaymentsTableProps {
  payments: PaymentWithTrip[]
  filters?: {
    dateFrom: string
    dateTo: string
    method: string
    minAmount: string
    maxAmount: string
    truckNo: string
  }
}

const methodStyles: Record<string, { badge: string; dot: string }> = {
  CASH: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500' },
  UPI: { badge: 'bg-blue-50 text-blue-700 ring-blue-600/20', dot: 'bg-blue-500' },
  BANK: { badge: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20', dot: 'bg-indigo-500' },
  OTHER: { badge: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-500' },
}

export function PaymentsTable({ payments, filters }: PaymentsTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' ? { key, direction: 'desc' } : null
      }
      return { key, direction: 'asc' }
    })
  }

  const filteredPayments = useMemo(() => {
    if (!filters) return payments

    return payments.filter(payment => {
      const paymentDate = new Date(payment.payment_date)
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null

      if (fromDate && paymentDate < fromDate) return false
      if (toDate && paymentDate > toDate) return false
      if (filters.method && filters.method !== 'ALL' && payment.method !== filters.method) return false
      if (filters.minAmount && payment.amount < parseFloat(filters.minAmount)) return false
      if (filters.maxAmount && payment.amount > parseFloat(filters.maxAmount)) return false
      if (filters.truckNo && !payment.trip?.truck?.truck_no?.toLowerCase().includes(filters.truckNo.toLowerCase())) return false

      return true
    })
  }, [payments, filters])

  const sortedPayments = useMemo(() => {
    if (!sortConfig) return filteredPayments

    return [...filteredPayments].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortConfig.key) {
        case 'date':
          aValue = new Date(a.payment_date)
          bValue = new Date(b.payment_date)
          break
        case 'amount':
          aValue = a.amount
          bValue = b.amount
          break
        case 'method':
          aValue = a.method
          bValue = b.method
          break
        case 'reference':
          aValue = a.reference_no || ''
          bValue = b.reference_no || ''
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
  }, [filteredPayments, sortConfig])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  if (sortedPayments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No payments recorded yet.</p>
        <Link href="/payments/new">
          <Button className="mt-4">Add First Payment</Button>
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
            <SortableTableHeader sortKey="date" currentSort={sortConfig} onSort={handleSort}>
              Date
            </SortableTableHeader>
            <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Trip</TableHead>
            <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Center</TableHead>
            <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Consignee</TableHead>
            <SortableTableHeader sortKey="amount" align="right" currentSort={sortConfig} onSort={handleSort}>
              Amount
            </SortableTableHeader>
            <SortableTableHeader sortKey="method" currentSort={sortConfig} onSort={handleSort}>
              Method
            </SortableTableHeader>
            <TableHead className="h-12 w-[120px] px-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPayments.map((payment, index) => {
            const trip = payment.trip
            const style = methodStyles[payment.method] ?? { badge: 'bg-gray-100 text-gray-600 ring-gray-500/20', dot: 'bg-gray-400' }
            return (
              <TableRow key={payment.id} className="group border-b border-gray-100 transition-colors hover:bg-blue-50/40">
                <TableCell className="px-4 py-3 text-center">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 transition-colors group-hover:bg-blue-100 group-hover:text-blue-700">
                    {index + 1}
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900">
                  {formatDate(payment.payment_date)}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">{trip?.lr_no || 'N/A'}</span>
                    <span className="font-mono text-xs text-gray-500">{trip?.truck?.truck_no || 'N/A'}</span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-700">{trip?.center_city || 'N/A'}</TableCell>
                <TableCell className="px-4 py-3 text-gray-700">{trip?.consignee1?.name || 'N/A'}</TableCell>
                <TableCell className="px-4 py-3 text-right font-bold tabular-nums text-emerald-600">
                  {formatCurrency(payment.amount)}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset', style.badge)}>
                    <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
                    {payment.method}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <RowActions
                    viewHref={`/payments/${payment.id}`}
                    editHref={`/payments/${payment.id}/edit`}
                    itemName={`Payment ${payment.reference_no || payment.id}`}
                    itemType="payment"
                    onDelete={async () => {
                      try {
                        await deletePayment(payment.id)
                      } catch (error) {
                        console.error('Error deleting payment:', error)
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
