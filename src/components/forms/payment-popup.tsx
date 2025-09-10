'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createPayment } from '@/app/(dashboard)/payments/actions'
import type { TripWithRelations } from '@/types/db'

interface PaymentPopupProps {
  trip: TripWithRelations
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PaymentPopup({ trip, isOpen, onClose, onSuccess }: PaymentPopupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      formData.append('trip_id', trip.id)
      await createPayment(formData)
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Payment creation failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Add Payment</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Trip Details */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-medium mb-2">Trip Details</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{formatDate(trip.trip_date)}</span>
            </div>
            <div className="flex justify-between">
              <span>Truck:</span>
              <span>{trip.truck?.truck_no}</span>
            </div>
            <div className="flex justify-between">
              <span>L/R No:</span>
              <span>{trip.lr_no || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Consignee:</span>
              <span>{trip.consignee1?.name}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total Amount:</span>
              <span>{formatCurrency(trip.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Received:</span>
              <span>{formatCurrency(trip.amount_received)}</span>
            </div>
            <div className="flex justify-between font-semibold text-red-600">
              <span>Balance Due:</span>
              <span>{formatCurrency(trip.balance_due)}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment_date">Payment Date *</Label>
            <Input
              type="date"
              name="payment_date"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              type="number"
              name="amount"
              step="0.01"
              placeholder="Enter payment amount"
              max={trip.balance_due}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method *</Label>
            <Select name="method" value={paymentMethod} onValueChange={setPaymentMethod} required>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
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
              name="reference_no"
              placeholder="Transaction/Reference number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              name="notes"
              placeholder="Payment notes (optional)"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              )}
              {isSubmitting ? 'Adding...' : 'Add Payment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}