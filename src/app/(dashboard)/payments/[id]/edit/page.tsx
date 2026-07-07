import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaymentEditForm } from '@/components/forms/payment-edit-form'
import { getPaymentById, getTripsForPayment } from '../../actions'

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
          <PaymentEditForm payment={payment} trips={trips} />
        </CardContent>
      </Card>
    </div>
  )
}