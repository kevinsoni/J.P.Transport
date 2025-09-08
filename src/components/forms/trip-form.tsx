'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createTrip, updateTrip } from '@/app/(dashboard)/trips/actions'
import { Truck, Party, Trip } from '@/types/db'

type TruckWithOwner = Truck & {
  owner: { name: string }[] | null
}

interface TripFormProps {
  trucks: TruckWithOwner[]
  parties: Party[]
  editData?: any
  tripId?: string
}

export function TripForm({ trucks, parties, editData, tripId }: TripFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [amounts, setAmounts] = useState({
    freight_amount: editData?.freight_amount || 0,
    rto_charges: editData?.rto_charges || 0,
    toll_charges: editData?.toll_charges || 0,
    loading_unloading: editData?.loading_unloading || 0,
    diesel_advance: editData?.diesel_advance || 0,
    other_charges: editData?.other_charges || 0,
    tax_percent: editData?.tax_percent || 0,
  })

  // Calculate totals
  const subtotal = amounts.freight_amount + amounts.rto_charges + amounts.toll_charges + 
                   amounts.loading_unloading + amounts.other_charges - amounts.diesel_advance
  const taxAmount = (subtotal * amounts.tax_percent) / 100
  const total = subtotal + taxAmount

  const handleAmountChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setAmounts(prev => ({
      ...prev,
      [field]: numValue
    }))
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      if (tripId && editData) {
        await updateTrip(tripId, formData)
      } else {
        await createTrip(formData)
      }
    } catch (error) {
      console.error(tripId ? 'Trip update failed:' : 'Trip creation failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const consignors = parties.filter(p => p.type === 'consignor' || p.type === 'transport')
  const consignees = parties.filter(p => p.type === 'consignee' || p.type === 'transport')

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Basic Trip Information */}
      <Card>
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
          <CardDescription>Basic trip information and route details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trip_date">Trip Date *</Label>
              <Input
                type="date"
                name="trip_date"
                defaultValue={editData?.trip_date || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="OUT">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OUT">OUT</SelectItem>
                  <SelectItem value="IN">IN</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                  <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="truck_id">Truck *</Label>
              <Select name="truck_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select truck" />
                </SelectTrigger>
                <SelectContent>
                  {trucks.map((truck) => (
                    <SelectItem key={truck.id} value={truck.id}>
                      <div className="flex flex-col text-left">
                        <span className="font-medium">{truck.truck_no}</span>
                        <span className="text-xs text-gray-500">
                          {truck.capacity_tons}T
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin_city">Origin City</Label>
              <Input name="origin_city" placeholder="Origin city" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination_city">Destination City</Label>
              <Input name="destination_city" placeholder="Destination city" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="center_city">Center City</Label>
              <Input name="center_city" placeholder="Center city" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lr_no">LR Number</Label>
              <Input name="lr_no" placeholder="LR number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice_no">Invoice Number</Label>
              <Input name="invoice_no" placeholder="Invoice number" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parties */}
      <Card>
        <CardHeader>
          <CardTitle>Parties</CardTitle>
          <CardDescription>Consignor and consignee information</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="consignor_id">Consignor *</Label>
              <Select name="consignor_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select consignor" />
                </SelectTrigger>
                <SelectContent>
                  {consignors.map((party) => (
                    <SelectItem key={party.id} value={party.id}>
                      {party.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="consignee1_id">Primary Consignee *</Label>
              <Select name="consignee1_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select primary consignee" />
                </SelectTrigger>
                <SelectContent>
                  {consignees.map((party) => (
                    <SelectItem key={party.id} value={party.id}>
                      {party.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="consignee2_id">Secondary Consignee</Label>
              <Select name="consignee2_id">
                <SelectTrigger>
                  <SelectValue placeholder="Select secondary consignee" />
                </SelectTrigger>
                <SelectContent>
                  {consignees.map((party) => (
                    <SelectItem key={party.id} value={party.id}>
                      {party.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver & Cargo */}
      <Card>
        <CardHeader>
          <CardTitle>Driver & Cargo Details</CardTitle>
          <CardDescription>Driver information and cargo specifications</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="driver_name">Driver Name</Label>
              <Input name="driver_name" placeholder="Driver name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driver_phone">Driver Phone</Label>
              <Input name="driver_phone" placeholder="Driver phone number" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight_mt">Weight (MT)</Label>
              <Input name="weight_mt" type="number" step="0.01" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="no_of_packages">Number of Packages</Label>
              <Input name="no_of_packages" type="number" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="material_type">Material Type</Label>
              <Input name="material_type" placeholder="Material type" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="km_distance">Distance (KM)</Label>
              <Input name="km_distance" type="number" placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cargo_details">Cargo Details</Label>
              <Input name="cargo_details" placeholder="Cargo description" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transport_details">Transport Details</Label>
              <Input name="transport_details" placeholder="Transport specifications" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Details */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Details</CardTitle>
          <CardDescription>Amount breakdown and calculations</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="freight_amount">Freight Amount *</Label>
              <Input
                name="freight_amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                onChange={(e) => handleAmountChange('freight_amount', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rto_charges">RTO Charges</Label>
              <Input
                name="rto_charges"
                type="number"
                step="0.01"
                placeholder="0.00"
                onChange={(e) => handleAmountChange('rto_charges', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toll_charges">Toll Charges</Label>
              <Input
                name="toll_charges"
                type="number"
                step="0.01"
                placeholder="0.00"
                onChange={(e) => handleAmountChange('toll_charges', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loading_unloading">Loading/Unloading</Label>
              <Input
                name="loading_unloading"
                type="number"
                step="0.01"
                placeholder="0.00"
                onChange={(e) => handleAmountChange('loading_unloading', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diesel_advance">Diesel Advance</Label>
              <Input
                name="diesel_advance"
                type="number"
                step="0.01"
                placeholder="0.00"
                onChange={(e) => handleAmountChange('diesel_advance', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="other_charges">Other Charges</Label>
              <Input
                name="other_charges"
                type="number"
                step="0.01"
                placeholder="0.00"
                onChange={(e) => handleAmountChange('other_charges', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax_percent">Tax Percentage</Label>
              <Input
                name="tax_percent"
                type="number"
                step="0.01"
                placeholder="0.00"
                onChange={(e) => handleAmountChange('tax_percent', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Total Amount</Label>
              <div className="h-9 px-3 py-2 rounded-md border bg-gray-50 flex items-center text-lg font-semibold text-green-600">
                {formatCurrency(total)}
              </div>
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax ({amounts.tax_percent}%):</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span className="text-green-600">{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Details */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Documentation and payment terms</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="e_way_bill_no">E-Way Bill Number</Label>
              <Input name="e_way_bill_no" placeholder="E-way bill number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Input name="payment_terms" placeholder="Payment terms" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input name="due_date" type="date" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="route_notes">Route Notes</Label>
              <Input name="route_notes" placeholder="Route specific notes" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Input name="remarks" placeholder="Additional remarks" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rto_details">RTO Details</Label>
            <Input name="rto_details" placeholder="RTO specific details" />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button 
          type="submit" 
          className="flex-1" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Trip...' : 'Create Trip'}
        </Button>
      </div>
    </form>
  )
}