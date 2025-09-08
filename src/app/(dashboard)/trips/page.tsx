'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TripsTable } from '@/components/tables/trips-table'
import { FilterBar } from '@/components/filters/filter-bar'
import type { FiltersData } from '@/lib/validators'
import type { TripWithRelations } from '@/types/db'

// Mock data - replace with real data from server actions
const mockTrips: TripWithRelations[] = [
  {
    id: '1',
    trip_date: '2024-01-15',
    status: 'COMPLETED',
    truck_id: '1',
    center_city: 'Mumbai',
    origin_city: 'Mumbai',
    destination_city: 'Delhi',
    cargo_details: 'Electronics',
    transport_details: 'Standard transport',
    consignor_id: '1',
    consignee1_id: '2',
    consignee2_id: null,
    lr_no: 'LR001',
    invoice_no: 'INV001',
    driver_name: 'Ravi Kumar',
    driver_phone: '9876543210',
    weight_mt: 15.5,
    no_of_packages: 100,
    route_notes: 'Highway route',
    remarks: 'Delivered on time',
    freight_amount: 50000,
    rto_charges: 2000,
    toll_charges: 1500,
    loading_unloading: 1000,
    diesel_advance: 5000,
    other_charges: 500,
    tax_percent: 18,
    total_amount: 58950,
    amount_received: 58950,
    balance_due: 0,
    payment_status: 'PAID',
    material_type: 'Electronics',
    e_way_bill_no: 'EWB001',
    payment_terms: 'Net 30',
    due_date: '2024-02-15',
    km_distance: 1400,
    settlement_party_id: null,
    rto_details: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    truck: {
      id: '1',
      truck_no: 'MH12AB1234',
      owner_id: '1',
      capacity_tons: 20,
      active: true,
      created_at: '2024-01-01T00:00:00Z'
    },
    consignor: {
      id: '1',
      name: 'ABC Suppliers',
      type: 'consignor',
      phone: '9876543210',
      email: 'abc@example.com',
      gstin: '27AABCU9603R1Z2',
      address: '123 Business Park',
      city: 'Mumbai',
      created_at: '2024-01-01T00:00:00Z'
    },
    consignee1: {
      id: '2',
      name: 'XYZ Industries',
      type: 'consignee',
      phone: '9876543211',
      email: 'xyz@example.com',
      gstin: '07AABCU9603R1Z3',
      address: '456 Industrial Area',
      city: 'Delhi',
      created_at: '2024-01-01T00:00:00Z'
    },
    owner: {
      id: '1',
      name: 'Transport Owner',
      type: 'owner',
      phone: '9876543212',
      email: 'owner@example.com',
      gstin: '27AABCU9603R1Z4',
      address: '789 Owner Street',
      city: 'Mumbai',
      created_at: '2024-01-01T00:00:00Z'
    },
    payments: [
      {
        id: '1',
        trip_id: '1',
        payment_date: '2024-01-20',
        amount: 58950,
        method: 'UPI',
        reference_no: 'UPI123456',
        notes: 'Full payment',
        created_at: '2024-01-20T10:00:00Z'
      }
    ]
  },
  {
    id: '2',
    trip_date: '2024-01-20',
    status: 'OUT',
    truck_id: '2',
    center_city: 'Delhi',
    origin_city: 'Delhi',
    destination_city: 'Bangalore',
    cargo_details: 'Textiles',
    transport_details: 'Covered truck',
    consignor_id: '1',
    consignee1_id: '3',
    consignee2_id: null,
    lr_no: 'LR002',
    invoice_no: 'INV002',
    driver_name: 'Suresh Singh',
    driver_phone: '9876543213',
    weight_mt: 18.0,
    no_of_packages: 200,
    route_notes: 'Avoid city traffic',
    remarks: 'In transit',
    freight_amount: 65000,
    rto_charges: 1500,
    toll_charges: 2000,
    loading_unloading: 1500,
    diesel_advance: 8000,
    other_charges: 1000,
    tax_percent: 18,
    total_amount: 74160,
    amount_received: 30000,
    balance_due: 44160,
    payment_status: 'PARTIAL',
    material_type: 'Textiles',
    e_way_bill_no: 'EWB002',
    payment_terms: 'Net 45',
    due_date: '2024-03-05',
    km_distance: 2200,
    settlement_party_id: null,
    rto_details: null,
    created_at: '2024-01-20T08:00:00Z',
    updated_at: '2024-01-20T08:00:00Z',
    truck: {
      id: '2',
      truck_no: 'KA05CD5678',
      owner_id: '1',
      capacity_tons: 25,
      active: true,
      created_at: '2024-01-01T00:00:00Z'
    },
    consignor: {
      id: '1',
      name: 'ABC Suppliers',
      type: 'consignor',
      phone: '9876543210',
      email: 'abc@example.com',
      gstin: '27AABCU9603R1Z2',
      address: '123 Business Park',
      city: 'Mumbai',
      created_at: '2024-01-01T00:00:00Z'
    },
    consignee1: {
      id: '3',
      name: 'PQR Textiles',
      type: 'consignee',
      phone: '9876543214',
      email: 'pqr@example.com',
      gstin: '29AABCU9603R1Z5',
      address: '789 Textile Hub',
      city: 'Bangalore',
      created_at: '2024-01-01T00:00:00Z'
    },
    owner: {
      id: '1',
      name: 'Transport Owner',
      type: 'owner',
      phone: '9876543212',
      email: 'owner@example.com',
      gstin: '27AABCU9603R1Z4',
      address: '789 Owner Street',
      city: 'Mumbai',
      created_at: '2024-01-01T00:00:00Z'
    },
    payments: [
      {
        id: '2',
        trip_id: '2',
        payment_date: '2024-01-22',
        amount: 30000,
        method: 'CASH',
        reference_no: null,
        notes: 'Advance payment',
        created_at: '2024-01-22T12:00:00Z'
      }
    ]
  }
]

export default function TripsPage() {
  const [filters, setFilters] = useState<FiltersData>({})
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [loading, setLoading] = useState(false)

  // Filter trips based on current filters
  const filteredTrips = mockTrips.filter(trip => {
    if (filters.dateFrom && trip.trip_date < filters.dateFrom) return false
    if (filters.dateTo && trip.trip_date > filters.dateTo) return false
    if (filters.status && trip.status !== filters.status) return false
    if (filters.paymentStatus && trip.payment_status !== filters.paymentStatus) return false
    if (filters.city && !trip.center_city?.toLowerCase().includes(filters.city.toLowerCase()) &&
        !trip.origin_city?.toLowerCase().includes(filters.city.toLowerCase()) &&
        !trip.destination_city?.toLowerCase().includes(filters.city.toLowerCase())) return false
    if (filters.truckNo && !trip.truck?.truck_no.toLowerCase().includes(filters.truckNo.toLowerCase())) return false
    if (filters.consignee && !trip.consignee1?.name.toLowerCase().includes(filters.consignee.toLowerCase())) return false
    
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