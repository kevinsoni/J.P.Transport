'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { createPayment } from '@/app/(dashboard)/payments/actions'
import { PaymentMethod, Trip } from '@/types/db'

type TripForPayment = Trip & {
  consignor: { name: string }[] | null
  consignee1: { name: string }[] | null
  truck: { truck_no: string }[] | null
}

interface PaymentFormProps {
  trips: TripForPayment[]
}

export function PaymentForm({ trips }: PaymentFormProps) {
  const [selectedTrip, setSelectedTrip] = useState<TripForPayment | null>(null)
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTripSelect = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId)
    setSelectedTrip(trip || null)
    setAmount(trip?.balance_due.toString() || '')
  }

  const handleSubmit = async (formData: FormData) => {
    if (!selectedTrip) return
    
    setIsSubmitting(true)
    try {
      await createPayment(formData)
    } catch (error) {
      console.error('Payment creation failed:', error)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>Enter payment information</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trip_id">Select Trip</Label>
              <Select name="trip_id" onValueChange={handleTripSelect} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a trip to record payment for" />
                </SelectTrigger>
                <SelectContent>
                  {trips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      <div className="flex flex-col text-left">
                        <div className="font-medium">
                          {trip.lr_no || trip.invoice_no || `Trip ${trip.id.slice(0, 8)}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {trip.origin_city} → {trip.destination_city} | 
                          Due: {formatCurrency(trip.balance_due)}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_date">Payment Date</Label>
                <Input
                  type="date"
                  name="payment_date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  type="number"
                  name="amount"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter payment amount"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select name="method" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="BANK">Bank Transfer</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference_no">Reference Number</Label>
                <Input
                  type="text"
                  name="reference_no"
                  placeholder="Transaction/Reference ID"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                type="text"
                name="notes"
                placeholder="Additional notes (optional)"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !selectedTrip}
            >
              {isSubmitting ? 'Recording Payment...' : 'Record Payment'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {selectedTrip && (
        <Card>
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
            <CardDescription>Selected trip information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">LR/Invoice No:</span>
              <span className="text-sm">
                {selectedTrip.lr_no || selectedTrip.invoice_no || 'N/A'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Date:</span>
              <span className="text-sm">{formatDate(selectedTrip.trip_date)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Route:</span>
              <span className="text-sm">
                {selectedTrip.origin_city} → {selectedTrip.destination_city}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Truck:</span>
              <span className="text-sm">{selectedTrip.truck?.[0]?.truck_no || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Consignor:</span>
              <span className="text-sm">{selectedTrip.consignor?.[0]?.name || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Consignee:</span>
              <span className="text-sm">{selectedTrip.consignee1?.[0]?.name || 'N/A'}</span>
            </div>

            <hr />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Amount:</span>
              <span className="text-sm font-medium">
                {formatCurrency(selectedTrip.total_amount)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Amount Received:</span>
              <span className="text-sm">
                {formatCurrency(selectedTrip.amount_received)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Balance Due:</span>
              <span className="text-sm font-bold text-red-600">
                {formatCurrency(selectedTrip.balance_due)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Payment Status:</span>
              <Badge 
                variant={
                  selectedTrip.payment_status === 'PAID' ? 'default' :
                  selectedTrip.payment_status === 'PARTIAL' ? 'secondary' : 
                  'destructive'
                }
              >
                {selectedTrip.payment_status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}