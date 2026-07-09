'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Route, Receipt, TrendingUp, Wallet, CreditCard } from 'lucide-react'

import { cn, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { TripsTable } from '@/components/tables/trips-table'
import { FilterBar } from '@/components/filters/filter-bar'
import { PaymentPopup } from '@/components/forms/payment-popup'
import { TripSelectionPopup } from '@/components/forms/trip-selection-popup'
import type { FiltersData } from '@/lib/validators'
import type { TripWithRelations } from '@/types/db'

interface TripsPageClientProps {
  trips: TripWithRelations[]
}

const accentMap = {
  blue: 'bg-blue-50 text-blue-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
} as const

export function TripsPageClient({ trips }: TripsPageClientProps) {
  const [filters, setFilters] = useState<FiltersData>({})
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [loading] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<TripWithRelations | null>(null)
  const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false)
  const [isTripSelectionOpen, setIsTripSelectionOpen] = useState(false)

  // Trips that still have an outstanding balance can receive a payment.
  const payableTrips = trips.filter(t => (t.balance_due || 0) > 0)

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

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length

  const stats = useMemo(() => {
    const totalBilled = filteredTrips.reduce((sum, t) => sum + (t.total_amount || 0), 0)
    const totalReceived = filteredTrips.reduce((sum, t) => sum + (t.amount_received || 0), 0)
    const totalBalance = filteredTrips.reduce((sum, t) => sum + (t.balance_due || 0), 0)
    return { totalBilled, totalReceived, totalBalance }
  }, [filteredTrips])

  const statCards = [
    { label: 'Total Trips', value: String(filteredTrips.length), sub: `${trips.length} total`, icon: Route, accent: 'blue' as const },
    { label: 'Total Billed', value: formatCurrency(stats.totalBilled), sub: 'Across current view', icon: Receipt, accent: 'indigo' as const },
    { label: 'Received', value: formatCurrency(stats.totalReceived), sub: 'Payments collected', icon: TrendingUp, accent: 'emerald' as const },
    { label: 'Outstanding', value: formatCurrency(stats.totalBalance), sub: 'Balance due', icon: Wallet, accent: 'amber' as const },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-1 bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
            Trips Management
          </h1>
          <p className="text-gray-500">Track and manage all your transport operations</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => setIsTripSelectionOpen(true)}
            disabled={payableTrips.length === 0}
            className="bg-gradient-to-r from-green-600 to-green-700 px-5 py-3 shadow-lg shadow-green-500/20 transition-all duration-200 hover:from-green-700 hover:to-green-800 hover:shadow-xl"
          >
            <CreditCard className="mr-2 h-5 w-5" />
            Record Payment
          </Button>
          <Button
            asChild
            className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 shadow-lg shadow-blue-500/20 transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
          >
            <Link href="/trips/new">
              <Plus className="mr-2 h-5 w-5" />
              Create New Trip
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, sub, icon: Icon, accent }) => (
          <div
            key={label}
            className="rounded-2xl border border-gray-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-shadow duration-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="mt-2 truncate text-2xl font-bold tabular-nums text-gray-900">{value}</p>
                <p className="mt-1 text-xs text-gray-400">{sub}</p>
              </div>
              <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', accentMap[accent])}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      {showAdvancedFilters && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200 rounded-2xl border border-gray-200/70 bg-white/70 p-5 shadow-sm backdrop-blur-sm">
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            showExpanded={showAdvancedFilters}
            onToggleExpanded={() => setShowAdvancedFilters(!showAdvancedFilters)}
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white/80 shadow-sm backdrop-blur-sm">
        <TripsTable
          trips={filteredTrips}
          loading={loading}
          selectedTrip={selectedTrip}
          setSelectedTrip={setSelectedTrip}
          isPaymentPopupOpen={isPaymentPopupOpen}
          setIsPaymentPopupOpen={setIsPaymentPopupOpen}
          showFilters={showAdvancedFilters}
          onToggleFilters={() => setShowAdvancedFilters(v => !v)}
          activeFilterCount={activeFilterCount}
        />
      </div>

      <TripSelectionPopup
        trips={payableTrips}
        isOpen={isTripSelectionOpen}
        onClose={() => setIsTripSelectionOpen(false)}
        onSelectTrip={(trip) => {
          setSelectedTrip(trip)
          setIsTripSelectionOpen(false)
          setIsPaymentPopupOpen(true)
        }}
      />

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
