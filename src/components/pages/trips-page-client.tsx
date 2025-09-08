'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TripsTable } from '@/components/tables/trips-table'
import { FilterBar } from '@/components/filters/filter-bar'
import type { FiltersData } from '@/lib/validators'
import type { TripWithRelations } from '@/types/db'

interface TripsPageClientProps {
  trips: TripWithRelations[]
}

export function TripsPageClient({ trips }: TripsPageClientProps) {
  const [filters, setFilters] = useState<FiltersData>({})
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [loading, setLoading] = useState(false)

  // Filter trips based on current filters
  const filteredTrips = trips.filter(trip => {
    if (filters.dateFrom && trip.trip_date < filters.dateFrom) return false
    if (filters.dateTo && trip.trip_date > filters.dateTo) return false
    if (filters.status && trip.status !== filters.status) return false
    if (filters.paymentStatus && trip.payment_status !== filters.paymentStatus) return false
    if (filters.city && !trip.center_city?.toLowerCase().includes(filters.city.toLowerCase()) &&
        !trip.origin_city?.toLowerCase().includes(filters.city.toLowerCase()) &&
        !trip.destination_city?.toLowerCase().includes(filters.city.toLowerCase())) return false
    const truckNo = (trip.truck as any)?.truck_no
    const consigneeName = (trip.consignee1 as any)?.name
    if (filters.truckNo && !truckNo?.toLowerCase().includes(filters.truckNo.toLowerCase())) return false
    if (filters.consignee && !consigneeName?.toLowerCase().includes(filters.consignee.toLowerCase())) return false
    
    return true
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trips</h1>
          <p className="text-gray-600">Manage your transport operations</p>
        </div>
        <Button asChild>
          <Link href="/trips/new">
            <Plus className="w-4 h-4 mr-2" />
            New Trip
          </Link>
        </Button>
      </div>

      <FilterBar 
        filters={filters}
        onFiltersChange={setFilters}
        showExpanded={showAdvancedFilters}
        onToggleExpanded={() => setShowAdvancedFilters(!showAdvancedFilters)}
      />

      <TripsTable 
        trips={filteredTrips}
        loading={loading}
      />
    </div>
  )
}