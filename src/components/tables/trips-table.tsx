'use client'

import { useState } from 'react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  const itemsPerPage = 20
  
  const totalPages = Math.ceil(trips.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTrips = trips.slice(startIndex, startIndex + itemsPerPage)

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
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, trips.length)} of {trips.length} trips
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
              <TableHead>Date</TableHead>
              <TableHead>Truck No.</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Consignee</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="w-[50px]"></TableHead>
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
                  <TableCell>{trip.truck?.truck_no}</TableCell>
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
                    {trip.consignee1?.name}
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/trips/${trip.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/trips/${trip.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/payments/new?tripId=${trip.id}`}>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Add Payment
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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