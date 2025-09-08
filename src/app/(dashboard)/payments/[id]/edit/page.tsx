import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getPaymentById, updatePayment, getTripsForPayment } from '../../actions'

interface EditPaymentPageProps {
  params: { id: string }
}

export default async function EditPaymentPage({ params }: EditPaymentPageProps) {
  const [payment, trips] = await Promise.all([
    getPaymentById(params.id),
    getTripsForPayment()
  ])
  
  if (!payment) {
    notFound()
  }

  const updatePaymentWithId = updatePayment.bind(null, params.id)

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/payments/${params.id}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Payment</h1>
          <p className="text-gray-600">Update payment details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updatePaymentWithId} className="space-y-6">
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
                          ` (${trip.origin_city} → ${trip.destination_city})`
                        }
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
                  step="0.01" 
                  id="amount" 
                  name="amount" 
                  defaultValue={payment.amount}
                  placeholder="Enter amount" 
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

            <div className="flex justify-end gap-4">
              <Button variant="outline" asChild>
                <Link href={`/payments/${params.id}`}>Cancel</Link>
              </Button>
              <Button type="submit">Update Payment</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}