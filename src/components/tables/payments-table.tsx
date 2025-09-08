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
import { Payment, PaymentMethod } from '@/types/db'
import { deletePayment } from '@/app/(dashboard)/payments/actions'

type PaymentWithTrip = Payment & {
  trip: {
    lr_no: string | null
    invoice_no: string | null
    trip_date: string
    origin_city: string | null
    destination_city: string | null
    consignor: { name: string }[] | null
    truck: { truck_no: string }[] | null
  }[] | null
}

interface PaymentsTableProps {
  payments: PaymentWithTrip[]
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' ? { key, direction: 'desc' } : null
      }
      return { key, direction: 'asc' }
    })
  }

  const sortedPayments = useMemo(() => {
    if (!sortConfig) return payments

    return [...payments].sort((a, b) => {
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
  }, [payments, sortConfig])
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

  const getMethodBadgeVariant = (method: PaymentMethod) => {
    switch (method) {
      case 'CASH':
        return 'secondary' as const
      case 'UPI':
        return 'default' as const
      case 'BANK':
        return 'outline' as const
      case 'OTHER':
        return 'destructive' as const
      default:
        return 'secondary' as const
    }
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">Sr No.</TableHead>
            <SortableTableHeader sortKey="date" currentSort={sortConfig} onSort={handleSort}>
              Date
            </SortableTableHeader>
            <TableHead>Trip</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Consignor</TableHead>
            <SortableTableHeader sortKey="amount" currentSort={sortConfig} onSort={handleSort}>
              Amount
            </SortableTableHeader>
            <SortableTableHeader sortKey="method" currentSort={sortConfig} onSort={handleSort}>
              Method
            </SortableTableHeader>
            <SortableTableHeader sortKey="reference" currentSort={sortConfig} onSort={handleSort}>
              Reference
            </SortableTableHeader>
            <TableHead>Notes</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPayments.map((payment, index) => {
            const trip = payment.trip
            return (
              <TableRow key={payment.id}>
                <TableCell className="text-center text-sm text-gray-600">
                  {index + 1}
                </TableCell>
                <TableCell className="font-medium">
                  {formatDate(payment.payment_date)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {trip?.lr_no || trip?.invoice_no || 'N/A'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(trip?.truck as any)?.truck_no || 'N/A'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {trip?.origin_city && trip?.destination_city
                      ? `${trip.origin_city} → ${trip.destination_city}`
                      : 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {(trip?.consignor as any)?.name || 'N/A'}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(payment.amount)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={getMethodBadgeVariant(payment.method)}>
                    {payment.method}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono">
                    {payment.reference_no || '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {payment.notes || '-'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/payments/${payment.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/payments/${payment.id}/edit`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    <DeleteConfirmationDialog 
                      itemName={`Payment ${payment.reference_no || payment.id}`}
                      itemType="payment"
                      onConfirm={async () => {
                        try {
                          await deletePayment(payment.id)
                        } catch (error) {
                          console.error('Error deleting payment:', error)
                        }
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}