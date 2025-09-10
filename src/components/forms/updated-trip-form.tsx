'use client'

import { useState } from 'react'
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

export function UpdatedTripForm({ trucks, parties, editData, tripId }: TripFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [amounts, setAmounts] = useState({
    advance_amount: editData?.advance_amount || 0,
    rate: editData?.rate || 0,
    tp_charge_consignor1: editData?.tp_charge_consignor1 || 0,
    tp_charge_consignor2: editData?.tp_charge_consignor2 || 0,
    rto_charge_gujarat: editData?.rto_charge_gujarat || 0,
    rto_charge_maharashtra: editData?.rto_charge_maharashtra || 0,
    lr_amount: editData?.lr_amount || 0,
    driver_cash_received: editData?.driver_cash_received || 0,
  })

  // Calculate totals
  const totalAmount = amounts.rate + amounts.tp_charge_consignor1 + amounts.tp_charge_consignor2 + 
                     amounts.rto_charge_gujarat + amounts.rto_charge_maharashtra
  const billAmount = totalAmount - amounts.lr_amount - amounts.driver_cash_received

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
  const owners = parties.filter(p => p.type === 'owner')

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Basic Trip Information */}
      <Card>
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Label htmlFor="truck_id">Truck Number *</Label>
              <Select name="truck_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select truck" />
                </SelectTrigger>
                <SelectContent>
                  {trucks.map((truck) => (
                    <SelectItem key={truck.id} value={truck.id}>
                      {truck.truck_no}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="center_city">Center</Label>
              <Input name="center_city" placeholder="Center city" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo_details">Cargo</Label>
              <Input name="cargo_details" placeholder="Cargo details" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loading_weight">Loading Weight</Label>
              <Input name="loading_weight" type="number" step="0.01" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_weight">Payment Weight</Label>
              <Input name="payment_weight" type="number" step="0.01" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lr_no">L/R No.</Label>
              <Input name="lr_no" placeholder="LR number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lr_name">L/R Name</Label>
              <Input name="lr_name" placeholder="LR name" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parties */}
      <Card>
        <CardHeader>
          <CardTitle>Parties</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="consignor_id">Consignor (1) *</Label>
              <Select name="consignor_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select consignor 1" />
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
              <Label htmlFor="consignor2_id">Consignor (2)</Label>
              <Select name="consignor2_id">
                <SelectTrigger>
                  <SelectValue placeholder="Select consignor 2" />
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
              <Label htmlFor="consignee1_id">Consignee *</Label>
              <Select name="consignee1_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select consignee" />
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
              <Label htmlFor="settlement_party_id">Truck Owner</Label>
              <Select name="settlement_party_id">
                <SelectTrigger>
                  <SelectValue placeholder="Select truck owner" />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((party) => (
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

      {/* Financial Details */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="advance_amount">Advance</Label>
              <Input
                name="advance_amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                onChange={(e) => handleAmountChange('advance_amount', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="party_payment_name">Party Payment Name</Label>
              <Input name="party_payment_name" placeholder="Party payment name" />
            </div>
          </div>

          {/* Charges Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rate">Rate *</Label>
              <Input
                name="rate"
                type="number"
                step="0.01"
                placeholder="0.00"
                onChange={(e) => handleAmountChange('rate', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tp_charge_consignor1">TP Charge Consignor 1</Label>
              <Input
                name="tp_charge_consignor1"
                type="number"
                step="0.01"
                placeholder="0.00"
                onChange={(e) => handleAmountChange('tp_charge_consignor1', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tp_charge_consignor2">TP Charge Consignor 2</Label>
              <Input
                name="tp_charge_consignor2"
                type="number"
                step="0.01"
                placeholder="0.00"
                onChange={(e) => handleAmountChange('tp_charge_consignor2', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rto_charge_gujarat">RTO Charge Gujarat</Label>
              <Input
                name="rto_charge_gujarat"
                type="number"
                step="0.01"
                placeholder="0.00"
                onChange={(e) => handleAmountChange('rto_charge_gujarat', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rto_charge_maharashtra">RTO Charge Maharashtra</Label>
              <Input
                name="rto_charge_maharashtra"
                type="number"
                step="0.01"
                placeholder="0.00"
                onChange={(e) => handleAmountChange('rto_charge_maharashtra', e.target.value)}
              />
            </div>
          </div>

          {/* Total Row */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center font-semibold">
              <div className="text-blue-600">{formatCurrency(amounts.rate)}</div>
              <div className="text-blue-600">{formatCurrency(amounts.tp_charge_consignor1)}</div>
              <div className="text-blue-600">{formatCurrency(amounts.tp_charge_consignor2)}</div>
              <div className="text-blue-600">{formatCurrency(amounts.rto_charge_gujarat)}</div>
              <div className="text-blue-600">{formatCurrency(amounts.rto_charge_maharashtra)}</div>
            </div>
            <div className="text-center mt-2 text-lg font-bold text-blue-700">
              TOTAL: {formatCurrency(totalAmount)}
            </div>
          </div>

          {/* Deductions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lr_amount">L/R Amount</Label>
              <Input
                name="lr_amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                onChange={(e) => handleAmountChange('lr_amount', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driver_cash_received">Driver Cash Received (Kachana)</Label>
              <Input
                name="driver_cash_received"
                type="number"
                step="0.01"
                placeholder="0.00"
                onChange={(e) => handleAmountChange('driver_cash_received', e.target.value)}
              />
            </div>
          </div>

          {/* Bill Amount */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Bill Amount Calculation:</div>
              <div className="text-sm text-gray-700">
                Total Amount: {formatCurrency(totalAmount)}
              </div>
              <div className="text-sm text-gray-700">
                Less: L/R Amount: {formatCurrency(amounts.lr_amount)}
              </div>
              <div className="text-sm text-gray-700">
                Less: Driver Cash: {formatCurrency(amounts.driver_cash_received)}
              </div>
              <hr className="my-2" />
              <div className="text-lg font-bold text-green-700">
                Bill Amount: {formatCurrency(billAmount)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button 
          type="submit" 
          className="flex-1" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (tripId ? 'Updating Trip...' : 'Creating Trip...') : (tripId ? 'Update Trip' : 'Create Trip')}
        </Button>
      </div>
    </form>
  )
}