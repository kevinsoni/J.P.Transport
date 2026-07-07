'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { updatePayment } from '@/app/(dashboard)/payments/actions'
import type { Payment } from '@/types/db'

interface TripOption {
  id: string
  lr_no: string | null
  invoice_no: string | null
  origin_city: string | null
  destination_city: string | null
}

interface PaymentEditFormProps {
  payment: Payment
  trips: TripOption[]
}

export function PaymentEditForm({ payment, trips }: PaymentEditFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await updatePayment(payment.id, formData)
      // On success the action redirects; this line is not reached.
      if (result?.error) {
        setError(result.error)
      }
    } catch (err) {
      console.error('Payment update failed:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="trip_id">Trip</Label>
          <Select name="trip_id" defaultValue={payment.trip_id} required>
            <SelectTrigger>
              <SelectValue placeholder="Select trip" />
            </SelectTrigger>
            <SelectContent>
              {trips.map((trip) => (
                <SelectItem key={trip.id} value={trip.id}>
                  {trip.lr_no || trip.invoice_no || `Trip ${trip.id.slice(0, 8)}...`}
                  {trip.origin_city && trip.destination_city &&
                    ` (${trip.origin_city} → ${trip.destination_city})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_date">Payment Date</Label>
          <Input
            type="date"
            id="payment_date"
            name="payment_date"
            defaultValue={payment.payment_date ? payment.payment_date.split('T')[0] : ''}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹)</Label>
          <Input
            type="number"
            step="1"
            min="0"
            inputMode="numeric"
            id="amount"
            name="amount"
            defaultValue={Math.round(payment.amount)}
            placeholder="Enter amount"
            onKeyDown={(e) => {
              if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault()
            }}
            onInput={(e) => {
              const el = e.currentTarget
              if (el.value.includes('.')) el.value = String(Math.round(Number(el.value) || 0))
            }}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="method">Payment Method</Label>
          <Select name="method" defaultValue={payment.method} required>
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
            type="text"
            id="reference_no"
            name="reference_no"
            defaultValue={payment.reference_no || ''}
            placeholder="Transaction/Reference number"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={payment.notes || ''}
          placeholder="Additional notes about this payment"
          rows={3}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild disabled={isSubmitting}>
          <Link href={`/payments/${payment.id}`}>Cancel</Link>
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Payment'}
        </Button>
      </div>
    </form>
  )
}
