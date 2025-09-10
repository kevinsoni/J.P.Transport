'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TripsTable } from '@/components/tables/trips-table'
import { FilterBar } from '@/components/filters/filter-bar'
import { PaymentPopup } from '@/components/forms/payment-popup'
import type { FiltersData } from '@/lib/validators'
import type { TripWithRelations } from '@/types/db'

interface TripsPageClientProps {
  trips: TripWithRelations[]
}

export function TripsPageClient({ trips }: TripsPageClientProps) {
  const [filters, setFilters] = useState<FiltersData>({})
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<TripWithRelations | null>(null)
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false)

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent mb-2">
            Trips Management
          </h1>
          <p className="text-gray-600 text-lg">Track and manage all your transport operations</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">{filteredTrips.length} trips found</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">{trips.length} total trips</span>
            </div>
          </div>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3">
          <Link href="/trips/new">
            <Plus className="w-5 h-5 mr-2" />
            Create New Trip
          </Link>
        </Button>
      </div>

      {/* Filters */}
      {showAdvancedFilters && (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border-0 p-6">
          <FilterBar 
            filters={filters}
            onFiltersChange={setFilters}
            showExpanded={showAdvancedFilters}
            onToggleExpanded={() => setShowAdvancedFilters(!showAdvancedFilters)}
          />
        </div>
      )}
      
      {!showAdvancedFilters && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => setShowAdvancedFilters(true)}
            className="border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all duration-200"
          >
            Show Filters
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border-0 overflow-hidden">
        <TripsTable 
          trips={filteredTrips}
          loading={loading}
          selectedTrip={selectedTrip}
          setSelectedTrip={setSelectedTrip}
          isPaymentPopupOpen={isPaymentPopupOpen}
          setIsPaymentPopupOpen={setIsPaymentPopupOpen}
        />
      </div>

      {selectedTrip && (
        <PaymentPopup
          trip={selectedTrip}
          isOpen={isPaymentPopupOpen}
          onClose={() => {
            setIsPaymentPopupOpen(false)
            setSelectedTrip(null)
          }}
          onSuccess={() => {
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}