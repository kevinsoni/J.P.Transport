import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PaymentForm } from '@/components/forms/payment-form'
import { getTripsForPayment } from '../actions'

export default async function NewPaymentPage() {
  const trips = await getTripsForPayment()

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/payments">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Record Payment</h1>
          <p className="text-gray-600">Add a new payment to the system</p>
        </div>
      </div>

      <PaymentForm trips={trips} />
    </div>
  )
}