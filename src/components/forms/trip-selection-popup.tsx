'use client'

import { useState, useEffect } from 'react'
import { X, Search, Truck, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { TripWithRelations } from '@/types/db'

interface TripSelectionPopupProps {
  trips: TripWithRelations[]
  isOpen: boolean
  onClose: () => void
  onSelectTrip: (trip: TripWithRelations) => void
}

export function TripSelectionPopup({ trips, isOpen, onClose, onSelectTrip }: TripSelectionPopupProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredTrips, setFilteredTrips] = useState(trips)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (searchTerm) {
      const filtered = trips.filter(trip => 
        trip.truck?.truck_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.consignee1?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.lr_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.center_city?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredTrips(filtered)
    } else {
      setFilteredTrips(trips)
    }
  }, [searchTerm, trips])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" style={{ margin: 'auto' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Select Trip</h2>
                <p className="text-blue-100 text-sm">Choose a trip to record payment</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by truck number, consignee, L/R number, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          {/* Trip List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredTrips.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No trips found matching your search' : 'No unpaid trips available'}
              </div>
            ) : (
              filteredTrips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => onSelectTrip(trip)}
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                          <span className="font-medium">{formatDate(trip.trip_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <Truck className="w-4 h-4 text-gray-500 shrink-0" />
                          <span className="font-medium truncate">{trip.truck?.truck_no}</span>
                        </div>
                        {trip.lr_no && (
                          <div className="text-sm text-gray-600 truncate">
                            L/R: {trip.lr_no}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1 min-w-0">
                          <User className="w-3 h-3 shrink-0" />
                          <span className="truncate">{trip.consignee1?.name}</span>
                        </div>
                        {trip.center_city && (
                          <div className="truncate">{trip.center_city}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(trip.total_amount)}
                      </div>
                      <div className="text-sm text-red-600 font-medium">
                        Due: {formatCurrency(trip.balance_due)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}